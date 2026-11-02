"""add_latency_ms_to_executions

Revision ID: 002_add_latency_ms
Revises: 001_initial_schema
Create Date: 2026-11-02 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Identificadores de revisión utilizados por Alembic
revision: str = "002_add_latency_ms"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Agrega la columna latency_ms a la tabla executions para telemetría forense."""
    op.add_column(
        "executions",
        sa.Column("latency_ms", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    """Remueve la columna latency_ms revirtiendo el esquema a la revisión 001."""
    op.drop_column("executions", "latency_ms")
