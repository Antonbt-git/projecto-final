"""agregar reconocimiento facial a usuarios

Revision ID: ae767edccfb7
Revises: 159fba03ebe1
Create Date: 2026-09-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae767edccfb7'
down_revision: Union[str, Sequence[str], None] = '159fba03ebe1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'usuarios',
        sa.Column(
            'rostro_registrado',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        'usuarios',
        sa.Column('rostro_imagen', sa.Text(), nullable=True),
    )
    op.add_column(
        'codigos_verificacion',
        sa.Column(
            'tipo',
            sa.String(length=20),
            nullable=False,
            server_default='login',
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('codigos_verificacion', 'tipo')
    op.drop_column('usuarios', 'rostro_imagen')
    op.drop_column('usuarios', 'rostro_registrado')
