from datetime import datetime

from pydantic import BaseModel


class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CategoriaResumen(BaseModel):
    """Resumen de una categoría junto con el conteo de comentarios
    (total, procesados y pendientes) que tiene asociados. Se usa para
    los apartados de la pantalla de Comentarios, guiándose por la
    tabla `categorias` de la base de datos en lugar de una lista fija
    en el frontend."""

    id: int
    nombre: str
    descripcion: str | None = None
    activo: bool
    total_comentarios: int
    procesados: int
    pendientes: int
