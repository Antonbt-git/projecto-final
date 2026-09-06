from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_db, obtener_usuario_actual
from app.core.analisis_texto import analizar_texto
from app.core.auditoria import registrar_auditoria
from app.database.models import AnalisisNLP, Comentario, Usuario
from app.schemas.analisis_nlp import AnalisisNLPResponse
from app.schemas.comentario import (
    ComentarioCreate,
    ComentarioResponse,
)

router = APIRouter(
    prefix="/api/comentarios",
    tags=["Comentarios"],
)


@router.post("/", response_model=ComentarioResponse)
def crear_comentario(
    comentario: ComentarioCreate,
    db: Session = Depends(get_db),
):
    """
    Registra un comentario de un cliente. Es un endpoint público:
    no requiere autenticación, para que un cliente pueda dejar su
    comentario desde el sitio web, un formulario, etc.
    """
    nuevo_comentario = Comentario(**comentario.model_dump())

    db.add(nuevo_comentario)
    db.commit()
    db.refresh(nuevo_comentario)

    return nuevo_comentario


@router.get("/", response_model=list[ComentarioResponse])
def listar_comentarios(
    estado: str | None = None,
    procesado: bool | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    consulta = select(Comentario).order_by(Comentario.fecha.desc())

    if estado is not None:
        consulta = consulta.where(Comentario.estado == estado)
    if procesado is not None:
        consulta = consulta.where(Comentario.procesado == procesado)

    resultado = db.execute(consulta)
    return resultado.scalars().all()


@router.get("/{comentario_id}", response_model=ComentarioResponse)
def obtener_comentario(
    comentario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    comentario = db.get(Comentario, comentario_id)

    if comentario is None:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    return comentario


@router.post("/{comentario_id}/analizar", response_model=AnalisisNLPResponse)
def analizar_comentario(
    comentario_id: int,
    request: Request,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """
    Ejecuta el análisis NLP (NLTK: tokenización, palabras frecuentes,
    clasificación por categoría y confianza) sobre un comentario ya
    existente, guarda el resultado en `analisis_nlp` y actualiza el
    comentario (categoría detectada, estado y procesado=True).
    """
    comentario = db.get(Comentario, comentario_id)

    if comentario is None:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    analisis = analizar_texto(comentario.contenido)

    nuevo_analisis = AnalisisNLP(
        comentario_id=comentario.id,
        idioma=analisis["idioma"],
        cantidad_palabras=analisis["cantidad_palabras"],
        palabras_limpias=analisis["tokens"],
        palabras_frecuentes=analisis["palabras_frecuentes"],
        categoria_detectada=analisis["categoria"],
        confianza=analisis["confianza"],
    )
    db.add(nuevo_analisis)

    comentario.categoria = analisis["categoria"]
    comentario.procesado = True
    comentario.estado = "procesado"

    db.commit()
    db.refresh(nuevo_analisis)

    registrar_auditoria(
        db,
        usuario_id=usuario.id,
        accion="analizar_comentario",
        tabla="comentarios",
        registro_id=comentario.id,
        detalles={
            "categoria_detectada": analisis["categoria"],
            "confianza": analisis["confianza"],
        },
        ip=request.client.host if request.client else None,
    )

    return nuevo_analisis


@router.get("/{comentario_id}/analisis", response_model=list[AnalisisNLPResponse])
def obtener_analisis_comentario(
    comentario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    comentario = db.get(Comentario, comentario_id)

    if comentario is None:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    resultado = db.execute(
        select(AnalisisNLP)
        .where(AnalisisNLP.comentario_id == comentario_id)
        .order_by(AnalisisNLP.fecha_analisis.desc())
    )
    return resultado.scalars().all()
