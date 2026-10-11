"""Modelos de Agentes de IA y Asociación con Herramientas."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AgentStatus

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.user import User
    from app.models.tool import Tool
    from app.models.policy import PolicyRule
    from app.models.execution import Execution


class Agent(Base):
    """Identidad de IA registrada y gobernada por AgentGuard."""
    __tablename__ = "agents"

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
    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[AgentStatus] = mapped_column(
        SQLEnum(AgentStatus, name="agent_status_enum", native_enum=True),
        nullable=False,
        default=AgentStatus.ACTIVE,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="agents")
    owner_user: Mapped["User"] = relationship("User", back_populates="sponsored_agents")
    agent_tools: Mapped[List["AgentTool"]] = relationship("AgentTool", back_populates="agent", cascade="all, delete-orphan")
    executions: Mapped[List["Execution"]] = relationship("Execution", back_populates="agent")
    targeted_rules: Mapped[List["PolicyRule"]] = relationship("PolicyRule", back_populates="target_agent")


class AgentTool(Base):
    """Tabla asociativa N:N entre Agente y Herramientas con configuración contextual."""
    __tablename__ = "agent_tools"
    __table_args__ = (
        UniqueConstraint("agent_id", "tool_id", name="uq_agent_tool_pair"),
        Index("idx_agent_tools_config_gin", "config", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tool_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tools.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    agent: Mapped["Agent"] = relationship("Agent", back_populates="agent_tools")
    tool: Mapped["Tool"] = relationship("Tool", back_populates="agent_tools")
