"""Modelo de Bandeja de Aprobación Humana (HITL - Human-in-the-Loop)."""

import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Text, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import ApprovalStatus

if TYPE_CHECKING:
    from app.models.execution import Execution
    from app.models.user import User


class Approval(Base):
    """Solicitud de intervención humana suspendida a la espera de un Approver."""
    __tablename__ = "approvals"
    __table_args__ = (
        UniqueConstraint("execution_id", name="uq_approval_execution"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    execution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("executions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_approver_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[ApprovalStatus] = mapped_column(
        SQLEnum(ApprovalStatus, name="approval_status_enum", native_enum=True),
        nullable=False,
        default=ApprovalStatus.PENDING,
        index=True,
    )
    resolution_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    execution: Mapped["Execution"] = relationship("Execution", back_populates="approval")
    assigned_approver: Mapped[Optional["User"]] = relationship("User", back_populates="resolved_approvals")
