"""Schemas Pydantic v2 para Organizaciones (Tenants)."""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema


class OrganizationCreate(BaseSchema):
    """Payload para dar de alta una nueva organización (tenant)."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre único o razón social del tenant",
    )


class OrganizationSettings(BaseSchema):
    """Configuración de gobernanza, postura de seguridad y políticas de retención del tenant."""

    fail_closed: bool = Field(
        default=True,
        description="Postura de seguridad: si no hay regla explícita o ante fallos, denegar por defecto (Fail-Closed)",
    )
    mask_sensitive: bool = Field(
        default=True,
        description="Sanitización contextual preventiva de credenciales y datos sensibles en trazas (OWASP LLM06)",
    )
    max_autonomous_amount: float = Field(
        default=5000.0,
        ge=0.0,
        description="Umbral de impacto financiero a partir del cual las acciones requieren aprobación humana (HITL)",
    )
    retention_days: int = Field(
        default=90,
        ge=1,
        description="Período de retención en días para depuración de trazas forenses de ejecución",
    )


class OrganizationSettingsUpdate(BaseSchema):
    """Payload para actualizar parcialmente la configuración de gobernanza del tenant."""

    fail_closed: Optional[bool] = Field(
        default=None,
        description="Actualizar postura Fail-Closed",
    )
    mask_sensitive: Optional[bool] = Field(
        default=None,
        description="Habilitar/deshabilitar sanitización contextual",
    )
    max_autonomous_amount: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Nuevo umbral financiero de autonomía",
    )
    retention_days: Optional[int] = Field(
        default=None,
        ge=1,
        description="Nuevo período de retención en días",
    )


class OrganizationRead(BaseSchema):
    """Respuesta serializada con datos completos de la organización."""

    id: UUID
    name: str
    created_at: datetime
    settings: Optional[Dict[str, Any]] = None

