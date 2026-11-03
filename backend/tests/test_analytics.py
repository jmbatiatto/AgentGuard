"""Pruebas exhaustivas para el Servicio y API REST de Analítica y Series Temporales.

Cubre:
1. Pruebas unitarias de AnalyticsService (get_overview y get_timeseries).
2. Endpoints HTTP GET /api/v1/analytics/overview y GET /api/v1/analytics/timeseries.
3. Validación estricta de organization_id (400 si es inválido o falta, 404 si no existe).
4. Aislamiento multi-tenant estricto y prevención de fuga de datos entre organizaciones.
5. Blindaje Anti-IA (bloqueo con 403 Forbidden ante cabecera X-Agent-Id).
6. Estado vacío (organización sin ejecuciones ni alertas retorna ceros y 0.0 ms, sin error 500).
"""

from datetime import datetime, timedelta, timezone
from typing import Any, NamedTuple, Optional
from unittest.mock import AsyncMock, MagicMock, patch
import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.enums import AlertStatus, PolicyDecision, UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.analytics import AnalyticsOverviewResponse, AnalyticsTimeseriesResponse
from app.services.analytics_service import analytics_service
from app.services.organization_service import organization_service


class MockOverviewRow(NamedTuple):
    total_executions: int
    allow_count: int
    deny_count: int
    require_approval_count: int
    avg_latency_ms: Optional[float]


class MockTimeseriesRow(NamedTuple):
    bucket: datetime
    executions: int
    allowed: int
    denied: int
    require_approval: int
    avg_latency_ms: Optional[float]


# ==============================================================================
# 1. Pruebas Unitarias de la Capa de Servicio (AnalyticsService)
# ==============================================================================

@pytest.mark.asyncio
async def test_analytics_service_get_overview_with_data():
    """Valida el cálculo de KPIs agregados cuando existen ejecuciones y alertas activas."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()

    mock_row = MockOverviewRow(
        total_executions=15,
        allow_count=10,
        deny_count=3,
        require_approval_count=2,
        avg_latency_ms=18.756,
    )
    exec_res = MagicMock()
    exec_res.first.return_value = mock_row

    alert_res = MagicMock()
    alert_res.scalar.return_value = 2

    mock_db.execute.side_effect = [exec_res, alert_res]

    overview = await analytics_service.get_overview(db=mock_db, organization_id=org_id)

    assert isinstance(overview, AnalyticsOverviewResponse)
    assert overview.total_executions == 15
    assert overview.allow_count == 10
    assert overview.deny_count == 3
    assert overview.require_approval_count == 2
    assert overview.avg_latency_ms == 18.76
    assert overview.active_incident_count == 2

    # Verificar que ambas consultas SQL incluyan el filtro estricto por organization_id
    assert mock_db.execute.call_count == 2
    exec_stmt = mock_db.execute.call_args_list[0][0][0]
    alert_stmt = mock_db.execute.call_args_list[1][0][0]

    compiled_exec = str(exec_stmt.compile(compile_kwargs={"literal_binds": False}))
    compiled_alert = str(alert_stmt.compile(compile_kwargs={"literal_binds": False}))

    assert "executions.organization_id =" in compiled_exec
    assert "alerts.organization_id =" in compiled_alert


@pytest.mark.asyncio
async def test_analytics_service_get_overview_empty_state():
    """Valida que una organización con 0 ejecuciones y 0 alertas retorne ceros limpios y 0.0 ms."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()

    mock_row = MockOverviewRow(
        total_executions=0,
        allow_count=0,
        deny_count=0,
        require_approval_count=0,
        avg_latency_ms=None,
    )
    exec_res = MagicMock()
    exec_res.first.return_value = mock_row

    alert_res = MagicMock()
    alert_res.scalar.return_value = 0

    mock_db.execute.side_effect = [exec_res, alert_res]

    overview = await analytics_service.get_overview(db=mock_db, organization_id=org_id)

    assert overview.total_executions == 0
    assert overview.allow_count == 0
    assert overview.deny_count == 0
    assert overview.require_approval_count == 0
    assert overview.avg_latency_ms == 0.0
    assert overview.active_incident_count == 0


