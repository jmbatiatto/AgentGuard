"""Schemas Pydantic v2 para Herramientas Externas (Tools)."""

from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID
from pydantic import Field, field_validator

from app.schemas.base import BaseSchema
from app.schemas.tool_action import ToolActionRead


class ToolCreate(BaseSchema):
    """Payload para dar de alta una nueva herramienta externa."""

    organization_id: UUID = Field(
        ...,
        description="ID de la organización propietaria",
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre identificador de la herramienta",
    )
    protocol: str = Field(
        default="REST",
        max_length=50,
        description="Protocolo de comunicación (REST HTTP)",
    )
    endpoint_url: str = Field(
        ...,
        min_length=1,
        max_length=1024,
        description="URL base o endpoint de la herramienta",
    )
    description: Optional[str] = Field(
        default=None,
        description="Descripción funcional de la herramienta",
    )
    status: Optional[str] = Field(
        default="ACTIVE",
        description="Estado operativo de la herramienta (ACTIVE, PAUSED, INACTIVE)",
    )
    execution_mode: Optional[str] = Field(
        default="SANDBOX",
        description="Modo de ejecución: SANDBOX (simulado seguro) o LIVE_REST (despacho real)",
    )


class ToolUpdate(BaseSchema):
    """Payload para actualizar propiedades de una herramienta externa."""

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Nuevo nombre identificador de la herramienta",
    )
    protocol: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Nuevo protocolo de comunicación",
    )
    endpoint_url: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=1024,
        description="Nueva URL base o endpoint de la herramienta",
    )
    description: Optional[str] = Field(
        default=None,
        description="Nueva descripción funcional de la herramienta",
    )
    status: Optional[str] = Field(
        default=None,
        description="Nuevo estado operativo (ACTIVE, PAUSED, INACTIVE)",
    )
    execution_mode: Optional[str] = Field(
        default=None,
        description="Nuevo modo de ejecución (SANDBOX o LIVE_REST)",
    )


class ToolRead(BaseSchema):
    """Respuesta con los datos de la herramienta registrada."""

    id: UUID
    organization_id: UUID
    name: str
    protocol: str
    endpoint_url: str
    description: Optional[str] = None
    status: Optional[str] = Field(default="ACTIVE")
    execution_mode: Optional[str] = Field(default="SANDBOX")
    created_at: datetime
    actions: List[ToolActionRead] = Field(default_factory=list)
    assigned_agents: List[str] = Field(default_factory=list)

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, v: Any) -> str:
        if v is None:
            return "ACTIVE"
        if hasattr(v, "value"):
            return str(v.value)
        return str(v)

    @field_validator("execution_mode", mode="before")
    @classmethod
    def validate_execution_mode(cls, v: Any) -> str:
        return str(v) if v is not None else "SANDBOX"
