from pydantic import BaseModel, EmailStr


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str = "USUARIO"
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
