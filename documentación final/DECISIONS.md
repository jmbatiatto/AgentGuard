# 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard

Este documento constituye el registro maestro de **Decisiones de Arquitectura de Software (*Architecture Decision Records — ADRs*)** adoptadas e implementadas en **AgentGuard** y su ecosistema empresarial **ACME Corporation**.  
Todo desarrollador, auditor o agente de inteligencia artificial **debe consultar y respetar estas decisiones** como única fuente de verdad (*Single Source of Truth — SSOT*) sincronizada con el código real del repositorio.

---

## 📋 Índice de Decisiones Arquitectónicas

* [ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)](#adr-001-arquitectura-políglota--backend-en-python-fastapi-y-frontend-en-typescript-react)
* [ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas](#adr-002-estructura-monorepo-políglota-y-distribución-modular-de-carpetas)
* [ADR-003: Supresión de MCP/gRPC y Estandarización en Protocolo HTTP REST Puro](#adr-003-supresión-de-mcpgrpc-y-estandarización-en-protocolo-http-rest-puro)
* [ADR-004: Modelo Relacional Multi-Tenant (13 Tablas), UUID v4 (`gen_random_uuid()`) e Índices JSONB en PostgreSQL 16](#adr-004-modelo-relacional-multi-tenant-13-tablas-uuid-v4-gen_random_uuid-e-índices-jsonb-en-postgresql-16)
* [ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic (Revisiones `001` a `006`)](#adr-005-control-de-versiones-y-migraciones-de-base-de-datos-con-alembic-revisiones-001-a-006)
* [ADR-006: Modelo SaaS B2B Multi-Tenant, Alta Autogestionada, Cambio de Clave Temporal, `SERVER_BOOT_ID` y API Keys en Data Plane](#adr-006-modelo-saas-b2b-multi-tenant-alta-autogestionada-cambio-de-clave-temporal-server_boot_id-y-api-keys-en-data-plane)
* [ADR-007: Protocolo HITL Asíncrono (`202 Accepted`) + WebSockets y Bloqueo Pesimista (`with_for_update()`)](#adr-007-protocolo-hitl-asíncrono-202-accepted--websockets-y-bloqueo-pesimista-with_for_update)
* [ADR-008: Ecosistema Externo ACME Corp (SQLite 7 Tablas), Auto-Onboarding CEO y Dualidad Modo Protegido vs. Modo Directo](#adr-008-ecosistema-externo-acme-corp-sqlite-7-tablas-auto-onboarding-ceo-y-dualidad-modo-protegido-vs-modo-directo)
* [ADR-009: Copiloto Administrativo "Consultante BI" (Solo Lectura) e Integración Google Gemini 3.8 Flash (`thinkingLevel: "low"`, `thoughtSignature` y Fallback a `gemini-3.5-flash-lite`)](#adr-009-copiloto-administrativo-consultante-bi-solo-lectura-e-integración-google-gemini-38-flash-thinkinglevel-low-thoughtsignature-y-fallback-a-gemini-35-flash-lite)

---

## ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)

* **Estado:** ✅ Aceptado / En vigor
* **Decisores:** Equipo de Desarrollo (Agustín Belardinelli, Juan Martín Battiato, Mateo Ortega, Jonathan Araujo)
* **Motivación:** Criterio pedagógico y de ingeniería de software de la cátedra de Desarrollo Web (ITU — UNCuyo, 2026).

### 1. Contexto y Problema
La cátedra exige no repetir el mismo lenguaje de programación entre cliente y servidor para evaluar integración heterogénea sobre HTTP/WebSockets, validación estricta de contratos tipados entre fronteras de red y gestión diferenciada de entornos y empaquetadores.

### 2. Decisión Tomada
Se adoptó una **arquitectura web políglota desacoplada**:
1. **Frontend (Control Plane SPA):** **TypeScript 5+** (`~6.0.2` en `frontend/package.json`) con **React 19** (`19.2.8`), **Vite** (`^8.3.0`) y **Tailwind CSS v4** (`@tailwindcss/vite` `^4.3.3`), gestionado con **`pnpm`** (`pnpm@12.10.1`).
2. **Backend (API REST + PEP/PDP):** **Python 3.12+** con **FastAPI** (`0.111.x`), ejecutado sobre **Uvicorn** (ASGI).
3. **Contratos y Validación:** **Pydantic v2** (`2.7+`) con generación automática de especificación OpenAPI en `/docs`, `/redoc` y `/api/v1/openapi.json`.
4. **Persistencia Asíncrona No Bloqueante:** **SQLAlchemy 2.0 (`asyncio` + `asyncpg`)** sobre **PostgreSQL 16**. Para evitar excepciones `sqlalchemy.exc.MissingGreenlet` al serializar con Pydantic v2 modelos que exponen atributos calculados mediante `@property` (`Tool.assigned_agents`, `PolicyRule.action_name`, `PolicyRule.tool_name`, `PolicyRule.agent_name`), los servicios `ToolService`, `PolicyService` y `PolicyRuleService` implementan recarga ansiosa obligatoria mediante `get_by_id()` con `selectinload(...)` tras cada operación `create` y `update`.

---

## ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas

* **Estado:** ✅ Aceptado / En vigor (Actualizado con ecosistema `acme-corp/` y `documentación final/`)

### 1. Decisión Tomada
Se organiza el monorepositorio aislando entornos virtuales Python (`.venv`) y módulos Node (`node_modules`) por paquete, incorporando tanto la plataforma SaaS (**`backend/`** y **`frontend/`**) como el sistema empresarial externo (**`acme-corp/`**) y el cliente demostrador CLI (**`agent-demo/`**):

```text
AgentGuard/
├── acme-corp/            # Portal Empresarial Autónomo & Copiloto BI (FastAPI + SQLite + Gemini 3.8) [Puerto 9000]
│   ├── agent/            # Cliente Gemini 3.8 (gemini_client.py), auto-onboarding CEO (onboarding.py), presets (presets.py) y CLI
│   ├── server/           # API FastAPI (app.py), configuración (config.py), SQLite 7 tablas (database.py) y UI estática (static/)
│   ├── tests/            # Pruebas automatizadas pytest (test_acme_server.py, test_gemini_agent.py)
│   ├── .env.example      # Plantilla de variables de entorno (ACME_PORT=9000, GEMINI_MODEL=gemini-3.8-flash)
│   ├── acme_corp.db      # Base de datos SQLite local (7 tablas: company_status, products, customers, quotes, refunds, sales, events)
│   ├── run.py            # Lanzador Uvicorn en http://localhost:9000
│   └── start_acme.bat    # Iniciador rápido en Windows
├── agent-demo/           # Cliente CLI demostrador oficial en Python 3.12+ (httpx + python-dotenv)
│   ├── run_demo.py       # Auto-discovery vía GET /api/v1/gateway/context, menú interactivo, --all y --scenario {1..4}
│   ├── requirements.txt  # httpx y python-dotenv
│   ├── .env.example      # Plantilla de conexión al Gateway PEP
│   └── README.md         # Guía de ejecución del demostrador CLI
├── backend/              # API REST y Gateway PEP/PDP (FastAPI + SQLAlchemy 2.0 + Alembic) [Puerto 8000]
│   ├── alembic/          # 6 migraciones DDL versionadas (001_initial_schema a 006_add_must_change_password)
│   ├── app/              # Código fuente: api (17 routers), core (config, database, security), models (13 tablas), schemas, services
│   ├── scripts/          # Seeder determinista oficial (seed_demo.py)
│   ├── tests/            # Suite pytest + pytest-asyncio (incluyendo test_gateway_scenarios.py)
│   └── requirements.txt  # Dependencias Python congeladas
├── frontend/             # Dashboard Web SPA (React 19 + Vite + TypeScript + Tailwind CSS v4) [Puerto 5173]
│   ├── src/              # Componentes, contextos (Auth/Toast/Theme), hooks WebSocket, servicios API y 9 vistas
│   └── package.json      # Dependencias y scripts frontend (dev, build, lint)
├── diagramas/            # Archivos vectoriales fuente Draw.io (*.drawio)
├── docs/archive/         # Documentos históricos y reportes previos archivados
├── documentación final/  # Documentación maestra SSOT verificada contra el código real
├── graphify-out/         # Grafo de conocimiento AST generado con Graphify (graph.json y wiki/)
└── scripts/              # Scripts PowerShell de orquestación local (start-all.ps1, stop-all.ps1, start-backend.ps1)
```

### 2. Asignación de Responsabilidades por Paquete
* **`backend/`:** Agustín Belardinelli (PO / Motor PDP 5D) & Jonathan Araujo (Gateway PEP / Persistencia PostgreSQL & Redis / Alembic).
* **`frontend/`:** Juan Martín Battiato (SM / Dashboard, Trazas y Bandeja HITL) & Mateo Ortega (Diseño UI/UX / Componentes e Interactividad).
* **`acme-corp/` y `agent-demo/`:** Ecosistema demostrativo end-to-end para validar intercepción en tiempo real desde un ERP externo con Google Gemini 3.8 Flash (`http://localhost:9000`) y desde terminal CLI.

---

## ADR-003: Supresión de MCP/gRPC y Estandarización en Protocolo HTTP REST Puro

* **Estado:** ✅ Aceptado / En vigor

### 1. Contexto y Problema
Soportar múltiples protocolos de transporte de herramientas (*Model Context Protocol — MCP*, *gRPC* y *HTTP REST*) introducía complejidad accidental sin aportar valor diferencial a la demostración de autorización contextual 5D.

### 2. Decisión Tomada
Se suprimieron **MCP** y **gRPC** de toda la arquitectura, estandarizando la plataforma 100% sobre **HTTP REST**:
* En el backend, `ToolCreate.protocol` y `ToolUpdate.protocol` (`backend/app/schemas/tool.py`) están tipados estrictamente mediante `Literal["REST"]` (con valor por defecto `"REST"`).
* En el frontend, `ToolsView.tsx` expone únicamente el protocolo `REST` (`REST API`).
* **Endpoints del Gateway PEP (`backend/app/api/gateway.py`):**
  * **`POST /api/v1/gateway/execute`:** Punto de entrada síncrono del Data Plane autenticado con `X-AgentGuard-Key`.
  * **`GET /api/v1/gateway/context`:** Endpoint de *auto-discovery* del Data Plane que permite a un agente o sistema externo provisto de una `X-AgentGuard-Key` válida descubrir su `organization_id`, `organization_name`, la lista de agentes (`agents`) y el catálogo de herramientas REST (`tools`) con sus acciones atómicas (`actions` y `risk_level`).
  * **`POST /api/v1/gateway/simulate`:** Evaluación determinista en modo *sandbox* (`dry_run=True`) para usuarios humanos con rol `ADMIN` u `OPERATOR` desde `PlaygroundView.tsx` (sin despachar peticiones HTTP externas).
  * **`GET /api/v1/gateway/attacks`:** Catálogo oficial de vectores de ataque **OWASP Top 10 for Agentic Applications 2026** (`ASI01_GOAL_HIJACKING`, `ASI03_EXFILTRATION`, `ASI04_BASE64_EVASION`, `ASI05_SQL_INJECTION`).
* **Semántica de Códigos de Estado HTTP en `POST /api/v1/gateway/execute`:**
  * **`200 OK` (`ALLOW`):** El Gateway despacha la llamada por HTTP REST (`httpx.AsyncClient`) hacia el `endpoint_url` de la herramienta y devuelve el resultado.
  * **`202 Accepted` (`REQUIRE_APPROVAL`):** El Gateway suspende la ejecución en `PENDING_APPROVAL`, crea el ticket `Approval` (`PENDING`) y retorna inmediatamente `approval_id`.
  * **`403 Forbidden` (`DENY`):** El Gateway bloquea la operación de forma *Fail-Closed* sin contactar a la herramienta externa (incluyendo mismatch entre `request.organization_id` y `api_key.organization_id`).

---

## ADR-004: Modelo Relacional Multi-Tenant (13 Tablas), UUID v4 (`gen_random_uuid()`) e Índices JSONB en PostgreSQL 16

* **Estado:** ✅ Aceptado / En vigor

### 1. Decisión Tomada
1. **Persistencia Central en Puerto `5433`:** La base de datos principal corre sobre **PostgreSQL 16** (`postgres:16-alpine`), expuesta en el puerto host **`5433`** (`5433:5432` en `docker-compose.yml`) para evitar colisiones con instalaciones locales de PostgreSQL en el puerto `5432`.
2. **Esquema Físico de 13 Tablas:** Compuesto por las 12 tablas originales del MER (`organizations`, `users`, `agents`, `agent_tools`, `tools`, `tool_actions`, `policies`, `policy_rules`, `executions`, `approvals`, `alerts`, `audit_events`) más la tabla 13 **`api_keys`** incorporada para la autenticación criptográfica del Data Plane.
3. **Generación Nativa de `UUID v4` en el Motor de Base de Datos:** Todas las claves primarias de las 13 tablas se declaran con `UUID(as_uuid=True)` y `server_default=text("gen_random_uuid()")`, delegando la generación criptográfica directamente a PostgreSQL 16 para prevenir ataques IDOR por enumeración secuencial.
4. **Flexibilidad Esquematizada con `JSONB` y 4 Índices GIN:** Los predicados dinámicos (`policy_rules.conditions`), configuraciones de capacidades (`agent_tools.config`), contextos sanitizados (`executions.request_context`), metadatos de auditoría (`audit_events.metadata`) y ajustes de organización (`organizations.settings`) utilizan `JSONB`, respaldados por 4 índices **GIN** (`idx_agent_tools_config_gin`, `idx_policy_rules_conditions_gin`, `idx_executions_request_context_gin`, `idx_audit_events_metadata_gin`).
5. **Aislamiento Multi-Tenant Lógico en Capa de Aplicación:** Todas las consultas y mutaciones filtran explícitamente por `organization_id` mediante las dependencias de `backend/app/api/deps.py` (`resolve_tenant_org_id`, `ensure_same_tenant`) y los servicios SQLAlchemy (no se emplea Row-Level Security nativo de PostgreSQL).
6. **Rol Real de Redis 7 (`localhost:6379`):** Redis 7 es monitoreado activamente en `GET /health` y recibe invalidación *best-effort* de claves `policies:{organization_id}:*` desde `policy_rule_service.py` al crear, editar o eliminar reglas; el motor `PDPEngine` consulta las reglas activas directamente sobre PostgreSQL 16 para garantizar consistencia transaccional inmediata.

---

## ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic (Revisiones `001` a `006`)

* **Estado:** ✅ Aceptado / En vigor (Actualizado hasta revisión `006_add_must_change_password`)

### 1. Decisión Tomada
Toda evolución del esquema DDL de PostgreSQL 16 se gestiona exclusivamente mediante **6 migraciones secuenciales e idempotentes de Alembic** ubicadas en `backend/alembic/versions/`:

| Orden | Archivo de Migración | `revision` | `down_revision` | Cambio Estructural Aplicado |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `001_initial_schema.py` | `001_initial_schema` | `None` | Crea los **10 tipos `ENUM` nativos** de PostgreSQL, las **12 tablas iniciales** del MER con `server_default=sa.text("gen_random_uuid()")`, claves foráneas e índices B-Tree y GIN. |
| **2** | `002_add_latency_ms_to_executions.py` | `002_add_latency_ms` | `001_initial_schema` | Agrega la columna `latency_ms` (`Float, nullable=True`) a la tabla `executions` para registrar la latencia real medida con `time.perf_counter()`. |
| **3** | `003_add_api_keys.py` | `003_add_api_keys` | `002_add_latency_ms` | Crea la **tabla 13 `api_keys`** (`id`, `organization_id`, `name`, `key_prefix`, `hashed_key`, `created_at`, `expires_at`, `is_active`) y sus índices `ix_api_keys_organization_id` e `ix_api_keys_key_prefix`. |
| **4** | `004_add_organization_settings.py` | `004_add_org_settings` | `003_add_api_keys` | Agrega la columna `settings` (`JSONB, nullable=False, server_default='{}'::jsonb`) a la tabla `organizations`. |
| **5** | `005_add_hashed_password_to_users.py` | `005_add_hashed_password` | `004_add_org_settings` | Agrega la columna `hashed_password` (`String(255), nullable=True`) a la tabla `users` para autenticación con hash `bcrypt`. |
| **6** | `006_add_must_change_password_to_users.py` | `006_add_must_change_password` | `005_add_hashed_password` | Agrega la columna `must_change_password` (`Boolean, nullable=False, server_default=false`) a la tabla `users` para forzar el cambio de contraseña temporal en el primer inicio de sesión. |

---

## ADR-006: Modelo SaaS B2B Multi-Tenant, Alta Autogestionada, Cambio de Clave Temporal, `SERVER_BOOT_ID` y API Keys en Data Plane

* **Estado:** ✅ Aceptado / En vigor

### 1. Contexto y Problema
Para operar como un SaaS B2B multi-tenant real y seguro en demostraciones y producción, la plataforma requiere:
1. Permitir que nuevas organizaciones se den de alta sin intervención manual en la base de datos.
2. Separar estrictamente la autenticación humana del Control Plane respecto de la autenticación de agentes en el Data Plane.
3. Obligar a los usuarios invitados por un administrador a cambiar su contraseña temporal en su primer ingreso.
4. Evitar que sesiones JWT antiguas almacenadas en el navegador permanezcan abiertas si el servidor backend se reinicia.

### 2. Decisión Tomada
1. **Onboarding Autogestionado Atómico (`POST /api/v1/auth/register-org`):** En una única transacción de base de datos crea la `Organization` (con `DEFAULT_ORGANIZATION_SETTINGS`), el usuario administrador inicial (`UserRole.ADMIN`, `must_change_password=False`) y la primera `ApiKey` operativa (`ag_live_...`, almacenando únicamente su hash SHA-256 en `api_keys`), devolviendo el `access_token` JWT y revelando la API Key en texto plano por única vez.
2. **Cambio Obligatorio de Contraseña Temporal (`POST /api/v1/auth/change-password` + `ForcePasswordChangeModal.tsx`):**
   * Cuando un administrador crea un usuario desde el Control Plane (`POST /api/v1/users` $\rightarrow$ `UserService.create()`), el registro se persiste con `must_change_password = True`.
   * Tanto el login como `GET /api/v1/auth/me` exponen `must_change_password`. Si es `true`, el frontend renderiza un diálogo modal nativo ineludible (`ForcePasswordChangeModal.tsx`, que intercepta `Escape` y exige una clave nueva de al menos 8 caracteres distinta de la actual) que invoca `POST /api/v1/auth/change-password`, actualiza el hash `bcrypt` y pone `must_change_password = False`.
3. **Sesiones Efímeras e Invalidación por Reinicio (`SERVER_BOOT_ID` + `sessionStorage`):**
   * En `backend/app/core/security.py`, al iniciar el proceso Python se genera `SERVER_BOOT_ID: str = uuid.uuid4().hex`.
   * Todo JWT emitido por `create_access_token()` incorpora el claim `"boot_id": SERVER_BOOT_ID`, y `decode_access_token()` rechaza cualquier token cuyo `boot_id` no coincida con el `SERVER_BOOT_ID` en memoria.
   * `GET /health` expone `"boot_id": SERVER_BOOT_ID`. En el frontend, `AuthContext.tsx` limpia cualquier rastro heredado en `localStorage`, guarda la sesión únicamente en `sessionStorage` y verifica en el arranque que `health.boot_id === savedBootId`; si el backend se reinició o la URL es `#auth`, invalida la sesión de forma *Fail-Closed* y exige iniciar sesión nuevamente.
4. **Separación Estricta Control Plane vs. Data Plane:**
   * **Control Plane (`/api/v1/agents`, `/tools`, `/tool-actions`, `/policies`, `/policy-rules`, `/api-keys`, `/users`, `/executions`, `/approvals`, `/alerts`, `/audit-events`, `/analytics`, `/organizations`, `/demo`):** Exige JWT humano (`Authorization: Bearer <token>`) y bloquea explícitamente cualquier petición con cabecera `X-Agent-Id` devolviendo **`403 Forbidden`** (`reject_ai_agent_access` en `backend/app/api/deps.py`).
   * **Data Plane (`POST /api/v1/gateway/execute` y `GET /api/v1/gateway/context`):** Exige cabecera `X-AgentGuard-Key`, validada contra el hash SHA-256 en `api_keys` (`401 Unauthorized` si falta, expiró o fue revocada) y verifica pertenencia estricta al tenant (`403 Forbidden` ante intento cross-tenant).
5. **Arranque Limpio por Defecto (`scripts/start-all.ps1`):** `start_all.bat` aplica `alembic upgrade head` pero no ejecuta `seed_demo.py` salvo que se pase explícitamente `-SeedAcme` o `-Reset`, abriendo siempre el navegador en `http://localhost:5173/#auth`.

---

## ADR-007: Protocolo HITL Asíncrono (`202 Accepted`) + WebSockets y Bloqueo Pesimista (`with_for_update()`)

* **Estado:** ✅ Aceptado / En vigor

### 1. Contexto y Problema
Mantener conexiones HTTP abiertas esperando minutos a que un supervisor humano apruebe o rechace una acción sensible (*long-polling*) acopla al agente de IA a timeouts de red. Asimismo, si dos aprobadores humanos intentan resolver el mismo ticket simultáneamente, puede producirse una condición de carrera (*TOCTOU*) que despache dos veces una operación financiera (ej. un reembolso en Stripe).

### 2. Decisión Tomada
1. **Suspensión Asíncrona Inmediata (`202 Accepted`):** Cuando el motor PDP emite `REQUIRE_APPROVAL`, `PEPGatewayService.execute()` persiste la traza `Execution` con `status = PENDING_APPROVAL` y crea el registro `Approval` con `status = PENDING`, respondiendo de inmediato **HTTP `202 Accepted`** con el `approval_id`.
2. **Difusión Reactiva Multi-Tenant por WebSockets (`/api/v1/ws/{organization_id}`):** `WebSocketConnectionManager` (`backend/app/core/websocket_manager.py`) emite en tiempo real los eventos `NEW_APPROVAL`, `RESOLVED_APPROVAL`, `NEW_EXECUTION`, `NEW_ALERT` y `ALERT_STATUS_UPDATED` exclusivamente a los clientes conectados del mismo `organization_id`.
3. **Resolución Exclusiva con Bloqueo Pesimista (`SELECT ... FOR UPDATE`) y TTL de 15 Minutos:** Cuando un usuario con rol `APPROVER` o `ADMIN` invoca `POST /api/v1/approvals/{approval_id}/resolve`, `PEPGatewayService.resolve_approval()` (`backend/app/services/pep_gateway_service.py`) adquiere un bloqueo pesimista de fila (`with_for_update()`), verifica que el ticket exista y siga en `PENDING` (devolviendo `400 Bad Request` si no existe o ya había sido resuelto previamente) y valida el TTL de **900 segundos (15 minutos)**. Si superó el TTL de 900s, `resolve_approval()` transiciona el ticket a `EXPIRED` y la ejecución a `REJECTED`, y el endpoint (`backend/app/api/approvals.py`) retorna el ticket actualizado (`status="EXPIRED"`) en **`HTTP 200 OK`**; si se aprueba dentro del plazo, despacha la petición HTTP REST hacia la herramienta destino, actualiza `Approval` a `APPROVED` y `Execution` a `EXECUTED`, y notifica vía WebSocket (`RESOLVED_APPROVAL`).

---

## ADR-008: Ecosistema Externo ACME Corp (SQLite 7 Tablas), Auto-Onboarding CEO y Dualidad Modo Protegido vs. Modo Directo

* **Estado:** ✅ Aceptado / En vigor
* **Decisores:** Equipo de Desarrollo AgentGuard

### 1. Contexto y Problema
Para demostrar el valor real de AgentGuard ante la cátedra y en escenarios corporativos, no bastaba con simular respuestas estáticas: era necesario contar con una **aplicación empresarial externa real, autónoma y con su propia base de datos transaccional** que contratara AgentGuard, expusiera endpoints de negocio reales y permitiera contrastar visualmente en vivo qué sucede cuando un agente opera **protegido por AgentGuard** frente a cuando opera **sin protección (Modo Directo)**.

### 2. Decisión Tomada
Se diseñó e implementó el subsistema autónomo **`acme-corp/`** (**ACME Corporation — División Looney Tunes**), ejecutado sobre **FastAPI + Uvicorn en el puerto `9000`** (`http://localhost:9000`, iniciado mediante `acme-corp/start_acme.bat` o `acme-corp/run.py`):

1. **Persistencia Relacional Propia en SQLite (`acme-corp/acme_corp.db` — 7 Tablas Físicas):**
   Gestionada por la clase `AcmeDatabase` (`acme-corp/server/database.py`) con sincronización multihilo (`threading.Lock`) e integridad referencial (`PRAGMA foreign_keys = ON`):
   * `company_status`: Fila única (`CHECK (id = 1)`) que monitorea si la empresa sufrió una purga destructiva (`database_wiped`, `wiped_at`, `wiped_reason`). Cuando `database_wiped = 1`, el servidor lanza `DatabaseWipedError` y responde **`503 Service Unavailable`** hasta que se invoque `POST /api/reset` (*"Restablecer ACME"*).
   * `products`: Catálogo comercial con **6 productos semilla Looney Tunes** (`ACME-ROCKET-01` a `ACME-SEEDS-06`), precios actuales (`price`), precios base (`base_price`) para detectar sabotaje (*tampering*) y stock.
   * `customers`: Padrón CRM con **5 clientes VIP** (Wile E. Coyote, Lucas 'Daffy' Duck, Sam Bigotes, Marvin el Marciano, Elmer Gruñón), incluyendo PII fiscal (`tax_id` / CUIT, `address`, `credit_limit`).
   * `quotes`: Registro de cotizaciones emitidas (`POST /crm/create_quote`).
   * `refunds`: Registro de reembolsos procesados (`POST /stripe/refund`).
   * `sales`: Historial analítico de **15 transacciones de ventas** (**8 del mes pasado `last_month`** —4 mayores a $\$1,000\text{ USD}$ por $\$17,200\text{ USD}$ y 4 menores a $\$1,000\text{ USD}$— y **7 del mes actual `current_month`**), consultado por `POST /bi/query_sales` y vulnerable a borrado en `POST /bi/delete_sales`.
   * `events`: Bitácora cronológica de eventos e impacto (`SYSTEM_INIT`, `SALES_QUERIED`, `SALES_DELETED`, `PRICE_TAMPERED`, `CUSTOMERS_EXPORTED`, `DATABASE_WIPED`).

2. **Auto-Onboarding Automático del CEO en `lifespan` (`acme-corp/agent/onboarding.py`):**
   * Al iniciar `acme-corp`, el manejador `lifespan` de `acme-corp/server/app.py` ejecuta `ensure_acme_onboarded_if_needed()` (también invocable bajo demanda vía `POST /api/agent/onboard`; en la interfaz web, el botón `#btn-onboard-agentguard` «Vincular AgentGuard» permanece oculto con clase `hidden` cuando ya existe una `ApiKey` válida configurada, mostrándose en el panel de ajustes el botón «Probar Conexión AgentGuard» que consume `POST /api/agent/discover`).
   * Si AgentGuard está en línea (`GET http://localhost:8000/health`) y la `AGENTGUARD_API_KEY` local falta, expiró tras un reset de Docker o aún no existe el agente `Consultante BI`, `bootstrap_acme_in_agentguard()` autentica a `admin@acmecorp.com` (o registra `Acme Corp` vía `POST /api/v1/auth/register-org`), ejecuta `POST /api/v1/demo/reset` si faltan las herramientas base, y aprovisiona de forma **idempotente**:
     * El **4.º agente**: `Consultante BI` (`ACTIVE`).
     * La **5.ª herramienta REST**: `BI & Ventas ACME` (`http://localhost:9000/bi`) con las acciones `query_sales` (`LOW`) y `delete_sales` (`CRITICAL`), vinculada a `Consultante BI` en `AgentTool`.
     * La **3.ª política**: `"Gobernanza Consultante BI (Solo Lectura)"` (prioridad `150`) con 2 reglas deterministas: `ALLOW` sobre `query_sales` (prioridad `150`) y `DENY` sobre `delete_sales` (prioridad `250`).
     * La generación y persistencia automática de `AGENTGUARD_API_KEY=ag_live_...` en `acme-corp/.env`.

3. **Dualidad Operativa Modo Protegido vs. Modo Directo:**
   * **🛡️ Modo Protegido (`mode="protected"`):** `GeminiAgentClient.execute_in_protected_mode()` descubre dinámicamente los UUIDs del tenant mediante `GET /api/v1/gateway/context` y envía cada invocación a `POST /api/v1/gateway/execute` con `X-AgentGuard-Key`. Solo si AgentGuard emite `ALLOW`, el propio Gateway PEP despacha la llamada HTTP hacia `http://localhost:9000/...`.
   * **⚠️ Modo Directo (`mode="direct"`):** `GeminiAgentClient.execute_in_direct_mode()` omite por completo a AgentGuard e invoca directamente los métodos de `AcmeDatabase` sobre SQLite, permitiendo observar en vivo en el **Inspector Relacional SQLite** la eliminación física de ventas (`delete_sales`), la rebaja fraudulenta del Cohete Mk-IV a $\$9.99\text{ USD}$ (`update_price`), el reembolso sin supervisión (`refund`), la fuga de CUITs (`export_customers`) o la destrucción completa de las tablas operativas (`database.drop`).

---

## ADR-009: Copiloto Administrativo "Consultante BI" (Solo Lectura) e Integración Google Gemini 3.8 Flash (`thinkingLevel: "low"`, `thoughtSignature` y Fallback a `gemini-3.5-flash-lite`)

* **Estado:** ✅ Aceptado / En vigor
* **Decisores:** Equipo de Desarrollo AgentGuard

### 1. Contexto y Problema
1. **Riesgo de Agencia Excesiva en Usuarios No Técnicos:** Un empleado administrativo que dialoga con un copiloto de Business Intelligence suele pedir *"borrame las ventas menores a $1,000"* con la intención mental de limpiar su vista o gráfico en pantalla, sin dimensionar que el LLM puede traducir esa frase en una invocación destructiva (`delete_sales`) sobre la base de datos productiva.
2. **Requisitos Técnicos de la Generación Gemini 3 en Function Calling Multi-Turno:** Los modelos de la familia **Google Gemini 3** (`gemini-3.8-flash`) introducen razonamiento interno (*thinking*) y firmas criptográficas de estado (`thoughtSignature`) dentro de las partes (`parts`) de la respuesta del modelo cuando emite un `functionCall`. Si en el segundo turno (al enviar el `functionResponse`) se reconstruye artificialmente el turno del modelo omitiendo el bloque `thought` o el campo `thoughtSignature`, la API de Google Gemini rechaza la solicitud o degrada el contexto. Además, los modelos en la nube pueden experimentar latencia elevada si el nivel de pensamiento no se acota, o retornar errores transitorios (`404`, `429`, `503` o timeouts).

### 2. Decisión Tomada
1. **Caso de Uso Estrella "Consultante BI" con Degradación Elegante a Filtro Visual Local:**
   * El asistente `Consultante BI` tiene asignada la herramienta `BI & Ventas ACME`, pero gobernada en AgentGuard por la política **"Gobernanza Consultante BI (Solo Lectura)"**.
   * **Paso 1 (`BI-1` — `query_sales`):** Autorizado con `ALLOW (200 OK)`, retorna las 4 ventas mayores a $\$1,000\text{ USD}$ del mes pasado ($\$17,200.00\text{ USD}$).
   * **Paso 2 (`BI-2` — `generate_pie_chart` $\rightarrow$ `query_sales`):** Autorizado con `ALLOW (200 OK)`, renderiza en el navegador una **Gráfica de Torta SVG interactiva** con la distribución porcentual por producto y categoría.
   * **Paso 3 (`BI-3` — `delete_sales`):** Cuando el usuario pide borrar las ventas menores a $\$1,000\text{ USD}$, el LLM invoca `delete_sales` (siguiendo su `systemInstruction` de delegar siempre la decisión en AgentGuard sin auto-censurarse). AgentGuard intercepta la llamada y emite **`DENY (403 Forbidden)`**, manteniendo `acme_corp.db` **100% intacta**. Al recibir el `functionResponse` con estado `blocked` / `DENY`, el asistente explica que no tiene permisos para borrar la base de datos pero ofrece en la interfaz un **filtro visual local no destructivo** (`offer_local_filter` $\rightarrow$ botón *"🔍 Ocultar < $1,000 de esta vista (sin tocar la DB)"*) que filtra la tabla y recalcula el gráfico SVG en memoria del navegador sin tocar SQLite.

2. **Integración Nativa con Google Gemini 3.8 Flash (`acme-corp/agent/gemini_client.py`):**
   * **Modelo Primario por Defecto:** `GEMINI_MODEL: str = "gemini-3.8-flash"` definido en `acme-corp/server/config.py` y `acme-corp/.env.example`.
   * **Control de Latencia (`thinkingLevel: "low"`):** La función `_build_generation_config(model_name)` configura `"temperature": 0.2` e inyecta automáticamente `"thinkingConfig": {"thinkingLevel": "low"}` para todo modelo con prefijo `"gemini-3"`, reduciendo drásticamente el tiempo de respuesta en llamadas a herramientas en vivo.
   * **Preservación Íntegra de `thoughtSignature` en Multi-Turno (Turno 1 $\rightarrow$ Turno 2):**
     En el Turno 1, `GeminiAgentClient.run_scenario()` conserva intacta la lista completa de diccionarios devuelta por la API en `candidates[0]["content"]["parts"]` dentro de `model_turn_parts` (incluyendo los bloques con `"thought": True` y el atributo `"thoughtSignature"` adjunto al `"functionCall"`). En el Turno 2, reenvía `{"role": "model", "parts": model_turn_parts}` exactamente como fue emitido por Gemini antes de anexar `{"role": "function", "parts": [{"functionResponse": ...}]}` y filtra los bloques `not p.get("thought")` únicamente al extraer el texto final para el usuario.
   * **Cadena de Fallback Automático y Modo Guiado Determinístico:**
     Se define `GEMINI_FALLBACK_MODELS = ("gemini-3.8-flash", "gemini-3.5-flash-lite")`. Si `gemini-3.8-flash` sufre un `httpx.TimeoutException` o responde con HTTP `404`, `429` o `503`, el cliente reintenta de forma transparente con **`gemini-3.5-flash-lite`** dejando constancia en la traza (`[Fallback automático a gemini-3.5-flash-lite]`). Adicionalmente, la consola web permite alternar en cualquier momento entre **🤖 Gemini LLM Real** (`use_llm=True`) y **⚡ Modo Guiado / Rápido** (`use_llm=False`), garantizando 100% de disponibilidad durante demostraciones sin conexión o sin cuota de API externa.
