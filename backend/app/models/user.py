"""Modelo de Usuarios y Roles."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.agent import Agent
    from app.models.execution import Execution
    from app.models.approval import Approval
    from app.models.alert import Alert


class User(Base):
    """Usuario corporativo perteneciente a una Organización."""
    __tablename__ = "users"

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
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum", native_enum=True),
        nullable=False,
        default=UserRole.OPERATOR,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")
    sponsored_agents: Mapped[List["Agent"]] = relationship("Agent", back_populates="owner_user")
    delegated_executions: Mapped[List["Execution"]] = relationship("Execution", back_populates="delegator_user")
    resolved_approvals: Mapped[List["Approval"]] = relationship("Approval", back_populates="assigned_approver")
    resolved_alerts: Mapped[List["Alert"]] = relationship("Alert", back_populates="resolved_by_user")
