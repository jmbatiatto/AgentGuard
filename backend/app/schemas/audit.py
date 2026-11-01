"""Schemas Pydantic v2 para Eventos de Auditoría Administrativa (WORM)."""

import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import Field, ConfigDict

from app.schemas.base import BaseSchema
from app.models.enums import ActorType


class AuditEventCreate(BaseSchema):
    """Payload para emitir un nuevo evento de auditoría administrativa."""
    organization_id: uuid.UUID = Field(..., description="ID de la organización tenant")
    actor_type: ActorType = Field(..., description="Tipo de actor que originó la acción (USER, AGENT, SYSTEM)")
    actor_id: uuid.UUID = Field(..., description="UUID del actor responsable")
    event_type: str = Field(..., min_length=1, max_length=255, description="Tipo de evento administrativo")
    event_metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos forenses inmutables")


class AuditEventRead(BaseSchema):
    """Representación de solo lectura de un evento de auditoría sellado."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    actor_type: ActorType
    actor_id: uuid.UUID
    event_type: str
    event_metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime
