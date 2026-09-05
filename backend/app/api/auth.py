from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.database.models import Usuario
from app.schemas.usuario import (
    LoginRequest,
    TokenResponse,
    UsuarioCreate,
    UsuarioResponse,
)
from app.core.security import (
    create_access_token,
    decode_access_token,
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
# REGISTRO
# --------------------------------

@router.post(
    "/register",
    response_model=UsuarioResponse,
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

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado.",
        )

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password_hash=hash_password(usuario.password),
        rol="ADMIN",
        activo=True,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


# --------------------------------
# LOGIN
# --------------------------------

@router.post(
    "/login",
    response_model=TokenResponse,
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