"""Modelos de Herramientas Externas (Tools) y Acciones Atómicas (ToolActions)."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import RiskLevel

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.agent import AgentTool
    from app.models.policy import PolicyRule
    from app.models.execution import Execution


class Tool(Base):
    """Herramienta o servicio externo protegido por AgentGuard."""
    __tablename__ = "tools"

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
    protocol: Mapped[str] = mapped_column(String(50), default="REST", nullable=False)
    endpoint_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="tools")
    actions: Mapped[List["ToolAction"]] = relationship("ToolAction", back_populates="tool", cascade="all, delete-orphan")
    agent_tools: Mapped[List["AgentTool"]] = relationship("AgentTool", back_populates="tool", cascade="all, delete-orphan")
    executions: Mapped[List["Execution"]] = relationship("Execution", back_populates="tool")

    @property
    def assigned_agents(self) -> List[str]:
        """Lista los nombres de agentes autorizados a invocar esta herramienta."""
        if not self.agent_tools:
            return []
        return [at.agent.name for at in self.agent_tools if at.agent]



class ToolAction(Base):
    """Acción atómica expuesta por una herramienta con nivel de riesgo tipificado."""
    __tablename__ = "tool_actions"
    __table_args__ = (
        UniqueConstraint("tool_id", "action_name", name="uq_tool_action_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    tool_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tools.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action_name: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(
        SQLEnum(RiskLevel, name="risk_level_enum", native_enum=True),
        nullable=False,
        default=RiskLevel.LOW,
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    tool: Mapped["Tool"] = relationship("Tool", back_populates="actions")
    policy_rules: Mapped[List["PolicyRule"]] = relationship("PolicyRule", back_populates="tool_action")
    executions: Mapped[List["Execution"]] = relationship("Execution", back_populates="tool_action")
