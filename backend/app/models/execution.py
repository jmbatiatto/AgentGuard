"""Modelo de Trazas Forenses de Ejecución en Runtime (Execution Trace)."""

import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import PolicyDecision, ExecutionStatus

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.agent import Agent
    from app.models.user import User
    from app.models.tool import Tool, ToolAction
    from app.models.policy import PolicyRule
    from app.models.approval import Approval
    from app.models.alert import Alert


class Execution(Base):
    """Registro inmutable de intento de ejecución y decisión del Gateway (PEP)."""
    __tablename__ = "executions"
    __table_args__ = (
        Index("idx_executions_request_context_gin", "request_context", postgresql_using="gin"),
        Index("idx_executions_org_timestamp", "organization_id", "timestamp"),
    )

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
    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    delegator_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    tool_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tools.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    tool_action_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tool_actions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    resource: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    request_context: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    decision: Mapped[PolicyDecision] = mapped_column(
        SQLEnum(PolicyDecision, name="policy_decision_enum", native_enum=True),
        nullable=False,
    )
    status: Mapped[ExecutionStatus] = mapped_column(
        SQLEnum(ExecutionStatus, name="execution_status_enum", native_enum=True),
        nullable=False,
        default=ExecutionStatus.EXECUTED,
    )
    evaluated_policy_rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("policy_rules.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="executions")
    agent: Mapped["Agent"] = relationship("Agent", back_populates="executions")
    delegator_user: Mapped[Optional["User"]] = relationship("User", back_populates="delegated_executions")
    tool: Mapped["Tool"] = relationship("Tool", back_populates="executions")
    tool_action: Mapped["ToolAction"] = relationship("ToolAction", back_populates="executions")
    evaluated_policy_rule: Mapped[Optional["PolicyRule"]] = relationship("PolicyRule", back_populates="executions")
    approval: Mapped[Optional["Approval"]] = relationship("Approval", back_populates="execution", uselist=False, cascade="all, delete-orphan")
    # Nota de Arquitectura Forense: 'approval' posee cascade="all, delete-orphan", pero 'alert'
    # no lo tiene intencionalmente, ya que los incidentes de seguridad constituyen evidencia SIEM inmutable
    # con ciclo de vida independiente del registro de ejecución.
    alert: Mapped[Optional["Alert"]] = relationship("Alert", back_populates="execution", uselist=False)

    # Propiedades calculadas para serialización en DTOs y lectura enriquecida
    @property
    def agent_name(self) -> Optional[str]:
        """Nombre del agente ejecutor."""
        return self.agent.name if self.agent else None

    @property
    def tool_name(self) -> Optional[str]:
        """Nombre de la herramienta interceptada."""
        return self.tool.name if self.tool else None

    @property
    def action_name(self) -> Optional[str]:
        """Nombre de la acción atómica ejecutada."""
        return self.tool_action.action_name if self.tool_action else None

