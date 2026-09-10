from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.auth import get_db, obtener_usuario_actual
from app.database.models import Cliente, Comentario, TiempoAtencion, Usuario
from app.schemas.dashboard import ResumenDashboard, TiempoDiario

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/resumen", response_model=ResumenDashboard)
def resumen_dashboard(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """
    Números reales (contados directamente en la base de datos) para
    las tarjetas KPI del dashboard: clientes, comentarios, porcentaje
    de comentarios procesados y tiempo promedio de atención.
    """
    total_clientes = db.scalar(select(func.count(Cliente.id))) or 0
    clientes_activos = (
        db.scalar(select(func.count(Cliente.id)).where(Cliente.activo.is_(True))) or 0
    )

    total_comentarios = db.scalar(select(func.count(Comentario.id))) or 0
    comentarios_procesados = (
        db.scalar(
            select(func.count(Comentario.id)).where(Comentario.procesado.is_(True))
        )
        or 0
    )

    porcentaje_procesados = (
        round((comentarios_procesados / total_comentarios) * 100, 1)
        if total_comentarios > 0
        else 0.0
    )

    tiempo_promedio = db.scalar(select(func.avg(TiempoAtencion.tiempo_minutos)))

    return ResumenDashboard(
        clientes=total_clientes,
        clientes_activos=clientes_activos,
        comentarios=total_comentarios,
        comentarios_procesados=comentarios_procesados,
        comentarios_pendientes=total_comentarios - comentarios_procesados,
        porcentaje_procesados=porcentaje_procesados,
        tiempo_promedio_minutos=(
            round(float(tiempo_promedio), 2) if tiempo_promedio is not None else 0.0
        ),
    )


@router.get("/tiempos-diarios", response_model=list[TiempoDiario])
def tiempos_diarios(
    dias: int = 7,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """
    Promedio del tiempo de atención agrupado por día, de los últimos
    `dias` días registrados en la tabla `tiempos_atencion`. Alimenta
    la gráfica "Tiempos de atención" del dashboard con datos reales
    en vez de datos de ejemplo.
    """
    desde = date.today() - timedelta(days=dias - 1)

    consulta = (
        select(
            TiempoAtencion.fecha,
            func.avg(TiempoAtencion.tiempo_minutos).label("promedio"),
            func.count(TiempoAtencion.id).label("cantidad"),
        )
        .where(TiempoAtencion.fecha >= desde)
        .group_by(TiempoAtencion.fecha)
        .order_by(TiempoAtencion.fecha)
    )

    filas = db.execute(consulta).all()

    return [
        TiempoDiario(
            fecha=fila.fecha.isoformat(),
            promedio_minutos=round(float(fila.promedio), 2),
            cantidad_registros=int(fila.cantidad),
        )
        for fila in filas
    ]
