from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuditoriaResponse(BaseModel):
    id: int
    usuario_id: int | None = None
    accion: str
    tabla: str | None = None
    registro_id: int | None = None
    detalles: dict[str, Any] | list[Any] | None = None
    ip: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
