from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    false,
    func,
    true,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="USUARIO",
    )
    activo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    rostro_registrado: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    rostro_imagen: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class CodigoVerificacion(Base):
    __tablename__ = "codigos_verificacion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False,
        index=True,
    )
    codigo: Mapped[str] = mapped_column(String(6), nullable=False)
    tipo: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="login",
        server_default="login",
    )
    expira_en: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    usado: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class Cliente(Base):
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    telefono: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    empresa: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    activo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class Comentario(Base):
    __tablename__ = "comentarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cliente_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("clientes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    contenido: Mapped[str] = mapped_column(Text, nullable=False)
    canal: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="web",
        server_default="web",
    )
    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pendiente",
        server_default="pendiente",
    )
    categoria: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fecha: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    procesado: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )


class AnalisisNLP(Base):
    __tablename__ = "analisis_nlp"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    comentario_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("comentarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    idioma: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="es",
        server_default="es",
    )
    cantidad_palabras: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    palabras_limpias: Mapped[Any | None] = mapped_column(JSONB, nullable=True)
    palabras_frecuentes: Mapped[Any | None] = mapped_column(JSONB, nullable=True)
    categoria_detectada: Mapped[str | None] = mapped_column(String(100), nullable=True)
    confianza: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    fecha_analisis: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=true(),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class TiempoAtencion(Base):
    __tablename__ = "tiempos_atencion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cliente_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("clientes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    comentario_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("comentarios.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    tiempo_minutos: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    fecha: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        server_default=func.current_date(),
    )
    operador: Mapped[str | None] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class MetricaEstadistica(Base):
    __tablename__ = "metricas_estadisticas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=False)
    cantidad_registros: Mapped[int] = mapped_column(Integer, nullable=False)
    media: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    mediana: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    desviacion_estandar: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    minimo: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    maximo: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    percentil_25: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    percentil_75: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class Optimizacion(Base):
    __tablename__ = "optimizaciones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    parametros_entrada: Mapped[Any] = mapped_column(JSONB, nullable=False)
    resultado: Mapped[Any | None] = mapped_column(JSONB, nullable=True)
    costo_inicial: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    costo_optimizado: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pendiente",
        server_default="pendiente",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class Auditoria(Base):
    __tablename__ = "auditoria"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    accion: Mapped[str] = mapped_column(String(100), nullable=False)
    tabla: Mapped[str | None] = mapped_column(String(100), nullable=True)
    registro_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    detalles: Mapped[Any | None] = mapped_column(JSONB, nullable=True)
    ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
