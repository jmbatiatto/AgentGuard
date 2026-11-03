"""add_organization_settings_column

Revision ID: 004_add_org_settings
Revises: 003_add_api_keys
Create Date: 2026-11-02 23:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# Identificadores de revisión utilizados por Alembic
revision: str = "004_add_org_settings"
down_revision: Union[str, None] = "003_add_api_keys"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Agrega la columna settings (JSONB) a la tabla organizations para gobernanza y postura de seguridad."""
    op.add_column(
        "organizations",
        sa.Column(
            "settings",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )


def downgrade() -> None:
    """Elimina la columna settings de la tabla organizations revirtiendo a la revisión 003."""
    op.drop_column("organizations", "settings")
