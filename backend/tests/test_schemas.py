"""Pruebas unitarias para los schemas Pydantic v2 de AgentGuard."""

import uuid
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.models.enums import UserRole, AgentStatus, RiskLevel, RuleEffect
from app.schemas import (
    OrganizationCreate,
    OrganizationRead,
    UserCreate,
    UserRead,
    ToolCreate,
    ToolRead,
    ToolActionCreate,
    ToolActionRead,
    AgentCreate,
    AgentRead,
    AgentToolCreate,
    AgentToolRead,
    PolicyCreate,
    PolicyRead,
    PolicyRuleCreate,
    PolicyRuleRead,
)


def test_organization_schemas():
    """Valida creación y serialización de Organization."""
    # Create válido
    data = {"name": "Acme Corp"}
    org_in = OrganizationCreate(**data)
    assert org_in.name == "Acme Corp"

    # Validación de campo obligatorio
    with pytest.raises(ValidationError):
        OrganizationCreate()

    # Read con from_attributes
    now = datetime.now(timezone.utc)
    org_id = uuid.uuid4()
    
    class MockOrg:
        id = org_id
        name = "Acme Corp"
        created_at = now

    org_out = OrganizationRead.model_validate(MockOrg())
    assert org_out.id == org_id
    assert org_out.name == "Acme Corp"
    assert org_out.created_at == now


def test_user_schemas():
    """Valida creación de usuario con defaults y serialización."""
    org_id = uuid.uuid4()
    user_in = UserCreate(organization_id=org_id, email="admin@acme.com")
    assert user_in.role == UserRole.OPERATOR  # Default
    assert user_in.email == "admin@acme.com"

    # Asignación explícita de rol
    user_admin = UserCreate(organization_id=org_id, email="sec@acme.com", role=UserRole.ADMIN)
    assert user_admin.role == UserRole.ADMIN

    # Read
    user_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    user_out = UserRead(
        id=user_id,
        organization_id=org_id,
        email="admin@acme.com",
        role=UserRole.ADMIN,
        created_at=now,
    )
    assert user_out.id == user_id
    assert user_out.role == UserRole.ADMIN


def test_tool_and_action_schemas():
    """Valida schemas de Tool y ToolAction (rutas separadas de gestión)."""
    org_id = uuid.uuid4()
    tool_in = ToolCreate(
        organization_id=org_id,
        name="Billing API",
        endpoint_url="https://api.billing.acme.internal",
    )
    assert tool_in.protocol == "REST"
    assert tool_in.description is None

    tool_id = uuid.uuid4()
    action_in = ToolActionCreate(
        tool_id=tool_id,
        action_name="refund_invoice",
        risk_level=RiskLevel.HIGH,
    )
    assert action_in.action_name == "refund_invoice"
    assert action_in.risk_level == RiskLevel.HIGH

    # Action default risk level
    action_default = ToolActionCreate(tool_id=tool_id, action_name="view_invoice")
    assert action_default.risk_level == RiskLevel.LOW


def test_agent_and_agent_tool_schemas():
    """Valida schemas de Agent e identidad de IA junto con AgentTool."""
    org_id = uuid.uuid4()
    user_id = uuid.uuid4()
    agent_in = AgentCreate(
        organization_id=org_id,
        owner_user_id=user_id,
        name="SupportBot",
    )
    assert agent_in.status == AgentStatus.ACTIVE

    tool_id = uuid.uuid4()
    agent_tool_in = AgentToolCreate(
        tool_id=tool_id,
        config={"rate_limit": 10},
    )
    assert agent_tool_in.enabled is True
    assert agent_tool_in.config["rate_limit"] == 10


def test_policy_and_policy_rule_schemas_fail_closed():
    """Valida contenedor de políticas y el principio Fail-Closed en PolicyRule."""
    org_id = uuid.uuid4()
    policy_in = PolicyCreate(
        organization_id=org_id,
        name="Financial Safety Policy",
    )
    assert policy_in.priority == 100
    assert policy_in.is_active is True

    policy_id = uuid.uuid4()
    action_id = uuid.uuid4()

    # Principio Fail-Closed: Por defecto el efecto debe ser DENY
    rule_in = PolicyRuleCreate(
        policy_id=policy_id,
        tool_action_id=action_id,
        conditions={"max_amount": 500},
    )
    assert rule_in.effect == RuleEffect.DENY
    assert rule_in.conditions["max_amount"] == 500
    assert rule_in.target_agent_id is None

    # Regla permisiva con target específico
    agent_id = uuid.uuid4()
    rule_allow = PolicyRuleCreate(
        policy_id=policy_id,
        tool_action_id=action_id,
        target_agent_id=agent_id,
        effect=RuleEffect.ALLOW,
    )
    assert rule_allow.effect == RuleEffect.ALLOW
    assert rule_allow.target_agent_id == agent_id

    # Validación de rango de prioridad (1 a 1000)
    with pytest.raises(ValidationError):
        PolicyRuleCreate(
            policy_id=policy_id,
            tool_action_id=action_id,
            priority=0,
        )
