# ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI)

Módulo central de autorización en tiempo de ejecución (Gateway PEP), motor determinista de políticas (PDP), control plane multi-tenant y persistencia forense de AgentGuard.

* **Responsables:** **Agustín Belardinelli** (PO / Motor PDP) & **Jonathan Araujo** (Gateway PEP / Persistencia / Alembic).
* **Runtime:** Python 3.12+
* **Framework:** **FastAPI** (ASGI con Uvicorn, Pydantic v2 y `pydantic-settings`).
* **Persistencia:** **SQLAlchemy 2.0 asíncrono** + **`asyncpg`** sobre **PostgreSQL 16** (puerto host **`5433`** -> `5432` en contenedor).
* **Infraestructura auxiliar:** **Redis 7** (puerto `6379`, monitoreado en `/health` e invalidación best-effort tras cambios de reglas; el motor PDP evalúa directamente contra PostgreSQL 16 sin caché Redis de lectura).
* **Migraciones DDL:** **Alembic** (`001_initial_schema.py` a `005_add_hashed_password_to_users.py`).

---

## 🏗️ Arquitectura de la API REST (`/api/v1`)

1. **Autenticación y Onboarding SaaS B2B:**
   * `/api/v1/auth` (`POST /login`, `POST /register`, `POST /register-org`, `GET /me`) — `register-org` crea en una transacción atómica `Organization`, `User` (`ADMIN`) y la primera `ApiKey` (`ag_live_...`).

2. **Data Plane — Agent Runtime Gateway (PEP):**
   * `POST /api/v1/gateway/execute`: Requiere cabecera `X-AgentGuard-Key`, verifica pertenencia del `organization_id` a la API Key, sanitiza parámetros (OWASP LLM06), analiza amenazas OWASP (`threat_detector.py`), evalúa capacidades `AgentTool` y PDP 5D, registra trazas/alertas/tickets en PostgreSQL y responde `200 OK` (`ALLOW`), `202 Accepted` (`REQUIRE_APPROVAL`) o `403 Forbidden` (`DENY`).
   * `POST /api/v1/gateway/simulate`: Ejecución en modo sandbox (`dry_run=True`) sin persistir en `executions` ni emitir WebSockets.
   * `GET /api/v1/gateway/attacks`: Catálogo estructurado de vectores de ataque OWASP para el Playground.

3. **Control Plane Administrativo (JWT obligatorio + bloqueo `403` ante `X-Agent-Id`):**
   * `/api/v1/organizations` (Tenants, `/{org_id}/settings` y `POST /{org_id}/settings/webhooks/test`)
   * `/api/v1/users` (Miembros y roles `ADMIN`, `APPROVER`, `OPERATOR`, `AUDITOR`, `VIEWER`)
   * `/api/v1/api-keys` (Generación, listado y revocación de API Keys `ag_live_...`)
   * `/api/v1/agents` (Identidades de IA y asignación N:N `AgentTool`)
   * `/api/v1/tools` & `/api/v1/tool-actions` (Catálogo de herramientas restringidas a protocolo `REST` y acciones atómicas con `risk_level`)
   * `/api/v1/policies` & `/api/v1/policy-rules` (Políticas y reglas deterministas con condiciones `JSONB`)
   * `/api/v1/executions` (Trazas forenses de ejecución con `latency_ms` real medida)
   * `/api/v1/approvals` (`GET` y `POST /{approval_id}/resolve` con bloqueo pesimista `with_for_update()` y TTL de 15 min)
   * `/api/v1/alerts` (Incidentes de seguridad y estados `OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`)
   * `/api/v1/audit-events` (Auditoría inmutable de mutaciones administrativas)
   * `/api/v1/analytics` (`/overview` y `/timeseries`)
   * `/api/v1/demo` (`POST /reset` para restablecer los datos semilla de Acme Corp)

4. **WebSockets en Tiempo Real y Diagnóstico:**
   * `/api/v1/ws` y `/api/v1/ws/{organization_id}` — Canales reactivos para eventos `NEW_APPROVAL`, `RESOLVED_APPROVAL`, `NEW_EXECUTION` y `NEW_ALERT`.
   * `GET /health` y `GET /api/v1/ping` — Estado de conectividad de PostgreSQL (`5433`) y Redis (`6379`).

5. **Motor de Políticas (PDP):**
   * Evaluador determinista de tuplas contextuales de 5 dimensiones consultando directamente PostgreSQL 16 con principio **Fail-Closed** (`DENY` por defecto):
     $$\text{Decisión} = f(\text{Principal}, \text{Delegator}, \text{Action}, \text{Resource}, \text{Context})$$

---

## 📁 Estructura del Código Fuente

```text
backend/
├── alembic/              # Historial DDL versionado en Git
│   ├── versions/         # 001_initial_schema.py .. 005_add_hashed_password_to_users.py
│   └── env.py            # Configuración asíncrona de Alembic con SQLAlchemy
├── app/
│   ├── api/              # 17 routers registrados en api/__init__.py + deps.py (JWT / RBAC)
│   ├── core/             # config.py (puerto 5433), database.py, security.py (JWT/hash), websocket_manager.py
│   ├── models/           # 13 tablas SQLAlchemy (12 del MER + api_keys) y enums tipados
│   ├── schemas/          # DTOs Pydantic v2 y validaciones estrictas (ej. protocol: Literal["REST"])
│   ├── services/         # pep_gateway_service, pdp_engine, threat_detector, sanitizer_service, api_key_service, etc.
│   └── main.py           # Punto de entrada FastAPI, CORS, healthchecks y router /api/v1
├── scripts/              # seed_demo.py (población determinista de Acme Corp)
├── tests/                # Suite automatizada pytest + pytest-asyncio
├── .env.example          # Plantilla con POSTGRES_PORT=5433 y variables críticas
├── alembic.ini           # Configuración de Alembic
└── requirements.txt      # Dependencias Python
```

---

## 🗄️ Versionado de Base de Datos con Alembic

El versionado de las **13 tablas** relacionales en PostgreSQL 16 (puerto `5433`) se gestiona mediante Alembic:

```powershell
# Aplicar todas las migraciones pendientes (desde la raíz del repositorio)
backend\.venv\Scripts\alembic.exe -c backend/alembic.ini upgrade head

# Crear nueva migración tras cambios en app/models/
backend\.venv\Scripts\alembic.exe -c backend/alembic.ini revision --autogenerate -m "descripcion_del_cambio"

# Revertir la última migración
backend\.venv\Scripts\alembic.exe -c backend/alembic.ini downgrade -1
```

---

## 🧪 Pruebas Automatizadas

```powershell
# Suite completa del backend
backend\.venv\Scripts\pytest.exe -q --tb=short --no-header backend/tests

# Suite de regresión de los 4 escenarios canónicos
backend\.venv\Scripts\pytest.exe -q --tb=short --no-header backend/tests/test_gateway_scenarios.py
```

---

## 📋 Especificaciones Históricas Archivadas

* **Semana 1:** [Base de Datos & Setup Inicial](../docs/archive/desglose_de_pasos_semana_1_base_de_datos_y_setup_inicial.md)
* **Semana 2:** [API REST de Gestión Administrativa](../docs/archive/desglose_de_pasos_semana_2_api_rest_de_gestion.md)
* **Semana 3:** [Gateway Interceptor (PEP) y Motor de Políticas (PDP)](../docs/archive/desglose_de_pasos_semana_3_gateway_interceptor_y_pdp.md)
