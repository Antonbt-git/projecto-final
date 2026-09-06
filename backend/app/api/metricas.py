from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_db, obtener_usuario_actual
from app.core.auditoria import registrar_auditoria
from app.core.estadisticas import SinDatosError, calcular_metricas
from app.database.models import MetricaEstadistica, TiempoAtencion, Usuario
from app.schemas.metrica import MetricaCalcularRequest, MetricaEstadisticaResponse

router = APIRouter(
    prefix="/api/metricas",
    tags=["Métricas estadísticas"],
)


@router.post("/calcular", response_model=MetricaEstadisticaResponse)
def calcular_metricas_periodo(
    datos: MetricaCalcularRequest,
    request: Request,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """
    Calcula (con NumPy/SciPy) media, mediana, desviación estándar,
    mínimo, máximo y percentiles 25/75 de los tiempos de atención
    registrados en el rango de fechas indicado, y guarda el
    resultado en `metricas_estadisticas`.
    """
    if datos.fecha_fin < datos.fecha_inicio:
        raise HTTPException(
            status_code=400,
            detail="fecha_fin no puede ser anterior a fecha_inicio.",
        )

    tiempos = db.scalars(
        select(TiempoAtencion.tiempo_minutos)
        .where(TiempoAtencion.fecha >= datos.fecha_inicio)
        .where(TiempoAtencion.fecha <= datos.fecha_fin)
    ).all()

    try:
        metricas = calcular_metricas([float(tiempo) for tiempo in tiempos])
    except SinDatosError as error:
        raise HTTPException(status_code=404, detail=str(error))

    nueva_metrica = MetricaEstadistica(
        fecha_inicio=datos.fecha_inicio,
        fecha_fin=datos.fecha_fin,
        cantidad_registros=metricas["cantidad_registros"],
        media=metricas["media"],
        mediana=metricas["mediana"],
        desviacion_estandar=metricas["desviacion_estandar"],
        minimo=metricas["minimo"],
        maximo=metricas["maximo"],
        percentil_25=metricas["percentil_25"],
        percentil_75=metricas["percentil_75"],
    )
    db.add(nueva_metrica)
    db.commit()
    db.refresh(nueva_metrica)

    registrar_auditoria(
        db,
        usuario_id=usuario.id,
        accion="calcular_metricas",
        tabla="metricas_estadisticas",
        registro_id=nueva_metrica.id,
        detalles={
            "fecha_inicio": str(datos.fecha_inicio),
            "fecha_fin": str(datos.fecha_fin),
            "cantidad_registros": metricas["cantidad_registros"],
        },
        ip=request.client.host if request.client else None,
    )

    return nueva_metrica


@router.get("/", response_model=list[MetricaEstadisticaResponse])
def listar_metricas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    resultado = db.execute(
        select(MetricaEstadistica).order_by(MetricaEstadistica.created_at.desc())
    )
    return resultado.scalars().all()
