from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class TiempoAtencionCreate(BaseModel):
    cliente_id: int | None = None
    comentario_id: int | None = None
    tiempo_minutos: Decimal
    fecha: date | None = None
    operador: str | None = None


class TiempoAtencionResponse(BaseModel):
    id: int
    cliente_id: int | None = None
    comentario_id: int | None = None
    tiempo_minutos: Decimal
    fecha: date
    operador: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
