from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.database.models import CodigoVerificacion, Usuario
from app.schemas.usuario import (
    LoginFacialRequest,
    LoginRequest,
    LoginResponse,
    ReenviarRegistroRequest,
    RegistroResponse,
    Resend2FARequest,
    TokenResponse,
    UsuarioCreate,
    UsuarioResponse,
    Verify2FARequest,
    VerificarRegistroRequest,
)
from app.core.email import enviar_codigo_registro, enviar_codigo_verificacion
from app.core.reconocimiento_facial import (
    ImagenInvalidaError,
    ReconocimientoNoDisponibleError,
    RostroNoDetectadoError,
    comparar_rostros,
    extraer_rostro,
)
from app.core.security import (
    CODIGO_2FA_EXPIRE_MINUTES,
    create_access_token,
    decode_access_token,
    generar_codigo_2fa,
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"],
)

security = HTTPBearer()


# --------------------------------
# CONEXIÓN A BASE DE DATOS
# --------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# --------------------------------
# USUARIO AUTENTICADO
# --------------------------------

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(
        credenciales.credentials
    )

    usuario_id = payload.get("sub")

    if not usuario_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario = db.scalar(
        select(Usuario).where(
            Usuario.id == int(usuario_id)
        )
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario está inactivo.",
        )

    return usuario


# --------------------------------
# CÓDIGO DE VERIFICACIÓN (2FA)
# --------------------------------

def generar_y_enviar_codigo_2fa(usuario: Usuario, db: Session) -> None:
    # Invalidar códigos anteriores no usados del usuario.
    db.query(CodigoVerificacion).filter(
        CodigoVerificacion.usuario_id == usuario.id,
        CodigoVerificacion.usado.is_(False),
    ).update({"usado": True})

    codigo = generar_codigo_2fa()

    nuevo_codigo = CodigoVerificacion(
        usuario_id=usuario.id,
        codigo=codigo,
        expira_en=datetime.now(timezone.utc)
        + timedelta(minutes=CODIGO_2FA_EXPIRE_MINUTES),
        usado=False,
    )

    db.add(nuevo_codigo)
    db.commit()

    enviar_codigo_verificacion(usuario.email, codigo)


def generar_y_enviar_codigo_registro(usuario: Usuario, db: Session) -> None:
    # Invalidar códigos de registro anteriores no usados del usuario.
    db.query(CodigoVerificacion).filter(
        CodigoVerificacion.usuario_id == usuario.id,
        CodigoVerificacion.tipo == "registro",
        CodigoVerificacion.usado.is_(False),
    ).update({"usado": True})

    codigo = generar_codigo_2fa()

    nuevo_codigo = CodigoVerificacion(
        usuario_id=usuario.id,
        codigo=codigo,
        tipo="registro",
        expira_en=datetime.now(timezone.utc)
        + timedelta(minutes=CODIGO_2FA_EXPIRE_MINUTES),
        usado=False,
    )

    db.add(nuevo_codigo)
    db.commit()

    enviar_codigo_registro(usuario.email, codigo)


# --------------------------------
# REGISTRO (con reconocimiento facial + token por correo)
# --------------------------------

MIN_LARGO_IMAGEN_ROSTRO = 500


@router.post(
    "/register",
    response_model=RegistroResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_administrador(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
):
    usuario_existente = db.scalar(
        select(Usuario).where(
            Usuario.email == usuario.email
        )
    )

    if usuario_existente and usuario_existente.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado.",
        )

    if (
        not usuario.rostro_imagen
        or len(usuario.rostro_imagen) < MIN_LARGO_IMAGEN_ROSTRO
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Debes capturar tu rostro con la cámara antes de "
                "completar el registro."
            ),
        )

    # Se valida que la foto capturada realmente contenga un rostro
    # detectable, ya que esta misma imagen se usará después para
    # verificar el inicio de sesión con reconocimiento facial.
    try:
        extraer_rostro(usuario.rostro_imagen)
    except (RostroNoDetectadoError, ImagenInvalidaError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ReconocimientoNoDisponibleError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    if usuario_existente:
        # Ya existía un intento de registro inactivo (por ejemplo, si
        # una falla de red interrumpió el paso de verificación).
        # Se actualiza con los datos nuevos en vez de bloquear al
        # usuario con "correo ya registrado".
        usuario_existente.nombre = usuario.nombre
        usuario_existente.password_hash = hash_password(usuario.password)
        usuario_existente.rostro_registrado = True
        usuario_existente.rostro_imagen = usuario.rostro_imagen
        nuevo_usuario = usuario_existente
        db.commit()
        db.refresh(nuevo_usuario)
    else:
        nuevo_usuario = Usuario(
            nombre=usuario.nombre,
            email=usuario.email,
            password_hash=hash_password(usuario.password),
            rol="ADMIN",
            # La cuenta queda inactiva hasta confirmar el token de 6
            # dígitos enviado al correo.
            activo=False,
            rostro_registrado=True,
            rostro_imagen=usuario.rostro_imagen,
        )

        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

    generar_y_enviar_codigo_registro(nuevo_usuario, db)

    return RegistroResponse(
        email=nuevo_usuario.email,
        mensaje=(
            "Registramos tu cuenta y tu reconocimiento facial. "
            "Enviamos un token de acceso de 6 dígitos a tu correo "
            "para activarla."
        ),
    )


# --------------------------------
# VERIFICAR TOKEN DE REGISTRO
# --------------------------------

@router.post(
    "/verify-register",
    response_model=TokenResponse,
)
def verificar_registro(
    datos: VerificarRegistroRequest,
    db: Session = Depends(get_db),
):
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.email == datos.email
        )
    )

    if usuario is None or usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
        )

    codigo_valido = db.scalar(
        select(CodigoVerificacion)
        .where(
            CodigoVerificacion.usuario_id == usuario.id,
            CodigoVerificacion.tipo == "registro",
            CodigoVerificacion.codigo == datos.codigo,
            CodigoVerificacion.usado.is_(False),
        )
        .order_by(CodigoVerificacion.created_at.desc())
    )

    ahora = datetime.now(timezone.utc)

    if codigo_valido is None or codigo_valido.expira_en.replace(
        tzinfo=timezone.utc
    ) < ahora:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
        )

    codigo_valido.usado = True
    usuario.activo = True
    db.commit()

    access_token = create_access_token(
        {
            "sub": str(usuario.id),
            "email": usuario.email,
            "rol": usuario.rol,
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


# --------------------------------
# REENVIAR TOKEN DE REGISTRO
# --------------------------------

@router.post(
    "/resend-register",
    response_model=RegistroResponse,
)
def reenviar_token_registro(
    datos: ReenviarRegistroRequest,
    db: Session = Depends(get_db),
):
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.email == datos.email
        )
    )

    if usuario is None or usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fue posible reenviar el token.",
        )

    generar_y_enviar_codigo_registro(usuario, db)

    return RegistroResponse(
        email=usuario.email,
        mensaje="Reenviamos el token de acceso a tu correo.",
    )


