"""Cliente de Línea de Comandos (CLI) para ACME Corporation (Looney Tunes).

Permite ejecutar demostraciones interactivas o automatizadas desde la terminal:
- Comparación en vivo: Modo Protegido (AgentGuard) vs Modo Directo (Sin Protección).
- Inferencia real con Google Gemini o disparo directo de payloads.
- Inspección de estado y restablecimiento de la base de datos de ACME.
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Optional

# Asegurar raíz de acme-corp en sys.path al invocar como script o módulo
ACME_ROOT = Path(__file__).resolve().parent.parent
if str(ACME_ROOT) not in sys.path:
    sys.path.insert(0, str(ACME_ROOT))

# Asegurar UTF-8 en Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from agent.gemini_client import GeminiAgentClient
from agent.presets import PRESETS, get_preset_by_id, list_presets
from server.config import settings
from server.database import acme_db


def print_banner() -> None:
    """Imprime el banner oficial de ACME Corporation."""
    banner = """
======================================================================
  💥 ACME CORPORATION - LABORATORIO AUTÓNOMO LOONEY TUNES 💥
  Gobernanza Runtime de Agentes de IA: AgentGuard vs Modo Directo
======================================================================
    """
    print(banner)


def display_presets_table() -> None:
    """Muestra la tabla de presets disponibles con sus descripciones."""
    print("\n📦 ESCENARIOS PRECONFIGURADOS (PRESETS):")
    print("-" * 75)
    for p in PRESETS:
        print(f"  • ID: {p['id']:<16} | {p['title']}")
        print(f"    Riesgo: {p['risk_level']:<8} | Veredicto Esperado: {p['expected_protected_decision']:<16}")
        print(f"    Acción: {p['action_name']:<14} | {p['description']}")
        print("-" * 75)


async def main_async() -> int:
    """Punto de entrada asíncrono para el CLI de ACME Corporation."""
    parser = argparse.ArgumentParser(
        prog="python -m agent.cli",
        description="Cliente de simulación y ejecución del Agente de Ventas de ACME Corporation.",
        epilog="Ejemplo: python -m agent.cli --preset legit_quote --mode protected",
    )

    parser.add_argument(
        "--preset",
        type=str,
        help="Identificador del preset Looney Tunes a ejecutar (ej. legit_quote, attack_price, hitl_refund, attack_exfil, attack_drop_db)",
    )
    parser.add_argument(
        "--prompt",
        type=str,
        help="Prompt libre en lenguaje natural para que el agente razone con Gemini.",
    )
    parser.add_argument(
        "--mode",
        choices=["protected", "direct"],
        default="protected",
        help="Modo de ejecución: 'protected' (interceptado por AgentGuard) o 'direct' (sin salvaguardas).",
    )
    parser.add_argument(
        "--no-llm",
        action="store_true",
        help="Desactiva la llamada a Google Gemini y ejecuta directamente el payload determinístico del preset.",
    )
    parser.add_argument(
        "--list-presets",
        action="store_true",
        help="Lista todos los escenarios preconfigurados y finaliza.",
    )
    parser.add_argument(
        "--reset-db",
        action="store_true",
        help="Restablece la base de datos SQLite de ACME Corp a su catálogo inicial.",
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Muestra el estado actual de la empresa (productos, eventos, base purgada).",
    )
    parser.add_argument(
        "--agentguard-url",
        type=str,
        default=settings.AGENTGUARD_URL,
        help=f"URL del servidor AgentGuard (por defecto: {settings.AGENTGUARD_URL}).",
    )
    parser.add_argument(
        "--agentguard-key",
        type=str,
        default=settings.AGENTGUARD_API_KEY,
        help="API Key X-AgentGuard-Key para autenticación en el Data Plane.",
    )
    parser.add_argument(
        "--gemini-key",
        type=str,
        default=settings.GEMINI_API_KEY,
        help="API Key de Google Gemini.",
    )
    parser.add_argument(
        "--gemini-model",
        type=str,
        default=settings.GEMINI_MODEL,
        help=f"Modelo de Gemini a utilizar (por defecto: {settings.GEMINI_MODEL}).",
    )

    args = parser.parse_args()
    print_banner()

    # Comandos utilitarios
    if args.list_presets:
        display_presets_table()
        return 0

    if args.reset_db:
        print("🔄 Restableciendo base de datos de ACME Corporation...")
        res = acme_db.reset_db()
        print(f"✅ {res['message']}")
        return 0

    if args.status:
        state = acme_db.get_state()
        print("📊 ESTADO ACTUAL DE ACME CORPORATION:")
        print(f"  • Base de Datos Purgada: {'🚨 SÍ (WIPED)' if state['database_wiped'] else '✅ NO (Operativa)'}")
        if state['database_wiped']:
            print(f"    Fecha de purga: {state['wiped_at']} | Motivo: {state['wiped_reason']}")
        print(f"  • Productos en catálogo: {state['counts']['products']}")
        print(f"  • Clientes registrados: {state['counts']['customers']}")
        print(f"  • Cotizaciones emitidas: {state['counts']['quotes']}")
        print(f"  • Reembolsos registrados: {state['counts']['refunds']}")
        print(f"  • Eventos en bitácora: {state['counts']['events']}")
        return 0

    # Determinar preset o prompt
    if not args.preset and not args.prompt:
        display_presets_table()
        print("\n💡 Selecciona un preset o ingresa un prompt libre para continuar:")
        try:
            choice = input("  Introduce el ID del preset (o presiona ENTER para 'legit_quote'): ").strip()
            args.preset = choice if choice else "legit_quote"
        except (EOFError, KeyboardInterrupt):
            print("\nOperación cancelada.")
            return 1

    use_llm = not args.no_llm

    print(f"\n🚀 Iniciando Agente de ACME Corporation...")
    print(f"  • Modo: {'🛡️ PROTEGIDO (AgentGuard)' if args.mode == 'protected' else '⚠️ DIRECTO (Vulnerable)'}")
    print(f"  • Motor: {'🤖 Google Gemini (' + args.gemini_model + ')' if use_llm else '⚡ Disparo Determinístico'}")
    if args.preset:
        p_obj = get_preset_by_id(args.preset)
        if p_obj:
            print(f"  • Preset: {p_obj['title']} ({p_obj['badge']})")

    client = GeminiAgentClient(
        gemini_api_key=args.gemini_key,
        gemini_model=args.gemini_model,
        agentguard_url=args.agentguard_url,
        agentguard_api_key=args.agentguard_key,
        db=acme_db,
    )

    try:
        trace = await client.run_scenario(
            prompt=args.prompt,
            preset_id=args.preset,
            mode=args.mode,
            use_llm=use_llm,
        )
    except Exception as exc:
        print(f"\n❌ Error durante la ejecución del escenario: {exc}")
        return 1

    # Imprimir traza de pasos
    print("\n📋 TRAZA PASO A PASO DE LA EJECUCIÓN:")
    print("=" * 75)
    for s in trace.get("steps", []):
        icon = "ℹ️"
        if s.get("status") == "success":
            icon = "✅"
        elif s.get("status") == "warning":
            icon = "⚠️"
        elif s.get("status") == "danger":
            icon = "🚨"

        print(f"{icon} [Paso {s['step']}] {s['title']}")
        print(f"   {s['detail']}")
        print("-" * 75)

    print("\n🎯 CONCLUSIÓN FINAL:")
    print(trace.get("final_answer", ""))
    print("=" * 75)
    return 0


def main() -> None:
    """Función de entrada síncrona."""
    sys.exit(asyncio.run(main_async()))


if __name__ == "__main__":
    main()
