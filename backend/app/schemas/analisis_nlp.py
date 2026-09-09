from datetime import datetime

from pydantic import BaseModel

from app.schemas.nltk import PalabraFrecuente


class AnalisisNLPResponse(BaseModel):
    id: int
    comentario_id: int
    idioma: str
    cantidad_palabras: int
    palabras_limpias: list[str] | None = None
    palabras_frecuentes: list[PalabraFrecuente] | None = None
    categoria_detectada: str | None = None
    confianza: float | None = None
    fecha_analisis: datetime

    class Config:
        from_attributes = True
