"""agregar codigos_verificacion (2FA)

Revision ID: 159fba03ebe1
Revises: 2d0e6ec5609a
Create Date: 2026-09-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '159fba03ebe1'
down_revision: Union[str, Sequence[str], None] = '2d0e6ec5609a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'codigos_verificacion',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('codigo', sa.String(length=6), nullable=False),
        sa.Column('expira_en', sa.DateTime(), nullable=False),
        sa.Column('usado', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_codigos_verificacion_id'),
        'codigos_verificacion',
        ['id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_codigos_verificacion_usuario_id'),
        'codigos_verificacion',
        ['usuario_id'],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_codigos_verificacion_usuario_id'), table_name='codigos_verificacion')
    op.drop_index(op.f('ix_codigos_verificacion_id'), table_name='codigos_verificacion')
    op.drop_table('codigos_verificacion')
