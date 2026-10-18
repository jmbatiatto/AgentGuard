"""Schemas Pydantic v2 para Contenedores de Políticas."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema


class PolicyCreate(BaseSchema):
    """Payload para crear un nuevo contenedor de políticas."""

    organization_id: UUID = Field(
        ...,
        description="ID de la organización propietaria",
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre identificador de la política",
    )
    description: Optional[str] = Field(
        default=None,
        description="Descripción del alcance y propósito de la política",
    )
    priority: int = Field(
        default=100,
        ge=1,
        le=1000,
        description="Prioridad de evaluación (mayor número = mayor precedencia)",
    )
    is_active: bool = Field(
        default=True,
        description="Indica si la política está activa",
    )


class PolicyRead(BaseSchema):
    """Respuesta serializada con los datos de la política."""

    id: UUID
    organization_id: UUID
    name: str
    description: Optional[str] = None
    priority: int
    is_active: bool
    created_at: datetime