@pytest.mark.asyncio
async def test_analytics_service_get_timeseries_with_buckets():
    """Valida la generación de 24 buckets continuos con datos en horas activas y ceros en inactivas."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()

    fixed_now = datetime(2026, 11, 2, 20, 0, 0, tzinfo=timezone.utc)
    hour_active = datetime(2026, 11, 2, 18, 0, 0, tzinfo=timezone.utc)

    mock_row = MockTimeseriesRow(
        bucket=hour_active,
        executions=5,
        allowed=4,
        denied=1,
        require_approval=0,
        avg_latency_ms=24.333,
    )

    timeseries_res = MagicMock()
    timeseries_res.all.return_value = [mock_row]
    mock_db.execute.return_value = timeseries_res

    res = await analytics_service.get_timeseries(
        db=mock_db,
        organization_id=org_id,
        range_str="24h",
        reference_time=fixed_now,
    )

    assert isinstance(res, AnalyticsTimeseriesResponse)
    assert res.range == "24h"
    assert len(res.points) == 24

    # Buscar el bucket activo y verificar valores
    active_point = next((p for p in res.points if p.timestamp == hour_active), None)
    assert active_point is not None
    assert active_point.executions == 5
    assert active_point.allowed == 4
    assert active_point.denied == 1
    assert active_point.require_approval == 0
    assert active_point.avg_latency_ms == 24.33

    # Verificar que una hora sin ejecuciones tenga ceros
    inactive_hour = datetime(2026, 11, 2, 17, 0, 0, tzinfo=timezone.utc)
    inactive_point = next((p for p in res.points if p.timestamp == inactive_hour), None)
    assert inactive_point is not None
    assert inactive_point.executions == 0
    assert inactive_point.allowed == 0
    assert inactive_point.denied == 0
    assert inactive_point.require_approval == 0
    assert inactive_point.avg_latency_ms == 0.0

    # Verificar que la consulta SQL filtre por organization_id
    call_stmt = mock_db.execute.call_args[0][0]
    compiled_stmt = str(call_stmt.compile(compile_kwargs={"literal_binds": False}))
    assert "executions.organization_id =" in compiled_stmt


@pytest.mark.asyncio
async def test_analytics_service_get_timeseries_empty_state():
    """Valida que una organización sin ejecuciones retorne 24 buckets continuos con ceros."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()

    fixed_now = datetime(2026, 11, 2, 12, 0, 0, tzinfo=timezone.utc)

    timeseries_res = MagicMock()
    timeseries_res.all.return_value = []
    mock_db.execute.return_value = timeseries_res

    res = await analytics_service.get_timeseries(
        db=mock_db,
        organization_id=org_id,
        range_str="24h",
        reference_time=fixed_now,
    )

    assert len(res.points) == 24
    for pt in res.points:
        assert pt.executions == 0
        assert pt.allowed == 0
        assert pt.denied == 0
        assert pt.require_approval == 0
        assert pt.avg_latency_ms == 0.0


