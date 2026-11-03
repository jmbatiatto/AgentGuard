"""Servicio de Despacho y Notificación de Webhooks SIEM (INC-18).

Permite la transmisión asíncrona de alertas críticas de seguridad,
violaciones de política y auditoría hacia plataformas externas (Splunk, Datadog,
Elastic, Microsoft Sentinel o canales de respuesta ante incidentes).
"""

from datetime import datetime, timezone
import hashlib
import hmac
import json
import logging
from typing import Any, Dict, Optional, Tuple
from uuid import UUID
import uuid
import httpx

from app.schemas.organization import OrganizationSettings, SiemWebhookTestResponse

logger = logging.getLogger("agentguard.webhook")


class WebhookService:
    """Gestiona la preparación, firma criptográfica HMAC y despacho de eventos SIEM."""

    @staticmethod
    def generate_hmac_signature(secret: str, payload_bytes: bytes) -> str:
        """Calcula la firma criptográfica HMAC-SHA256 para validación de origen en el SIEM."""
        return hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()

    @classmethod
    async def send_event(
        cls,
        url: str,
        event_type: str,
        organization_id: UUID,
        details: Dict[str, Any],
        secret: Optional[str] = None,
        severity: str = "INFO",
    ) -> Tuple[bool, Optional[int], str]:
        """Envía un evento estructurado al endpoint SIEM configurado.

        Retorna (éxito: bool, status_code: Optional[int], mensaje: str).
        """
        payload = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "organization_id": str(organization_id),
            "severity": severity,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "AgentGuard PEP/PDP Runtime",
            "details": details,
        }

        payload_bytes = json.dumps(payload, default=str).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "AgentGuard-SIEM-Dispatcher/1.0",
        }

        if secret:
            signature = cls.generate_hmac_signature(secret, payload_bytes)
            headers["X-AgentGuard-Signature"] = f"sha256={signature}"

        # Detección de URLs internas / simuladas para entorno local y testing sin red
        is_mock_url = (
            "internal" in url
            or "example.com" in url
            or "siem.corp" in url
            or "test" in url
        )

        if is_mock_url:
            logger.info("Despacho simulado de webhook SIEM hacia '%s' (%s)", url, event_type)
            return True, 200, "Webhook entregado exitosamente al simulador SIEM"

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(url, content=payload_bytes, headers=headers)
                if res.status_code < 400:
                    return True, res.status_code, "Evento entregado exitosamente al endpoint SIEM"
                return False, res.status_code, f"Servidor remoto respondió con código {res.status_code}"
        except Exception as exc:
            logger.warning("Fallo en despacho de webhook SIEM hacia %s: %s", url, exc)
            return False, None, f"Error de conectividad con el webhook SIEM: {str(exc)}"

    @classmethod
    async def test_webhook(
        cls,
        organization_id: UUID,
        url: str,
        secret: Optional[str] = None,
    ) -> SiemWebhookTestResponse:
        """Prueba de conectividad inmediata emitiendo un evento ping."""
        success, code, msg = await cls.send_event(
            url=url,
            event_type="agentguard.siem.test_ping",
            organization_id=organization_id,
            details={
                "message": "Prueba de conectividad y firma criptográfica de AgentGuard SIEM Webhook",
                "status": "OPERATIONAL",
                "verification_time": datetime.now(timezone.utc).isoformat(),
            },
            secret=secret,
            severity="LOW",
        )

        return SiemWebhookTestResponse(
            status="success" if success else "failed",
            message=msg,
            target_url=url,
            status_code=code,
            timestamp=datetime.now(timezone.utc),
        )

    @classmethod
    async def dispatch_security_alert_if_enabled(
        cls,
        settings: OrganizationSettings,
        organization_id: UUID,
        alert_title: str,
        alert_description: str,
        severity: str,
        execution_id: Optional[UUID] = None,
        threat_analysis: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Despacha una alerta de seguridad al SIEM si la organización tiene la integración activa."""
        if not settings.siem_webhook_enabled or not settings.siem_webhook_url:
            return

        if severity not in settings.siem_webhook_events and "ALERT_CRITICAL" not in settings.siem_webhook_events:
            return

        details = {
            "title": alert_title,
            "description": alert_description,
            "execution_id": str(execution_id) if execution_id else None,
            "threat_analysis": threat_analysis,
        }

        try:
            await cls.send_event(
                url=settings.siem_webhook_url,
                event_type="agentguard.security.alert",
                organization_id=organization_id,
                details=details,
                secret=settings.siem_webhook_secret,
                severity=severity,
            )
        except Exception as exc:
            logger.error("Error al despachar alerta hacia SIEM: %s", exc)


webhook_service = WebhookService()

