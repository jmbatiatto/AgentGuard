# 🎤 Presentación Oficial en Canva y Guion de Defensa Académica — AgentGuard

> **«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora».**  
> Documento maestro de acompañamiento para la defensa oral y demostración en vivo del proyecto **AgentGuard** ante el tribunal de la cátedra de **Desarrollo Web** (5.º Semestre — Tecnicatura Universitaria en Desarrollo de Software, **ITU — Universidad Nacional de Cuyo, 2026**).

---

## 🎨 1. Ficha Técnica y Enlace Oficial de la Presentación en Canva

La presentación oficial de **12 diapositivas** fue generada directamente en la plataforma **Canva** mediante la integración oficial (`canva_canva` $\rightarrow$ `create-design` y confirmación asíncrona vía `get-create-design-async-job` con estado `completed`):

| Atributo | Valor Oficial Verificado |
| :--- | :--- |
| **Título de la Presentación** | **AgentGuard: Gobernanza Zero Trust en Runtime para Agentes de IA** |
| **Enlace Oficial en Canva (`edit_url`)** | 🔗 [**https://canva.link/59p7pjdurhxr1vk**](https://canva.link/59p7pjdurhxr1vk) |
| **Identificador del Diseño (`design_id`)** | `DAHbl5SRXbM` |
| **Identificador del Trabajo (`job_id`)** | `c2c54cf3-f497-4b73-9791-2103e72401b6` |
| **Cuenta / Espacio de Trabajo en Canva** | **Jonathan Araujo** (`team_id: oBZfd3hsBoA87QCO_UBgiI`) |
| **Extensión y Formato** | **12 diapositivas** (formato panorámico `16:9`, 100% en español) |
| **Dirección Estética y Paleta Semántica** | Estética moderna de ciberseguridad empresarial / SaaS B2B: fondo *Dark Navy / Slate* (`#0F172A` / `#1E293B`), **Verde Esmeralda** (`#10B981`) para veredictos `ALLOW (200 OK)`, **Ámbar** (`#F59E0B`) para `REQUIRE_APPROVAL (202 Accepted — HITL)` y **Coral / Rojo** (`#EF4444`) para bloqueos `DENY (403 Forbidden)` y alertas `CRITICAL`. |

> [!NOTE]
> **Nota de Transparencia Técnica sobre la Generación MCP:**  
> El diseño `DAHbl5SRXbM` fue creado y confirmado exitosamente mediante las herramientas `create-design` y `get-create-design-async-job` (`status: completed`, URL: `https://canva.link/59p7pjdurhxr1vk`). La inspección posterior con `read-design` se omitió debido a la restricción de permisos interactivos de lectura MCP durante la ejecución autónoma bajo `/goal`, por lo que el mapa de las 12 diapositivas documentado a continuación refleja con exactitud el `outline` estructurado que alimentó al motor de diseño de Canva.

---

## 👥 2. Distribución de Roles SCRUM y Asignación de Diapositivas (~15 Minutos)

La exposición está diseñada para una duración total de **15 minutos**, equilibrando la participación de los **4 integrantes del equipo SCRUM** según su responsabilidad arquitectónica y funcional en el proyecto:

| Integrante | Rol SCRUM y Especialidad | Diapositivas Asignadas | Tiempo Estimado | Ejes Temáticos de su Intervención |
| :--- | :--- | :---: | :---: | :--- |
| **Agustín Belardinelli** | **Product Owner & Backend Core (PDP)** | **Slides 1, 2, 3 y 5** | ~4 min | Apertura institucional, problemática **OWASP Agentic Top 10 2026 & LLM06**, paradigma **Zero Trust fuera del LLM** (*"Never trust the model as the enforcement point"*) y motor determinista **PDP 5D Fail-Closed**. |
| **Jonathan Araujo** | **Arquitectura Backend, Gateway PEP, Persistencia & ACME Corp** | **Slides 4, 6, 10 y 12** | ~4 min 30 s | Stack políglota (**ADR-001 a ADR-009**), modelo relacional dual (**PostgreSQL 16 con 13 tablas y 6 migraciones Alembic + SQLite ACME con 7 tablas**), portal **ACME Corp (`:9000`)** con auto-onboarding del CEO y cierre con los **4 escenarios canónicos** y calidad **Zero-Regression**. |
| **Juan Martín Battiato** | **Scrum Master & Frontend Core / HITL** | **Slides 7 y 8** | ~3 min | Protocolo **HITL Asíncrono (`202 Accepted`)**, difusión por **WebSockets Multi-Tenant** (`WebSocketConnectionManager`), bloqueo pesimista `SELECT ... FOR UPDATE` con TTL de 15 min (`900 s`), alta **SaaS B2B** (`register-org`), sesiones efímeras (`SERVER_BOOT_ID` + `sessionStorage`) y matriz **RBAC de 5 roles**. |
| **Mateo Ortega** | **Diseñador UI/UX & Frontend / Consultante BI** | **Slides 9 y 11** | ~3 min 30 s | Experiencia de usuario en las **9 vistas del Dashboard SPA** (100% español con `labels.ts`, Modo Claro/Oscuro, `QuickSetupWizard`, `ForcePasswordChangeModal`, `PlaygroundView` real) y demostración del caso estrella **Copiloto "Consultante BI"** con **Google Gemini 3.8 Flash**, gráfica de torta SVG y filtro visual local no destructivo. |

---

## 🖼️ 3. Desglose Técnico Diapositiva por Diapositiva (Slides 1 a 12)

### Slide 1 — Portada: `AgentGuard: Gobernanza Zero Trust en Runtime para Agentes de IA`
* **Orador:** Agustín Belardinelli | **Tiempo:** `00:00 – 00:45`
* **Objetivo Pedagógico:** Presentar la identidad del producto, la tesis central del proyecto y la conformación del equipo SCRUM ante la cátedra.
* **Contenido Técnico Clave:**
  * Lema rector: **«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora»**.
  * Plataforma SaaS B2B Multi-Tenant de intercepción PEP (*Policy Enforcement Point*), evaluación determinista PDP 5D (*Policy Decision Point*) y observabilidad forense en tiempo de ejecución para agentes de IA conectados a APIs REST empresariales.
  * Contexto académico: Cátedra **Desarrollo Web — 5.º Semestre**, Tecnicatura Universitaria en Desarrollo de Software, **ITU — Universidad Nacional de Cuyo (2026)**.
  * Equipo SCRUM: **Agustín Belardinelli** (PO & PDP), **Juan Martín Battiato** (SM & Front Core), **Mateo Ortega** (UI/UX & Front) y **Jonathan Araujo** (Arq. Backend, PEP & QA).
* **Apoyo Visual Sugerido:** Portada de Canva en pantalla completa junto a la pestaña de `http://localhost:5173/#auth` lista en el navegador.

---

### Slide 2 — `El Problema: Riesgos Críticos en Agentes Autónomos (OWASP 2026)`
* **Orador:** Agustín Belardinelli | **Tiempo:** `00:45 – 01:45`
* **Objetivo Pedagógico:** Justificar por qué los controles tradicionales de autenticación (IAM) y los *system prompts* son insuficientes cuando un LLM ejecuta *Function Calling* sobre sistemas transaccionales.
* **Contenido Técnico Clave:**
  * Los agentes modernos invocan herramientas reales sobre bases de datos, pasarelas de pagos (Stripe), catálogos comerciales y sistemas CRM/BI.
  * **OWASP Top 10 for Agentic Applications (2026):**
    * **`ASI01` (Prompt Injection / Goal Hijacking):** Instrucciones maliciosas directas o indirectas que desvían el objetivo del agente para anular controles de negocio.
    * **`ASI03` (Sensitive Data Exfiltration):** Fuga masiva de padrones de clientes, CUITs y secretos hacia servidores externos no autorizados (ej. `https://attacker.io/leak`).
    * **`ASI04` & `ASI05` (Base64 Evasion & Destructive SQL):** Ofuscación de cargas útiles en Base64 y ejecución de sentencias destructivas (`DROP TABLE`, `DELETE` masivo).
  * **OWASP GenAI `LLM06` (Sensitive Information Disclosure):** Riesgo de persistir tokens `Bearer`, API Keys (`ag_live_...`), contraseñas o PII en texto plano dentro de los logs de auditoría.
* **Apoyo Visual Sugerido:** Mostrar el contraste entre un LLM con acceso directo a la base de datos y los vectores tipificados en `GET /api/v1/gateway/attacks`.

---

### Slide 3 — `Propuesta de Valor y Paradigma Zero Trust Fuera del LLM`
* **Orador:** Agustín Belardinelli | **Tiempo:** `01:45 – 02:45`
* **Objetivo Pedagógico:** Explicar la decisión arquitectónica central de situar el punto de control fuera del modelo probabilístico y separar el Control Plane del Data Plane.
* **Contenido Técnico Clave:**
  * **Axioma Rector:** *"Never trust the model as the enforcement point"* — el LLM propone una acción (`functionCall`), pero **AgentGuard decide determinísticamente** si se ejecuta, se suspende o se bloquea.
  * **Data Plane (`POST /api/v1/gateway/execute` y `GET /api/v1/gateway/context`):** Canal exclusivo para agentes y sistemas integrados, autenticado criptográficamente con la cabecera `X-AgentGuard-Key` (`ag_live_...`, validada contra su hash SHA-256 en la tabla `api_keys`).
  * **Control Plane (17 routers REST bajo `/api/v1`):** Canal exclusivo para operadores humanos autenticados con JWT (`Authorization: Bearer <token>`) que incluye validación de `SERVER_BOOT_ID` y **rechaza cualquier solicitud con cabecera `X-Agent-Id` devolviendo `403 Forbidden`** (`reject_ai_agent_access`).
  * **Principio Fail-Closed Innegociable:** Ante falta de regla aplicable, empate de prioridades, ambigüedad, agente suspendido o fallo de servicio, AgentGuard emite **siempre `DENY` (`403 Forbidden`)**.
* **Apoyo Visual Sugerido:** Diagrama arquitectónico PEP/PDP (`03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST.md`).

---

### Slide 4 — `Arquitectura Políglota Full-Stack (ADR-001 a ADR-009)`
* **Orador:** Jonathan Araujo | **Tiempo:** `02:45 – 03:50`
* **Objetivo Pedagógico:** Demostrar el cumplimiento de la consigna de diversidad políglota de la cátedra y presentar las 4 piezas vivas del monorepositorio.
* **Contenido Técnico Clave:**
  * **Frontend SPA (`http://localhost:5173`):** **TypeScript 5+** (`~6.0.2`), **React 19** (`19.2.8`), **Vite 8**, **Tailwind CSS v4** (`@tailwindcss/vite`) y **`pnpm`** (`12.10.1`). Compuesto por 9 vistas 100% en español y cliente `api.ts` sin *silent fallbacks* (propagación estricta de `ApiError` + `useToast()`).
  * **Backend Core & Gateway (`http://localhost:8000`):** **Python 3.12+**, **FastAPI**, servidor ASGI **Uvicorn**, contratos **Pydantic v2** y ORM **SQLAlchemy 2.0 Async** (`asyncpg`) con recarga ansiosa `get_by_id()` (`selectinload`) anti-`MissingGreenlet` en `ToolService`, `PolicyService` y `PolicyRuleService`.
  * **Persistencia Core:** **PostgreSQL 16** en Docker (puerto host **`5433`** $\rightarrow$ `5432`, **13 tablas**, **6 migraciones Alembic `001`–`006`**) + **Redis 7** (puerto **`6379`**, monitoreado en `GET /health` y usado para invalidación *best-effort* de claves `policies:{org_id}:*`, mientras que el motor PDP evalúa directamente sobre PostgreSQL 16).
  * **Ecosistema Empresarial Satélite (`http://localhost:9000`) y CLI:** Portal ERP **ACME Corporation** en FastAPI + **SQLite 3 (`acme_corp.db`, 7 tablas)** + Copiloto **Consultante BI** conectado a **Google Gemini 3.8 Flash**, más el demostrador CLI `agent-demo/run_demo.py`.
* **Apoyo Visual Sugerido:** Esquema en capas del monorepositorio y `GET http://localhost:8000/health` respondiendo `healthy` con `boot_id`.

---

### Slide 5 — `Flujo Runtime: Interceptor PEP y Motor Determinista PDP 5D`
* **Orador:** Agustín Belardinelli | **Tiempo:** `03:50 – 05:00`
* **Objetivo Pedagógico:** Detallar el pipeline exacto de intercepción dentro de `PEPGatewayService` y la evaluación contextual de 5 dimensiones en `PDPEngine`.
* **Contenido Técnico Clave:**
  * **Etapa 1 — Autenticación y Tenant Match:** Verifica `X-AgentGuard-Key` en `api_keys` (`401 Unauthorized` si falta o fue revocada) y exige `request.organization_id == api_key.organization_id` (`403 Forbidden` ante intento *cross-tenant*).
  * **Etapa 2 — Sanitización (`LLM06`) y `ThreatDetector` (`OWASP 2026`):** `SanitizerService` enmascara tokens, claves y PII antes de persistir `request_context`; `ThreatDetector` inspecciona heurísticas de *Prompt Injection* (`ASI01`), dominios C2 de exfiltración (`ASI03`), payloads Base64 (`ASI04`) y SQL destructivo (`ASI05`).
  * **Etapa 3 — Verificación de Capacidad N:N (`AgentTool`):** Comprueba que el agente esté en estado `ACTIVE` y posea un vínculo activo (`enabled=True`) con la herramienta REST solicitada.
  * **Etapa 4 — Evaluación Determinista PDP 5D sobre PostgreSQL 16:** Evalúa la tupla `[Agente, Delegador/Usuario, Acción Atómica, Recurso, Contexto JSONB]` aplicando operadores dinámicos (`lte`, `lt`, `gte`, `gt`, `eq`, `neq`, `in`, `not_in`, `contains`) ordenados por prioridad:
    * **`ALLOW` (`200 OK`):** Despacho HTTP REST a la herramienta destino y medición de `latency_ms` real con `time.perf_counter()`.
    * **`REQUIRE_APPROVAL` (`202 Accepted`):** Suspensión en bandeja HITL.
    * **`DENY` (`403 Forbidden`):** Bloqueo inmediato y generación de `Alert` si hubo amenaza o regla crítica.
* **Apoyo Visual Sugerido:** Flujo de decisión de `pdp_engine.py` y `pep_gateway_service.py`.

---

### Slide 6 — `Modelo de Datos Dual: PostgreSQL 16 (13 Tablas) + SQLite ACME (7)`
* **Orador:** Jonathan Araujo | **Tiempo:** `05:00 – 06:15`
* **Objetivo Pedagógico:** Defender el diseño de bases de datos relacionales del proyecto, su evolución con Alembic y la separación física entre la plataforma SaaS y el ERP del cliente.
* **Contenido Técnico Clave:**
  * **PostgreSQL 16 (`localhost:5433`, `agentguard_db` — 13 Tablas):**
    * *Identidad y Acceso:* `organizations` (con `settings JSONB`), `users` (con `hashed_password` y `must_change_password`), `api_keys` (`key_prefix` + `hashed_key` SHA-256).
    * *Inventario IA:* `agents`, `tools` (`Literal["REST"]`), `tool_actions` (`risk_level`), `agent_tools` (tabla asociativa N:N con `enabled` y `config JSONB`).
    * *Gobernanza:* `policies`, `policy_rules` (`effect`, `priority`, `conditions JSONB`).
    * *Forense y Runtime:* `executions` (`request_context JSONB`, `latency_ms`), `approvals` (relación `1:1` con `executions`), `alerts`, `audit_events` (`metadata JSONB`).
  * **Claves, Integridad e Índices:** PKs `UUID v4` generadas nativamente por PostgreSQL mediante `server_default=text("gen_random_uuid()")` (prevención anti-IDOR), **24 claves foráneas** (`14 CASCADE`, `5 RESTRICT`, `5 SET NULL`), **10 tipos `ENUM` nativos** y **4 índices GIN** sobre columnas `JSONB`.
  * **6 Migraciones Alembic (`001` a `006`):** `001_initial_schema` (12 tablas base) $\rightarrow$ `002_add_latency_ms` $\rightarrow$ `003_add_api_keys` (tabla 13) $\rightarrow$ `004_add_org_settings` $\rightarrow$ `005_add_hashed_password` $\rightarrow$ `006_add_must_change_password`.
  * **SQLite ACME Corp (`acme-corp/acme_corp.db` — 7 Tablas):** `company_status` (flag `database_wiped`), `products` (6 SKUs Looney Tunes), `customers` (5 clientes VIP con CUIT), `quotes`, `refunds`, `sales` (15 ventas históricas por **USD 34.440,00**) y `events`.
* **Apoyo Visual Sugerido:** Diagrama MER Relacional (`01_MER_RELACIONAL_Y_FISICO_DB.md` / `agentguard_mer_relacional.drawio`).

---

### Slide 7 — `Protocolo HITL Asíncrono (202), WebSockets y Bloqueo Pesimista`
* **Orador:** Juan Martín Battiato | **Tiempo:** `06:15 – 07:45`
* **Objetivo Pedagógico:** Explicar cómo AgentGuard resuelve la intervención humana en tiempo real sin bloquear hilos HTTP ni sufrir condiciones de carrera (*TOCTOU*).
* **Contenido Técnico Clave:**
  * **Suspensión Asíncrona (`HTTP 202 Accepted`):** Cuando una acción (ej. `refund` por $\$4,500\text{ USD}$ o $\$12,500\text{ USD} \ge \$500\text{ USD}$) dispara `REQUIRE_APPROVAL`, el Gateway persiste `Execution` (`PENDING_APPROVAL`) y `Approval` (`PENDING`), devolviendo `202 Accepted` con el `approval_id` en milisegundos sin mantener la conexión HTTP colgada (*no long-polling*).
  * **WebSockets Multi-Tenant (`/api/v1/ws/{organization_id}`):** `WebSocketConnectionManager` (`backend/app/core/websocket_manager.py`) opera en memoria Python aislando canales por `organization_id` y transmite en vivo los eventos `CONNECTED`, `PONG`, `NEW_APPROVAL`, `RESOLVED_APPROVAL`, `NEW_EXECUTION`, `NEW_ALERT` y `ALERT_STATUS_UPDATED`.
  * **Prevención de Condición de Carrera TOCTOU (`SELECT ... FOR UPDATE`):** En `POST /api/v1/approvals/{approval_id}/resolve`, `PEPGatewayService.resolve_approval()` adquiere un bloqueo pesimista de fila (`with_for_update()`) en PostgreSQL, garantizando que dos supervisores concurrentes no puedan aprobar ni despachar dos veces el mismo reembolso.
  * **TTL Fail-Closed de 15 Minutos (`900 s`):** Si el ticket supera los 900 segundos sin resolución de un `APPROVER` o `ADMIN`, `resolve_approval()` lo transiciona automáticamente a `EXPIRED` (y la ejecución a `REJECTED`), retornando el ticket actualizado (`status="EXPIRED"`) con `HTTP 200 OK`.
* **Apoyo Visual Sugerido:** Máquina de estados de `Approval` (`04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO.md`) y bandeja `ApprovalsView.tsx`.

---

### Slide 8 — `Onboarding SaaS B2B, Sesiones Efímeras y Matriz RBAC`
* **Orador:** Juan Martín Battiato | **Tiempo:** `07:45 – 09:15`
* **Objetivo Pedagógico:** Exponer los mecanismos de seguridad del Control Plane: alta autogestionada multi-tenant, rotación forzada de clave temporal, invalidación de sesión por reinicio y control de acceso basado en roles.
* **Contenido Técnico Clave:**
  * **Alta Autogestionada Atómica (`POST /api/v1/auth/register-org`):** Crea en una sola transacción la `Organization` (con `DEFAULT_ORGANIZATION_SETTINGS`), su usuario `ADMIN` inicial y la primera `ApiKey` (`ag_live_...`), revelando el secreto en texto plano por única vez.
  * **Asistente *"Proteger Agente en 3 Clics"* (`QuickSetupWizard.tsx`) y Clave Temporal (`ForcePasswordChangeModal.tsx`):** Cuando un `ADMIN` da de alta un usuario (`POST /api/v1/users`), `UserService.create()` marca `must_change_password = True`; al iniciar sesión, un modal nativo ineludible exige cambiar la clave vía `POST /api/v1/auth/change-password`.
  * **Sesiones Efímeras con `SERVER_BOOT_ID`:** `security.py` genera `SERVER_BOOT_ID: str = uuid.uuid4().hex` en cada arranque del backend, lo incluye como claim `boot_id` en el JWT y lo publica en `GET /health`. `AuthContext.tsx` guarda la sesión únicamente en `sessionStorage` (limpiando `localStorage`) y contrasta `health.boot_id`; si el servidor se reinició o la ruta es `#auth`, cierra la sesión de forma *Fail-Closed*.
  * **Matriz RBAC de 5 Roles Corporativos:**
    * `ADMIN`: Control total del tenant, políticas, herramientas, equipo, API Keys y *Factory Reset* demo.
    * `APPROVER`: Resolución de solicitudes HITL (`approvals`) y gestión de alertas.
    * `OPERATOR`: Simulación en `PlaygroundView` (`/gateway/simulate`) y triage de alertas.
    * `AUDITOR`: Consulta del log forense inmutable (`GET /api/v1/audit-events`).
    * `VIEWER`: Observabilidad de solo lectura sobre métricas, catálogo y trazas.
* **Apoyo Visual Sugerido:** Pantalla `AuthView.tsx` (pestaña *"Registrar Empresa"*) y tabla RBAC en `SettingsView.tsx`.

---

### Slide 9 — `Dashboard Web SPA: 9 Vistas en Español y Modo Claro/Oscuro`
* **Orador:** Mateo Ortega | **Tiempo:** `09:15 – 10:45`
* **Objetivo Pedagógico:** Recorrer la arquitectura de interfaz de usuario en React 19, su localización 100% al español y la interactividad en tiempo real de sus 9 vistas.
* **Contenido Técnico Clave:**
  * **UI 100% en Español y Sistema de Temas:** Todos los textos, estados, badges y mensajes provienen de `frontend/src/constants/labels.ts` (manteniendo los enums internos en inglés mayúsculas compatibles con OpenAPI). `ThemeContext` provee conmutación instantánea entre **Modo Oscuro** y **Modo Claro** mediante variables CSS semánticas (`--bg-card`, `--json-bg`).
  * **Recorrido de las 9 Vistas (`frontend/src/views/*.tsx`):**
    1. `AuthView`: Login con accesos rápidos para los 5 roles demo y registro SaaS B2B con revelación única de API Key.
    2. `OverviewView`: KPIs en tiempo real, distribución de decisiones PDP, alertas activas y acceso al `QuickSetupWizard`.
    3. `AgentsView`: CRUD de agentes (`ACTIVE`, `SUSPENDED`, `REVOKED`) y vinculación N:N de herramientas (`AgentTool`).
    4. `ToolsView`: Catálogo de herramientas `REST` y acciones atómicas (`ToolAction`) clasificadas por riesgo (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
    5. `PoliciesView`: Contenedores de políticas y reglas deterministas con traducción automática de predicados `JSONB` a **lenguaje natural en español**.
    6. `ApprovalsView`: Bandeja HITL reactiva por WebSocket con contador TTL y prevención de doble clic.
    7. `TracesView`: Inspector forense de `executions` (con `latency_ms` real y payloads sanitizados `LLM06`), triage de `alerts` y pestaña de `audit_events`.
    8. `PlaygroundView`: Simulador *sandbox* (`dry_run=True`) conectado al motor PDP real sobre PostgreSQL (`POST /api/v1/gateway/simulate`) con presets de vectores OWASP (`GET /api/v1/gateway/attacks`).
    9. `SettingsView`: Postura de seguridad de la organización, gestión de usuarios RBAC, ciclo de vida de API Keys y botón `ResetDemoModal`.
* **Apoyo Visual Sugerido:** Navegación rápida en vivo por el Dashboard en `http://localhost:5173`.

---

### Slide 10 — `Portal Empresarial ACME Corp (:9000) y Auto-Onboarding CEO`
* **Orador:** Jonathan Araujo | **Tiempo:** `10:45 – 12:00`
* **Objetivo Pedagógico:** Presentar el sistema ERP externo **ACME Corporation (Looney Tunes)** que contrata AgentGuard y permite contrastar en vivo el Modo Protegido frente al Modo Directo.
* **Contenido Técnico Clave:**
  * **Auto-Onboarding Automático en `lifespan` (`acme-corp/agent/onboarding.py`):** Al ejecutar `acme-corp\start_acme.bat`, el servidor FastAPI en `:9000` verifica `GET http://localhost:8000/health` y valida su `AGENTGUARD_API_KEY` contra `GET /api/v1/gateway/context`. Si AgentGuard inició limpio o la clave expiró, el CEO **Lucas Duck** (`admin@acmecorp.com`) registra o autentica automáticamente a `Acme Corp`, ejecuta `/api/v1/demo/reset` si faltan herramientas base, aprovisiona de forma idempotente el agente `Consultante BI`, la herramienta `BI & Ventas ACME` (`http://localhost:9000/bi`), las acciones `query_sales` (`LOW`) y `delete_sales` (`CRITICAL`), la política `"Gobernanza Consultante BI (Solo Lectura)"` y persiste la `AGENTGUARD_API_KEY` en `acme-corp/.env`.
  * **Estado Consolidado en AgentGuard Post-Onboarding:** **4 agentes activos** (`Agente de Ventas`, `Finance Copilot`, `Support Assistant`, `Consultante BI`), **5 herramientas REST**, **7 acciones atómicas**, **3 políticas** y **7 reglas deterministas**. *(En la UI de ACME, el botón `#btn-onboard-agentguard` «Vincular AgentGuard» permanece oculto con clase `hidden` cuando la API Key ya es válida, exponiéndose en ajustes el botón «Probar Conexión AgentGuard» vía `POST /api/agent/discover`).*
  * **Dualidad Operativa en Tiempo Real:**
    * **🛡️ Modo Protegido (AgentGuard PEP):** El agente descubre el contexto vía `GET /api/v1/gateway/context` y envía cada invocación a `POST /api/v1/gateway/execute`.
    * **⚠️ Modo Directo (Sin Protección / Vulnerable):** Las acciones se ejecutan directamente sobre `acme_corp.db` omitiendo AgentGuard, evidenciando el daño real en el **Inspector Relacional SQLite en Vivo** (actualización cada `2.5 s`).
* **Apoyo Visual Sugerido:** Mostrar el Portal ACME Corporation en `http://localhost:9000` con el badge verde de vinculación activa y el Inspector Relacional SQLite a la derecha.

---

### Slide 11 — `Caso Estrella: Copiloto Consultante BI con Gemini 3.8 Flash`
* **Orador:** Mateo Ortega | **Tiempo:** `12:00 – 13:30`
* **Objetivo Pedagógico:** Demostrar en vivo el caso de uso del empleado administrativo no técnico dialogando con el Copiloto BI impulsado por **Google Gemini 3.8 Flash** y cómo AgentGuard evita el borrado accidental de la base de datos ofreciendo una alternativa visual segura.
* **Contenido Técnico Clave:**
  * **Integración Técnica con Google Gemini 3.8 Flash (`acme-corp/agent/gemini_client.py`):**
    * Modelo por defecto `gemini-3.8-flash` con `_build_generation_config()` que inyecta `thinkingConfig: {"thinkingLevel": "low"}` y `temperature: 0.2` para baja latencia.
    * **Preservación de `thoughtSignature` en Multi-Turno:** Conserva intactos todos los bloques de `candidates[0].content.parts` (`model_turn_parts`) entre el Turno 1 (`functionCall`) y el Turno 2 (`functionResponse`).
    * **Resiliencia:** Fallback automático a `gemini-3.5-flash-lite` ante HTTP `404`/`429`/`503` o timeout, más **Modo Guiado / Rápido** determinístico para operación sin cuota externa.
  * **Secuencia en 3 Pasos del Administrativo:**
    1. **Paso 1 (`BI-1` — `ALLOW 200 OK`):** *"Dame todas las ventas mayores a $1,000 del mes pasado"* $\rightarrow$ AgentGuard autoriza `query_sales`; se despliega la tabla interactiva con **4 ventas** por **$17,200.00 USD**.
    2. **Paso 2 (`BI-2` — `ALLOW / Visualización`):** *"Ahora esos datos hacemelos en una gráfica de torta"* $\rightarrow$ Renderiza en vivo una **Gráfica de Torta SVG interactiva** con montos en USD y porcentajes por producto.
    3. **Paso 3 (`BI-3` — `DENY 403 Forbidden` vs. Catástrofe en Modo Directo):** *"Ahora borrá de la base las ventas menores a $1,000"* $\rightarrow$ El LLM invoca `delete_sales`, pero **AgentGuard la bloquea con `DENY (403)`** bajo la política de solo lectura. **SQLite queda 100% intacta (15 ventas)** y el Consultante BI ofrece el botón **"🔍 Ocultar < $1,000 de esta vista (sin tocar la DB)"**, que aplica un filtro visual local en pantalla y recalcula la torta SVG sin eliminar ni una fila de la base de datos. *(Si se repite en Modo Directo, SQLite pierde físicamente 4 registros).*
* **Apoyo Visual Sugerido:** Ejecutar en vivo los Pasos 1, 2 y 3 en la pestaña **📊 Asistente "Consultante BI"** de `http://localhost:9000`.

---

### Slide 12 — `4 Escenarios Canónicos, Calidad Zero-Regression y Conclusión`
* **Orador:** Jonathan Araujo | **Tiempo:** `13:30 – 15:00`
* **Objetivo Pedagógico:** Certificar los 4 escenarios canónicos de seguridad (desde `acme-corp` o `agent-demo/run_demo.py --all`), presentar las métricas de testing automatizado y cerrar la defensa.
* **Contenido Técnico Clave:**
  * **Los 4 Escenarios Canónicos Verificados:**
    1. **Escenario 1 (`ALLOW` — `200 OK`):** `create_quote` por $\$2,500\text{ USD}$ ($\le \$10,000\text{ USD}$) $\rightarrow$ Cotización emitida y traza `EXECUTED` con `latency_ms` real.
    2. **Escenario 2 (`DENY` — `403 Forbidden`):** `update_price` a $\$10\text{ USD}$ (o $\$9.99\text{ USD}$ en ACME) $\rightarrow$ Bloqueado por falta de capacidad en `AgentTool` (en Modo Directo sabotea el precio del Cohete Mk-IV en SQLite).
    3. **Escenario 3 (`REQUIRE_APPROVAL` — `202 Accepted`):** `refund` por $\$4,500\text{ USD}$ (o $\$12,500\text{ USD}$ en ACME, $\ge \$500\text{ USD}$) $\rightarrow$ Genera ticket `PENDING` en `ApprovalsView` vía WebSocket y se despacha a Stripe tras aprobación humana.
    4. **Escenario 4 (`DENY` + `Alert CRITICAL` — `403 Forbidden`):** `export_customers` hacia `https://attacker.io/leak` $\rightarrow$ Neutraliza exfiltración `OWASP ASI03`, sanitiza token `Bearer` (`LLM06`) y dispara alerta `CRITICAL` en vivo. *(Bonus `SEC-5`: `database.drop` bloqueado con `DENY` vs. purga total `HTTP 503` en Modo Directo).*
  * **Calidad Zero-Regression y Metodología SDD + SCRUM:**
    * Suite `backend/tests/test_gateway_scenarios.py` y suites de `backend/tests` + `acme-corp/tests` al **100% en verde**.
    * Chequeo estricto de tipos TypeScript (`tsc -b`) y build de producción (`vite build`) sin errores.
    * Grafo de conocimiento AST (`graphify-out/graph.json`) y 11 volúmenes documentales SSOT 100% sincronizados.
* **Apoyo Visual Sugerido:** Ejecución de `backend\.venv\Scripts\python.exe agent-demo\run_demo.py --all` o aprobación en vivo de un ticket HITL en `http://localhost:5173`.

---

## 🎙️ 4. Guion de Oratoria Paso a Paso (~15 Minutos)

### 🟢 Bloque 1: Visión, Problema OWASP y Paradigma Zero Trust (Agustín Belardinelli — Slides 1, 2 y 3)

> **[Slide 1 — 00:00 a 00:45]**  
> *"Buenas tardes al tribunal. Somos el equipo de desarrollo de **AgentGuard**, integrado por Juan Martín Battiato, Mateo Ortega, Jonathan Araujo y quien les habla, Agustín Belardinelli. Nuestro proyecto para la cátedra de Desarrollo Web se resume en una premisa arquitectónica clara: **«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora»**. Hemos construido una plataforma SaaS B2B Multi-Tenant de autorización contextual, gobernanza y observabilidad forense en tiempo de ejecución para agentes de Inteligencia Artificial."*

> **[Slide 2 — 00:45 a 01:45]**  
> *"¿Qué problema real resolvemos? Hoy las empresas conectan modelos como Gemini o GPT a sus APIs internas mediante Function Calling: esos agentes emiten presupuestos, procesan reembolsos, alteran catálogos o consultan bases de datos. Como documenta el estándar **OWASP Top 10 for Agentic Applications 2026**, confiar en el prompt del sistema como barrera de seguridad es inaceptable: un agente puede sufrir **Prompt Injection (`ASI01`)**, intentar **exfiltrar el padrón de clientes con sus CUITs hacia un servidor atacante (`ASI03`)**, **evadir filtros usando Base64 (`ASI04`)** o **ejecutar sentencias destructivas como `DROP TABLE` o `DELETE` masivos (`ASI05`)**. Además, sin sanitización contextual (**OWASP GenAI `LLM06`**), los propios logs de auditoría terminan filtrando tokens Bearer y secretos corporativos."*

> **[Slide 3 — 01:45 a 02:45]**  
> *"Frente a esto, nuestra propuesta aplica el axioma Zero Trust: **«Never trust the model as the enforcement point»**. Situamos un interceptor determinista fuera del LLM y dividimos la arquitectura en dos planos estrictos: el **Data Plane** (`POST /api/v1/gateway/execute` y `GET /api/v1/gateway/context`), donde los agentes se autentican mediante una API Key criptográfica (`X-AgentGuard-Key`), y el **Control Plane** (17 routers administrativos), que exige un usuario humano autenticado con JWT y rechaza de plano cualquier petición con cabecera `X-Agent-Id` devolviendo `403 Forbidden`. Y todo bajo principio **Fail-Closed**: ante cualquier duda, falta de regla o empate de prioridades, la decisión es siempre `DENY`."*

---

### 🔵 Bloque 2: Stack Políglota, Motor PDP 5D y Persistencia Dual (Jonathan Araujo y Agustín Belardinelli — Slides 4, 5 y 6)

> **[Slide 4 — Jonathan Araujo — 02:45 a 03:50]**  
> *"Para materializar esta arquitectura cumplimos estrictamente la consigna políglota de la cátedra documentada en nuestros 9 ADRs. En el **Frontend (`:5173`)** utilizamos **TypeScript 5+, React 19, Vite 8 y Tailwind CSS v4** gestionados con `pnpm`, sin ningún fallback silencioso. En el **Backend (`:8000`)** utilizamos **Python 3.12+ con FastAPI, Uvicorn, Pydantic v2 y SQLAlchemy 2.0 asíncrono (`asyncpg`)**, aplicando carga ansiosa con `selectinload` en nuestros servicios para evitar errores `MissingGreenlet`. En persistencia combinamos **PostgreSQL 16** en el puerto `5433` y **Redis 7** en el `6379`. Y para demostrar el sistema en un entorno empresarial real, desarrollamos un servidor externo completo en el puerto `9000`: el **Portal Empresarial ACME Corporation**, con su propia base SQLite y conectado en vivo a **Google Gemini 3.8 Flash**."*

> **[Slide 5 — Agustín Belardinelli — 03:50 a 05:00]**  
> *"Veamos qué ocurre en milisegundos cuando una llamada ingresa a `POST /api/v1/gateway/execute`. Primero validamos el hash SHA-256 de `X-AgentGuard-Key` y verificamos que el `organization_id` coincida con el tenant de la llave. Segundo, `SanitizerService` enmascara recursivamente credenciales y PII según OWASP LLM06, y `ThreatDetector` analiza el payload buscando inyecciones, Base64 o SQL destructivo. Tercero, validamos en la tabla asociativa `AgentTool` que el agente esté `ACTIVE` y tenga asignada esa herramienta REST. Cuarto, nuestro motor `PDPEngine` evalúa en PostgreSQL 16 las **5 dimensiones**: `[Agente, Delegador, Acción Atómica, Recurso y Contexto JSONB]`. El resultado es determinista: `ALLOW (200 OK)` despachando la petición HTTP a la herramienta y midiendo la latencia real con `perf_counter()`, `REQUIRE_APPROVAL (202 Accepted)` derivando a un supervisor humano, o `DENY (403 Forbidden)` cortando la ejecución antes de tocar la API externa."*

> **[Slide 6 — Jonathan Araujo — 05:00 a 06:15]**  
> *"A nivel de base de datos, el proyecto implementa una arquitectura de **doble persistencia**. En **PostgreSQL 16 (`:5433`)** modelamos **13 tablas** normalizadas, donde todas las claves primarias son `UUID v4` generadas nativamente por el motor con `server_default=text('gen_random_uuid()')` para impedir ataques IDOR. Contamos con 24 claves foráneas, 10 tipos `ENUM` nativos y **4 índices GIN** sobre columnas `JSONB` para evaluar predicados y auditar contextos a alta velocidad. Todo el esquema evoluciona mediante **6 migraciones secuenciales de Alembic (`001` a `006`)**, incluyendo `latency_ms`, la tabla `api_keys`, `organizations.settings`, `hashed_password` y `users.must_change_password`. En paralelo, el ERP externo **ACME Corp** posee su propia base **SQLite (`acme_corp.db`) con 7 tablas físicas** (`company_status`, `products`, `customers`, `quotes`, `refunds`, `sales` con 15 ventas históricas por 34.440 dólares y `events`)."*

---

### 🟣 Bloque 3: Protocolo HITL Asíncrono, WebSockets, Onboarding SaaS y RBAC (Juan Martín Battiato — Slides 7 y 8)

> **[Slide 7 — Juan Martín Battiato — 06:15 a 07:45]**  
> *"Cuando una operación financiera supera el umbral autónomo —por ejemplo, un reembolso en Stripe mayor o igual a 500 dólares—, mantener la conexión HTTP abierta esperando a un humano bloquearía al agente. Por eso diseñamos en el **ADR-007** un **Protocolo HITL Asíncrono**: el Gateway persiste la ejecución en `PENDING_APPROVAL`, abre un ticket `Approval` en estado `PENDING`, responde de inmediato **`HTTP 202 Accepted`** con el `approval_id` y notifica en vivo al Dashboard mediante nuestro `WebSocketConnectionManager` en el canal aislado `/api/v1/ws/{organization_id}`. Cuando el aprobador humano presiona 'Aprobar' o 'Rechazar' en `ApprovalsView`, el backend ejecuta `SELECT ... FOR UPDATE` (`with_for_update()`), aplicando un **bloqueo pesimista a nivel de fila** que impide condiciones de carrera TOCTOU si dos supervisores hacen clic al mismo tiempo. Además, cada ticket tiene un **TTL Fail-Closed de 15 minutos (900 segundos)**: si vence, transiciona automáticamente a `EXPIRED` y la ejecución queda `REJECTED`."*

> **[Slide 8 — Juan Martín Battiato — 07:45 a 09:15]**  
> *"En el plano administrativo, AgentGuard opera como un verdadero **SaaS B2B Multi-Tenant**. Mediante `POST /api/v1/auth/register-org`, cualquier empresa se registra en una sola transacción atómica que crea la Organización, el usuario `ADMIN` y su primera API Key `ag_live_...` mostrada por única vez. Si el administrador invita colaboradores desde `SettingsView`, se crean con `must_change_password = True` y, al loguearse, `ForcePasswordChangeModal` los obliga a rotar su clave temporal vía `POST /api/v1/auth/change-password`. También blindamos el ciclo de sesión con `SERVER_BOOT_ID`: cada arranque del backend genera un identificador único en memoria inyectado en el JWT y expuesto en `/health`; el frontend guarda la sesión solo en `sessionStorage` y, si detecta que el servidor fue reiniciado, invalida la sesión y redirige a `#auth`. Todo esto gobernado por una **matriz RBAC de 5 roles**: `ADMIN`, `APPROVER`, `OPERATOR`, `AUDITOR` y `VIEWER`."*

---

### 🟠 Bloque 4: Dashboard SPA, Portal ACME Corp, Caso Estrella "Consultante BI" y Cierre (Mateo Ortega y Jonathan Araujo — Slides 9, 10, 11 y 12)

> **[Slide 9 — Mateo Ortega — 09:15 a 10:45]**  
> *"Desde la experiencia de usuario, construimos una SPA de **9 vistas 100% en español** centralizadas en `labels.ts`, con soporte nativo para **Modo Oscuro y Modo Claro**. En `OverviewView` y `AgentsView` incluimos el asistente **'Proteger Agente en 3 Clics'** (`QuickSetupWizard`), que guía paso a paso el alta de herramienta REST, agente vinculado y política PDP. En `PoliciesView`, los predicados `JSONB` se traducen automáticamente a lenguaje natural legible por humanos. En `TracesView` auditamos cada ejecución con su `latency_ms` real, su contexto sanitizado y el triage de alertas SIEM. Y un punto clave: `PlaygroundView` no es una maqueta estática; consume `POST /api/v1/gateway/simulate` evaluando el motor PDP real sobre PostgreSQL en modo `dry_run=True` con el catálogo de ataques OWASP 2026."*

> **[Slide 10 — Jonathan Araujo — 10:45 a 12:00]**  
> *"Para ver la plataforma en acción desde la perspectiva de un cliente real, levantamos en el puerto `9000` el **Portal Empresarial de ACME Corporation (división Looney Tunes)**. Al iniciar `start_acme.bat`, su evento `lifespan` ejecuta el **Auto-Onboarding del CEO Lucas Duck**: verifica la salud de AgentGuard, autentica o registra a `Acme Corp`, aprovisiona de manera idempotente el cuarto agente —**`Consultante BI`**—, la quinta herramienta REST —**`BI & Ventas ACME`** con las acciones `query_sales` y `delete_sales`—, la política de solo lectura y persiste la `AGENTGUARD_API_KEY` en `acme-corp/.env`. El portal nos ofrece un selector para alternar en vivo entre el **Modo Protegido (pasando por AgentGuard PEP)** y el **Modo Directo (vulnerable, directo contra SQLite)**, mientras a la derecha observamos en tiempo real el **Inspector Relacional SQLite**."*

> **[Slide 11 — Mateo Ortega — 12:00 a 13:30]**  
> *"Nuestro caso de uso estrella en ACME Corp es el **Asistente 'Consultante BI'**, diseñado para personal administrativo no técnico e impulsado por **Google Gemini 3.8 Flash** configurado con `thinkingLevel: 'low'`, preservación estricta de `thoughtSignature` entre turnos de Function Calling y fallback automático a `gemini-3.5-flash-lite`.  
> — En el **Paso 1**, el administrativo pide: **«Dame todas las ventas mayores a $1,000 del mes pasado»**. Gemini invoca `query_sales`, AgentGuard evalúa la política y responde **`ALLOW (200 OK)`**, desplegando en pantalla las 4 ventas de alto valor por **17.200 dólares**.  
> — En el **Paso 2**, pide: **«Ahora esos datos hacemelos en una gráfica de torta»**. El asistente genera en vivo una **Gráfica de Torta SVG interactiva** con el desglose porcentual por producto.  
> — En el **Paso 3**, el administrativo comete un error clásico: creyendo que solo va a limpiar su pantalla, pide **«Ahora borrá de la base las ventas menores a $1,000»**. Gemini traduce la orden en la herramienta crítica `delete_sales`. En **Modo Protegido**, AgentGuard intercepta la llamada y emite **`DENY (403 Forbidden)`**: la base SQLite queda **100% intacta con sus 15 ventas**, y el Consultante BI le explica amablemente que no tiene permisos para borrar la base de datos, pero le ofrece el botón **'Ocultar < $1,000 de esta vista (sin tocar la DB)'**, aplicando un filtro visual local en el navegador. En cambio, si cambiamos el selector a **Modo Directo** sin AgentGuard y repetimos el comando, vemos en el inspector SQLite cómo `DELETE FROM sales` borra físicamente 4 registros históricos de la empresa."*

> **[Slide 12 — Jonathan Araujo — 13:30 a 15:00]**  
> *"Finalmente, tanto desde la pestaña de Seguridad de ACME como desde nuestro cliente CLI `agent-demo/run_demo.py --all` (que descubre automáticamente los UUIDs vía `GET /api/v1/gateway/context`), certificamos los **4 escenarios canónicos**:  
> 1) `create_quote` por $2.500 $\rightarrow$ **`ALLOW (200 OK)`**;  
> 2) `update_price` $\rightarrow$ **`DENY (403 Forbidden)`** por falta de capacidad en `AgentTool` (evitando que en Modo Directo rebajen el Cohete Mk-IV a $9,99);  
> 3) `refund` $\rightarrow$ **`REQUIRE_APPROVAL (202 Accepted)`**, que aprobamos en vivo desde la bandeja HITL del Dashboard; y  
> 4) `export_customers` hacia `attacker.io` (junto con `database.drop`) $\rightarrow$ **`DENY (403 Forbidden)`** con generación inmediata de **Alerta `CRITICAL`** en vivo.  
> Todo el sistema cuenta con pruebas automatizadas en `pytest` y validación `tsc -b` + `vite build` al 100% en verde bajo política **Zero-Regression**. Con esto demostramos cómo **AgentGuard** transforma agentes de IA impredecibles en sistemas gobernados, auditables y seguros para producción. Muchas gracias y quedamos abiertos a las preguntas del tribunal."*

