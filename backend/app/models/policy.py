"""Modelos de Políticas y Reglas Deterministas de Autorización."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import RuleEffect

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.agent import Agent
    from app.models.tool import ToolAction
    from app.models.execution import Execution


class Policy(Base):
    """Contenedor de políticas de autorización para una organización."""
    __tablename__ = "policies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="policies")
    rules: Mapped[List["PolicyRule"]] = relationship("PolicyRule", back_populates="policy", cascade="all, delete-orphan")


class PolicyRule(Base):
    """Regla atómica evaluada por el motor PDP con predicados en JSONB."""
    __tablename__ = "policy_rules"
    __table_args__ = (
        Index("idx_policy_rules_conditions_gin", "conditions", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    policy_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("policies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    effect: Mapped[RuleEffect] = mapped_column(
        SQLEnum(RuleEffect, name="rule_effect_enum", native_enum=True),
        nullable=False,
        default=RuleEffect.DENY,
    )
    tool_action_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tool_actions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    target_agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    conditions: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    policy: Mapped["Policy"] = relationship("Policy", back_populates="rules")
    tool_action: Mapped["ToolAction"] = relationship("ToolAction", back_populates="policy_rules")
    target_agent: Mapped[Optional["Agent"]] = relationship("Agent", back_populates="targeted_rules")
    executions: Mapped[List["Execution"]] = relationship("Execution", back_populates="evaluated_policy_rule")

    @property
    def action_name(self) -> Optional[str]:
        """Nombre de la acción atómica evaluada."""
        return self.tool_action.action_name if self.tool_action else None

    @property
    def tool_name(self) -> Optional[str]:
        """Nombre de la herramienta padre."""
        return self.tool_action.tool.name if self.tool_action and self.tool_action.tool else None

    @property
    def agent_name(self) -> str:
        """Nombre del agente objetivo o indicación de regla global."""
        return self.target_agent.name if self.target_agent else "Global / Multi-agent"

