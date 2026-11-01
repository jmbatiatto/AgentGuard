# 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard

Este documento registra formalmente las decisiones de arquitectura de software (Architecture Decision Records) adoptadas por el equipo de desarrollo de **AgentGuard**.  
Cualquier desarrollador o agente de inteligencia artificial (Antigravity, Cursor, Copilot, etc.) **debe consultar y respetar estas decisiones** antes de proponer cambios estructurales en el código.

---

## 📋 Índice de Decisiones

* [ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)](#adr-001-arquitectura-políglota--backend-en-python-fastapi-y-frontend-en-typescript-react)
* [ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas](#adr-002-estructura-monorepo-políglota-y-distribución-modular-de-carpetas)
* [ADR-003: Supresión de MCP y Estandarización en Protocolo HTTP REST Puro](#adr-003-supresión-de-mcp-y-estandarización-en-protocolo-http-rest-puro)
* [ADR-004: Modelo Relacional Multi-Tenant con Identificadores UUID v4 e Índices JSONB en PostgreSQL](#adr-004-modelo-relacional-multi-tenant-con-identificadores-uuid-v4-e-índices-jsonb-en-postgresql)
* [ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic](#adr-005-control-de-versiones-y-migraciones-de-base-de-datos-con-alembic)
* [ADR-006: Protocolo HITL Asíncrono con Bóveda Cifrada en Redis Vault (Fernet TTL 15m)](#adr-006-protocolo-hitl-asíncrono-con-bóveda-cifrada-en-redis-vault-fernet-ttl-15m)
* [ADR-007: Pipeline PEP con Inspección Heurística Temprana OWASP 2026 y Latencia Forense Real](#adr-007-pipeline-pep-con-inspección-heurística-temprana-owasp-2026-y-latencia-forense-real)
* [ADR-008: Trazabilidad Administrativa Inmutable WORM con AuditService y Consulta Multi-Tenant](#adr-008-trazabilidad-administrativa-inmutable-worm-con-auditservice-y-consulta-multi-tenant)

---

## ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026
* **Decisores:** Equipo de Desarrollo (Agustín Belardinelli, Juan Martín Battiato, Mateo Ortega, Jonathan Araujo)
* **Motivación:** Criterio pedagógico oficial de la cátedra de Desarrollo Web (ITU - UNCUYO).

### 1. Contexto y Problema
El profesor evaluador de la materia especificó a los equipos que **no desea que se utilice el mismo lenguaje en el frontend y en el backend**, con el objetivo de evaluar la capacidad de integrar sistemas heterogéneos, gestionar dos entornos de ejecución distintos y aplicar paradigmas políglotas en una arquitectura web real.

### 2. Decisión Tomada
Se resolvió adoptar una **arquitectura web políglota desacoplada**:
1. **Frontend:** **TypeScript (v5+) con React y Vite**, gestionado mediante **`pnpm`**.
2. **Backend:** **Python (v3.12+) con FastAPI**, ejecutado sobre el servidor ASGI **Uvicorn**.
3. **Validación y Contratos:** **Pydantic v2** para validación estricta de esquemas y generación automática de la documentación interactiva OpenAPI / Swagger en `/docs`.
4. **Capa de Datos:** **SQLAlchemy 2.0 (asyncio + asyncpg)** para acceso asíncrono de alto rendimiento a PostgreSQL 16.

### 3. Justificación Técnica
* **Cumplimiento Académico Estricto:** Satisface al 100% el requerimiento de diversidad de lenguajes planteado por el docente.
* **Especialización por Capas:**
  * **Frontend (TypeScript/React):** Gran ecosistema de componentes UI, reactividad con WebSockets para la bandeja de aprobaciones en vivo y tipado estricto en la interfaz.
  * **Backend (Python/FastAPI):** Estándar de la industria en microservicios y gobernanza de IA. Proporciona alto rendimiento asíncrono (`async`/`await`), tipado nativo con *type hints* y generación automática de contratos OpenAPI sin esfuerzo manual.
* **Integración sin Fricción:** Al exponer una API REST estándar con especificación OpenAPI, el equipo de frontend puede generar clientes tipados o consumir los endpoints directamente con la documentación interactiva de Swagger.

---

## ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026

### 1. Contexto y Problema
Al coexistir dos ecosistemas de ejecución diferentes (Node.js/pnpm para el frontend y Python para el backend), se requiere una estructura de carpetas que aísle sus dependencias y herramientas (`node_modules` vs `.venv`) manteniendo un único repositorio Git centralizado.

### 2. Decisión Tomada
Se adoptó una estructura monorepo modular claramente delimitada:
```text
AgentGuard/
├── backend/              # API REST (FastAPI + Pydantic + SQLAlchemy + Alembic) [Python 3.12+]
│   ├── alembic/          # Historial de migraciones y versionado de base de datos
│   ├── app/              # Código fuente (core, api, models, schemas, services)
│   ├── requirements.txt  # Dependencias de Python
│   └── alembic.ini       # Configuración de migraciones Alembic
├── frontend/             # Dashboard Web SPA (React + Vite + TypeScript) [pnpm]
│   ├── src/              # Código fuente de componentes y vistas
│   └── package.json      # Dependencias del frontend
├── agent-demo/           # Script cliente autónomo del Agente para la demo [Python]
├── diagramas/            # Archivos vectoriales de respaldo de Draw.io (*.drawio)
├── scripts/              # Utilidades de mantenimiento, regeneración y seeds
├── pnpm-workspace.yaml   # Configuración de workspaces de pnpm para el frontend
├── package.json          # Root scripts coordinados
└── *.md                  # Suite de documentación, guías de defensa y reglas
```

### 3. Asignación por Paquete
* **`backend/`:** Agustín Belardinelli (PO / Motor PDP) & Jonathan Araujo (Gateway PEP / Persistencia / Alembic).
* **`frontend/`:** Juan Martín Battiato (SM / Integración) & Mateo Ortega (Diseño UI/UX / Componentes).
* **`agent-demo/`:** Script de ejecución para la demostración en vivo ante el tribunal.

---

## ADR-003: Supresión de MCP y Estandarización en Protocolo HTTP REST Puro

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026

### 1. Decisión Tomada
Se eliminó MCP (*Model Context Protocol*) de toda la arquitectura de AgentGuard. La plataforma opera **100% sobre llamadas HTTP REST estándar**:
* El agente de IA propone una acción y ejecuta un `POST /api/gateway/execute` enviando un payload JSON a la API REST de FastAPI.
* Si la política autoriza (`ALLOW`), el Gateway reenvía la petición mediante una llamada HTTP REST estándar (JSON) hacia la API de destino (ej. CRM, Stripe, API interna).
* Si la política deniega (`DENY`), el Gateway corta la conexión y devuelve HTTP `403 Forbidden`.

---

## ADR-004: Modelo Relacional Multi-Tenant con Identificadores UUID v4 e Índices JSONB en PostgreSQL

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026

### 1. Decisión Tomada
La persistencia de datos utiliza **PostgreSQL 16** bajo un esquema compartido con discriminador de tenant (`organization_id`), claves primarias basadas en **UUID v4** y almacenamiento de predicados lógicos y contextos de sesión en columnas **`JSONB`** indexadas mediante **GIN**.

### 2. Justificación Técnica
* Previene ataques IDOR (*Insecure Direct Object References*).
* Permite generación descentralizada de identificadores de ejecución sin bloqueos de secuencias.
* Permite consultas de alta velocidad sobre predicados contextuales heterogéneos sin requerir antipatrones EAV (*Entity-Attribute-Value*).

---

## ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026
* **Decisores:** Equipo de Desarrollo (Jonathan Araujo / Agustín Belardinelli)

### 1. Contexto y Problema
Un sistema de base de datos relacional de 12 tablas multi-tenant en evolución requiere un mecanismo formal, reproducible y trazable para gestionar cambios de esquema (DDL). Modificar tablas manualmente con scripts sueltos genera discrepancias entre entornos locales y pérdida de trazabilidad en Git.

### 2. Decisión Tomada
Se adoptó **Alembic** como la tecnología oficial de **versionado y migraciones de base de datos** para PostgreSQL.

### 3. Justificación Técnica
1. **Estándar Oficial de SQLAlchemy:** Alembic es la herramienta de migraciones por defecto en el ecosistema Python / SQLAlchemy.
2. **Trazabilidad en Git:** Cada cambio de esquema se guarda en un archivo de migración versionado con timestamp y hash único en `backend/alembic/versions/` (ej. `001_initial_schema.py`).
3. **Reversibilidad y Determinismo:** Toda migración cuenta con métodos bidireccionales obligatorios: `upgrade()` (aplica cambios) y `downgrade()` (revierte cambios de forma segura).
4. **Tabla de Control `alembic_version`:** PostgreSQL mantiene una tabla interna que registra con exactitud la última versión de esquema aplicada, garantizando que todo el equipo trabaje sobre la misma base de datos.
5. **Autogeneración:** Permite detectar discrepancias entre los modelos declarativos de Python y el estado real de la base de datos mediante `alembic revision --autogenerate`.

---

## ADR-006: Protocolo HITL Asíncrono con Bóveda Cifrada en Redis Vault (Fernet TTL 15m)

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Noviembre 2026
* **Decisores:** Equipo de Desarrollo (Jonathan Araujo / Agustín Belardinelli)

### 1. Contexto y Problema
El flujo de aprobación humana (HITL) bajo la decisión `REQUIRE_APPROVAL` no puede suspender indefinidamente la corrutina HTTP del agente sin provocar bloqueos de hilos, timeouts en balanceadores de carga y consumo excesivo de sockets. A su vez, para cumplir con el estándar OWASP GenAI (LLM06 - Sensitive Information Disclosure), el contexto almacenado en PostgreSQL debe estar ofuscado (`***REDACTED***`). Sin embargo, al momento de que un aprobador humano autorice la acción, el Gateway necesita los parámetros originales íntegros para despachar la llamada a la herramienta externa.

### 2. Decisión Tomada
1. Responder `HTTP 202 Accepted` de forma asíncrona, creando el registro de ejecución y el ticket en la tabla `approvals` con estado `PENDING`.
2. Custodiar los parámetros originales sin rediseñar en una **bóveda volátil cifrada en Redis (`RedisVault`)** utilizando clave simétrica AES-128-CBC (`Fernet`) bajo la clave `hitl:payload:{approval_id}` con tiempo de vida estricto (**TTL de 900 segundos / 15 minutos**).
3. En la resolución (`POST /api/v1/approvals/{id}/resolve`):
   - Adquirir bloqueo pesimista `with_for_update()` sobre la fila del ticket.
   - Si se aprueba, recuperar y consumir atómicamente el payload original desde Redis (`GETDEL`).
   - Despachar a la herramienta y persistir la respuesta real en la columna `response_payload JSONB` de `executions`.

---

## ADR-007: Pipeline PEP con Inspección Heurística Temprana OWASP 2026 y Latencia Forense Real

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Noviembre 2026
* **Decisores:** Jonathan Araujo (Backend Architecture & Gateway)

### 1. Contexto y Problema
Si un atacante invoca el Gateway PEP con un vector malicioso (ej. SQL Injection destructivo o Prompt Injection) hacia una herramienta no asociada al agente (`AgentTool`), un descarte temprano por falta de capacidad ocultaba el intento de ataque, evitando que el SIEM y el centro de operaciones registraran la alerta crítica. Asimismo, la latencia de las ejecuciones se reportaba con un valor estático simulado.

### 2. Decisión Tomada
1. Evaluar el motor heurístico `ThreatDetector` (estándar OWASP Top 10 for Agentic Applications 2026) **antes** de verificar el acoplamiento agente-herramienta.
2. Si se detecta un vector hostil (`threat.is_threat == True`), el Gateway **SIEMPRE emite `DENY`**, persiste la traza forense y genera de forma obligatoria una `Alert` con severidad `CRITICAL`.
3. Medir la latencia real de ejecución mediante reloj monotónico de precisión (`time.perf_counter()`) y persistirla formalmente en la columna `executions.latency_ms` (FLOAT).

---

## ADR-008: Trazabilidad Administrativa Inmutable WORM con AuditService y Consulta Multi-Tenant

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Noviembre 2026
* **Decisores:** Jonathan Araujo / Agustín Belardinelli

### 1. Contexto y Problema
La Regla 7 de `AGENTS.md` exige trazabilidad inmutable WORM (*Write Once, Read Many*) tanto para operaciones de runtime (`executions`) como para cambios de configuración administrativa (creación de políticas, resolución de aprobaciones, actualización de estados de alerta, etc.). La tabla `audit_events` existía en PostgreSQL pero carecía de servicio y endpoints de consumo.

### 2. Decisión Tomada
1. Implementar `AuditService` (`backend/app/services/audit_service.py`) con método `record_event()` para el sellado inmutable de eventos con metadatos JSONB (`idx_audit_events_metadata_gin`).
2. Exponer `GET /api/v1/audit-events` (`backend/app/api/audit_events.py`) acotado estrictamente por `organization_id` con paginación (`skip`, `limit`) y filtro por `event_type`.
3. Prohibir mutaciones o eliminaciones (`UPDATE`/`DELETE`) sobre `audit_events` para preservar la validez probatoria forense.
