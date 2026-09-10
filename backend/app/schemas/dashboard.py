from pydantic import BaseModel


class ResumenDashboard(BaseModel):
    clientes: int
    clientes_activos: int
    comentarios: int
    comentarios_procesados: int
    comentarios_pendientes: int
    porcentaje_procesados: float
    tiempo_promedio_minutos: float


class TiempoDiario(BaseModel):
    fecha: str
    promedio_minutos: float
    cantidad_registros: int
