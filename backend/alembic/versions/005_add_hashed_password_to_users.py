"""add_hashed_password_to_users

Revision ID: 005_add_hashed_password
Revises: 004_add_org_settings
Create Date: 2026-11-03 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Identificadores de revisión utilizados por Alembic
revision: str = "005_add_hashed_password"
down_revision: Union[str, None] = "004_add_org_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Agrega la columna hashed_password (String(255), nullable=True) a la tabla users."""
    op.add_column(
        "users",
        sa.Column("hashed_password", sa.String(255), nullable=True),
    )


def downgrade() -> None:
    """Elimina la columna hashed_password de la tabla users."""
    op.drop_column("users", "hashed_password")
