---
layout: doc
title: Instalación Local y Pruebas en Vivo
description: Guía completa para levantar AgentGuard y el ecosistema ACME Corp en local (PostgreSQL 16, Redis 7, FastAPI, React 19 y Handshake Universal Multi-LLM) y ejecutar los 4 escenarios canónicos.
---

# Instalación Local y Pruebas en Vivo

Levantá el entorno completo de **AgentGuard** y el portal satélite **ACME Corp** en tu máquina en menos de 2 minutos. El orquestador automatiza el inicio de contenedores Docker, aplica las 6 migraciones Alembic sobre PostgreSQL 16, crea los archivos `.env` desde sus plantillas y ejecuta el auto-onboarding de `Acme Corp` listo para probar los 4 escenarios canónicos y el Copiloto **Consultante BI**.

<LocalQuickstart :show-header="false" />

---

## Arquitectura de Servicios Locales

Al ejecutar `npm run start:all` (o `.\start_ecosystem.bat`), el orquestador levanta 5 servicios coordinados con aislamiento limpio entre la plataforma SaaS de gobernanza y el ERP cliente:

| Servicio | Stack Tecnológico | Dirección / Puerto | Rol y Verificación Rápida |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | `postgres:16-alpine` (Docker) | `localhost:5433` (contenedor `5432`) | Base transaccional `agentguard_db`: **13 tablas** con PKs `UUID v4` (`gen_random_uuid()`), **4 índices GIN** en `JSONB` y **6 migraciones Alembic** (`001`–`006`). |
| **Redis 7** | `redis:7-alpine` (Docker) | `localhost:6379` | Diagnóstico en `/health`, invalidación *best-effort* de reglas PDP (`policies:{org_id}:*`) y caché del catálogo de modelos Multi-LLM en ACME (`TTL 600 s`). |
| **Backend AgentGuard** | Python 3.12 + FastAPI + Uvicorn | `http://localhost:8000` | Control Plane (**17 routers** con blindaje anti-IA `403`), Data Plane PEP/PDP (`POST /api/v1/gateway/execute`), WebSockets (`/api/v1/ws/{org_id}`), `/health` y `/docs`. |
| **Control Plane SPA** | React 19 + TypeScript 5+ + Vite | `http://localhost:5173` | Dashboard operativo de **9 vistas** en español (`/#auth`), 5 roles RBAC, Playground `dry_run`, bandeja HITL en vivo y visor de trazas forenses sanitizadas (`LLM06`). |
| **Portal ACME Corp** | FastAPI + SQLite 3 + Multi-LLM | `http://localhost:9000` | ERP cliente satélite (**7 tablas SQLite**), auto-onboarding del CEO, APIs destino (`/crm`, `/stripe`, `/catalog`, `/db`, `/bi`) y Copiloto **Consultante BI**. |

---

## Configuración del Handshake Universal Multi-LLM en ACME Corp (`:9000`)

::: tip Pruebas inmediatas sin API Key externa
No necesitás ninguna suscripción ni clave paga para probar el sistema: ACME Corp (`http://localhost:9000`) incluye un **Modo Guiado** 100% operativo que dispara llamadas reales por el Gateway PEP/PDP de AgentGuard. Si querés probar razonamiento real con *Function Calling*, activá el **Handshake Universal Multi-LLM** en 30 segundos.
:::

El portal de **ACME Corp** soporta detección automática de proveedor y descubrimiento dinámico de modelos para **Google Gemini** (`gemini-2.5-flash` recomendado y `gemini-2.5-flash-lite`), **OpenAI**, **Groq** y **Anthropic**:

1. Abrí `http://localhost:9000` y ubicá el panel de configuración de IA en el encabezado.
2. Pegá tu API Key de **Google Gemini**, **OpenAI**, **Groq** o **Anthropic** (opcionalmente también podés declararla en `acme-corp/.env` como `GEMINI_API_KEY`).
3. Hacé clic en **`🤝 Conectar IA (Handshake)`**:
   - ACME Corp invoca `POST /api/agent/handshake`, detecta el proveedor a partir de la credencial, valida conectividad y recupera la lista de modelos compatibles.
   - El catálogo descubierto se almacena en **Redis 7** con un `TTL` de `600 s` para evitar latencia repetida entre recargas.
4. Verificá que el badge cambie a **`✓ IA Conectada`** junto al nombre del proveedor detectado y confirmá el modelo seleccionado (para Google Gemini se prioriza **`gemini-2.5-flash`**).
5. Ejecutá una pregunta en el Copiloto **Consultante BI** y revisá la **barra de telemetría real** al pie de cada respuesta: discrimina exactamente el tiempo consumido por el modelo LLM frente a la latencia de evaluación determinista del interceptor **AgentGuard PEP/PDP** (`latency_ms` medido con reloj monotónico `time.perf_counter()`).

---

## Recorrido Guiado de 5 Minutos (4 Escenarios Canónicos + Consultante BI)

Para iniciar sesión en el Dashboard (`http://localhost:5173/#auth`), todas las cuentas pre-sembradas de **`Acme Corp`** utilizan la contraseña `demo-password` y ofrecen acceso en un clic desde `AuthView`:

