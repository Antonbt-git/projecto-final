from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.database.models import Cliente
from app.schemas.cliente import ClienteResponse, ClienteCreate, ClienteUpdate

from fastapi import HTTPException


router = APIRouter(
    prefix="/api/clientes",
    tags=["Clientes"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ClienteResponse])
def listar_clientes(db: Session = Depends(get_db)):
    resultado = db.execute(
        select(Cliente).order_by(Cliente.created_at.desc())
    )
    return resultado.scalars().all()



@router.post("/", response_model=ClienteResponse)
def crear_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db),
):
    nuevo_cliente = Cliente(**cliente.model_dump())

    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)

    return nuevo_cliente

@router.get("/{cliente_id}", response_model=ClienteResponse)
def obtener_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
):
    cliente = db.get(Cliente, cliente_id)

    if cliente is None:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado",
        )

    return cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def actualizar_cliente(
    cliente_id: int,
    datos: ClienteUpdate,
    db: Session = Depends(get_db),
):
    cliente = db.get(Cliente, cliente_id)

    if cliente is None:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado",
        )

    # Solo se actualizan los campos que realmente vinieron en la
    # petición, para permitir ediciones parciales desde el frontend.
    datos_actualizados = datos.model_dump(exclude_unset=True)

    if not datos_actualizados:
        raise HTTPException(
            status_code=400,
            detail="No se enviaron campos para actualizar.",
        )

    for campo, valor in datos_actualizados.items():
        setattr(cliente, campo, valor)

    db.commit()
    db.refresh(cliente)

    return cliente


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
):
    cliente = db.get(Cliente, cliente_id)

    if cliente is None:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado",
        )

    db.delete(cliente)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)