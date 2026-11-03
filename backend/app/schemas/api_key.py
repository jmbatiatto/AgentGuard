"""Schemas Pydantic v2 para API Keys de Autenticación PEP."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema


class ApiKeyCreate(BaseSchema):
    """Payload para dar de alta una nueva API Key corporativa."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Nombre descriptivo asignado a la API Key",
        examples=["Key Gateway Producción"],
    )
    organization_id: UUID = Field(
        ...,
        description="ID de la organización propietaria de la llave",
    )
    expires_in_days: Optional[int] = Field(
        default=None,
        ge=1,
        le=365,
        description="Días de validez antes de expiración automática (opcional)",
    )


class ApiKeyResponse(BaseSchema):
    """Respuesta pública y segura para listar o consultar API Keys (sin secreto en plano ni hash)."""

    id: UUID
    organization_id: UUID
    name: str
    key_prefix: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool


class ApiKeyCreatedResponse(ApiKeyResponse):
    """Respuesta emitida una única vez al crear la llave, revelando el secreto en plano."""

    api_key: str = Field(
        ...,
        description="Clave secreta en texto plano retornada una única vez al momento de creación",
    )


# Alias de conveniencia
ApiKeyRead = ApiKeyResponse
