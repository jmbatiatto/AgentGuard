# 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard

Este documento registra formalmente las decisiones de arquitectura de software (*Architecture Decision Records*) adoptadas por el equipo de desarrollo de **AgentGuard**.  
Cualquier desarrollador o agente de inteligencia artificial **debe consultar y respetar estas decisiones** antes de realizar cambios estructurales en el código.

---

## 📋 Índice de Decisiones

* [ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)](#adr-001-arquitectura-políglota--backend-en-python-fastapi-y-frontend-en-typescript-react)
* [ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas](#adr-002-estructura-monorepo-políglota-y-distribución-modular-de-carpetas)
* [ADR-003: Supresión de MCP/gRPC y Estandarización en Protocolo HTTP REST Puro](#adr-003-supresión-de-mcpgrpc-y-estandarización-en-protocolo-http-rest-puro)
* [ADR-004: Modelo Relacional Multi-Tenant (13 Tablas), UUID v4 e Índices JSONB en PostgreSQL 16](#adr-004-modelo-relacional-multi-tenant-13-tablas-uuid-v4-e-índices-jsonb-en-postgresql-16)
* [ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic](#adr-005-control-de-versiones-y-migraciones-de-base-de-datos-con-alembic)
* [ADR-006: Modelo SaaS B2B Multi-Tenant con Alta Autogestionada y API Keys en Data Plane](#adr-006-modelo-saas-b2b-multi-tenant-con-alta-autogestionada-y-api-keys-en-data-plane)
* [ADR-007: Protocolo HITL Asíncrono (`202 Accepted`) + WebSockets y Bloqueo Pesimista](#adr-007-protocolo-hitl-asíncrono-202-accepted--websockets-y-bloqueo-pesimista)

---

## ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)

* **Estado:** ✅ Aceptado / En vigor
* **Decisores:** Equipo de Desarrollo (Agustín Belardinelli, Juan Martín Battiato, Mateo Ortega, Jonathan Araujo)
* **Motivación:** Criterio pedagógico oficial de la cátedra de Desarrollo Web (ITU - UNCUYO).

### 1. Contexto y Problema
La cátedra requiere que no se repita el mismo lenguaje de programación entre frontend y backend para evaluar integración heterogénea, tipado entre fronteras de red y gestión diferenciada de entornos.

### 2. Decisión Tomada
Se adoptó una **arquitectura web políglota desacoplada**:
1. **Frontend:** **TypeScript 5+ con React 19, Vite y Tailwind CSS**, gestionado con **`pnpm`**.
2. **Backend:** **Python 3.12+ con FastAPI**, ejecutado sobre **Uvicorn** (ASGI).
3. **Contratos y Validación:** **Pydantic v2** con documentación OpenAPI automática en `/docs` y `/redoc`.
4. **Persistencia Asíncrona:** **SQLAlchemy 2.0 (asyncio + asyncpg)** sobre **PostgreSQL 16**.

---

## ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas

* **Estado:** ✅ Aceptado / En vigor

### 1. Decisión Tomada
Se organiza el monorepositorio aislando dependencias Python (`.venv`) y Node/pnpm (`node_modules`) por paquete:

```text
AgentGuard/
├── backend/              # API REST y Gateway PEP/PDP (FastAPI + SQLAlchemy 2.0 + Alembic) [Python 3.12+]
│   ├── alembic/          # Migraciones versionadas (001 a 005)
│   ├── app/              # Código fuente (api, core, models, schemas, services)
│   ├── scripts/          # Seeder oficial (seed_demo.py)
│   ├── tests/            # Pruebas automatizadas pytest
│   └── requirements.txt  # Dependencias Python del backend
├── frontend/             # Dashboard Web SPA (React 19 + Vite + TypeScript) [pnpm]
│   ├── src/              # Componentes, contexto Auth/Toast, servicios y 9 vistas
│   └── package.json      # Dependencias y scripts frontend
├── agent-demo/           # Cliente CLI demostrador oficial en Python 3.12+ (httpx + python-dotenv)
│   ├── requirements.txt  # httpx y python-dotenv
│   ├── .env.example      # Plantilla de configuración del Gateway y UUIDs demo
│   ├── run_demo.py       # Menú interactivo y modo --all para los 4 escenarios
│   └── README.md         # Guía de instalación y ejecución
├── diagramas/            # Diagramas vectoriales Draw.io (*.drawio)
├── docs/archive/         # Documentos históricos y reportes archivados
├── graphify-out/         # Grafo de conocimiento AST generado con Graphify
└── scripts/              # Scripts de orquestación local (start-all.ps1, stop-all.ps1)
```

### 2. Asignación por Paquete
* **`backend/`:** Agustín Belardinelli (PO / Motor PDP) & Jonathan Araujo (Gateway PEP / Persistencia / Alembic).
* **`frontend/`:** Juan Martín Battiato (SM / Integración) & Mateo Ortega (Diseño UI/UX / Componentes).
* **`agent-demo/`:** Cliente CLI autónomo en Python para demostración en vivo contra `POST /api/v1/gateway/execute`.

---

## ADR-003: Supresión de MCP/gRPC y Estandarización en Protocolo HTTP REST Puro

* **Estado:** ✅ Aceptado / En vigor

### 1. Decisión Tomada
Se suprimieron **MCP** (*Model Context Protocol*) y **gRPC** de toda la arquitectura, tanto en interfaz como en esquemas de validación:
* En el backend, `ToolCreate.protocol` y `ToolUpdate.protocol` (`backend/app/schemas/tool.py`) están tipados estrictamente con `Literal["REST"]` (valor por defecto `"REST"`).
* En el frontend, `ToolsView.tsx` expone únicamente la opción `REST` (`REST API`).
* Toda invocación runtime ingresa mediante **`POST /api/v1/gateway/execute`** (y en modo sandbox mediante **`POST /api/v1/gateway/simulate`**, con catálogo de vectores OWASP en **`GET /api/v1/gateway/attacks`**).
* Respuestas HTTP del Gateway PEP (`backend/app/api/gateway.py`):
  * **`200 OK` (`ALLOW`):** El Gateway despacha por HTTP REST a la herramienta destino y devuelve el resultado.
  * **`202 Accepted` (`REQUIRE_APPROVAL`):** El Gateway suspende la ejecución en `PENDING_APPROVAL` y retorna el `approval_id` generado.
  * **`403 Forbidden` (`DENY`):** El Gateway corta el flujo sin tocar la herramienta externa (incluyendo mismatch organizacional entre API Key y `organization_id`).

---

## ADR-004: Modelo Relacional Multi-Tenant (13 Tablas), UUID v4 e Índices JSONB en PostgreSQL 16

* **Estado:** ✅ Aceptado / En vigor

### 1. Decisión Tomada
* La persistencia corre sobre **PostgreSQL 16** expuesto en el puerto **`5433`** (`5433:5432` en `docker-compose.yml`), modelando **13 tablas** (`organizations`, `users`, `agents`, `agent_tools`, `tools`, `tool_actions`, `policies`, `policy_rules`, `executions`, `approvals`, `alerts`, `audit_events` y `api_keys`).
* Todas las claves primarias utilizan **`UUID v4`** para prevenir ataques IDOR por enumeración secuencial.
* Los predicados dinámicos de reglas (`PolicyRule.conditions`), configuraciones por agente (`AgentTool.config`), configuración de tenant (`Organization.settings`), contextos sanitizados (`Execution.request_context`) y metadata forense (`AuditEvent.metadata`) se almacenan en **`JSONB`** con índices **GIN**.
* **Aislamiento Multi-Tenant en Capa de Aplicación:** Todas las consultas y mutaciones filtran explícitamente por `organization_id` en la capa de servicios/routers SQLAlchemy (no se utiliza Row-Level Security nativo en PostgreSQL).

---

## ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic

* **Estado:** ✅ Aceptado / En vigor

### 1. Decisión Tomada
El esquema evolutivo de las **13 tablas** en PostgreSQL se gestiona exclusivamente mediante migraciones versionadas con **Alembic** en `backend/alembic/versions/`:
* `001_initial_schema.py` — Esquema relacional base (12 tablas originales del MER, enums e índices GIN).
* `002_add_latency_ms_to_executions.py` — Columna `latency_ms` para latencia real medida en `executions`.
* `003_add_api_keys.py` — Tabla `api_keys` para autenticación criptográfica del Data Plane.
* `004_add_organization_settings.py` — Columna `settings` (`JSONB`) en `organizations`.
* `005_add_hashed_password_to_users.py` — Columna `hashed_password` en `users` para autenticación real.

---

## ADR-006: Modelo SaaS B2B Multi-Tenant con Alta Autogestionada y API Keys en Data Plane

* **Estado:** ✅ Aceptado / En vigor

### 1. Contexto y Problema
Para operar como un SaaS B2B multi-tenant real, la plataforma debe permitir que nuevas organizaciones se registren por sí mismas sin ejecutar scripts manuales de base de datos, y separar estrictamente las credenciales de administración humana respecto de las credenciales usadas por agentes de IA en runtime.

### 2. Decisión Tomada
1. **Onboarding Autogestionado Atómico (`POST /api/v1/auth/register-org`):** En una única transacción de base de datos crea la `Organization` (con `DEFAULT_ORGANIZATION_SETTINGS`), el usuario inicial con rol `UserRole.ADMIN` y contraseña hasheada, y la primera `ApiKey` operativa (`ag_live_...`, almacenada como hash SHA-256 en `api_keys`), devolviendo el JWT `access_token` y revelando la API Key en texto plano una única vez.
2. **Separación Estricta Control Plane vs. Data Plane:**
   * **Control Plane (`/api/v1/agents`, `/tools`, `/policies`, `/policy-rules`, `/api-keys`, `/users`, `/executions`, `/approvals`, `/alerts`, `/organizations`, `/demo`):** Exige JWT humano válido (`Authorization: Bearer <token>`) firmado con `settings.SECRET_KEY` y rechaza explícitamente cualquier request con cabecera `X-Agent-Id` devolviendo `403 Forbidden`.
   * **Data Plane (`POST /api/v1/gateway/execute`):** Exige cabecera `X-AgentGuard-Key`, la valida con `api_key_service.verify_api_key()` (`401 Unauthorized` si falta, expiró o fue revocada) y verifica estrictamente `request.organization_id == api_key.organization_id` (`403 Forbidden` ante intento cross-tenant).
3. **Asistente Frontend en 3 Clics (`QuickSetupWizard.tsx`):** Accesible desde `OverviewView` y `AgentsView` para crear herramienta REST + acción, agente vinculado y regla de política inmediatamente tras el registro.

---

## ADR-007: Protocolo HITL Asíncrono (`202 Accepted`) + WebSockets y Bloqueo Pesimista

* **Estado:** ✅ Aceptado / En vigor

### 1. Contexto y Problema
Mantener conexiones HTTP abiertas esperando minutos a que un operador humano apruebe o rechace una acción (`long-polling` con respuesta `200 OK`) acopla al cliente LLM a timeouts de red y dificulta el escalado. Además, dos aprobadores concurrentes podrían intentar resolver el mismo ticket simultáneamente (condición de carrera TOCTOU).

### 2. Decisión Tomada
1. **Respuesta Inmediata `202 Accepted`:** Cuando el motor PDP emite `REQUIRE_APPROVAL`, `POST /api/v1/gateway/execute` persiste la traza `Execution` (`status = PENDING_APPROVAL`) y el ticket `Approval` (`status = PENDING`), y responde inmediatamente **HTTP `202 Accepted`** retornando `approval_id`.
2. **Notificaciones Reactivas por WebSocket:** El Gateway emite el evento `NEW_APPROVAL` al canal aislado por tenant (`/api/v1/ws/{organization_id}`) para actualizar en vivo la bandeja `ApprovalsView` en el frontend.
3. **Resolución Exclusiva con Bloqueo Pesimista (`with_for_update()`):** Un usuario humano con rol `APPROVER` o `ADMIN` resuelve el ticket vía `POST /api/v1/approvals/{approval_id}/resolve`. `PEPGatewayService.resolve_approval()` adquiere un bloqueo pesimista a nivel de fila (`SELECT ... FOR UPDATE`), valida el TTL de 15 minutos (`900 s`, transicionando a `EXPIRED` + `ExecutionStatus.REJECTED` si venció), despacha hacia la herramienta destino si fue `APPROVED`, actualiza estados y emite `RESOLVED_APPROVAL` por WebSocket.
