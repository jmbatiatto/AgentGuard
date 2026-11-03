"""Schemas Pydantic v2 para Organizaciones (Tenants) y Gobernanza SIEM."""

from datetime import datetime
from typing import Any, Dict, List, Optional
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
    siem_webhook_url: Optional[str] = Field(
        default=None,
        description="URL del endpoint de recepción SIEM (Splunk, Elastic, Datadog, Slack, Microsoft Sentinel)",
    )
    siem_webhook_enabled: bool = Field(
        default=False,
        description="Habilita el despacho asíncrono de eventos de seguridad y alertas hacia el SIEM",
    )
    siem_webhook_secret: Optional[str] = Field(
        default=None,
        description="Clave secreta para firma criptográfica HMAC-SHA256 en cabecera X-AgentGuard-Signature",
    )
    siem_webhook_events: List[str] = Field(
        default_factory=lambda: ["ALERT_CRITICAL", "POLICY_VIOLATION"],
        description="Lista de eventos suscritos para notificación inmediata",
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
    siem_webhook_url: Optional[str] = Field(
        default=None,
        description="Nueva URL para webhooks SIEM",
    )
    siem_webhook_enabled: Optional[bool] = Field(
        default=None,
        description="Activar o pausar webhooks SIEM",
    )
    siem_webhook_secret: Optional[str] = Field(
        default=None,
        description="Nueva clave secreta HMAC-SHA256",
    )
    siem_webhook_events: Optional[List[str]] = Field(
        default=None,
        description="Lista de eventos para webhooks SIEM",
    )


class SiemWebhookTestRequest(BaseSchema):
    """Payload opcional para probar conectividad de webhook SIEM."""

    webhook_url: Optional[str] = Field(
        default=None,
        description="URL destino a probar. Si se omite, se usa la configurada en la organización",
    )
    secret: Optional[str] = Field(
        default=None,
        description="Clave secreta opcional para firmar el payload de prueba",
    )


class SiemWebhookTestResponse(BaseSchema):
    """Resultado estructurado de prueba de entrega SIEM."""

    status: str = Field(..., description="Estado: 'success' o 'failed'")
    message: str = Field(..., description="Explicación detallada del resultado en español")
    target_url: str = Field(..., description="URL a la que se envió la prueba")
    status_code: Optional[int] = Field(default=None, description="Código HTTP recibido del servidor remoto")
    timestamp: datetime = Field(..., description="Marca de tiempo UTC de la prueba")


class OrganizationRead(BaseSchema):
    """Respuesta serializada con datos completos de la organización."""

    id: UUID
    name: str
    created_at: datetime
    settings: Optional[Dict[str, Any]] = None