# --------------------------------
# LOGIN
# --------------------------------

@router.post(
    "/login",
    response_model=LoginResponse,
)
def iniciar_sesion(
    credenciales: LoginRequest,
    db: Session = Depends(get_db),
):
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.email == credenciales.email
        )
    )

    if usuario is None or not verify_password(
        credenciales.password,
        usuario.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario está inactivo.",
        )

    generar_y_enviar_codigo_2fa(usuario, db)

    return LoginResponse(
        requiere_2fa=True,
        email=usuario.email,
        mensaje="Hemos enviado un código de verificación a tu correo.",
    )


# --------------------------------
# LOGIN CON RECONOCIMIENTO FACIAL
# --------------------------------

@router.post(
    "/login-facial",
    response_model=LoginResponse,
)
def iniciar_sesion_facial(
    datos: LoginFacialRequest,
    db: Session = Depends(get_db),
):
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.email == datos.email
        )
    )

    if (
        usuario is None
        or not usuario.rostro_registrado
        or not usuario.rostro_imagen
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "No hay un rostro registrado para este correo. Inicia "
                "sesión con tu contraseña o regístrate primero."
            ),
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario está inactivo.",
        )

    try:
        coincide, confianza = comparar_rostros(
            usuario.rostro_imagen,
            datos.rostro_imagen,
        )
    except (RostroNoDetectadoError, ImagenInvalidaError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ReconocimientoNoDisponibleError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    if not coincide:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El rostro no coincide con el registrado para esta cuenta.",
        )

    generar_y_enviar_codigo_2fa(usuario, db)

    return LoginResponse(
        requiere_2fa=True,
        email=usuario.email,
        mensaje=(
            "Rostro verificado. Hemos enviado un código de verificación "
            "a tu correo."
        ),
    )


# --------------------------------
# VERIFICAR CÓDIGO 2FA
# --------------------------------

@router.post(
    "/verify-2fa",
    response_model=TokenResponse,
)
def verificar_codigo_2fa(
    datos: Verify2FARequest,
    db: Session = Depends(get_db),
):
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.email == datos.email
        )
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código inválido o expirado.",
        )

    codigo_valido = db.scalar(
        select(CodigoVerificacion)
        .where(
            CodigoVerificacion.usuario_id == usuario.id,
            CodigoVerificacion.codigo == datos.codigo,
            CodigoVerificacion.usado.is_(False),
        )
        .order_by(CodigoVerificacion.created_at.desc())
    )

    ahora = datetime.now(timezone.utc)

    if codigo_valido is None or codigo_valido.expira_en.replace(
        tzinfo=timezone.utc
    ) < ahora:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código inválido o expirado.",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario está inactivo.",
        )

    codigo_valido.usado = True
    db.commit()

    access_token = create_access_token(
        {
            "sub": str(usuario.id),
            "email": usuario.email,
            "rol": usuario.rol,
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


# --------------------------------
# REENVIAR CÓDIGO 2FA
# --------------------------------

@router.post(
    "/resend-2fa",
    response_model=LoginResponse,
)
def reenviar_codigo_2fa(
    datos: Resend2FARequest,
    db: Session = Depends(get_db),
):
    usuario = db.scalar(
        select(Usuario).where(
            Usuario.email == datos.email
        )
    )

    if usuario is None or not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fue posible reenviar el código.",
        )

    generar_y_enviar_codigo_2fa(usuario, db)

    return LoginResponse(
        requiere_2fa=True,
        email=usuario.email,
        mensaje="Hemos reenviado el código de verificación a tu correo.",
    )


# --------------------------------
# MI PERFIL
# --------------------------------

@router.get(
    "/me",
    response_model=UsuarioResponse,
)
def obtener_perfil(
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    return usuario