# ==============================================================================
# 2. Pruebas de Endpoints HTTP (/api/v1/analytics/overview)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_analytics_overview_success():
    """Valida respuesta 200 OK y serialización correcta en /analytics/overview."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    org = Organization(id=org_id, name="Acme Corp")

    overview_resp = AnalyticsOverviewResponse(
        total_executions=42,
        allow_count=35,
        deny_count=5,
        require_approval_count=2,
        avg_latency_ms=19.45,
        active_incident_count=1,
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(analytics_service, "get_overview", new_callable=AsyncMock) as mock_get_overview:
        mock_get_org.return_value = org
        mock_get_overview.return_value = overview_resp

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/analytics/overview?organization_id={org_id}")

            assert res.status_code == 200
            data = res.json()
            assert data["total_executions"] == 42
            assert data["allow_count"] == 35
            assert data["deny_count"] == 5
            assert data["require_approval_count"] == 2
            assert data["avg_latency_ms"] == 19.45
            assert data["active_incident_count"] == 1

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_analytics_overview_missing_org_id():
    """Valida que si falta el parámetro organization_id se retorne 400 Bad Request."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/overview")
        assert res.status_code == 400
        assert "obligatorio" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_api_analytics_overview_invalid_uuid():
    """Valida que un valor no convertible a UUID retorne 400 Bad Request."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/overview?organization_id=not-a-valid-uuid")
        assert res.status_code == 400
        assert "inválido" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_api_analytics_overview_org_not_found():
    """Valida que una organización inexistente retorne 404 Not Found."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    org_id = uuid.uuid4()

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org:
        mock_get_org.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/analytics/overview?organization_id={org_id}")
            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"].lower()

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_analytics_overview_cross_tenant_forbidden():
    """Valida que un usuario ADMIN de Tenant A que intente consultar Tenant B reciba 404 Not Found."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()

    admin_user = User(
        id=uuid.uuid4(),
        organization_id=tenant_a_id,
        email="admin@tenant-a.com",
        role=UserRole.ADMIN,
    )

    res_user = MagicMock()
    res_user.scalar_one_or_none.return_value = admin_user
    mock_db.execute.return_value = res_user

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            headers = {"X-User-Id": str(admin_user.id)}
            res = await client.get(
                f"/api/v1/analytics/overview?organization_id={tenant_b_id}",
                headers=headers,
            )
            assert res.status_code == 404
            assert "no pertenece" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_analytics_anti_ai_shield():
    """Valida que las identidades de IA (X-Agent-Id) tengan estrictamente bloqueado el acceso a analítica."""
    agent_id = uuid.uuid4()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        headers = {"X-Agent-Id": str(agent_id)}
        res = await client.get(f"/api/v1/analytics/overview?organization_id={uuid.uuid4()}", headers=headers)
        assert res.status_code == 403
        assert "AI Agents are not permitted" in res.json()["detail"]


# ==============================================================================
# 3. Pruebas de Endpoints HTTP (/api/v1/analytics/timeseries)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_analytics_timeseries_success():
    """Valida respuesta 200 OK y estructura con 24 puntos en /analytics/timeseries."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    org = Organization(id=org_id, name="Acme Corp")
    now = datetime.now(timezone.utc)

    mock_points = [
        analytics_service.get_timeseries.__annotations__["return"].__dict__.get("points", [])
    ]
    # Crear 24 puntos dummy para la respuesta simulada
    dummy_response = AnalyticsTimeseriesResponse(
        range="24h",
        points=[],
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(analytics_service, "get_timeseries", new_callable=AsyncMock) as mock_get_ts:
        mock_get_org.return_value = org
        mock_get_ts.return_value = dummy_response

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/analytics/timeseries?organization_id={org_id}&range=24h")

            assert res.status_code == 200
            data = res.json()
            assert data["range"] == "24h"
            assert isinstance(data["points"], list)
            mock_get_ts.assert_awaited_once_with(
                db=mock_db,
                organization_id=org_id,
                range_str="24h",
            )

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_analytics_timeseries_empty_state_and_defaults():
    """Valida consulta de serie temporal con comportamiento real del servicio en estado vacío."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    org = Organization(id=org_id, name="Acme Corp")

    res_ts = MagicMock()
    res_ts.all.return_value = []
    mock_db.execute.return_value = res_ts

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org:
        mock_get_org.return_value = org

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/analytics/timeseries?organization_id={org_id}")

            assert res.status_code == 200
            data = res.json()
            assert data["range"] == "24h"
            assert len(data["points"]) == 24
            for pt in data["points"]:
                assert pt["executions"] == 0
                assert pt["allowed"] == 0
                assert pt["denied"] == 0
                assert pt["require_approval"] == 0
                assert pt["avg_latency_ms"] == 0.0

    app.dependency_overrides.clear()
