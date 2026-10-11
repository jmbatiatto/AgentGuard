"""Modelo de Alertas e Incidentes de Seguridad."""

import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AlertSeverity, AlertStatus

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.execution import Execution
    from app.models.user import User


class Alert(Base):
    """Incidente de seguridad o anomalía detectada en tiempo de ejecución."""
    __tablename__ = "alerts"

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
    execution_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("executions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Incidente de Seguridad")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[AlertSeverity] = mapped_column(
        SQLEnum(AlertSeverity, name="alert_severity_enum", native_enum=True),
        nullable=False,
        default=AlertSeverity.MEDIUM,
    )
    status: Mapped[AlertStatus] = mapped_column(
        SQLEnum(AlertStatus, name="alert_status_enum", native_enum=True),
        nullable=False,
        default=AlertStatus.OPEN,
        index=True,
    )
    resolved_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="alerts")
    execution: Mapped[Optional["Execution"]] = relationship("Execution", back_populates="alert")
    resolved_by_user: Mapped[Optional["User"]] = relationship("User", back_populates="resolved_alerts")
