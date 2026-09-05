from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.database.models import Cliente
from app.schemas.cliente import ClienteResponse, ClienteCreate

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
    resultado = db.execute(select(Cliente))
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