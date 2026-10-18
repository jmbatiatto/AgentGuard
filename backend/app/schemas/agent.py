"""Schemas Pydantic v2 para Agentes de IA y Asociación con Herramientas."""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import Field

from app.models.enums import AgentStatus
from app.schemas.base import BaseSchema


class AgentCreate(BaseSchema):
    """Payload para dar de alta una nueva identidad de IA."""

    organization_id: UUID = Field(
        ...,
        description="ID de la organización a la que pertenece el agente",
    )
    owner_user_id: UUID = Field(
        ...,
        description="ID del usuario sponsor/responsable del agente",
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre asignado al agente de IA",
    )
    purpose: Optional[str] = Field(
        default=None,
        description="Propósito o función de negocio del agente",
    )
    status: AgentStatus = Field(
        default=AgentStatus.ACTIVE,
        description="Estado operativo inicial del agente",
    )


class AgentRead(BaseSchema):
    """Respuesta con los detalles del agente de IA."""

    id: UUID
    organization_id: UUID
    owner_user_id: UUID
    name: str
    purpose: Optional[str] = None
    status: AgentStatus
    created_at: datetime


class AgentToolCreate(BaseSchema):
    """Payload para asociar una herramienta a un agente."""

    tool_id: UUID = Field(
        ...,
        description="ID de la herramienta autorizada para este agente",
    )
    enabled: bool = Field(
        default=True,
        description="Indica si la vinculación está activa",
    )
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Configuración contextual específica para este agente",
    )


class AgentToolRead(BaseSchema):
    """Respuesta con los datos de asociación Agente-Herramienta."""

    id: UUID
    agent_id: UUID
    tool_id: UUID
    enabled: bool
    config: Dict[str, Any]
    created_at: datetime
