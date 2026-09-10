from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.api.auth import get_db
from app.database.models import Categoria, Comentario
from app.schemas.categoria import CategoriaResponse, CategoriaResumen

router = APIRouter(
    prefix="/api/categorias",
    tags=["Categorías"],
)


@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(
    activo: bool | None = None,
    db: Session = Depends(get_db),
):
    """
    Lista las categorías registradas en la tabla `categorias`
    (VENTAS, SOPORTE, RECLAMO, CONSULTA, FELICITACION, OTROS, o
    cualquier otra que se agregue). Es pública para que tanto el
    formulario de comentarios como sus filtros puedan construirse de
    forma dinámica en vez de tener la lista fija en el frontend.
    """
    consulta = select(Categoria).order_by(Categoria.nombre)

    if activo is not None:
        consulta = consulta.where(Categoria.activo == activo)

    resultado = db.execute(consulta)
    return resultado.scalars().all()


@router.get("/resumen", response_model=list[CategoriaResumen])
def resumen_categorias(db: Session = Depends(get_db)):
    """
    Igual que `listar_categorias`, pero agrega para cada categoría
    cuántos comentarios tiene asociados (total, procesados y
    pendientes). Alimenta el apartado "Comentarios por categoría" de
    la pantalla de Comentarios.
    """
    consulta = (
        select(
            Categoria.id,
            Categoria.nombre,
            Categoria.descripcion,
            Categoria.activo,
            func.count(Comentario.id).label("total_comentarios"),
            func.sum(
                case((Comentario.estado == "procesado", 1), else_=0)
            ).label("procesados"),
            func.sum(
                case((Comentario.estado != "procesado", 1), else_=0)
            ).label("pendientes"),
        )
        .outerjoin(Comentario, Comentario.categoria == Categoria.nombre)
        .group_by(Categoria.id, Categoria.nombre, Categoria.descripcion, Categoria.activo)
        .order_by(Categoria.nombre)
    )

    filas = db.execute(consulta).all()

    return [
        CategoriaResumen(
            id=fila.id,
            nombre=fila.nombre,
            descripcion=fila.descripcion,
            activo=fila.activo,
            total_comentarios=int(fila.total_comentarios or 0),
            procesados=int(fila.procesados or 0),
            pendientes=int(fila.pendientes or 0),
        )
        for fila in filas
    ]
