from fastapi import APIRouter

from app.core.analisis_texto import (
    analizar_sentimiento,
    analizar_texto,
    clasificar_texto,
    obtener_palabras_frecuentes,
)
from app.schemas.nltk import (
    ClasificacionResponse,
    NLPAnalysisResponse,
    PalabraFrecuente,
    SentimientoResponse,
    TextoRequest,
)

router = APIRouter(
    prefix="/api/nltk",
    tags=["NLTK"],
)


@router.post("/analizar", response_model=NLPAnalysisResponse)
def analizar(datos: TextoRequest):
    return analizar_texto(datos.texto)


@router.post("/palabras-frecuentes", response_model=list[PalabraFrecuente])
def palabras_frecuentes(datos: TextoRequest):
    return obtener_palabras_frecuentes(datos.texto)


@router.post("/clasificar", response_model=ClasificacionResponse)
def clasificar(datos: TextoRequest):
    return clasificar_texto(datos.texto)


@router.post("/sentimiento", response_model=SentimientoResponse)
def sentimiento(datos: TextoRequest):
    return analizar_sentimiento(datos.texto)
