from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.auth import get_db, obtener_usuario_actual
from app.core.estadisticas import SinDatosError, calcular_metricas
from app.core.interpolacion import DatosInsuficientesError, interpolar_serie
from app.database.models import TiempoAtencion, Usuario
from app.schemas.scipy_analisis import (
    EstadisticasRequest,
    EstadisticasResponse,
    InterpolacionRequest,
    InterpolacionResponse,
)

router = APIRouter(
    prefix="/api/scipy",
    tags=["SciPy — Estadísticas e interpolación"],
)


def _formatear_estadisticas(valores: list[float]) -> dict:
    metricas = calcular_metricas(valores)

    return {
        "cantidad": metricas["cantidad_registros"],
        "media": metricas["media"],
        "mediana": metricas["mediana"],
        "desviacion_estandar": metricas["desviacion_estandar"],
        "minimo": metricas["minimo"],
        "maximo": metricas["maximo"],
        "percentil_25": metricas["percentil_25"],
        "percentil_75": metricas["percentil_75"],
    }


@router.get("/estadisticas", response_model=EstadisticasResponse)
def obtener_estadisticas(
    dias: int = 30,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """
    Estadísticas descriptivas (NumPy/SciPy: media, mediana, desviación
    estándar, mínimo, máximo y percentiles 25/75) calculadas sobre los
    tiempos de atención registrados en los últimos `dias` días.
    Alimenta el apartado "Estadísticas" del dashboard.
    """
    desde = date.today() - timedelta(days=dias)

    valores = db.scalars(
        select(TiempoAtencion.tiempo_minutos).where(TiempoAtencion.fecha >= desde)
    ).all()

    try:
        return _formatear_estadisticas([float(valor) for valor in valores])
    except SinDatosError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/estadisticas", response_model=EstadisticasResponse)
def calcular_estadisticas_valores(datos: EstadisticasRequest):
    """
    Igual que el GET, pero calcula las estadísticas (NumPy/SciPy)
    sobre una lista de valores enviada directamente en el cuerpo de
    la petición (por ejemplo, desde la pantalla de "Métricas").
    """
    try:
        return _formatear_estadisticas(datos.valores)
    except SinDatosError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/interpolacion", response_model=InterpolacionResponse)
def obtener_interpolacion(
    dias: int = 7,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """
    Interpola (SciPy: `scipy.interpolate.interp1d`) el promedio diario
    de los tiempos de atención de los últimos `dias` días, para
    suavizar la curva y proyectar el siguiente valor. Alimenta el
    apartado "Interpolación" del dashboard.
    """
    desde = date.today() - timedelta(days=dias - 1)

    consulta = (
        select(
            TiempoAtencion.fecha,
            func.avg(TiempoAtencion.tiempo_minutos).label("promedio"),
        )
        .where(TiempoAtencion.fecha >= desde)
        .group_by(TiempoAtencion.fecha)
        .order_by(TiempoAtencion.fecha)
    )
    filas = db.execute(consulta).all()

    if len(filas) < 2:
        raise HTTPException(
            status_code=404,
            detail=(
                "No hay suficientes tiempos de atención registrados en "
                "ese rango de fechas para interpolar (se necesitan al "
                "menos 2 días con datos)."
            ),
        )

    valores = [float(fila.promedio) for fila in filas]

    try:
        resultado = interpolar_serie(valores)
    except DatosInsuficientesError as error:
        raise HTTPException(status_code=400, detail=str(error))

    resultado["fechas"] = [fila.fecha.isoformat() for fila in filas]
    resultado["valores_originales"] = valores

    return resultado


@router.post("/interpolacion", response_model=InterpolacionResponse)
def calcular_interpolacion_valores(datos: InterpolacionRequest):
    """
    Igual que el GET, pero interpola (SciPy) una lista de valores
    enviada directamente en el cuerpo de la petición.
    """
    try:
        return interpolar_serie(datos.valores)
    except DatosInsuficientesError as error:
        raise HTTPException(status_code=400, detail=str(error))
