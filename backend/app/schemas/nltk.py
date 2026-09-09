from pydantic import BaseModel


class TextoRequest(BaseModel):
    texto: str


class PalabraFrecuente(BaseModel):
    palabra: str
    frecuencia: int


class NLPAnalysisResponse(BaseModel):
    idioma: str
    cantidad_palabras: int
    tokens: list[str]
    palabras_frecuentes: list[PalabraFrecuente]
    categoria: str
    confianza: float | None = None


class ClasificacionResponse(BaseModel):
    categoria: str
    confianza: float | None = None


class SentimientoResponse(BaseModel):
    sentimiento: str
    puntaje: int
    confianza: float
    palabras_positivas: list[str]
    palabras_negativas: list[str]
