from pydantic import BaseModel, EmailStr


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str = "USUARIO"
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str
    # Imagen del rostro capturada en el registro, en formato
    # Data URL base64 (ej. "data:image/jpeg;base64,...").
    rostro_imagen: str


class UsuarioResponse(UsuarioBase):
    id: int
    rostro_registrado: bool

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginFacialRequest(BaseModel):
    email: EmailStr
    # Imagen capturada en el momento del login, en formato Data URL
    # base64 (ej. "data:image/jpeg;base64,...").
    rostro_imagen: str


class LoginResponse(BaseModel):
    requiere_2fa: bool
    email: EmailStr
    mensaje: str


class Verify2FARequest(BaseModel):
    email: EmailStr
    codigo: str


class Resend2FARequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# --------------------------------
# REGISTRO CON RECONOCIMIENTO FACIAL
# --------------------------------

class RegistroResponse(BaseModel):
    email: EmailStr
    mensaje: str


class VerificarRegistroRequest(BaseModel):
    email: EmailStr
    codigo: str


class ReenviarRegistroRequest(BaseModel):
    email: EmailStr
