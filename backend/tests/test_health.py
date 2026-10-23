"""Pruebas automatizadas de diagnóstico y healthcheck de AgentGuard."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_root_endpoint():
    """Valida que la raíz responda con metadatos y links a la documentación."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "AgentGuard Backend API"
        assert data["status"] == "online"
        assert data["docs"] == "/docs"


@pytest.mark.asyncio
async def test_ping_endpoint():
    """Valida el endpoint ultraligero /api/v1/ping."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/ping")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "pong"
        assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_endpoint():
    """Valida la estructura y respuesta del healthcheck global."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("healthy", "degraded")
        assert "app" in data
        assert "version" in data
        assert "services" in data
        assert "database" in data["services"]
        assert "redis" in data["services"]


def test_settings_secret_key_production_fail_fast():
    """Valida que Settings rechace arranques en entorno production con SECRET_KEY por defecto o insegura."""
    from app.core.config import Settings

    with pytest.raises(ValueError, match="FATAL: SECRET_KEY insegura"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="agentguard-insecure-dev-secret-key-change-in-production-min-32-chars",
        )

    # Debe ser aceptado si cumple con el estándar productivo
    valid_prod_settings = Settings(
        ENVIRONMENT="production",
        SECRET_KEY="c1f8b49e8a7d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0",
    )
    assert valid_prod_settings.ENVIRONMENT == "production"

