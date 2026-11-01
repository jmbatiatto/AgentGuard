"""remediation_schema_columns_indexes_and_api_keys

Revision ID: 002_remediation_schema
Revises: 001_initial_schema
Create Date: 2026-11-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002_remediation_schema"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear nuevo tipo Enum nativo para ToolStatus
    tool_status_enum = postgresql.ENUM("ACTIVE", "PAUSED", "INACTIVE", name="tool_status_enum")
    tool_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Agregar valores a execution_status_enum en PostgreSQL
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE execution_status_enum ADD VALUE IF NOT EXISTS 'BLOCKED'")
        op.execute("ALTER TYPE execution_status_enum ADD VALUE IF NOT EXISTS 'EXPIRED'")
        op.execute("ALTER TYPE execution_status_enum ADD VALUE IF NOT EXISTS 'FAILED'")

    # 3. Alteraciones a la tabla organizations (settings de seguridad y postura)
    op.add_column("organizations", sa.Column("settings", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False))

    # 4. Alteraciones a la tabla tools (status y execution_mode)
    op.add_column("tools", sa.Column("status", sa.Enum("ACTIVE", "PAUSED", "INACTIVE", name="tool_status_enum", create_type=False), server_default="ACTIVE", nullable=False))
    op.add_column("tools", sa.Column("execution_mode", sa.String(length=50), server_default="SANDBOX", nullable=False))

    # 5. Alteraciones a la tabla executions (latency_ms real y response_payload diferido)
    op.add_column("executions", sa.Column("latency_ms", sa.Float(), server_default="0.0", nullable=False))
    op.add_column("executions", sa.Column("response_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    # 6. Crear tabla api_keys para autenticación perimetral del PEP Gateway
    op.create_table(
        "api_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("key_prefix", sa.String(length=16), nullable=False),
        sa.Column("hashed_key", sa.String(length=128), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_api_keys_organization_id", "api_keys", ["organization_id"])
    op.create_index("ix_api_keys_key_prefix", "api_keys", ["key_prefix"])
    op.create_index("ix_api_keys_hashed_key", "api_keys", ["hashed_key"], unique=True)

    # 7. Índices compuestos optimizados para auditoría forense y PDP
    op.create_index("ix_executions_org_decision_ts", "executions", ["organization_id", "decision", "timestamp"])
    op.create_index("ix_policy_rules_action_priority", "policy_rules", ["tool_action_id", "priority"])


def downgrade() -> None:
    op.drop_index("ix_policy_rules_action_priority", table_name="policy_rules")
    op.drop_index("ix_executions_org_decision_ts", table_name="executions")
    op.drop_table("api_keys")
    op.drop_column("executions", "response_payload")
    op.drop_column("executions", "latency_ms")
    op.drop_column("tools", "execution_mode")
    op.drop_column("tools", "status")
    op.drop_column("organizations", "settings")
    sa.Enum(name="tool_status_enum").drop(op.get_bind(), checkfirst=True)

