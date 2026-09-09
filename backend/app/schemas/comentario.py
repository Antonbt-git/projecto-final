from datetime import datetime

from pydantic import BaseModel


class ComentarioBase(BaseModel):
    contenido: str
    canal: str = "web"
    cliente_id: int | None = None


class ComentarioCreate(ComentarioBase):
    pass


class ComentarioUpdate(BaseModel):
    # Todos los campos son opcionales para permitir actualizaciones
    # parciales (por ejemplo, cambiar solo el estado).
    estado: str | None = None
    categoria: str | None = None


class ComentarioResponse(ComentarioBase):
    id: int
    estado: str
    categoria: str | None = None
    fecha: datetime
    procesado: bool

    class Config:
        from_attributes = True
