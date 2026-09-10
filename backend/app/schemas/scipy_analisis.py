from pydantic import BaseModel, Field


class EstadisticasRequest(BaseModel):
    valores: list[float] = Field(..., min_length=1)


class EstadisticasResponse(BaseModel):
    cantidad: int
    media: float
    mediana: float
    desviacion_estandar: float
    minimo: float
    maximo: float
    percentil_25: float
    percentil_75: float


class InterpolacionRequest(BaseModel):
    valores: list[float] = Field(..., min_length=2)


class InterpolacionResponse(BaseModel):
    metodo: str
    x: list[float]
    valores_interpolados: list[float]
    proyeccion_siguiente: float
    fechas: list[str] | None = None
    valores_originales: list[float] | None = None
