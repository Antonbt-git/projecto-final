from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class MetricaCalcularRequest(BaseModel):
    fecha_inicio: date
    fecha_fin: date


class MetricaEstadisticaResponse(BaseModel):
    id: int
    fecha_inicio: date
    fecha_fin: date
    cantidad_registros: int
    media: Decimal | None = None
    mediana: Decimal | None = None
    desviacion_estandar: Decimal | None = None
    minimo: Decimal | None = None
    maximo: Decimal | None = None
    percentil_25: Decimal | None = None
    percentil_75: Decimal | None = None
    created_at: datetime

    class Config:
        from_attributes = True
