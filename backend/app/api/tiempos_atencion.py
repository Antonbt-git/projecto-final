from datetime import date

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_db, obtener_usuario_actual
from app.core.auditoria import registrar_auditoria
from app.database.models import TiempoAtencion, Usuario
from app.schemas.tiempo_atencion import TiempoAtencionCreate, TiempoAtencionResponse

router = APIRouter(
    prefix="/api/tiempos-atencion",
    tags=["Tiempos de atención"],
)


@router.post("/", response_model=TiempoAtencionResponse)
def registrar_tiempo(
    datos: TiempoAtencionCreate,
    request: Request,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    valores = datos.model_dump(exclude_unset=True)

    # Si no se especifica un operador, se usa el nombre del usuario
    # autenticado que registra el tiempo de atención.
    valores.setdefault("operador", usuario.nombre)

    nuevo_registro = TiempoAtencion(**valores)
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)

    registrar_auditoria(
        db,
        usuario_id=usuario.id,
        accion="registrar_tiempo_atencion",
        tabla="tiempos_atencion",
        registro_id=nuevo_registro.id,
        detalles={"tiempo_minutos": float(nuevo_registro.tiempo_minutos)},
        ip=request.client.host if request.client else None,
    )

    return nuevo_registro


@router.get("/", response_model=list[TiempoAtencionResponse])
def listar_tiempos(
    fecha_inicio: date | None = None,
    fecha_fin: date | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    consulta = select(TiempoAtencion).order_by(TiempoAtencion.fecha.desc())

    if fecha_inicio is not None:
        consulta = consulta.where(TiempoAtencion.fecha >= fecha_inicio)
    if fecha_fin is not None:
        consulta = consulta.where(TiempoAtencion.fecha <= fecha_fin)

    resultado = db.execute(consulta)
    return resultado.scalars().all()
