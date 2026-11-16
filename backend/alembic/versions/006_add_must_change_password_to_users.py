"""add_must_change_password_to_users

Revision ID: 006_add_must_change_password
Revises: 005_add_hashed_password
Create Date: 2026-11-16 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Identificadores de revisión utilizados por Alembic
revision: str = "006_add_must_change_password"
down_revision: Union[str, None] = "005_add_hashed_password"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Agrega la columna must_change_password (Boolean, nullable=False, server_default=false) a la tabla users."""
    op.add_column(
        "users",
        sa.Column(
            "must_change_password",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )


def downgrade() -> None:
    """Elimina la columna must_change_password de la tabla users."""
    op.drop_column("users", "must_change_password")
