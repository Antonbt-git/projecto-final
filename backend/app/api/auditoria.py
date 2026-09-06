from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_db, obtener_usuario_actual
from app.database.models import Auditoria, Usuario
from app.schemas.auditoria import AuditoriaResponse

router = APIRouter(
    prefix="/api/auditoria",
    tags=["Auditoría"],
)


@router.get("/", response_model=list[AuditoriaResponse])
def listar_auditoria(
    tabla: str | None = None,
    usuario_id: int | None = None,
    limite: int = 100,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    consulta = select(Auditoria).order_by(Auditoria.created_at.desc())

    if tabla is not None:
        consulta = consulta.where(Auditoria.tabla == tabla)
    if usuario_id is not None:
        consulta = consulta.where(Auditoria.usuario_id == usuario_id)

    consulta = consulta.limit(min(limite, 500))

    resultado = db.execute(consulta)
    return resultado.scalars().all()
