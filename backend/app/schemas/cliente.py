from pydantic import BaseModel


class ClienteBase(BaseModel):
    nombre: str
    email: str | None = None
    telefono: str | None = None
    empresa: str | None = None
    activo: bool = True


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    # Todos los campos son opcionales para permitir actualizaciones
    # parciales (solo se modifican los campos que el cliente envíe).
    nombre: str | None = None
    email: str | None = None
    telefono: str | None = None
    empresa: str | None = None
    activo: bool | None = None


class ClienteResponse(ClienteBase):
    id: int

    class Config:
        from_attributes = True