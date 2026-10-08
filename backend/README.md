# ⚙️ AgentGuard — Backend (Python + FastAPI)

Módulo central de autorización, gobernanza y persistencia en tiempo de ejecución de AgentGuard.

* **Responsables:** **Agustín Belardinelli** (PO / Motor PDP) & **Jonathan Araujo** (Gateway PEP / Persistencia / Alembic).
* **Runtime:** Python 3.12+
* **Framework:** **FastAPI** (asíncrono con Uvicorn, Starlette y Pydantic v2).
* **Capa de Persistencia:** **SQLAlchemy 2.0 (asíncrono)** + **asyncpg** (PostgreSQL 16) + **Redis 7** (ioredis / redis-py).
* **Control de Versiones y Migraciones de BD:** **Alembic** (historial de migraciones DDL versionadas en Git con métodos `upgrade()` y `downgrade()`).

---

## 🏗️ Arquitectura de la API REST

1. **API de Gestión Administrativa:**
   * `/api/v1/organizations` (Tenants)
   * `/api/v1/users` (Usuarios y roles)
   * `/api/v1/agents` (Identidades de IA y sponsors)
   * `/api/v1/tools` & `/api/v1/tool-actions` (Catálogo de herramientas y endpoints protegidos)
   * `/api/v1/policies` & `/api/v1/policy-rules` (Reglas deterministas con condiciones JSONB)
   * `/api/v1/traces` (Consulta de trazas de ejecución)
   * `/api/v1/approvals` (Bandeja de intervención humana)
   * `/api/v1/alerts` (Incidentes de seguridad)

2. **Agent Runtime Gateway (PEP):**
   * `POST /api/v1/gateway/execute`: Intercepta la llamada de herramienta del agente de IA, sanitiza el contexto, invoca al PDP y enruta o bloquea.

3. **Motor de Políticas (PDP):**
   * Evaluador determinista de tuplas contextuales de 5 dimensiones:
     $$\text{Decisión} = f(\text{Principal}, \text{Delegator}, \text{Action}, \text{Resource}, \text{Context})$$
   * Caché volátil en Redis para evaluación sin latencia de disco.

---

## 📁 Estructura del Código Fuente

```text
backend/
├── alembic/              # Historial de versiones de esquema de base de datos
│   ├── versions/         # Scripts de migración versionados (ej. 001_initial_schema.py)
│   └── env.py            # Configuración de contexto de Alembic con SQLAlchemy
├── app/
│   ├── api/              # Routers por dominio (/gateway, /agents, /policies, etc.)
│   ├── core/             # Configuración (pydantic-settings), base de datos y seguridad
│   ├── models/           # Modelos declarativos SQLAlchemy (las 12 tablas del MER)
│   ├── schemas/          # Modelos Pydantic v2 (DTOs de request/response y validación)
│   ├── services/         # Lógica de negocio (pdp_engine, pep_gateway, audit_service)
│   └── main.py           # Punto de entrada de FastAPI y middlewares CORS/Auth
├── tests/                # Pruebas automatizadas (pytest + pytest-asyncio)
├── alembic.ini           # Archivo de configuración de Alembic
└── requirements.txt      # Dependencias congeladas del proyecto
```

---

## 🗄️ Versionado de Base de Datos con Alembic

El versionado de las 12 tablas relacionales en PostgreSQL se gestiona mediante comandos de Alembic:

* **Crear nueva migración:**
  ```bash
  alembic revision --autogenerate -m "descripcion_del_cambio"
  ```
* **Aplicar migraciones pendientes:**
  ```bash
  alembic upgrade head
  ```
* **Revertir la última migración (*Rollback*):**
  ```bash
  alembic downgrade -1
  ```
