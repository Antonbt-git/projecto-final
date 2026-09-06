from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


class OptimizacionCreate(BaseModel):
    nombre: str
    descripcion: str | None = None
    recursos: dict[str, float] = Field(
        description=(
            "Cantidad inicial de cada recurso, "
            "ej. {'recurso_a': 3, 'recurso_b': 5}"
        )
    )
    costos_unitarios: dict[str, float] = Field(
        description="Costo por unidad de cada recurso."
    )
    capacidad_por_unidad: dict[str, float] = Field(
        description="Capacidad de servicio que aporta cada unidad de recurso."
    )
    demanda_minima: float = Field(
        description="Capacidad total de servicio que debe cubrirse."
    )
    margen_maximo: float = Field(
        default=1.5,
        description="Cuánto puede crecer cada recurso respecto a su valor inicial.",
    )


class OptimizacionResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
    parametros_entrada: dict[str, Any]
    resultado: dict[str, Any] | None = None
    costo_inicial: Decimal | None = None
    costo_optimizado: Decimal | None = None
    estado: str
    created_at: datetime

    class Config:
        from_attributes = True