| Rol RBAC | Correo Electrónico | Contraseña | Uso en el Recorrido |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@acmecorp.com` | `demo-password` | Revisar políticas 5D, agentes, API Keys, métricas globales y *Factory Reset*. |
| **`APPROVER`** | `approver@acmecorp.com` | `demo-password` | Resolver en vivo tickets HITL retenidos (`HTTP 202 Accepted`) en `ApprovalsView`. |
| **`OPERATOR`** | `operator@acmecorp.com` | `demo-password` | Ejecutar simulaciones `dry_run=True` en `PlaygroundView` y gestionar alertas. |
| **`AUDITOR`** | `auditor@acmecorp.com` | `demo-password` | Inspeccionar trazas sanitizadas (`LLM06`) y eventos inmutables en `audit_events`. |
| **`VIEWER`** | `viewer@acmecorp.com` | `demo-password` | Consulta ejecutiva en modo estricto de solo lectura. |

### Paso a paso (5 minutos)

1. **Minuto 1 — Escenario 1 (`ALLOW` · `200 OK` · `create_quote`):**
   - Desde ACME Corp (`:9000`) o ejecutando el CLI demo, emití un presupuesto estándar dentro del umbral permitido.
   - Verificá en el Dashboard (`TracesView`) la ejecución `ALLOW` con `latency_ms` real y el registro persistido en la tabla `quotes` del inspector SQLite.
2. **Minuto 2 — Escenario 2 (`DENY` · `403 Forbidden` · `update_price`):**
   - Intentá modificar el precio de catálogo desde el agente comercial.
   - AgentGuard aplica el principio **Fail-Closed**, rechaza la acción antes de contactar a ACME Corp y deja evidencia inmutable de la regla aplicada.
3. **Minuto 3 — Escenario 3 (`REQUIRE_APPROVAL` · `202 Accepted` · `refund` HITL):**
   - Solicitá un reembolso en Stripe por un monto **≥ $500 USD**.
   - El Gateway retorna **`HTTP 202 Accepted`** sin bloquear hilos, crea el ticket `PENDING` con TTL de `900 s` y dispara una notificación en vivo vía WebSockets (`/api/v1/ws/{org_id}`).
   - Ingresá con `approver@acmecorp.com` en `ApprovalsView` y aprobá o rechazá el reembolso (ejecución atómica con bloqueo pesimista `SELECT ... FOR UPDATE`).
4. **Minuto 4 — Escenario 4 (`DENY + ALERT CRITICAL` · `export_customers`):**
   - Dispará la exportación masiva de clientes o un vector de inyección OWASP Agentic (`ASI01`–`ASI05`).
   - Confirmá el bloqueo inmediato, el enmascaramiento `LLM06` de secretos/PII en `request_context` y la alerta crítica generada en `AlertsView`.
5. **Minuto 5 — Copiloto Consultante BI (`http://localhost:9000`):**
   - Preguntá por ventas por categoría en **Modo Protegido (AgentGuard PEP)** para ver la respuesta con gráfica SVG (`ALLOW`), y luego intentá una acción destructiva (`delete_sales` / borrado de historial) comparando **Modo Protegido** frente a **Modo Directo (Sin Firewall)**.

### Verificación automatizada por consola (Zero-Regression)

```powershell
# Ejecutar los 4 escenarios canónicos vía CLI demostrador contra el Gateway local:
backend\.venv\Scripts\python.exe agent-demo\run_demo.py --all

# Correr la suite automatizada de regresión (4 escenarios obligatorios):
backend\.venv\Scripts\pytest.exe -q --tb=short --no-header backend/tests/test_gateway_scenarios.py
```

---

## Solución de Problemas Comunes en Windows

| Síntoma | Causa Probable | Resolución Exacta |
| :--- | :--- | :--- |
| **`Docker Desktop no está iniciado` o error al conectar al daemon** | El motor de Docker / WSL2 todavía no terminó de arrancar. | Abrí **Docker Desktop**, esperá a que el indicador muestre estado **Running**, validá `docker info` y relanzá `npm run start:all`. |
| **Error `address already in use` en puertos `5433`, `6379`, `8000`, `5173` o `9000`** | Quedó una instancia previa corriendo o un servicio local ocupa el puerto. | Ejecutá `npm run stop:all` (o `.\stop_all.bat`). Si el puerto sigue ocupado, identificá el PID con `netstat -ano \| findstr :8000` y cerralo antes de reintentar. |
| **Datos demo desfasados, tablas vacías o errores tras cambios de esquema** | Volumen de PostgreSQL o base SQLite de ACME con estado parcial de pruebas previas. | Ejecutá un reinicio limpio completo: `.\scripts\start-ecosystem.ps1 -Reset` (reaplica Alembic `001`–`006` y re-siembra `Acme Corp` de cero). |
| **El Dashboard cierra la sesión automáticamente tras reiniciar el backend** | Protección anti-sesiones huérfanas por `SERVER_BOOT_ID` (`AuthContext` valida `health.boot_id`). | Comportamiento esperado de seguridad. Volvé a iniciar sesión en `http://localhost:5173/#auth` (1 clic en la cuenta demo deseada). |
| **Timeout o cuota excedida durante el Handshake Multi-LLM** | La API Key del proveedor externo alcanzó su límite o el modelo seleccionado demoró en responder. | Seleccioná `gemini-2.5-flash-lite` desde el selector de ACME Corp, revisá tu cuota del proveedor o usá el **Modo Guiado** sin dependencias externas. |

---

### Recursos Relacionados

- [Simulador Interactivo PDP 5D en el Navegador](/#simulador-pdp) — Probá los 5 escenarios sin instalar nada.
- [Manual de Frontend SPA, Matriz RBAC y Credenciales](/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES) — Detalle completo de las 9 vistas y permisos.
- [Portal Empresarial ACME Corp y Consultante BI](/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO) — Arquitectura interna del ERP cliente y flujo Multi-LLM.
- [Kit de Presentación, Video Demo y Código QR](/modo-presentacion) — Video Demo Oficial (68s), QR HD y comandos rápidos.
