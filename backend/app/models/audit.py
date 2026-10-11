"""Modelo de Auditoría Forense de Operaciones Administrativas."""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import ActorType

if TYPE_CHECKING:
    from app.models.organization import Organization


class AuditEvent(Base):
    """Registro inmutable de operaciones administrativas y cambios de configuración."""
    __tablename__ = "audit_events"
    __table_args__ = (
        Index("idx_audit_events_metadata_gin", "metadata", postgresql_using="gin"),
        Index("idx_audit_events_org_timestamp", "organization_id", "timestamp"),
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
    actor_type: Mapped[ActorType] = mapped_column(
        SQLEnum(ActorType, name="actor_type_enum", native_enum=True),
        nullable=False,
    )
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    
    # Mapeo a columna física "metadata" sin colisionar con Base.metadata
    event_metadata: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relaciones
    organization: Mapped["Organization"] = relationship("Organization", back_populates="audit_events")
