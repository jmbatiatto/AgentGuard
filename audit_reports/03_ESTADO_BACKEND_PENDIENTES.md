# 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural

- **Alcance:** Auditoría estática exhaustiva de `backend/app/**`, `backend/alembic/**`, `backend/scripts/**` y `backend/tests/**` (`Python 3.12+`, `FastAPI 0.115.0`, `SQLAlchemy 2.0.35 async`, `Pydantic 2.9.2`, `PostgreSQL 16`, `Redis 7`).
- **Fecha de Auditoría:** 30 de octubre de 2026 (`HEAD: a2bcd19`, rama `main`).
- **Objetivo:** Inventariar endpoints rotos en tiempo de ejecución, retornos ficticios (*stubs*), violaciones a las **7 Reglas Innegociables de Dominio** ([AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md#L73-L90)), brechas de aislamiento multi-tenant, condiciones de carrera y puntos ciegos de la suite de pruebas.

---

## 1. Veredicto Ejecutivo del Backend

El backend de **AgentGuard** posee una base bien organizada en términos de tipado con Pydantic v2, esquema relacional de 12 tablas en Alembic ([001_initial_schema.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic/versions/001_initial_schema.py)) y separación inicial entre modelos, esquemas, routers y motores (`pdp_engine.py`, `threat_detector.py`, `sanitizer_service.py`).

Sin embargo, el análisis forense estático revela **fallos críticos que impiden su operación confiable fuera de los caminos felices pre-sembrados**:

1. **5 endpoints `POST`/`PATCH` colapsan deterministamente con `HTTP 500 (sqlalchemy.exc.MissingGreenlet)`** contra PostgreSQL real debido a `await db.refresh(...)` sin recarga *eager* (`selectinload`) de relaciones accedidas durante la serialización Pydantic. Pasaron desapercibidos en CI porque el 100% de `backend/tests/` usa `AsyncMock` en lugar de sesiones reales de SQLAlchemy.
2. **4 endpoints mutadores colapsan con `HTTP 500 (sqlalchemy.exc.IntegrityError)`** ante borrados con restricciones `ON DELETE RESTRICT` o UUIDs de usuario no verificados (`DELETE /agents/{id}`, `DELETE /users/{id}`, `POST /approvals/{id}/resolve`, `PATCH /alerts/{id}/status`).
3. **Retornos simulados silenciosos y latencia ficticia:** `_dispatch_to_tool` captura cualquier caída o error HTTP `4xx`/`5xx` de una API REST real y **fabrica un `{"status": "success"}` falso con `HTTP 200 OK` y estado `EXECUTED`**; por su parte, `GET /api/v1/executions` devuelve `latency_ms=21.5` hardcodeado en todas las trazas históricas.
4. **Incumplimiento de reglas nucleares de seguridad:** **0 de 13 routers** implementan autenticación o RBAC; el aislamiento por `organization_id` es opcional o inexistente en lecturas/mutaciones/WebSockets; y un error en el orden del pipeline de `pep_gateway_service.py` **suprime la generación de alertas OWASP y eventos WebSocket** cuando un agente intenta atacar una herramienta no asignada en `AgentTool` (afectando directamente al Escenario 5 de la demo).

---

## 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución

### 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`

En SQLAlchemy 2.0 asíncrono (`asyncpg`), `await db.commit()` expira todos los atributos de la instancia ORM (porque [database.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/core/database.py#L22-L26) no configura `expire_on_commit=False` o porque `await db.refresh(obj)` solo recarga columnas escalares de la tabla base, dejando sus relaciones descargadas). Cuando FastAPI valida el `response_model` de Pydantic (`from_attributes=True`), el acceso síncrono a cualquier relación `relationship()` o `@property` derivada dispara `MissingGreenlet: greenlet_spawn has not been called; can't call await_only() here`.

| Endpoint Afectado | Router y Servicio | Relaciones / `@property` que Disparan el Crash | Evidencia Exacta |
| :--- | :--- | :--- | :--- |
| **`POST /api/v1/tools`** | [tools.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/tools.py#L25-L38) -> [tool_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/tool_service.py#L21-L31) | `ToolRead` ([schemas/tool.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/tool.py#L38-L46)) serializa `tool.actions` y `@property assigned_agents` ([models/tool.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/tool.py#L52-L56)), que itera `self.agent_tools` y `at.agent.name`. | `tool_service.create` hace `await db.refresh(tool)` en línea 30 sin `selectinload(Tool.actions)` ni `selectinload(Tool.agent_tools).selectinload(AgentTool.agent)` (a diferencia de `get_by_id` en líneas 34-43). |
| **`PATCH /api/v1/tools/{tool_id}`** | [tools.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/tools.py#L89-L115) -> [tool_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/tool_service.py#L75-L89) | Ídem (`ToolRead` -> `tool.actions` y `tool.assigned_agents`). | `tool_service.update` ejecuta `await db.commit()` + `await db.refresh(tool)` en líneas 87-88, expirando las relaciones previamente cargadas por `get_by_id`. |
| **`POST /api/v1/policies`** | [policies.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/policies.py#L24-L37) -> [policy_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/policy_service.py#L21-L31) | `PolicyRead` ([schemas/policy.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/policy.py#L35-L41)) accede a `policy.rules: List[PolicyRuleRead]`. | `policy_service.create` ejecuta `await db.refresh(policy)` en línea 30 sin `selectinload(Policy.rules)` (que sí usa `get_by_id` en líneas 34-43). |
| **`PATCH /api/v1/policies/{policy_id}`** | [policies.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/policies.py#L88-L114) -> [policy_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/policy_service.py#L75-L89) | Ídem (`PolicyRead` -> `policy.rules` y `@property` internas de cada `PolicyRule`). | `policy_service.update` expira `policy.rules` tras `commit()` + `refresh(policy)` en líneas 87-88. |
| **`POST /api/v1/policy-rules`** | [policy_rules.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/policy_rules.py#L25-L71) -> [policy_rule_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/policy_rule_service.py#L21-L32) | `PolicyRuleRead` ([schemas/policy_rule.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/policy_rule.py#L39-L48)) lee `@property action_name`, `tool_name` y `agent_name` ([models/policy.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/policy.py#L72-L86)), que navegan `self.tool_action.tool` y `self.target_agent`. | `policy_rule_service.create` ejecuta `await db.refresh(rule)` en línea 31 sin `selectinload(PolicyRule.tool_action).selectinload(ToolAction.tool)` ni `selectinload(PolicyRule.target_agent)`. |

> [!WARNING]
> **Efecto Cascada con el Frontend:** Estos 5 errores `HTTP 500` son exactamente la causa raíz por la cual al crear una Herramienta o una Política desde el Dashboard web, `api.ts` cae silenciosamente en su bloque de fallback local, muestra un *toast* verde engañoso y pierde los datos al recargar la página (documentado en [02_ESTADO_FRONTEND_ALMA_MATER.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/02_ESTADO_FRONTEND_ALMA_MATER.md)).

### 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`)

Mientras que [tools.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/tools.py#L124-L131) y [policies.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/policies.py#L123-L130) capturan `IntegrityError` y devuelven `409 Conflict`, otros 5 flujos carecen de protección:

1. **`DELETE /api/v1/agents/{agent_id}` ([agents.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/agents.py#L130-L148)):** La columna `executions.agent_id` tiene `ondelete="RESTRICT"` ([001_initial_schema.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic/versions/001_initial_schema.py#L148)). Intentar borrar cualquier agente que haya ejecutado al menos una acción en su historia lanza un `IntegrityError` crudo (`HTTP 500`).
2. **`DELETE /api/v1/users/{user_id}` ([users.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/users.py#L125-L143)):** `agents.owner_user_id` tiene `ondelete="RESTRICT"` ([001_initial_schema.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic/versions/001_initial_schema.py#L89)). Intentar eliminar a un usuario propietario de agentes detona `HTTP 500`.
3. **`POST /api/v1/approvals/{approval_id}/resolve` ([pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L474-L501)):**
   ```python
   approver_res = await db.execute(select(User).where(User.id == approver_user_id))
   approver = approver_res.scalar_one_or_none()
   if approver and approver.role not in (UserRole.APPROVER, UserRole.ADMIN):
       return None
   ```
   Si `approver` es `None` (UUID inexistente en PostgreSQL, como el perfil `Lucia Vance` `22222222-2222-2222-2222-222222222204` de `AuthContext.tsx`), la condición `if approver and ...` **se salta la validación de seguridad**, continúa hasta `approval.assigned_approver_id = approver_user_id` (línea 500) y revienta en `await db.commit()` con `ForeignKeyViolationError` (`HTTP 500`).
4. **`PATCH /api/v1/alerts/{alert_id}/status` ([alerts.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/alerts.py#L103-L108)):** Asigna `alert.resolved_by_user_id = update_data.resolved_by_user_id` sin verificar si el usuario existe ni si pertenece a `alert.organization_id`, provocando `HTTP 500` si el UUID no está en `users`.
5. **`POST /api/v1/gateway/execute` con `delegator_user_id` inválido ([pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L349)):** `request.delegator_user_id` se inserta directamente en `Execution.delegator_user_id` sin comprobar previamente su existencia ni su pertenencia a la organización, detonando `ForeignKeyViolationError` (`HTTP 500`) en lugar de `400`/`403` Fail-Closed.

---

## 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP

### 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed)
- **Ubicación:** [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L50-L81).
- **Evidencia:**
  ```python
  if endpoint and endpoint.startswith(("http://", "https://")) and "acmecorp.internal" not in endpoint:
      try:
          async with httpx.AsyncClient(timeout=5.0) as client:
              response = await client.post(...)
              if response.status_code < 400:
                  return {"status": "success", "upstream_code": response.status_code, ...}
      except Exception as exc:
          logger.warning("Despacho HTTP real a %s falló (%s); usando respuesta controlada.", endpoint, exc)
  # Respuesta determinista simulada para herramientas de demostración
  return {"status": "success", "tool": tool.name, "executed_action": action_name, ...}
  ```
- **Impacto Crítico:** Si una empresa conecta una API REST real (ej. `https://api.stripe.com/...`) y el servidor externo devuelve `401 Unauthorized`, `500 Internal Server Error` o sufre un `ConnectTimeout`, el Gateway **oculta el fallo**, marca la traza forense en PostgreSQL como `ExecutionStatus.EXECUTED` y responde `HTTP 200 OK` al agente con un payload simulado diciendo que la acción fue ejecutada exitosamente. Asimismo, en [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L508-L518), tras aprobar un ticket HITL, `approval.execution.status = ExecutionStatus.EXECUTED` se asigna **antes** de `_dispatch_to_tool` y cualquier excepción se silencia en `except Exception`.

### 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado
- **Ubicación:** [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L280-L286), [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L352) y [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L512-L516).
- **Causa Técnica:** Cuando una solicitud cae en `REQUIRE_APPROVAL`, el Gateway guarda en `Execution.request_context` la versión **ya sanitizada** por `SanitizerService.sanitize_context(...)` (donde tarjetas, secretos o claves con subcadenas `"auth"`/`"token"`/`"pin"` fueron sobrescritas irreversiblemente con `"***REDACTED***"`, y potencialmente enriquecida con la llave interna `_security_threat`). Cuando el humano aprueba el ticket en `resolve_approval`, las líneas 512-516 reenvían `parameters=approval.execution.request_context` a la herramienta externa — mandando literales `"***REDACTED***"` a la API de negocio — y además **descartan el valor de retorno** de `_dispatch_to_tool` porque `Execution` no posee columna `response_payload`.

### 3.3 Bug de Orden de Validación en el Pipeline del Gateway (Supresión de Alertas OWASP y Trazas)
- **Ubicación:** [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L112-L343).

```mermaid
flowchart TD
    REQ["POST /api/v1/gateway/execute"] --> S1["1. Buscar Agent / Tool / ToolAction (L114-184)"]
    S1 -->|"No existe o Agent != ACTIVE"| BUG1["Retorna DENY con uuid4() FALSO SIN escribir en tabla executions (Viola Regla 7)"]
    S1 -->|"OK"| S2["2. ThreatDetector.analyze_parameters (L187) -> detecta SQLi / Prompt Injection"]
    S2 --> S3["3. Verificar vínculo AgentTool (L196-224)"]
    S3 -->|"Sin vínculo AgentTool (ej. Escenario 5: Sales Agent -> Core DB)"| BUG2["Guarda Execution y RETORNA TEMPRANO en L213: NO crea Alert en BD, NO envía security_analysis y NO emite WebSocket!"]
    S3 -->|"Con vínculo AgentTool"| S4["4. Evaluar amenaza OWASP (L247) + PDP + Crear Alert + Broadcast WS (L363-431)"]
```

- **Impacto Directo en Seguridad y en la Demo:**
  1. **Rechazos tempranos sin traza forense (líneas 114-184):** Si un agente `SUSPENDED` o `REVOKED` intenta invocar una herramienta, o solicita una `action_name` inexistente para sondear capacidades (*enumeration attack*), el Gateway devuelve un `execution_id=uuid4()` en el JSON **sin insertar ningún registro en `executions`**, violando la **Regla 7 de `AGENTS.md`** (*"Cada decisión de autorización produce un registro inmutable en `executions`"*).
  2. **Supresión de alertas OWASP ante falta de `AgentTool` (líneas 187-247):** `ThreatDetector.analyze_parameters` se ejecuta en la línea 187, pero su resultado (`threat_report.is_threat`) recién se procesa en la línea 247, **después** del `return` temprano por falta de relación `AgentTool` (línea 213). En [seed_demo.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/scripts/seed_demo.py#L70) y [seed_demo.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/scripts/seed_demo.py#L290-L324), el `Agente de Ventas` (`...3301`) no tiene asignada `Core PostgreSQL DB` (`...4404`). Por ende, cuando se ejecuta el vector `ASI05_SQL_INJECTION` del catálogo oficial ([gateway.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/gateway.py#L118-L131)) o el **Escenario 5 (`database.drop`)** con el `Agente de Ventas`, el backend **no crea ninguna `Alert` en PostgreSQL, devuelve `alert_id=None`, `security_analysis=None` y no transmite ningún evento por WebSocket**.

### 3.4 Latencia Forense Ficticia (`latency_ms=21.5`)
- **Ubicación:** [executions.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/executions.py#L47), [schemas/execution.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/execution.py#L29) y [models/execution.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/execution.py#L23-L45).
- **Diagnóstico:** `pep_gateway_service.py:407` mide `elapsed_ms` con `time.perf_counter()`, pero el modelo `Execution` no tiene columna `latency_ms`. Al consultar el historial por REST, `_to_execution_response()` inyecta la constante fija `latency_ms=21.5` en el 100% de las filas.

---

## 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4)

### 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs
- **Estado:** **0 de los 13 routers** en `backend/app/api/` validan identidad del llamador.
- **Rutas críticas totalmente abiertas sin credenciales:**
  - `POST /api/v1/demo/reset` ([demo.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/demo.py#L16-L46)): ejecuta `TRUNCATE ... CASCADE` sobre toda la base de datos en cualquier entorno (y en caso de fallo filtra `str(exc)` interno en el detalle HTTP 500, además de mutar `sys.path` dinámicamente en tiempo de request).
  - `POST /api/v1/policies`, `POST /api/v1/policy-rules`, `DELETE /api/v1/policies/{id}`: cualquier cliente anónimo puede inyectar una regla `ALLOW` con prioridad `1` o borrar todas las políticas.
  - `POST /api/v1/approvals/{id}/resolve`: acepta `approver_user_id` en el body JSON sin verificar que quien envía el request sea realmente ese usuario (`ID Spoofing`).

### 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`)
La Regla 2 establece: *"Toda consulta o mutación de persistencia DEBE estar acotada por `organization_id`"*. Se detectaron **4 vectores de fuga cross-tenant**:
1. **Listados globales cuando se omite `organization_id`:** En [users.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/users.py#L54), [agents.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/agents.py#L46), [tools.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/tools.py#L51), [policies.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/policies.py#L50), [approvals.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/approvals.py#L26), [executions.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/executions.py#L64) y [alerts.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/alerts.py#L32), el query param es `Optional[UUID] = None`. Llamar a `GET /api/v1/executions` sin query param retorna las trazas de **todos los tenants**.
2. **Endpoints sin filtro `organization_id` ni siquiera opcional:** `GET /api/v1/tool-actions` ([tool_actions.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/tool_actions.py#L48-L61)) y `GET /api/v1/policy-rules` ([policy_rules.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/policy_rules.py#L86-L100)) listan acciones y reglas de todas las organizaciones.
3. **Accesos y mutaciones por `{id}` sin acotar por tenant:** Todos los endpoints `GET /{id}`, `PATCH /{id}` y `DELETE /{id}` en `users`, `agents`, `tools`, `tool_actions`, `policies`, `policy_rules`, `executions`, `approvals` y `alerts` buscan únicamente por clave primaria `WHERE id = :id`. Además, `resolve_approval` ([pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L475-L482)) **no valida que `approver.organization_id == approval.execution.organization_id`**, permitiendo que un `APPROVER` del Tenant B apruebe transacciones financieras del Tenant A.
4. **Canal WebSocket Global sin filtro de Tenant:** `WS /api/v1/ws` ([websocket.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/websocket.py#L14-L28)) registra al cliente en el bucket `"global"` de [websocket_manager.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/core/websocket_manager.py#L88-L89), el cual recibe copia de **todos** los eventos emitidos para cualquier `organization_id`.

### 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL
- **Race Condition TOCTOU ([pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L459-L524)):** `resolve_approval` ejecuta `SELECT ... WHERE approvals.id = :id` sin bloqueo pesimista (`with_for_update()`) ni actualización condicional atómica (`UPDATE approvals SET status = ... WHERE id = :id AND status = 'PENDING'`). Dos peticiones concurrentes `POST /resolve` leen `status == PENDING`, ambas despachan el reembolso financiero hacia la API externa y ambas hacen `commit()`.
- **TTL Pasivo:** No existe worker ni tarea periódica que pase a `EXPIRED` los tickets con más de 15 minutos de antigüedad; si nadie invoca `POST /approvals/{id}/resolve` sobre un ticket vencido, `GET /api/v1/approvals?status=PENDING` lo seguirá reportando como `PENDING` eternamente.

### 4.4 Defectos en `SanitizerService` y Configuraciones Ignoradas
1. **Falsos positivos agresivos por coincidencia de subcadena ([sanitizer_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/sanitizer_service.py#L16-L46)):** `SENSITIVE_KEY_PATTERNS` incluye cadenas cortas como `"pin"`, `"auth"` y `"token"`, evaluadas mediante `any(pattern in key_lower for pattern in cls.SENSITIVE_KEY_PATTERNS)`. Esto corrompe parámetros legítimos de negocio cuyo nombre contenga esas sílabas: `shipping_address`, `shopping_cart`, `mapping`, `author`, `authority` o `max_tokens` son reemplazados por `"***REDACTED***"`.
2. **Bypass de sanitización en payloads Base64 ([pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L280-L286)):** `sanitized_context` se genera en la línea 280, y en la línea 286 se le adjunta `threat_report.to_dict()`, que contiene `decoded_payload` en texto plano sin pasar por `SanitizerService`. Si un prompt contenía credenciales codificadas en Base64, quedan guardadas sin redactar en PostgreSQL.
3. **`AgentTool.config` ignorado y `AgentTool.enabled` filtrado erróneamente:**
   - La columna `AgentTool.config` (`JSONB`, ej. `{"max_daily_calls": 500, "timeout_ms": 3000}` sembrada en [seed_demo.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/scripts/seed_demo.py#L298-L322)) **nunca es leída** ni por `pep_gateway_service.py` ni por `pdp_engine.py`.
   - En [models/tool.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/tool.py#L52-L56), `@property assigned_agents` devuelve `[at.agent.name for at in self.agent_tools if at.agent]` **sin filtrar `if at.enabled`**, mostrando como autorizados vínculos revocados (`enabled=False`).
   - En [schemas/agent.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/agent.py#L31-L40), `AgentRead` ni siquiera expone `assigned_tools` ni el nombre/email del propietario (`owner`).

---

## 5. Deuda Técnica Estructural, Contratos Incompletos y Configuración

1. **Inconsistencia arquitectónica Router vs. Service:** Mientras `users`, `agents`, `tools`, `policies`, `policy_rules` y `tool_actions` delegan en `app/services/*_service.py`, los routers [executions.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/executions.py) y [alerts.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/alerts.py) ejecutan consultas y commits SQLAlchemy directamente en la capa HTTP, sin validar máquinas de estado en `Alert.status`.
2. **Esquemas duplicados y divergentes para `Execution`:** Coexisten `ExecutionResponse` en [schemas/execution.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/execution.py#L12-L35) y `ExecutionRead` en [schemas/gateway.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/schemas/gateway.py#L84-L106) (este último completamente en desuso).
3. **Operaciones CRUD faltantes en la API REST:**
   - `organizations`: sin `PATCH /api/v1/organizations/{id}` ni `DELETE`.
   - `tool_actions`: sin `PATCH /api/v1/tool-actions/{id}` ni `DELETE` (imposible editar el `risk_level` o eliminar una acción desde la UI).
   - `policy_rules`: sin `PATCH /api/v1/policy-rules/{id}` ni `DELETE` (imposible modificar `conditions` JSONB o `priority` de una regla existente sin recrear toda la política).
   - `agent_tools`: existe `POST /api/v1/agents/{agent_id}/tools` ([agents.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/agents.py#L151-L185)), pero **no existe `GET` ni `DELETE /api/v1/agents/{agent_id}/tools/{tool_id}`** para listar o revocar capacidades individuales.
   - `tools`: el modelo [models/tool.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/tool.py#L19-L50) carece de columna `status` (`ACTIVE`/`PAUSED`/`INACTIVE`), impidiendo pausar globalmente una herramienta caída sin borrarla.
4. **Credenciales hardcodeadas en configuración de migraciones:** [alembic.ini](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic.ini#L8) contiene `sqlalchemy.url = postgresql+asyncpg://agentguard:agentguard_secret@localhost:5432/agentguard` en texto plano (aunque `alembic/env.py` lo sobrescribe con `settings.DATABASE_URL`).
5. **Creación efímera de clientes de red por petición:** `main.py:42` instancia y cierra una conexión `redis.from_url(...)` nueva en cada `/health`, y `pep_gateway_service.py:56` crea un `httpx.AsyncClient` nuevo (sin reutilizar pool TCP/TLS) en cada despacho a herramientas.

---

## 6. Diagnóstico de la Suite de Pruebas (`backend/tests/`)

Aunque existen 19 archivos de test en `backend/tests/`, la estrategia actual presenta **3 puntos ciegos graves**:

1. **100% de tests de API y Servicios con `AsyncMock` (0 tests de integración real con SQLAlchemy/BD):**
   - No existe `backend/tests/conftest.py` con base de datos de prueba transaccional.
   - En [test_tools.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/tests/test_tools.py#L22-L44), [test_policies.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/tests/test_policies.py#L22-L43) y [test_policy_rules.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/tests/test_policy_rules.py#L24-L48), `db` es un `AsyncMock()` donde `db.refresh` es un mock vacío y los objetos ORM son instancias transitorias en memoria (no adjuntas a ninguna sesión real). En objetos transitorios de SQLAlchemy, acceder a `tool.actions` devuelve `[]` sin disparar I/O, **ocultando por completo los 5 crashes `MissingGreenlet` (`HTTP 500`) que ocurren en producción contra PostgreSQL**.
2. **Test Vacuo (*No-Op Test*) en `test_seed_demo.py`:**
   - En [test_seed_demo.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/tests/test_seed_demo.py#L148-L159), la prueba `test_seed_data_already_exists_without_reset` configura `mock_session`, **nunca invoca `await seed_data(reset=False)`** y termina ejecutando `mock_session.add.assert_not_called()`, pasando siempre en verde por omisión.
3. **Cobertura incompleta del Escenario 5:**
   - [test_gateway_scenarios.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/tests/test_gateway_scenarios.py) valida los Escenarios 1 a 4, pero no incluye una prueba de extremo a extremo para el Escenario 5 (`database.drop` desde `Agente de Ventas`), razón por la cual no se detectó que dicho flujo no genera `Alert` en backend.