---

## ✅ 5. Checklist Rápida de Puesta en Marcha Antes de Pasar alFrente

Ejecutar en orden **5 minutos antes** de comenzar la defensa:

1. **Iniciar la plataforma AgentGuard (arranque limpio por defecto):**
   ```powershell
   .\start_all.bat
   ```
   *Verificar:* Contenedores Docker (`agentguard-postgres` en `:5433` y `agentguard-redis` en `:6379`) activos, migraciones Alembic aplicadas hasta `006_add_must_change_password`, backend en `http://localhost:8000/health` (`status: "healthy"`, `boot_id` presente) y navegador abierto en `http://localhost:5173/#auth`.
2. **Iniciar el Portal Empresarial ACME Corporation (`:9000`):**
   ```powershell
   acme-corp\start_acme.bat
   ```
   *Verificar:* El servidor levanta en `http://localhost:9000` y en menos de 2 segundos el `lifespan` ejecuta el **auto-onboarding del CEO Lucas Duck**, dejando en AgentGuard los **4 agentes** y **5 herramientas** de `Acme Corp` y persistiendo `AGENTGUARD_API_KEY` en `acme-corp/.env`.
3. **Abrir las 3 pestañas clave en el navegador (en orden de exposición):**
   * **Pestaña 1:** Presentación oficial en Canva $\rightarrow$ [`https://canva.link/59p7pjdurhxr1vk`](https://canva.link/59p7pjdurhxr1vk) (`design_id: DAHbl5SRXbM`).
   * **Pestaña 2:** Dashboard de Control Plane AgentGuard $\rightarrow$ `http://localhost:5173/#auth` (iniciar sesión con un clic como `admin@acmecorp.com` / `demo-password`).
   * **Pestaña 3:** Portal Empresarial ACME Corp & Consultante BI $\rightarrow$ `http://localhost:9000` (verificar badge verde **"Vinculado con AgentGuard"** y las **15 ventas históricas** en el Inspector Relacional SQLite).
4. **(Opcional) Tener lista una terminal en la raíz para el demostrador CLI:**
   ```powershell
   backend\.venv\Scripts\python.exe agent-demo\run_demo.py --all
   ```

---

## 🛡️ 6. Respuestas Rápidas de Respaldo ante Preguntas del Tribunal

| Pregunta Posible del Tribunal | Respuesta Técnica Concreta (Basada en el Código Real) |
| :--- | :--- |
| **1. ¿Por qué el motor PDP consulta PostgreSQL 16 directamente en lugar de leer desde Redis 7?** | Para garantizar **consistencia transaccional inmediata (Zero Stale Policies)**: cualquier cambio de regla o revocación de capacidad en `AgentTool` surte efecto en el mismo milisegundo sin ventana de desincronización. Redis 7 (`:6379`) se monitorea en `GET /health` y recibe invalidación *best-effort* (`policies:{org_id}:*`) desde `policy_rule_service.py`, mientras que los 4 índices GIN en PostgreSQL 16 mantienen la evaluación PDP por debajo de los pocos milisegundos. |
| **2. ¿Cómo evitan que un agente de IA se modifique a sí mismo sus políticas usando el Control Plane?** | Por separación criptográfica y estructural de planos (**ADR-006**): los agentes solo poseen `X-AgentGuard-Key`, válida únicamente en `/api/v1/gateway/execute` y `/api/v1/gateway/context`. Todos los routers administrativos exigen JWT humano (`get_current_user` / `require_admin_user`) e invocan la dependencia `reject_ai_agent_access` (`backend/app/api/deps.py`), que devuelve **`403 Forbidden`** si detecta la cabecera `X-Agent-Id`. |
| **3. ¿Cómo se sincronizan los UUIDs si PostgreSQL los genera dinámicamente con `gen_random_uuid()`?** | Eliminamos todo UUID hardcodeado mediante el endpoint de *auto-discovery* **`GET /api/v1/gateway/context`**. Tanto `acme-corp` como `agent-demo/run_demo.py` consultan ese endpoint presentando su `X-AgentGuard-Key` y resuelven en tiempo de ejecución el `organization_id`, el `agent_id` (`Consultante BI` o `Agente de Ventas`) y el `tool_id` correspondiente a cada `action_name`. |
| **4. ¿Qué ocurre técnicamente en el multi-turno de Google Gemini 3.8 Flash cuando se usa `thinkingLevel: "low"`?** | Los modelos Gemini 3 adjuntan bloques de razonamiento (`thought: True`) y una firma criptográfica (`thoughtSignature`) junto al `functionCall` en el Turno 1. En `acme-corp/agent/gemini_client.py` capturamos la lista completa `candidates[0].content.parts` en `model_turn_parts` y la reenviamos intacta dentro del mensaje `role: "model"` del Turno 2 junto al `functionResponse`, evitando errores de validación de firma en la API `v1beta`. |
