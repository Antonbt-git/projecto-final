"""agregar comentarios, analisis_nlp, categorias, tiempos_atencion, metricas_estadisticas, optimizaciones y auditoria

Revision ID: d1fa006d5311
Revises: ae767edccfb7
Create Date: 2026-09-05 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd1fa006d5311'
down_revision: Union[str, Sequence[str], None] = 'ae767edccfb7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # 6. Comentarios de clientes
    op.create_table(
        'comentarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cliente_id', sa.Integer(), nullable=True),
        sa.Column('contenido', sa.Text(), nullable=False),
        sa.Column('canal', sa.String(length=30), server_default='web', nullable=False),
        sa.Column('estado', sa.String(length=30), server_default='pendiente', nullable=False),
        sa.Column('categoria', sa.String(length=50), nullable=True),
        sa.Column('fecha', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('procesado', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_comentarios_id'), 'comentarios', ['id'], unique=False)
    op.create_index(op.f('ix_comentarios_cliente_id'), 'comentarios', ['cliente_id'], unique=False)

    # 7. Análisis NLP
    op.create_table(
        'analisis_nlp',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('comentario_id', sa.Integer(), nullable=False),
        sa.Column('idioma', sa.String(length=20), server_default='es', nullable=False),
        sa.Column('cantidad_palabras', sa.Integer(), server_default='0', nullable=False),
        sa.Column('palabras_limpias', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('palabras_frecuentes', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('categoria_detectada', sa.String(length=100), nullable=True),
        sa.Column('confianza', sa.Numeric(precision=5, scale=4), nullable=True),
        sa.Column('fecha_analisis', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['comentario_id'], ['comentarios.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_analisis_nlp_id'), 'analisis_nlp', ['id'], unique=False)
    op.create_index(op.f('ix_analisis_nlp_comentario_id'), 'analisis_nlp', ['comentario_id'], unique=False)

    # 8. Categorías de comentarios
    op.create_table(
        'categorias',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('activo', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('nombre'),
    )
    op.create_index(op.f('ix_categorias_id'), 'categorias', ['id'], unique=False)
    op.create_index(op.f('ix_categorias_nombre'), 'categorias', ['nombre'], unique=True)

    # Categorías iniciales
    categorias_iniciales = sa.table(
        'categorias',
        sa.column('nombre', sa.String),
    )
    op.bulk_insert(
        categorias_iniciales,
        [
            {'nombre': 'VENTAS'},
            {'nombre': 'SOPORTE'},
            {'nombre': 'RECLAMO'},
            {'nombre': 'CONSULTA'},
            {'nombre': 'FELICITACION'},
            {'nombre': 'OTROS'},
        ],
    )

    # 9. Tiempos de atención
    op.create_table(
        'tiempos_atencion',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cliente_id', sa.Integer(), nullable=True),
        sa.Column('comentario_id', sa.Integer(), nullable=True),
        sa.Column('tiempo_minutos', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('fecha', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('operador', sa.String(length=150), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['comentario_id'], ['comentarios.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_tiempos_atencion_id'), 'tiempos_atencion', ['id'], unique=False)
    op.create_index(op.f('ix_tiempos_atencion_cliente_id'), 'tiempos_atencion', ['cliente_id'], unique=False)
    op.create_index(op.f('ix_tiempos_atencion_comentario_id'), 'tiempos_atencion', ['comentario_id'], unique=False)

    # 10. Métricas estadísticas
    op.create_table(
        'metricas_estadisticas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('fecha_inicio', sa.Date(), nullable=False),
        sa.Column('fecha_fin', sa.Date(), nullable=False),
        sa.Column('cantidad_registros', sa.Integer(), nullable=False),
        sa.Column('media', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('mediana', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('desviacion_estandar', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('minimo', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('maximo', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('percentil_25', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('percentil_75', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_metricas_estadisticas_id'), 'metricas_estadisticas', ['id'], unique=False)

    # 11. Optimizaciones con SciPy
    op.create_table(
        'optimizaciones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=150), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('parametros_entrada', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('resultado', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('costo_inicial', sa.Numeric(precision=14, scale=4), nullable=True),
        sa.Column('costo_optimizado', sa.Numeric(precision=14, scale=4), nullable=True),
        sa.Column('estado', sa.String(length=30), server_default='pendiente', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_optimizaciones_id'), 'optimizaciones', ['id'], unique=False)

    # 12. Auditoría
    op.create_table(
        'auditoria',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=True),
        sa.Column('accion', sa.String(length=100), nullable=False),
        sa.Column('tabla', sa.String(length=100), nullable=True),
        sa.Column('registro_id', sa.Integer(), nullable=True),
        sa.Column('detalles', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_auditoria_id'), 'auditoria', ['id'], unique=False)
    op.create_index(op.f('ix_auditoria_usuario_id'), 'auditoria', ['usuario_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_auditoria_usuario_id'), table_name='auditoria')
    op.drop_index(op.f('ix_auditoria_id'), table_name='auditoria')
    op.drop_table('auditoria')

    op.drop_index(op.f('ix_optimizaciones_id'), table_name='optimizaciones')
    op.drop_table('optimizaciones')

    op.drop_index(op.f('ix_metricas_estadisticas_id'), table_name='metricas_estadisticas')
    op.drop_table('metricas_estadisticas')

    op.drop_index(op.f('ix_tiempos_atencion_comentario_id'), table_name='tiempos_atencion')
    op.drop_index(op.f('ix_tiempos_atencion_cliente_id'), table_name='tiempos_atencion')
    op.drop_index(op.f('ix_tiempos_atencion_id'), table_name='tiempos_atencion')
    op.drop_table('tiempos_atencion')

    op.drop_index(op.f('ix_categorias_nombre'), table_name='categorias')
    op.drop_index(op.f('ix_categorias_id'), table_name='categorias')
    op.drop_table('categorias')

    op.drop_index(op.f('ix_analisis_nlp_comentario_id'), table_name='analisis_nlp')
    op.drop_index(op.f('ix_analisis_nlp_id'), table_name='analisis_nlp')
    op.drop_table('analisis_nlp')

    op.drop_index(op.f('ix_comentarios_cliente_id'), table_name='comentarios')
    op.drop_index(op.f('ix_comentarios_id'), table_name='comentarios')
    op.drop_table('comentarios')
