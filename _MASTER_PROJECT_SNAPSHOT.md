# `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard

> **Corte de verdad:** Consolidado sobre rama `main` en `HEAD` `597d3d97f7ce04d057c30e8a1179451bdf9896b9`, contrastando toda la documentación vigente con el grafo AST de Graphify ([GRAPH_REPORT.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/graphify-out/GRAPH_REPORT.md), commit `b7646228`) y la inspección directa de código y migraciones Alembic (`001`–`005`).

---

## Índice Navegable

1. [Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant)](#1-propósito-y-modelo-de-negocio-saas-b2b-vs-paas-multi-tenant)
   - [1.1 Qué problema resuelve](#11-qué-problema-resuelve)
   - [1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin](#12-roles-y-realidad-saas-b2b-vs-solicitud-paas-superadmin)
   - [1.3 Flujo principal operativo vs. onboarding en "pocos clics"](#13-flujo-principal-operativo-vs-onboarding-en-pocos-clics)
2. [Arquitectura y Stack Tecnológico](#2-arquitectura-y-stack-tecnológico)
   - [2.1 Stack políglota verificado](#21-stack-políglota-verificado)
   - [2.2 Topología PEP / PDP y aislamiento multi-tenant](#22-topología-pep--pdp-y-aislamiento-multi-tenant)
   - [2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel)](#23-controles-de-seguridad-para-agentes-ia-implementado-vs-solo-en-papel)
3. [Modelo de Datos y Contratos Clave](#3-modelo-de-datos-y-contratos-clave)
   - [3.1 Esquema PostgreSQL real (13 tablas, migraciones 001–005)](#31-esquema-postgresql-real-13-tablas-migraciones-001005)
   - [3.2 Superficie HTTP/WebSocket real (`backend/app/api/`)](#32-superficie-httpwebsocket-real-backendappapi)
   - [3.3 Contratos críticos: PEP Gateway, PDP, HITL y Escenarios Demo](#33-contratos-críticos-pep-gateway-pdp-hitl-y-escenarios-demo)
4. [Estado Real del Proyecto (Código vs. Graphify vs. Docs)](#4-estado-real-del-proyecto-código-vs-graphify-vs-docs)
   - [4.1 Módulos construidos y verificables en código](#41-módulos-construidos-y-verificables-en-código)
   - [4.2 Módulos a medio hacer o parcialmente cableados](#42-módulos-a-medio-hacer-o-parcialmente-cableados)
   - [4.3 Elementos que quedaron solo en papel](#43-elementos-que-quedaron-solo-en-papel)
5. [Deuda Técnica y Riesgos Detectados](#5-deuda-técnica-y-riesgos-detectados)

---

## 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant)

### 1.1 Qué problema resuelve

**AgentGuard** es una plataforma de autorización contextual, gobernanza y observabilidad en tiempo de ejecución para agentes de IA que invocan herramientas/APIs externas (*«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora»*).

- Actúa como **Gateway Interceptor / PEP (Policy Enforcement Point)** delante de APIs empresariales (CRM, pagos, soporte, etc.) para evitar acciones destructivas, fraudes por delegación excesiva, inyección de prompts y exfiltración de PII.
- Evalúa cada invocación de forma determinista y **Fail-Closed** (`DENY` por defecto) sobre un modelo de **5 dimensiones**:
  `[Agente, Delegador/Usuario, Acción Atómica, Recurso, Contexto]`.
- Mitiga vectores alineados con **OWASP Top 10 for Agentic Applications 2026** y **OWASP LLM06** (sanitización previa de credenciales/PII antes de persistir trazas).

### 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin

> [!WARNING]
> **Brecha de modelo de negocio detectada:** Aunque en esta auditoría se solicitó consolidar el modelo **PaaS Multi-tenant (`superadmin PaaS vs. admin empresa cliente`)**, una búsqueda exhaustiva en todo el código y documentos arroja **0 referencias** a `superadmin`, `super_admin`, `platform_admin`, `paas` o `pocos clics`.

- **Modelo documentado e implementado:** **SaaS B2B multi-tenant en esquema compartido** (`AgentGuard_Propuesta_Desarrollo_Web_v2.pdf`, `README.md`, `AGENTS.md`, [enums.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/enums.py)).
- **Roles existentes (todos acotados a una `Organization` cliente):**
  - `ADMIN`: Gobierno del tenant (agentes, herramientas, políticas, reglas, API keys, settings y auditoría).
  - `APPROVER`: Operador humano autorizado para resolver tickets HITL (`APPROVED` / `REJECTED`). Nota: [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L540) también permite resolver aprobaciones al rol `ADMIN`.
  - `OPERATOR`: Operación estándar de plataforma dentro del tenant.
  - `AUDITOR` / `VIEWER`: Presentes en [enums.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/enums.py) y [domain.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/types/domain.ts) para consulta sin mutación administrativa (sin endpoints diferenciados aún en el backend).
- **Qué existe hoy en lugar de Superadmin PaaS:**
  - En el frontend ([dashboard-sidebar.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/components/ui/dashboard-sidebar.tsx#L40-L96)), el componente `WorkspaceSwitcher` permite listar organizaciones (`GET /api/v1/organizations`) y ejecutar `switchOrganization(org.id)` desde la sesión actual, comportándose como selector multi-tenant de demo más que como consola aislada de Superadmin PaaS.
  - En el backend, `GET / POST /api/v1/organizations` carece de dependencia de autenticación.

### 1.3 Flujo principal operativo vs. onboarding en "pocos clics"

No existe un asistente guiado de alta en "pocos clics" ni auto-onboarding PaaS implementado. El flujo real de uso por un administrador de empresa cliente (`ADMIN`) sigue esta secuencia:

1. **Acceso y contexto de tenant:** Iniciar sesión (JWT en `AuthView` o seed Acme Corp con `admin@acmecorp.com`).
2. **Registro de superficie externa (`ToolsView`):** Crear `Tool` (ej. `Stripe Payments`) y sus acciones atómicas `ToolAction` etiquetadas por `RiskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
3. **Identidad y privilegio mínimo (`AgentsView`):** Registrar `Agent` (`owner_user_id`) y vincularle explícitamente qué herramientas puede operar mediante la relación N:N `AgentTool` (`enabled`, `config JSONB`).
4. **Reglas de gobierno (`PoliciesView`):** Definir `Policy` y `PolicyRule` granulares con `effect` (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`), prioridad numérica y condiciones JSONB (`max_amount`, `currency`, `allowed_domains`, etc.).
5. **Integración Data Plane (`SettingsView` + Gateway):** Emitir una `ApiKey` (`ag_live_...`, aún pendiente de verificación en runtime) para que los agentes llamen a `POST /api/v1/gateway/execute` (o probar reglas antes en `PlaygroundView` vía `POST /api/v1/gateway/simulate`).
6. **Supervisión en vivo:** Auditar trazas en `TracesView`, resolver bloqueos HITL (`REQUIRE_APPROVAL`) desde `ApprovalsView` por WebSocket y revisar KPIs/eventos en `OverviewView` y `SettingsView`.

---

## 2. Arquitectura y Stack Tecnológico

### 2.1 Stack políglota verificado

| Capa | Tecnología real verificada | Evidencia / Archivos |
| :--- | :--- | :--- |
| **Backend API** | Python 3.12+, FastAPI (`>=0.111.0`), Uvicorn, Pydantic v2 (`>=2.7.0`), `httpx` (`>=0.27.0`) | [requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), [main.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/main.py) |
| **ORM y Migraciones** | SQLAlchemy 2.0 async (`asyncpg`), Alembic (`>=1.13.0`), 5 revisiones (`001`–`005`) | [backend/alembic/versions/](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic/versions/001_initial_schema.py) |
| **Base de Datos** | PostgreSQL 16 (puerto **5433** en host -> `5432` en contenedor) con UUID v4 y JSONB + índices GIN | [docker-compose.yml](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/docker-compose.yml), [config.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/core/config.py) |
| **Caché / Broker** | Redis 7 (`redis://localhost:6379/0`, `redis>=5.0.0` asyncio) | [docker-compose.yml](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/docker-compose.yml), [main.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/main.py) |
| **Frontend SPA** | React `^19.2.8`, TypeScript `~6.0.2`, Vite `^8.3.0`, Tailwind CSS, `lucide-react`, `oxlint`, `pnpm` | [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/package.json), [App.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/App.tsx) |
| **Testing** | Backend: `pytest` + `pytest-asyncio` (30 archivos en `backend/tests/`). Frontend: **sin suite ni runner instalado** | [backend/tests/](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/tests/test_gateway_scenarios.py), [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/package.json) |
| **Agente Demo externo** | Documentado como Python (README/ADR-002) o Node.js/TS (`agent-demo/README.md`); **vacío en código** | [agent-demo/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agent-demo/README.md) |

### 2.2 Topología PEP / PDP y aislamiento multi-tenant

- **Separación Data Plane vs. Control Plane (ADR-003, HTTP REST puro sin MCP):**
  - **Data Plane:** `POST /api/v1/gateway/execute` y `/simulate` interceptan la intención del agente antes de tocar herramientas externas.
  - **Control Plane:** `/api/v1/{organizations,users,tools,tool-actions,agents,policies,policy-rules,api-keys,audit-events,analytics,approvals,executions,alerts,auth}`.
  - **Tiempo Real:** WebSockets en `/api/v1/ws` y `/api/v1/ws/{organization_id}` ([websocket.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/websocket.py)) emiten `NEW_EXECUTION`, `NEW_APPROVAL`, `NEW_ALERT` y `RESOLVED_APPROVAL`.
- **Aislamiento Multi-Tenant actual:** Todas las entidades principales incorporan FK `organization_id` (`UUID v4`) y el filtrado se realiza a nivel de aplicación en queries SQLAlchemy y canales WebSocket por `organization_id`. **No existe Row-Level Security (RLS) en PostgreSQL.**

### 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel)

| Mecanismo | Estado real | Qué hace hoy en código |
| :--- | :--- | :--- |
| **Sanitización OWASP LLM06** | **Implementado** | `sanitizer_service.sanitize()` redacta claves sensibles y tokens (`***REDACTED***`, `***REDACTED_JWT***`) antes de guardar `request_context`. |
| **Detector de amenazas OWASP ASI01/03/04/05** | **Implementado** | `threat_detector.analyze()` ([threat_detector.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/threat_detector.py)) inspecciona prompt injection, dominios C2 (`attacker.io`, etc.), SQL/shell destructivo y payloads Base64; fuerza `DENY` + `Alert` `CRITICAL`. |
| **Blindaje anti-IA en Control Plane (`X-Agent-Id`)** | **Parcial** | `require_admin_user` ([deps.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/deps.py)) rechaza `X-Agent-Id` con `403 Forbidden`, pero retorna `None` si no llegan headers y falta en 10 routers. |
| **Motor PDP determinista Fail-Closed** | **Implementado (reducido)** | [pdp_engine.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pdp_engine.py) evalúa políticas activas ordenadas por prioridad (reglas `target_agent_id` primero, Fail-Closed `DENY` sin match o con empate). No implementa `neq`, `contains` ni `allowed_hours`. |
| **Caché de políticas en Redis** | **No implementado** | `policy_rule_service.py` solo borra claves `policies:{org}:*` al mutar reglas; `pdp_engine.py` nunca lee ni escribe Redis y consulta PostgreSQL en cada petición. |
| **PostgreSQL RLS** | **No implementado** | Ausente en migraciones `001`–`005`. |
| **Autenticación del Gateway vía API Keys** | **No cableado** | `api_key_service.verify_api_key()` existe con tests unitarios, pero ningún endpoint ni servicio del Gateway lo invoca. |

---

## 3. Modelo de Datos y Contratos Clave

### 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`)

Definidas en [001_initial_schema.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic/versions/001_initial_schema.py) y evolucionadas hasta [005_add_hashed_password_to_users.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/alembic/versions/005_add_hashed_password_to_users.py):

| # | Tabla | PK / Discriminador | Columnas / Enums clave reales |
| :-: | :--- | :--- | :--- |
| 1 | `organizations` | `id` (UUID v4) | `name`, `created_at`, **`settings JSONB`** (`004_add_org_settings`) |
| 2 | `users` | `id` / `organization_id` | `email` (unique), `role` (`ADMIN`, `OPERATOR`, `APPROVER`, `AUDITOR`, `VIEWER`), **`hashed_password`** (`005_add_hashed_password`) |
| 3 | `agents` | `id` / `organization_id` | `owner_user_id`, `name`, `purpose`, `status` (`ACTIVE`, `SUSPENDED`, `REVOKED`) |
| 4 | `tools` | `id` / `organization_id` | `name`, `protocol` (`REST` por defecto), `endpoint_url`, `description` |
| 5 | `agent_tools` | `id` (N:N `agent_id`, `tool_id`) | `enabled`, `config JSONB` + índice GIN (`uq_agent_tool_pair`) |
| 6 | `tool_actions` | `id` (`tool_id`) | `action_name` (`uq_tool_action_name`), `risk_level` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| 7 | `policies` | `id` / `organization_id` | `name`, `priority`, `is_active` |
| 8 | `policy_rules` | `id` (`policy_id`, `tool_action_id`, `target_agent_id`) | `priority`, `effect` (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`), `conditions JSONB` + índice GIN |
| 9 | `executions` | `id` / `organization_id` | `agent_id`, `delegator_user_id`, `tool_id`, `tool_action_id`, `resource`, `request_context JSONB` + GIN, `decision`, `status` (`PENDING_APPROVAL`, `REJECTED`, `EXECUTED`), **`latency_ms Float`** (`002_add_latency_ms`) |
| 10 | `approvals` | `id` (`execution_id` unique) | `assigned_approver_id`, `status` (`PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`), `resolution_reason`, `resolved_at`, `created_at` |
| 11 | `alerts` | `id` / `organization_id` | `execution_id`, `title`, `description`, `severity` (`LOW`..`CRITICAL`), `status` (`OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`), `resolved_by_user_id` |
| 12 | `audit_events` | `id` / `organization_id` | `actor_type` (`USER`, `AGENT`, `SYSTEM`), `actor_id`, `event_type`, `metadata JSONB` + GIN, `timestamp` |
| 13 | `api_keys` | `id` / `organization_id` | Añadida en `003_add_api_keys`: `name`, `key_prefix` (12 chars), `hashed_key` (SHA-256), `expires_at`, `is_active` |

### 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`)

Montada bajo prefijo `/api/v1` en [main.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/main.py) (más `GET /health` en raíz):

- **Data Plane (sin Auth API Key actualmente):** `POST /api/v1/gateway/execute`, `POST /api/v1/gateway/simulate`, `GET /api/v1/gateway/attacks`.
- **Control Plane con `Depends(require_admin_user)` / `get_current_user` (7 routers):**
  - `auth.py`: login JWT, me (`get_current_user`).
  - `organizations.py`: `GET/PATCH /organizations/{id}/settings` y `POST /organizations/{id}/settings/webhooks/test` protegidos (base `GET/POST /organizations` sin auth).
  - `policies.py`, `policy_rules.py`, `api_keys.py`, `audit_events.py`, `analytics.py`.
- **Control Plane SIN dependencia de autenticación en código actual (9 routers REST + 1 WS):**
  - `agents.py`, `tools.py`, `tool_actions.py`, `users.py`, `executions.py`, `approvals.py`, `alerts.py`, `demo.py`, `websocket.py` (`/api/v1/ws` y `/api/v1/ws/{organization_id}`).

### 3.3 Contratos críticos: PEP Gateway, PDP, HITL y Escenarios Demo

1. **Contrato HTTP de `POST /api/v1/gateway/execute`** ([gateway.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/gateway.py#L47-L54)):
   - `ALLOW` -> **`200 OK`** (`ExecutionStatus.EXECUTED`).
   - `REQUIRE_APPROVAL` -> **`202 Accepted`** (`ExecutionStatus.PENDING_APPROVAL`, crea ticket `Approval` en `PENDING` con TTL de 900s / 15 min y emite WebSocket `NEW_APPROVAL`). *No usa long-polling `asyncio` como afirman los docs UML.*
   - `DENY` -> **`403 Forbidden`** (`ExecutionStatus.REJECTED`). Si `risk_level` es `HIGH`/`CRITICAL` o `threat.is_threat`, crea `Alert` y emite WebSocket `NEW_ALERT` + notificación webhook SIEM si está habilitada.
2. **Escenarios canónicos (Seed oficial [seed_demo.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/scripts/seed_demo.py)):**
   - Organización `Acme Corp`, usuarios `admin@acmecorp.com`, `approver@acmecorp.com`, `operator@acmecorp.com` (clave `"demo-password"`), agente principal `Agente de Ventas` (`AGENT_SALES_ID`).
   - **4 escenarios base (`test_gateway_scenarios.py` / docs core):**
     1. `create_quote` (\$2.500) -> `ALLOW` (`200 OK`)
     2. `update_price` (\$10) -> `DENY` (`403 Forbidden`, falta `AgentTool`)
     3. `refund` (\$4.500) -> `REQUIRE_APPROVAL` (`202 Accepted` + HITL `ApprovalsView`)
     4. `export_customers` (destino `attacker.io`) -> `DENY` + `Alert` `CRITICAL` (`403 Forbidden`)
   - **5.º escenario extendido en UI (`PlaygroundView` / `/gateway/attacks`):** inyección prompt / comando destructivo (`database.drop` / OWASP ASI01–ASI05).

---

## 4. Estado Real del Proyecto (Código vs. Graphify vs. Docs)

> **Desfase de Graphify:** [graphify-out/GRAPH_REPORT.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/graphify-out/GRAPH_REPORT.md) fue generado el `2026-11-03` sobre el commit `b7646228` (`182` archivos, `2.146` nodos, `5.809` aristas, `107` comunidades, `0` ciclos). Existen **4 commits posteriores** hasta `HEAD` (`f1e4f59`, `1d04e25`, `b9591ad`, `597d3d9`) que no figuran en ese grafo.

### 4.1 Módulos construidos y verificables en código

- **Core Backend & Migraciones:** 13 modelos/tablas Alembic (`001`–`005`), 18 routers registrados en `api/__init__.py`, 30 archivos de tests en `backend/tests/`.
- **Fases 1–3 cerradas (certificadas en [handoff.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/teamwork/handoff.md) y verificadas en código):**
  - Localización al español (`frontend/src/constants/labels.ts`) y erradicación de fallbacks silenciosos en `api.ts` (propaga `ApiError` hacia `ToastContext` + banner por `/health` degradado + `Skeleton`/`EmptyState`).
  - CRUD jerárquico completo de `policy_rules` (`PoliciesView` + `policy_rules.py`).
  - Medición real `latency_ms` en `PEPGatewayService` y columna en `executions` (`002`).
  - Persistencia real de `audit_events` (`audit_service.py`) y métricas/serie temporal 24h en `analytics_service.py` consumidas por `OverviewView`.
  - Gestión de `api_keys` (`003`, `SettingsView` Tab 2) y `organizations.settings` (`004`, `SettingsView` Tab 4).
- **Fase 4 (Auth JWT):** Columna `hashed_password` (`005`), router `auth.py`, `AuthView.tsx`, `AuthContext.tsx`.
- **Fase 5+ (commits posteriores a Graphify):**
  - `webhook_service.py` + `POST /organizations/{org_id}/settings/webhooks/test` (firma HMAC-SHA256) y despacho SIEM en alertas críticas.
  - `POST /api/v1/gateway/simulate` (`dry_run=True` en `PEPGatewayService`).
  - Selector multi-tenant `WorkspaceSwitcher` conectado a `switchOrganization` y puerto Docker PostgreSQL ajustado a `5433`.

### 4.2 Módulos a medio hacer o parcialmente cableados

- **API Keys (`api_keys`):** Se generan, listan y revocan en Control Plane/UI, pero `verify_api_key()` no está conectado al Data Plane (`/gateway/execute`).
- **Modo Sandbox (`dry_run=True` / `/gateway/simulate`):** Evita llamadas externas, aprobaciones, alertas y webhooks SIEM, pero **sigue persistiendo filas en `executions` y transmitiendo `NEW_EXECUTION` por WebSocket**, adulterando trazas y métricas productivas.
- **Control Plane Auth (`require_admin_user`):** Implementado en `deps.py` pero omitido en 9 routers REST + WS, y con fallback anónimo `return None` en los 7 routers que sí lo usan.
- **Cobertura parcial de `audit_events`:** Registran auditoría `agents`, `policies`, `policy_rules`, `api_keys` y `organization_service`; no registran eventos `tools`, `tool_actions`, `users`, `approvals`, `alerts` ni `auth`.
- **Multi-tenancy en `SettingsView.tsx`:** Lee `activeOrgId`, pero `copyTenantId` (L57) y `fetchApiKeys` (L83) siguen pasando `DEMO_IDS.ORG_ACME_ID`.
- **Restos de `MCP`/`gRPC` y hardcode menor UI:** `ToolsView.tsx` (L752–753) y `schemas/tool.py` mantienen `gRPC` y `MCP` sin soporte runtime; `TracesView.tsx` (L54) conserva `newTraceData.latency_ms || 22.0` como respaldo WS.
- **Uso de Redis:** Activo solo en `/health` e invalidación ciega desde `policy_rule_service.py`, sin lectura en `pdp_engine.py` ni Pub/Sub en `websocket_manager.py`.

### 4.3 Elementos que quedaron solo en papel

- **Cliente demo externo (`agent-demo/`):** Sin una sola línea de código (contradictorio entre Python vs. Node.js/TS en los READMEs).
- **PostgreSQL Row-Level Security (RLS)** y **long-polling `asyncio` bloqueante / Vault cifrado HITL**.
- **Operadores avanzados de PDP** prometidos en docs: `neq`, `contains`, `allowed_hours`.
- **Rol `superadmin PaaS`**, onboarding en "pocos clics" y política automática de purga/archivo basada en `retention_days`.
- **Operación real completa desde UI:** Asistente "Presenter Tour" propuesto en `docs/PROPUESTAS_MEJORAS_FRONTEND.md`, vista dedicada de Alertas (`CU-11` citado en `audit_reports/01`) y diferenciación de permisos en backend para `OPERATOR`, `AUDITOR` y `VIEWER`.
- **Suite de tests automatizados Frontend** (`Vitest` / `Playwright`) y refactoring Hexagonal/Feature-Sliced sugerido en `audit_reports/06`.

---

## 5. Deuda Técnica y Riesgos Detectados

| Severidad | Hallazgo | Ubicación Exacta / Evidencia | Impacto y Riesgo |
| :---: | :--- | :--- | :--- |
| **CRÍTICA** | **Bug bloqueante `NameError` en `resolve_approval()`** | [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L553-L661) | Bloques copy-paste de `execute()` quedaron dentro de `resolve_approval()` referenciando variables inexistentes (`alert`, `request`). Rompe en runtime toda resolución o expiración (>15 min) de tickets HITL. Además carece de `SELECT ... FOR UPDATE` (TOCTOU). |
| **CRÍTICA** | **Re-despacho HITL con payload redactado (`"***REDACTED***"`)** | [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L613-L617) | Al aprobar un ticket, se reenvía `approval.execution.request_context` (ya sanitizado con `"***REDACTED***"`) en vez del payload original en un vault cifrado. |
| **CRÍTICA** | **Bypass anónimo en `require_admin_user` + 10 endpoints/routers sin auth** | [deps.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/deps.py#L76-L152) y [api/__init__.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/__init__.py) | `require_admin_user` devuelve `None` si no hay headers (L152), `X-User-Id` es falsificable sin firma JWT, y `agents`, `tools`, `tool_actions`, `users`, `executions`, `approvals`, `alerts`, `demo`, `websocket` y `GET/POST /organizations` no exigen autenticación. |
| **CRÍTICA** | **Backdoor de contraseñas demo y doble secreto JWT** | [auth.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/auth.py#L67-L71), [security.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/core/security.py#L28) | `auth.py` acepta `("demo-password", "admin123", "demo123", "secret123")` para cualquier usuario y reescribe `hashed_password` en BD; `security.py` lee `JWT_SECRET_KEY` con valor hardcodeado sin validar fail-fast ni alinearse con `settings.SECRET_KEY`. |
| **ALTA** | **Data Plane sin verificación de API Key y `_dispatch_to_tool` con éxito falso** | [gateway.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/gateway.py), [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L50-L81) | `/gateway/execute` no exige `X-AgentGuard-Key` (`verify_api_key` sin callers); `_dispatch_to_tool` captura excepciones o HTTP `>= 400` y devuelve `"status": "success"` simulado en lugar de fail-closed. |
| **ALTA** | **Bug `if threat:` en modo `dry_run` + contaminación de métricas en `simulate`** | [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L368-L419) | `threat` (`ThreatAnalysisResult`) siempre es truthy aunque `is_threat=False`, por lo que `simulate` muestra explicación de "Vector hostil detectado" ante llamadas legítimas; además `simulate` escribe filas en `executions` y emite eventos `NEW_EXECUTION` afectando `analytics`. |
| **MEDIA** | **Brecha de testing (0 tests FE, exceso de `AsyncMock` BE)** | [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/package.json), `backend/tests/` | La ausencia de pruebas E2E/integración contra flujo real HITL permitió que el `NameError` de `resolve_approval()` pasara desapercibido; el frontend carece por completo de tests automatizados. |
| **MEDIA** | **Grafo Graphify obsoleto y paquete no instalado en runtime** | [GRAPH_REPORT.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/graphify-out/GRAPH_REPORT.md) | 4 commits por detrás de `HEAD` y `python -m graphify` inoperante en Python 3.12 actual (`No module named graphify`). |
| **BAJA** | **Basura/huérfanos en disco y dependencias muertas** | `mockData.ts`, `App.css`, `start_dev.bat`, `stop_dev.bat`, `guia_simple*.{html,pdf}`, `requirements.txt` | Persisten archivos template sin uso y paquetes Python sin referencias activas (`psycopg2-binary`, `python-jose`, `passlib`), junto a 152 `.md` históricos de teamwork contaminando las búsquedas en el repo. |

