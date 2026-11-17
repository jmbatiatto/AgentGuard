"""Módulo de Onboarding Automático y Vinculación Empresarial con AgentGuard.

Simula el flujo oficial en el que el CEO de ACME Corporation (Lucas Duck)
contrata e integra su empresa con la plataforma AgentGuard:
1. Autenticación o registro de la organización 'Acme Corp' y usuario administrador.
2. Re-seeding demo inicial para precargar herramientas y políticas corporativas.
3. Provisión idempotente del Asistente 'Consultante BI', herramienta 'BI & Ventas ACME',
   acciones atómicas ('query_sales' LOW, 'delete_sales' CRITICAL), asignación N:N en AgentTool,
   política 'Gobernanza Consultante BI (Solo Lectura)' y reglas deterministas (ALLOW / DENY).
4. Generación y persistencia de la clave X-AgentGuard-Key en memoria y en acme-corp/.env.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from server.config import ENV_FILE, ROOT_DIR, settings

logger = logging.getLogger("acme.onboarding")


def persist_api_key_to_env(api_key: str) -> None:
    """Persiste la clave AGENTGUARD_API_KEY en acme-corp/.env sin pisar otras claves."""
    env_path = ENV_FILE
    example_path = ROOT_DIR / ".env.example"

    if env_path.exists():
        content = env_path.read_text(encoding="utf-8")
        lines = content.splitlines()
        key_found = False
        new_lines: List[str] = []
        for line in lines:
            if line.strip().startswith("AGENTGUARD_API_KEY="):
                new_lines.append(f"AGENTGUARD_API_KEY={api_key}")
                key_found = True
            else:
                new_lines.append(line)
        if not key_found:
            new_lines.append(f"AGENTGUARD_API_KEY={api_key}")
        env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    elif example_path.exists():
        content = example_path.read_text(encoding="utf-8")
        lines = content.splitlines()
        new_lines = []
        for line in lines:
            if line.strip().startswith("AGENTGUARD_API_KEY="):
                new_lines.append(f"AGENTGUARD_API_KEY={api_key}")
            else:
                new_lines.append(line)
        env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    else:
        env_path.write_text(f"AGENTGUARD_API_KEY={api_key}\n", encoding="utf-8")


async def bootstrap_acme_in_agentguard(
    agentguard_url: Optional[str] = None,
    acme_public_url: Optional[str] = None,
    force_reset: bool = False,
) -> Dict[str, Any]:
    """Orquesta el onboarding completo y automatizado de ACME Corporation en AgentGuard."""
    base_url = (agentguard_url or settings.AGENTGUARD_URL).rstrip("/")
    acme_url = (acme_public_url or settings.ACME_PUBLIC_URL).rstrip("/")

    admin_email = "admin@acmecorp.com"
    admin_password = "demo-password"

    async with httpx.AsyncClient(timeout=25.0) as client:
        # -------------------------------------------------------------------
        # 1. Autenticación o Registro de la Organización y Usuario CEO
        # -------------------------------------------------------------------
        jwt_token: Optional[str] = None
        user_id: Optional[str] = None
        org_id: Optional[str] = None
        initial_api_key: Optional[str] = None
        is_new_registration = False

        try:
            login_resp = await client.post(
                f"{base_url}/api/v1/auth/login",
                json={"email": admin_email, "password": admin_password},
            )
        except Exception as exc:
            raise RuntimeError(
                f"No fue posible conectar con el servidor de AgentGuard en {base_url}: {exc}"
            )

        if login_resp.status_code == 200:
            login_data = login_resp.json()
            jwt_token = login_data.get("access_token")
            user_info = login_data.get("user", {})
            user_id = user_info.get("id")
            org_id = user_info.get("organization_id")
        elif login_resp.status_code in (401, 404):
            # Intentar alta como nueva organización
            reg_payload = {
                "organization_name": "Acme Corp",
                "admin_name": "Lucas Duck (CEO ACME)",
                "email": admin_email,
                "password": admin_password,
            }
            reg_resp = await client.post(f"{base_url}/api/v1/auth/register-org", json=reg_payload)
            if reg_resp.status_code == 201:
                reg_data = reg_resp.json()
                jwt_token = reg_data.get("access_token")
                initial_api_key = reg_data.get("api_key")
                user_info = reg_data.get("user", {})
                user_id = user_info.get("id")
                org_info = reg_data.get("organization", {})
                org_id = org_info.get("id")
                is_new_registration = True
            else:
                # Si falló porque ya existe el email, reintentar login alternativo
                raise RuntimeError(
                    f"Fallo al registrar ACME Corp en AgentGuard ({reg_resp.status_code}): {reg_resp.text}"
                )
        else:
            raise RuntimeError(
                f"Respuesta inesperada al autenticar en AgentGuard ({login_resp.status_code}): {login_resp.text}"
            )

        if not jwt_token:
            raise RuntimeError("No se obtuvo un token JWT válido para el administrador de ACME Corp.")

        auth_headers = {"Authorization": f"Bearer {jwt_token}"}

        # -------------------------------------------------------------------
        # 2. Reseed inicial si corresponde (alta nueva, forzado u org incompleta)
        # -------------------------------------------------------------------
        should_reset = is_new_registration or force_reset
        if not should_reset:
            try:
                tools_probe = await client.get(f"{base_url}/api/v1/tools", headers=auth_headers)
                if tools_probe.status_code == 200 and isinstance(tools_probe.json(), list) and len(tools_probe.json()) == 0:
                    logger.info("La organización Acme Corp no posee herramientas base; ejecutando /demo/reset...")
                    should_reset = True
            except Exception as exc:
                logger.warning("No se pudo verificar herramientas existentes de Acme Corp: %s", exc)

        if should_reset:
            reset_resp = await client.post(f"{base_url}/api/v1/demo/reset", headers=auth_headers)
            if reset_resp.status_code == 200:
                reset_data = reset_resp.json()
                new_token = reset_data.get("access_token")
                if new_token:
                    jwt_token = new_token
                    auth_headers = {"Authorization": f"Bearer {jwt_token}"}
                # /demo/reset regenera UUIDs de organización, usuario y API keys
                reset_user = reset_data.get("user") if isinstance(reset_data.get("user"), dict) else {}
                user_id = reset_user.get("id")
                org_id = reset_data.get("organization_id") or org_id
                initial_api_key = None
            else:
                raise RuntimeError(
                    f"Error al ejecutar /demo/reset durante onboarding ({reset_resp.status_code}): {reset_resp.text}"
                )

        # -------------------------------------------------------------------
        # 3. Asegurar Perfil y Tenant del Administrador
        # -------------------------------------------------------------------
        if not user_id or not org_id:
            me_resp = await client.get(f"{base_url}/api/v1/auth/me", headers=auth_headers)
            if me_resp.status_code == 200:
                me_data = me_resp.json()
                user_id = me_data.get("id")
                org_id = me_data.get("organization_id")
            else:
                raise RuntimeError(f"No fue posible obtener perfil del usuario en AgentGuard: {me_resp.text}")

        # -------------------------------------------------------------------
        # 4. Provisión Idempotente del Asistente 'Consultante BI'
        # -------------------------------------------------------------------
        agents_resp = await client.get(f"{base_url}/api/v1/agents", headers=auth_headers)
        agents_list = agents_resp.json() if agents_resp.status_code == 200 and isinstance(agents_resp.json(), list) else []

        consultante_agent = next(
            (a for a in agents_list if "consultante" in (a.get("name") or "").lower() or "bi" in (a.get("name") or "").lower()),
            None,
        )
        if not consultante_agent:
            create_agent_payload = {
                "organization_id": org_id,
                "owner_user_id": user_id,
                "name": "Consultante BI",
                "purpose": "Asistente analítico de ventas y gráficos para personal administrativo (solo lectura)",
                "status": "ACTIVE",
            }
            new_agent_resp = await client.post(f"{base_url}/api/v1/agents", headers=auth_headers, json=create_agent_payload)
            if new_agent_resp.status_code != 201:
                raise RuntimeError(f"Error al crear el Agente 'Consultante BI': {new_agent_resp.text}")
            consultante_agent = new_agent_resp.json()

        consultante_id = consultante_agent["id"]

        # -------------------------------------------------------------------
        # 5. Provisión Idempotente de la Herramienta 'BI & Ventas ACME'
        # -------------------------------------------------------------------
        tools_resp = await client.get(f"{base_url}/api/v1/tools", headers=auth_headers)
        tools_list = tools_resp.json() if tools_resp.status_code == 200 and isinstance(tools_resp.json(), list) else []

        bi_tool = next(
            (t for t in tools_list if "bi" in (t.get("name") or "").lower() and "ventas" in (t.get("name") or "").lower()),
            None,
        )
        expected_bi_url = f"{acme_url}/bi"
        if not bi_tool:
            create_tool_payload = {
                "organization_id": org_id,
                "name": "BI & Ventas ACME",
                "protocol": "REST",
                "endpoint_url": expected_bi_url,
                "description": "Consultas analíticas y mantenimiento sobre ventas históricas de ACME Corp.",
            }
            new_tool_resp = await client.post(f"{base_url}/api/v1/tools", headers=auth_headers, json=create_tool_payload)
            if new_tool_resp.status_code != 201:
                raise RuntimeError(f"Error al registrar la Herramienta 'BI & Ventas ACME': {new_tool_resp.text}")
            bi_tool = new_tool_resp.json()
        elif bi_tool.get("endpoint_url") != expected_bi_url:
            await client.patch(
                f"{base_url}/api/v1/tools/{bi_tool['id']}",
                headers=auth_headers,
                json={"endpoint_url": expected_bi_url},
            )

        # Sincronizar endpoints antiguos (*.api.corp) si Acme ya existía de una sesión previa
        canonical_tool_suffixes = {
            "CRM & Facturación": "/crm",
            "Stripe Payments": "/stripe",
            "Catálogo de Precios": "/catalog",
            "Database Administrator": "/db",
        }
        for existing_t in tools_list:
            t_name = existing_t.get("name") or ""
            t_url = existing_t.get("endpoint_url") or ""
            suffix = canonical_tool_suffixes.get(t_name)
            if suffix and "api.corp" in t_url:
                await client.patch(
                    f"{base_url}/api/v1/tools/{existing_t['id']}",
                    headers=auth_headers,
                    json={"endpoint_url": f"{acme_url}{suffix}"},
                )

        tool_id = bi_tool["id"]

        # -------------------------------------------------------------------
        # 6. Provisión Idempotente de Acciones Atómicas (query_sales / delete_sales)
        # -------------------------------------------------------------------
        tool_detail_resp = await client.get(f"{base_url}/api/v1/tools/{tool_id}", headers=auth_headers)
        tool_detail = tool_detail_resp.json() if tool_detail_resp.status_code == 200 else bi_tool
        existing_actions = tool_detail.get("actions", []) if isinstance(tool_detail, dict) else []

        # Acción query_sales (LOW)
        query_sales_act = next(
            (act for act in existing_actions if (act.get("action_name") or act.get("name")) == "query_sales"),
            None,
        )
        if not query_sales_act:
            qa_resp = await client.post(
                f"{base_url}/api/v1/tool-actions",
                headers=auth_headers,
                json={
                    "tool_id": tool_id,
                    "action_name": "query_sales",
                    "risk_level": "LOW",
                    "description": "Consulta y análisis de registros de ventas históricas de ACME Corp.",
                },
            )
            if qa_resp.status_code != 201:
                raise RuntimeError(f"Error al registrar acción 'query_sales': {qa_resp.text}")
            query_sales_act = qa_resp.json()

        query_sales_id = query_sales_act["id"]

        # Acción delete_sales (CRITICAL)
        delete_sales_act = next(
            (act for act in existing_actions if (act.get("action_name") or act.get("name")) == "delete_sales"),
            None,
        )
        if not delete_sales_act:
            da_resp = await client.post(
                f"{base_url}/api/v1/tool-actions",
                headers=auth_headers,
                json={
                    "tool_id": tool_id,
                    "action_name": "delete_sales",
                    "risk_level": "CRITICAL",
                    "description": "Borrado masivo o selectivo de registros de ventas en la base de datos de ACME Corp.",
                },
            )
            if da_resp.status_code != 201:
                raise RuntimeError(f"Error al registrar acción 'delete_sales': {da_resp.text}")
            delete_sales_act = da_resp.json()

        delete_sales_id = delete_sales_act["id"]

        # -------------------------------------------------------------------
        # 7. Asignación N:N en AgentTool
        # -------------------------------------------------------------------
        agent_tools_resp = await client.get(f"{base_url}/api/v1/agents/{consultante_id}/tools", headers=auth_headers)
        assigned_tools = agent_tools_resp.json() if agent_tools_resp.status_code == 200 and isinstance(agent_tools_resp.json(), list) else []

        is_assigned = any(str(at.get("tool_id")) == str(tool_id) for at in assigned_tools)
        if not is_assigned:
            assign_resp = await client.post(
                f"{base_url}/api/v1/agents/{consultante_id}/tools",
                headers=auth_headers,
                json={"tool_id": tool_id, "enabled": True, "config": {}},
            )
            if assign_resp.status_code != 201:
                raise RuntimeError(f"Error al asignar 'BI & Ventas ACME' a 'Consultante BI': {assign_resp.text}")

        # -------------------------------------------------------------------
        # 8. Política y Reglas de Gobernanza
        # -------------------------------------------------------------------
        policies_resp = await client.get(f"{base_url}/api/v1/policies", headers=auth_headers)
        policies_list = policies_resp.json() if policies_resp.status_code == 200 and isinstance(policies_resp.json(), list) else []

        policy_name = "Gobernanza Consultante BI (Solo Lectura)"
        bi_policy = next((p for p in policies_list if p.get("name") == policy_name), None)

        if not bi_policy:
            create_policy_payload = {
                "organization_id": org_id,
                "name": policy_name,
                "description": "Permite consultas analíticas y bloquea terminantemente la eliminación o mutación de ventas",
                "priority": 150,
                "is_active": True,
            }
            new_policy_resp = await client.post(f"{base_url}/api/v1/policies", headers=auth_headers, json=create_policy_payload)
            if new_policy_resp.status_code != 201:
                raise RuntimeError(f"Error al crear política '{policy_name}': {new_policy_resp.text}")
            bi_policy = new_policy_resp.json()

        policy_id = bi_policy["id"]

        # Consultar reglas actuales de la política
        policy_detail_resp = await client.get(f"{base_url}/api/v1/policies/{policy_id}", headers=auth_headers)
        policy_detail = policy_detail_resp.json() if policy_detail_resp.status_code == 200 else bi_policy
        existing_rules = policy_detail.get("rules", []) if isinstance(policy_detail, dict) else []

        # Regla 1: ALLOW query_sales (prioridad 150)
        has_allow_rule = any(
            str(r.get("tool_action_id")) == str(query_sales_id) and r.get("effect") == "ALLOW"
            for r in existing_rules
        )
        if not has_allow_rule:
            rule_allow_payload = {
                "policy_id": policy_id,
                "tool_action_id": query_sales_id,
                "target_agent_id": consultante_id,
                "priority": 150,
                "effect": "ALLOW",
                "conditions": {},
            }
            ra_resp = await client.post(f"{base_url}/api/v1/policy-rules", headers=auth_headers, json=rule_allow_payload)
            if ra_resp.status_code != 201:
                raise RuntimeError(f"Error al crear regla ALLOW query_sales: {ra_resp.text}")

        # Regla 2: DENY delete_sales (prioridad 250)
        has_deny_rule = any(
            str(r.get("tool_action_id")) == str(delete_sales_id) and r.get("effect") == "DENY"
            for r in existing_rules
        )
        if not has_deny_rule:
            rule_deny_payload = {
                "policy_id": policy_id,
                "tool_action_id": delete_sales_id,
                "target_agent_id": consultante_id,
                "priority": 250,
                "effect": "DENY",
                "conditions": {},
            }
            rd_resp = await client.post(f"{base_url}/api/v1/policy-rules", headers=auth_headers, json=rule_deny_payload)
            if rd_resp.status_code != 201:
                raise RuntimeError(f"Error al crear regla DENY delete_sales: {rd_resp.text}")

        # -------------------------------------------------------------------
        # 9. Resolución y Persistencia de la API Key Operativa
        # -------------------------------------------------------------------
        effective_key = initial_api_key

        if not effective_key:
            # Probar si la clave actual en settings sigue siendo válida para el Gateway
            current_key = (settings.AGENTGUARD_API_KEY or "").strip()
            key_is_valid = False
            if current_key:
                try:
                    ctx_check = await client.get(
                        f"{base_url}/api/v1/gateway/context",
                        headers={"X-AgentGuard-Key": current_key},
                    )
                    if ctx_check.status_code == 200:
                        key_is_valid = True
                        effective_key = current_key
                except Exception:
                    key_is_valid = False

            if not key_is_valid:
                # Generar una nueva API Key corporativa
                key_payload = {
                    "organization_id": org_id,
                    "name": "Portal ACME Corporation",
                }
                key_resp = await client.post(f"{base_url}/api/v1/api-keys", headers=auth_headers, json=key_payload)
                if key_resp.status_code == 201:
                    effective_key = key_resp.json().get("api_key")
                else:
                    raise RuntimeError(f"Error al generar API Key para ACME Corp: {key_resp.text}")

        if effective_key:
            settings.AGENTGUARD_API_KEY = effective_key
            persist_api_key_to_env(effective_key)

        # -------------------------------------------------------------------
        # 10. Recuento final y respuesta en español
        # -------------------------------------------------------------------
        final_agents_resp = await client.get(f"{base_url}/api/v1/agents", headers=auth_headers)
        final_agents = final_agents_resp.json() if final_agents_resp.status_code == 200 and isinstance(final_agents_resp.json(), list) else []

        final_tools_resp = await client.get(f"{base_url}/api/v1/tools", headers=auth_headers)
        final_tools = final_tools_resp.json() if final_tools_resp.status_code == 200 and isinstance(final_tools_resp.json(), list) else []

        masked_key = (
            f"{effective_key[:12]}...{effective_key[-4:]}"
            if effective_key and len(effective_key) > 16
            else "***"
        )

        return {
            "status": "success",
            "message": "ACME Corporation contratada y vinculada exitosamente con AgentGuard",
            "organization_id": str(org_id),
            "organization_name": "Acme Corp",
            "api_key_masked": masked_key,
            "agents_count": len(final_agents),
            "tools_count": len(final_tools),
            "already_configured": not is_new_registration,
        }
