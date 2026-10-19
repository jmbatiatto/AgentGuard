"""Schemas Pydantic v2 para Incidentes y Alertas de Seguridad."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.models.enums import AlertSeverity, AlertStatus
from app.schemas.base import BaseSchema


class AlertRead(BaseSchema):
    """Lectura de una alerta o incidente de seguridad detectado en runtime."""

    id: UUID
    organization_id: UUID
    execution_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    severity: AlertSeverity
    status: AlertStatus
    resolved_by_user_id: Optional[UUID] = None
    created_at: datetime
