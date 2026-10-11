"""initial_schema_12_tables

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-11 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear tipos Enum nativos de PostgreSQL
    sa.Enum("ADMIN", "OPERATOR", "APPROVER", "AUDITOR", "VIEWER", name="user_role_enum").create(op.get_bind())
    sa.Enum("ACTIVE", "SUSPENDED", "REVOKED", name="agent_status_enum").create(op.get_bind())
    sa.Enum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="risk_level_enum").create(op.get_bind())
    sa.Enum("ALLOW", "DENY", "REQUIRE_APPROVAL", name="rule_effect_enum").create(op.get_bind())
    sa.Enum("ALLOW", "DENY", "REQUIRE_APPROVAL", name="policy_decision_enum").create(op.get_bind())
    sa.Enum("PENDING_APPROVAL", "REJECTED", "EXECUTED", name="execution_status_enum").create(op.get_bind())
    sa.Enum("PENDING", "APPROVED", "REJECTED", "EXPIRED", name="approval_status_enum").create(op.get_bind())
    sa.Enum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="alert_severity_enum").create(op.get_bind())
    sa.Enum("OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED", name="alert_status_enum").create(op.get_bind())
    sa.Enum("USER", "AGENT", "SYSTEM", name="actor_type_enum").create(op.get_bind())

    # 2. Tabla organizations (Tenant Root)
    op.create_table(
        "organizations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # 3. Tabla users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("role", postgresql.ENUM("ADMIN", "OPERATOR", "APPROVER", "AUDITOR", "VIEWER", name="user_role_enum", create_type=False), nullable=False, server_default="OPERATOR"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_users_organization_id", "users", ["organization_id"])
    op.create_index("ix_users_email", "users", ["email"])

    # 4. Tabla agents
    op.create_table(
        "agents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("purpose", sa.Text(), nullable=True),
        sa.Column("status", postgresql.ENUM("ACTIVE", "SUSPENDED", "REVOKED", name="agent_status_enum", create_type=False), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_agents_organization_id", "agents", ["organization_id"])
    op.create_index("ix_agents_owner_user_id", "agents", ["owner_user_id"])

    # 5. Tabla tools
    op.create_table(
        "tools",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("protocol", sa.String(50), nullable=False, server_default="REST"),
        sa.Column("endpoint_url", sa.String(1024), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_tools_organization_id", "tools", ["organization_id"])

    # 6. Tabla agent_tools (N:N con config JSONB)
    op.create_table(
        "agent_tools",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tool_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tools.id", ondelete="CASCADE"), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("config", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("agent_id", "tool_id", name="uq_agent_tool_pair"),
    )
    op.create_index("ix_agent_tools_agent_id", "agent_tools", ["agent_id"])
    op.create_index("ix_agent_tools_tool_id", "agent_tools", ["tool_id"])
    op.create_index("idx_agent_tools_config_gin", "agent_tools", ["config"], postgresql_using="gin")

    # 7. Tabla tool_actions
    op.create_table(
        "tool_actions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tool_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tools.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action_name", sa.String(255), nullable=False),
        sa.Column("risk_level", postgresql.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL", name="risk_level_enum", create_type=False), nullable=False, server_default="LOW"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("tool_id", "action_name", name="uq_tool_action_name"),
    )
    op.create_index("ix_tool_actions_tool_id", "tool_actions", ["tool_id"])

    # 8. Tabla policies
    op.create_table(
        "policies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_policies_organization_id", "policies", ["organization_id"])

    # 9. Tabla policy_rules (con conditions JSONB)
    op.create_table(
        "policy_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("policy_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("policies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("effect", postgresql.ENUM("ALLOW", "DENY", "REQUIRE_APPROVAL", name="rule_effect_enum", create_type=False), nullable=False, server_default="DENY"),
        sa.Column("tool_action_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tool_actions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("target_agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agents.id", ondelete="CASCADE"), nullable=True),
        sa.Column("conditions", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_policy_rules_policy_id", "policy_rules", ["policy_id"])
    op.create_index("ix_policy_rules_tool_action_id", "policy_rules", ["tool_action_id"])
    op.create_index("ix_policy_rules_target_agent_id", "policy_rules", ["target_agent_id"])
    op.create_index("idx_policy_rules_conditions_gin", "policy_rules", ["conditions"], postgresql_using="gin")

    # 10. Tabla executions (Trazas Forenses)
    op.create_table(
        "executions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agents.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("delegator_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("tool_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tools.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("tool_action_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tool_actions.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("resource", sa.String(255), nullable=True),
        sa.Column("request_context", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("decision", postgresql.ENUM("ALLOW", "DENY", "REQUIRE_APPROVAL", name="policy_decision_enum", create_type=False), nullable=False),
        sa.Column("status", postgresql.ENUM("PENDING_APPROVAL", "REJECTED", "EXECUTED", name="execution_status_enum", create_type=False), nullable=False, server_default="EXECUTED"),
        sa.Column("evaluated_policy_rule_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("policy_rules.id", ondelete="SET NULL"), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_executions_organization_id", "executions", ["organization_id"])
    op.create_index("ix_executions_agent_id", "executions", ["agent_id"])
    op.create_index("ix_executions_delegator_user_id", "executions", ["delegator_user_id"])
    op.create_index("ix_executions_tool_id", "executions", ["tool_id"])
    op.create_index("ix_executions_tool_action_id", "executions", ["tool_action_id"])
    op.create_index("ix_executions_timestamp", "executions", ["timestamp"])
    op.create_index("idx_executions_request_context_gin", "executions", ["request_context"], postgresql_using="gin")
    op.create_index("idx_executions_org_timestamp", "executions", ["organization_id", "timestamp"])

    # 11. Tabla approvals (HITL)
    op.create_table(
        "approvals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("execution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("executions.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("assigned_approver_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", postgresql.ENUM("PENDING", "APPROVED", "REJECTED", "EXPIRED", name="approval_status_enum", create_type=False), nullable=False, server_default="PENDING"),
        sa.Column("resolution_reason", sa.Text(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_approvals_execution_id", "approvals", ["execution_id"])
    op.create_index("ix_approvals_assigned_approver_id", "approvals", ["assigned_approver_id"])
    op.create_index("ix_approvals_status", "approvals", ["status"])

    # 12. Tabla alerts (Incidentes)
    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("execution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("executions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False, server_default="Incidente de Seguridad"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("severity", postgresql.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL", name="alert_severity_enum", create_type=False), nullable=False, server_default="MEDIUM"),
        sa.Column("status", postgresql.ENUM("OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED", name="alert_status_enum", create_type=False), nullable=False, server_default="OPEN"),
        sa.Column("resolved_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_alerts_organization_id", "alerts", ["organization_id"])
    op.create_index("ix_alerts_execution_id", "alerts", ["execution_id"])
    op.create_index("ix_alerts_status", "alerts", ["status"])

    # 13. Tabla audit_events (Log Inmutable Administrativo)
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("actor_type", postgresql.ENUM("USER", "AGENT", "SYSTEM", name="actor_type_enum", create_type=False), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", sa.String(255), nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_audit_events_organization_id", "audit_events", ["organization_id"])
    op.create_index("ix_audit_events_actor_id", "audit_events", ["actor_id"])
    op.create_index("ix_audit_events_event_type", "audit_events", ["event_type"])
    op.create_index("ix_audit_events_timestamp", "audit_events", ["timestamp"])
    op.create_index("idx_audit_events_metadata_gin", "audit_events", ["metadata"], postgresql_using="gin")
    op.create_index("idx_audit_events_org_timestamp", "audit_events", ["organization_id", "timestamp"])


def downgrade() -> None:
    # 1. Eliminar las 12 tablas en orden inverso respetando integridad referencial
    op.drop_table("audit_events")
    op.drop_table("alerts")
    op.drop_table("approvals")
    op.drop_table("executions")
    op.drop_table("policy_rules")
    op.drop_table("policies")
    op.drop_table("tool_actions")
    op.drop_table("agent_tools")
    op.drop_table("tools")
    op.drop_table("agents")
    op.drop_table("users")
    op.drop_table("organizations")

    # 2. Eliminar tipos Enum
    sa.Enum(name="actor_type_enum").drop(op.get_bind())
    sa.Enum(name="alert_status_enum").drop(op.get_bind())
    sa.Enum(name="alert_severity_enum").drop(op.get_bind())
    sa.Enum(name="approval_status_enum").drop(op.get_bind())
    sa.Enum(name="execution_status_enum").drop(op.get_bind())
    sa.Enum(name="policy_decision_enum").drop(op.get_bind())
    sa.Enum(name="rule_effect_enum").drop(op.get_bind())
    sa.Enum(name="risk_level_enum").drop(op.get_bind())
    sa.Enum(name="agent_status_enum").drop(op.get_bind())
    sa.Enum(name="user_role_enum").drop(op.get_bind())
