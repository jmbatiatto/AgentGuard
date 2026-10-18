"""Schemas Pydantic v2 para Acciones Atómicas de Herramientas (ToolActions)."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.models.enums import RiskLevel
from app.schemas.base import BaseSchema


class ToolActionCreate(BaseSchema):
    """Payload para registrar una acción atómica vinculada a una herramienta."""

    tool_id: UUID = Field(
        ...,
        description="ID de la herramienta contenedora",
    )
    action_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre de la acción atómica (ej. refund, create_quote)",
    )
    risk_level: RiskLevel = Field(
        default=RiskLevel.LOW,
        description="Nivel de riesgo tipificado de la acción",
    )
    description: Optional[str] = Field(
        default=None,
        description="Descripción del alcance de la acción",
    )


class ToolActionRead(BaseSchema):
    """Respuesta serializada de una acción atómica."""

    id: UUID
    tool_id: UUID
    action_name: str
    risk_level: RiskLevel
    description: Optional[str] = None
    created_at: datetime
