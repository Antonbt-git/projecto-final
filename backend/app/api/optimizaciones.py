from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_db, obtener_usuario_actual
from app.core.auditoria import registrar_auditoria
from app.core.optimizacion import ParametrosInvalidosError, optimizar_recursos
from app.database.models import Optimizacion, Usuario
from app.schemas.optimizacion import OptimizacionCreate, OptimizacionResponse

router = APIRouter(
    prefix="/api/optimizaciones",
    tags=["Optimizaciones"],
)


@router.post("/", response_model=OptimizacionResponse)
def crear_optimizacion(
    datos: OptimizacionCreate,
    request: Request,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    """
    Ejecuta una optimización de asignación de recursos con SciPy
    (programación lineal, scipy.optimize.linprog) y guarda el
    escenario junto con su resultado.
    """
    parametros_entrada = {
        "recursos": datos.recursos,
        "costos_unitarios": datos.costos_unitarios,
        "capacidad_por_unidad": datos.capacidad_por_unidad,
        "demanda_minima": datos.demanda_minima,
        "margen_maximo": datos.margen_maximo,
    }

    try:
        resultado = optimizar_recursos(
            recursos=datos.recursos,
            costos_unitarios=datos.costos_unitarios,
            capacidad_por_unidad=datos.capacidad_por_unidad,
            demanda_minima=datos.demanda_minima,
            margen_maximo=datos.margen_maximo,
        )
    except ParametrosInvalidosError as error:
        raise HTTPException(status_code=400, detail=str(error))

    nueva_optimizacion = Optimizacion(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        parametros_entrada=parametros_entrada,
        resultado=resultado,
        costo_inicial=resultado["costo_inicial"],
        costo_optimizado=resultado["costo"],
        estado="completado",
    )
    db.add(nueva_optimizacion)
    db.commit()
    db.refresh(nueva_optimizacion)

    registrar_auditoria(
        db,
        usuario_id=usuario.id,
        accion="crear_optimizacion",
        tabla="optimizaciones",
        registro_id=nueva_optimizacion.id,
        detalles={
            "nombre": datos.nombre,
            "costo_inicial": resultado["costo_inicial"],
            "costo_optimizado": resultado["costo"],
        },
        ip=request.client.host if request.client else None,
    )

    return nueva_optimizacion


@router.get("/", response_model=list[OptimizacionResponse])
def listar_optimizaciones(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    resultado = db.execute(
        select(Optimizacion).order_by(Optimizacion.created_at.desc())
    )
    return resultado.scalars().all()


@router.get("/{optimizacion_id}", response_model=OptimizacionResponse)
def obtener_optimizacion(
    optimizacion_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    optimizacion = db.get(Optimizacion, optimizacion_id)

    if optimizacion is None:
        raise HTTPException(status_code=404, detail="Optimización no encontrada")

    return optimizacion
