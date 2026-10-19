"""Pruebas automatizadas para el Router de API REST de Aprobaciones HITL."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.approval import Approval
from app.models.execution import Execution
from app.models.enums import ApprovalStatus, ExecutionStatus, PolicyDecision


@pytest.mark.asyncio
async def test_approvals_list_endpoint():
    """Valida el listado paginado de solicitudes de aprobación."""
    appr_id = uuid.uuid4()
    exec_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    execution = Execution(
        id=exec_id,
        organization_id=uuid.uuid4(),
        agent_id=uuid.uuid4(),
        tool_id=uuid.uuid4(),
        tool_action_id=uuid.uuid4(),
        decision=PolicyDecision.REQUIRE_APPROVAL,
        status=ExecutionStatus.PENDING_APPROVAL,
        request_context={"amount": 1000},
        timestamp=now,
    )
    approval = Approval(
        id=appr_id,
        execution_id=exec_id,
        status=ApprovalStatus.PENDING,
        created_at=now,
    )
    approval.execution = execution

    with patch("app.api.approvals.pep_gateway_service.list_approvals", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = [approval]

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/v1/approvals?skip=0&limit=10")
            assert res.status_code == 200
            data = res.json()
            assert len(data) == 1
            assert data[0]["id"] == str(appr_id)
            assert data[0]["status"] == "PENDING"
            assert data[0]["execution"]["id"] == str(exec_id)


@pytest.mark.asyncio
async def test_approvals_get_by_id_success():
    """Valida la consulta de detalle de una aprobación existente."""
    appr_id = uuid.uuid4()
    exec_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    approval = Approval(
        id=appr_id,
        execution_id=exec_id,
        status=ApprovalStatus.PENDING,
        created_at=now,
    )

    with patch("app.api.approvals.pep_gateway_service.get_approval_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = approval

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/approvals/{appr_id}")
            assert res.status_code == 200
            data = res.json()
            assert data["id"] == str(appr_id)
            assert data["status"] == "PENDING"


@pytest.mark.asyncio
async def test_approvals_get_by_id_not_found():
    """Valida 404 cuando la aprobación no existe."""
    fake_id = uuid.uuid4()
    with patch("app.api.approvals.pep_gateway_service.get_approval_by_id", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get(f"/api/v1/approvals/{fake_id}")
            assert res.status_code == 404
            assert "no encontrada" in res.json()["detail"]


@pytest.mark.asyncio
async def test_approvals_resolve_success():
    """Valida la resolución exitosa (APPROVED) de una solicitud pendiente."""
    appr_id = uuid.uuid4()
    approver_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    resolved_approval = Approval(
        id=appr_id,
        execution_id=uuid.uuid4(),
        assigned_approver_id=approver_id,
        status=ApprovalStatus.APPROVED,
        resolution_reason="Monto verificado con el cliente por teléfono.",
        resolved_at=now,
        created_at=now,
    )

    with patch("app.api.approvals.pep_gateway_service.resolve_approval", new_callable=AsyncMock) as mock_res:
        mock_res.return_value = resolved_approval

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "decision": "APPROVED",
                "resolution_reason": "Monto verificado con el cliente por teléfono.",
                "approver_user_id": str(approver_id),
            }
            res = await client.post(f"/api/v1/approvals/{appr_id}/resolve", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["id"] == str(appr_id)
            assert data["status"] == "APPROVED"
            assert data["resolution_reason"] == "Monto verificado con el cliente por teléfono."
            assert data["assigned_approver_id"] == str(approver_id)


@pytest.mark.asyncio
async def test_approvals_resolve_already_resolved_or_not_found():
    """Valida 400 Bad Request cuando la aprobación ya fue resuelta o no existe."""
    fake_id = uuid.uuid4()
    with patch("app.api.approvals.pep_gateway_service.resolve_approval", new_callable=AsyncMock) as mock_res:
        mock_res.return_value = None

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "decision": "REJECTED",
                "resolution_reason": "Rechazo tardío",
                "approver_user_id": str(uuid.uuid4()),
            }
            res = await client.post(f"/api/v1/approvals/{fake_id}/resolve", json=payload)
            assert res.status_code == 400
            assert "no existe o ya ha sido resuelta" in res.json()["detail"]
