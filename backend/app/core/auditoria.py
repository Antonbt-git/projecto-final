"""
Registro de auditoría de acciones relevantes del sistema (tabla
`auditoria`). Se usa desde los distintos routers para dejar
trazabilidad de quién hizo qué, sobre qué tabla/registro y desde
qué dirección IP.
"""
from typing import Any

from sqlalchemy.orm import Session

from app.database.models import Auditoria


def registrar_auditoria(
    db: Session,
    *,
    usuario_id: int | None,
    accion: str,
    tabla: str | None = None,
    registro_id: int | None = None,
    detalles: dict[str, Any] | None = None,
    ip: str | None = None,
) -> Auditoria:
    entrada = Auditoria(
        usuario_id=usuario_id,
        accion=accion,
        tabla=tabla,
        registro_id=registro_id,
        detalles=detalles,
        ip=ip,
    )
    db.add(entrada)
    db.commit()
    db.refresh(entrada)

    return entrada
