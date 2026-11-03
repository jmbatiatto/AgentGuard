"""Esquemas Pydantic v2 para Eventos de Auditoría Forense (Audit Events)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import AliasChoices, Field

from app.models.enums import ActorType
from app.schemas.base import BaseSchema


class AuditEventBase(BaseSchema):
    """Esquema base para eventos de auditoría forense."""

    organization_id: UUID = Field(
        ...,
        description="ID del tenant u organización a la que pertenece el evento",
    )
    actor_type: ActorType = Field(
        ...,
        description="Tipo de actor que originó la acción (USER, AGENT, SYSTEM)",
    )
    actor_id: UUID = Field(
        ...,
        description="Identificador UUID del actor que ejecutó la operación",
    )
    event_type: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Tipo canónico del evento administrativo o de gobernanza",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        validation_alias=AliasChoices("event_metadata", "metadata"),
        serialization_alias="metadata",
        description="Metadatos contextuales semiestructurados del evento forense",
    )


class AuditEventCreate(AuditEventBase):
    """Payload para registro de un nuevo evento de auditoría."""

    description: Optional[str] = Field(
        default=None,
        description="Descripción legible opcional del evento (se almacena en metadatos)",
    )


class AuditEventResponse(AuditEventBase):
    """Esquema de respuesta para un evento de auditoría forense inmutable."""

    id: UUID = Field(
        ...,
        description="Identificador único UUID del evento de auditoría",
    )
    timestamp: datetime = Field(
        ...,
        description="Marca temporal inmutable de ocurrencia del evento",
    )


class AuditEventPagination(BaseSchema):
    """Esquema de paginación para listado de eventos de auditoría."""

    items: List[AuditEventResponse] = Field(
        default_factory=list,
        description="Listado de eventos de auditoría en la página actual",
    )
    total: int = Field(
        ...,
        ge=0,
        description="Cantidad total de eventos coincidentes con los filtros",
    )
    skip: int = Field(
        default=0,
        ge=0,
        description="Desplazamiento aplicado",
    )
    limit: int = Field(
        default=50,
        ge=1,
        description="Límite de registros por página",
    )
