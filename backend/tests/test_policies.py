"""Pruebas automatizadas para el Service y API REST de Contenedores de Políticas (Policies)."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app
from app.models.organization import Organization
from app.models.policy import Policy
from app.schemas.policy import PolicyCreate
from app.services.organization_service import organization_service
from app.services.policy_service import policy_service


# ==============================================================================
# Pruebas de la Capa de Servicio (PolicyService)
# ==============================================================================

@pytest.mark.asyncio
async def test_policy_service_create():
    """Valida la creación y persistencia de una política."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    org_id = uuid.uuid4()
    policy_in = PolicyCreate(
        organization_id=org_id,
        name="Global Safety Guardrails",
        description="Reglas globales de seguridad",
        priority=200,
        is_active=True,
    )

    async def mock_refresh(instance):
        instance.id = uuid.uuid4()
        instance.created_at = datetime.now(timezone.utc)

    mock_db.refresh.side_effect = mock_refresh

    result = await policy_service.create(db=mock_db, policy_in=policy_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    mock_db.refresh.assert_awaited_once()
    assert result.name == "Global Safety Guardrails"
    assert result.priority == 200
    assert result.is_active is True
    assert result.organization_id == org_id


@pytest.mark.asyncio
async def test_policy_service_get_by_id():
    """Valida la búsqueda de política por UUID."""
    mock_db = AsyncMock()
    policy_id = uuid.uuid4()
    mock_policy = Policy(
        id=policy_id,
        organization_id=uuid.uuid4(),
        name="Financial Limits",
        priority=150,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_policy
    mock_db.execute.return_value = mock_result

    result = await policy_service.get_by_id(db=mock_db, policy_id=policy_id)

    mock_db.execute.assert_awaited_once()
    assert result is not None
    assert result.id == policy_id
    assert result.name == "Financial Limits"


@pytest.mark.asyncio
async def test_policy_service_list_by_org():
    """Valida listado de políticas con filtro por organización."""
    mock_db = AsyncMock()
    org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    mock_policies = [
        Policy(
            id=uuid.uuid4(),
            organization_id=org_id,
            name=f"Policy {i}",
            priority=100 + i * 10,
            is_active=True,
            created_at=now,
        )
        for i in range(2)
    ]

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = mock_policies
    mock_db.execute.return_value = mock_result

    result = await policy_service.list_by_org(db=mock_db, organization_id=org_id, skip=0, limit=10)

    mock_db.execute.assert_awaited_once()
    assert len(result) == 2
    assert result[0].name == "Policy 0"


# ==============================================================================
# Pruebas de Endpoints HTTP (/api/v1/policies)
# ==============================================================================

@pytest.mark.asyncio
async def test_api_create_policy_success():
    """Valida registro exitoso de una política (201 Created)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    policy_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    fake_org = Organization(id=org_id, name="Security Operations LLC", created_at=now)
    fake_policy = Policy(
        id=policy_id,
        organization_id=org_id,
        name="Data Export Guard",
        priority=100,
        is_active=True,
        created_at=now,
    )

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org, \
         patch.object(policy_service, "create", new_callable=AsyncMock) as mock_create_policy:

        mock_get_org.return_value = fake_org
        mock_create_policy.return_value = fake_policy

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/policies",
                json={
                    "organization_id": str(org_id),
                    "name": "Data Export Guard",
                    "priority": 100,
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == str(policy_id)
            assert data["name"] == "Data Export Guard"
            assert data["priority"] == 100
            assert data["organization_id"] == str(org_id)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_create_policy_organization_not_found():
    """Valida que si la organización no existe devuelva 404."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    missing_org_id = uuid.uuid4()

    with patch.object(organization_service, "get_by_id", new_callable=AsyncMock) as mock_get_org:
        mock_get_org.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/policies",
                json={
                    "organization_id": str(missing_org_id),
                    "name": "Orphan Policy",
                },
            )

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_list_policies():
    """Valida listado de políticas con parámetro de filtro por organización."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    org_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_policies = [
        Policy(
            id=uuid.uuid4(),
            organization_id=org_id,
            name=f"Policy {i}",
            priority=100 + i,
            is_active=True,
            created_at=now,
        )
        for i in range(2)
    ]

    with patch.object(policy_service, "list_by_org", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = fake_policies

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/policies?organization_id={org_id}&skip=0&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["name"] == "Policy 0"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_policy_found():
    """Valida consulta de política existente por UUID."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    policy_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fake_policy = Policy(
        id=policy_id,
        organization_id=uuid.uuid4(),
        name="Target Policy",
        priority=120,
        is_active=True,
        created_at=now,
    )

    with patch.object(policy_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = fake_policy

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/policies/{policy_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(policy_id)
            assert data["name"] == "Target Policy"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_get_policy_not_found():
    """Valida consulta de política inexistente (404)."""
    mock_db = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch.object(policy_service, "get_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        random_id = uuid.uuid4()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/v1/policies/{random_id}")

            assert response.status_code == 404
            assert "no encontrada" in response.json()["detail"]

    app.dependency_overrides.clear()
