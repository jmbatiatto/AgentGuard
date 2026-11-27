---
layout: doc
aside: false
title: Kit de Presentación, Video Demo y Código QR
description: Centro de proyección en vivo para presentaciones ejecutivas y técnicas de AgentGuard, con el Video Demo Oficial (68s), generador QR HD, hoja de ruta del equipo y comandos de demo.
---

# Kit de Presentación, Video Demo y Código QR

Centro operativo diseñado para presentaciones en vivo, sesiones de due-diligence técnico y demostraciones ante audiencia. Reproducí el **Video Demo Oficial (68s)** directamente desde el portal, proyectá el **código QR de alto contraste** para que el público abra la plataforma desde su celular, o accedé en un clic a las credenciales y comandos de arranque local.

<ProductReelPlayer :compact="true" />

<QrShareCard />

---

## Hoja de Ruta de Presentación en Vivo (~15 Minutos · 4 Integrantes)

La demostración completa está estructurada en **15 minutos** cubriendo arquitectura, seguridad runtime OWASP 2026, protocolo HITL en vivo y el Copiloto **Consultante BI** con Handshake Universal Multi-LLM. El guion extendido y el banco de preguntas técnicas están disponibles en [07 · Guion de Presentación y Respuestas Técnicas](/volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA).

### Distribución por Especialidad del Equipo

| Integrante | Rol y Especialidad | Bloques | Tiempo Estimado | Ejes Técnicos de su Intervención |
| :--- | :--- | :---: | :---: | :--- |
| **Agustín Belardinelli** | **Product Owner & Backend Core (PDP)** | **Bloques 1, 2, 3 y 5** | `~4 min` | Tesis del producto, riesgos **OWASP Agentic Top 10 2026** (`ASI01`–`ASI05`) & `LLM06`, axioma Zero Trust fuera del LLM y pipeline determinista **PEP + PDP 5D Fail-Closed**. |
| **Jonathan Araujo** | **Backend Architecture, Gateway PEP, DB & ACME** | **Bloques 4, 6, 10 y 12** | `~4 min 30 s` | Stack políglota (**ADR-001 a ADR-009**), persistencia dual (**PostgreSQL 16 con 13 tablas, 6 migraciones Alembic y Redis 7 + SQLite ACME con 7 tablas**), portal **ACME Corp (`:9000`)** y cierre con los **4 escenarios canónicos** (`Zero-Regression`). |
| **Juan Martín Battiato** | **Scrum Master & Frontend Core / HITL** | **Bloques 7 y 8** | `~3 min` | Protocolo **HITL Asíncrono (`HTTP 202 Accepted`)**, **WebSockets Multi-Tenant** (`/api/v1/ws/{org_id}`), bloqueo pesimista `SELECT ... FOR UPDATE` con TTL de `900 s`, alta B2B (`register-org`), `SERVER_BOOT_ID` y matriz **RBAC de 5 roles**. |
| **Mateo Ortega** | **UI/UX Designer & Frontend / Consultante BI** | **Bloques 9 y 11** | `~3 min 30 s` | Recorrido por las **9 vistas del Dashboard SPA** en React 19 (100% español en `labels.ts`, Modo Claro/Oscuro, `QuickSetupWizard`, `PlaygroundView` real) y demo en vivo del **Copiloto "Consultante BI"** con **Handshake Multi-LLM (Gemini 2.5 Flash, OpenAI, Groq, Anthropic)**, caché Redis 7 y telemetría real. |

### Agenda Cronometrada (15 Minutos)

| Bloque | Minuto | Orador | Foco de la Demostración | Apoyo Visual / Demo |
| :---: | :---: | :--- | :--- | :--- |
| **1** | `00:00 – 00:45` | **Agustín Belardinelli** | Apertura: Gobernanza Zero Trust en Runtime para Agentes de IA | **Video Demo Oficial (68s)** + login en `http://localhost:5173/#auth` |
| **2** | `00:45 – 01:45` | **Agustín Belardinelli** | El Problema: Riesgos Críticos en Agentes Autónomos (OWASP 2026) | Vectores `ASI01`, `ASI03`, `ASI04`, `ASI05` y `LLM06` |
| **3** | `01:45 – 02:45` | **Agustín Belardinelli** | Propuesta de Valor y Paradigma Zero Trust Fuera del LLM | Separación Data Plane vs. Control Plane (17 routers) |
| **4** | `02:45 – 03:50` | **Jonathan Araujo** | Arquitectura Políglota Full-Stack (ADR-001 a ADR-009) | Capas React 19 / FastAPI / PG 16 / Redis 7 / ACME `:9000` |
| **5** | `03:50 – 05:00` | **Agustín Belardinelli** | Flujo Runtime: Interceptor PEP y Motor Determinista PDP 5D | Pipeline `POST /api/v1/gateway/execute` ([Volumen 03](/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST)) |
| **6** | `05:00 – 06:15` | **Jonathan Araujo** | Modelo de Datos Dual: PostgreSQL 16 (13 Tablas) + SQLite ACME (7) | Diagrama MER en [Galería 4K](/galeria-diagramas) y [Volumen 01](/volumenes/01_MER_RELACIONAL_Y_FISICO_DB) |
| **7** | `06:15 – 07:45` | **Juan Martín Battiato** | Protocolo HITL Asíncrono (`202`), WebSockets y Bloqueo Pesimista | Máquina de estados HITL ([Volumen 04](/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO)) + `ApprovalsView` |
| **8** | `07:45 – 09:15` | **Juan Martín Battiato** | Onboarding SaaS B2B, Sesiones Efímeras y Matriz RBAC | Alta `register-org`, `SERVER_BOOT_ID` y 5 roles ([Volumen 05](/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES)) |
| **9** | `09:15 – 10:45` | **Mateo Ortega** | Dashboard Web SPA: 9 Vistas en Español y Modo Claro/Oscuro | Navegación rápida por `http://localhost:5173` |
| **10** | `10:45 – 12:00` | **Jonathan Araujo** | Portal Empresarial ACME Corp (`:9000`) y Auto-Onboarding CEO | Badge verde AgentGuard + Inspector SQLite en `http://localhost:9000` |
| **11** | `12:00 – 13:30` | **Mateo Ortega** | Caso Estrella: Copiloto Consultante BI con Multi-LLM + Redis | Handshake `gemini-2.5-flash` + pasos `BI-1` (`ALLOW`), `BI-2` (Torta SVG) y `BI-3` (`DENY delete_sales`) |
| **12** | `13:30 – 15:00` | **Jonathan Araujo** | 4 Escenarios Canónicos, Calidad Zero-Regression y Cierre | Ejecución `run_demo.py --all` / HITL en vivo + QR del portal |

---

## Enlaces Oficiales del Proyecto

| Recurso Oficial | Enlace Directo Verificado | Identificador / Detalle |
| :--- | :--- | :--- |
| **Video Demo Oficial (68s)** | [**Ver AgentGuard Reel Oficial (Google Drive)**](https://drive.google.com/file/d/1MGKSaJY939cJWj5cr5Wl7op8VL1b91c5/view?usp=drivesdk) | Recorrido completo en 68 segundos: Gateway PEP/PDP, HITL en vivo y protección ACME Corp |
| **Portal Web Oficial en Vivo (Vercel)** | [**https://agentguard-docs-eight.vercel.app/**](https://agentguard-docs-eight.vercel.app/) | Plataforma interactiva de producto, Simulador PDP 5D, Galería 4K y 11 volúmenes SSOT |
| **Repositorio Oficial en GitHub** | [**https://github.com/jmbatiatto/AgentGuard**](https://github.com/jmbatiatto/AgentGuard) | Monorepositorio rama `main` (`Zero-Regression Verified`) |
| **Tablero Trello SCRUM Oficial** | [**https://trello.com/b/2Ay99TRz/agentguard-tablero-scrum-itu-2026**](https://trello.com/b/2Ay99TRz/agentguard-tablero-scrum-itu-2026) | Planificación de sprints, historias de usuario y entregables |

---

## Comandos Rápidos y Credenciales para la Demo en Vivo

### 1. Lanzadores Oficiales en Windows (ejecutar desde la raíz del repositorio con Docker Desktop activo)

```powershell
# 1. Levantar TODO el ecosistema unificado en un solo comando
#    (Docker PG 16/Redis 7 + Alembic + Backend :8000 + SPA :5173 + ACME Corp :9000 + Auto-Onboarding):
npm run start:all
# (equivalentes: pnpm start:all  |  .\start_ecosystem.bat)

# 2. Reinicio limpio completo (recrea esquema Alembic y datos demo de cero):
.\scripts\start-ecosystem.ps1 -Reset

# 3. Levantar este Portal Web VitePress en vista previa local (:4173):
.\start_docs.bat
# (Usar ".\start_docs.bat --rebuild" si se actualizaron archivos en documentación final/)

# 4. (Opcional) Ejecutar los 4 escenarios canónicos desde el demostrador CLI:
backend\.venv\Scripts\python.exe agent-demo\run_demo.py --all

# 5. Detener ordenadamente AgentGuard (:8000/:5173), ACME Corp (:9000) y Docker:
npm run stop:all
# (equivalentes: pnpm stop  |  .\stop_all.bat)
```

### 2. Puertos Locales Activos Durante la Demostración

| Servicio | URL Local | Verificación Rápida |
| :--- | :--- | :--- |
| **Dashboard Control Plane SPA** | `http://localhost:5173/#auth` | Login con un clic para los 5 roles RBAC o alta B2B |
| **Backend API REST + Gateway PEP/PDP** | `http://localhost:8000/health` | Retorna `status: "healthy"`, estado PG/Redis y `boot_id` |
| **Swagger UI (API AgentGuard / ACME)** | `http://localhost:8000/docs` | Esquema OpenAPI interactivo (`:9000/docs` para ACME Corp) |
| **Portal Cliente ACME Corp + Consultante BI** | `http://localhost:9000` | Badge **"Vinculado con AgentGuard"**, Handshake Multi-LLM y 15 ventas SQLite |
| **Portal Web Interactivo y Documentación** | `http://localhost:4173` | Inicio, [Instalación Local](/instalacion), [Galería 4K](/galeria-diagramas) e [Índice Maestro](/volumenes/INDICE_MAESTRO) |

### 3. Credenciales Operativas (`Acme Corp` — Contraseña Uniforme: `demo-password`)

::: info Inicio de Sesión con Un Clic en `AuthView`
Tras el auto-onboarding de `npm run start:all` (o al iniciar con `-SeedAcme` / `-Reset`), las cuentas canónicas de `Acme Corp` están listas para usar en `http://localhost:5173/#auth`:
:::

| Rol RBAC | Correo Electrónico | Contraseña | Uso Principal Durante la Demostración en Vivo |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** *(Principal)* | `admin@acmecorp.com` | `demo-password` | Control total del tenant, políticas PDP, agentes, herramientas, usuarios, API Keys y *Factory Reset* demo. |
| **`APPROVER`** *(HITL)* | `approver@acmecorp.com` | `demo-password` | Aprobar o rechazar en vivo reembolsos retenidos (`HTTP 202 Accepted`) desde `ApprovalsView` (Escenario 3). |
| **`OPERATOR`** | `operator@acmecorp.com` | `demo-password` | Simular payloads `dry_run=True` y vectores OWASP 2026 en `PlaygroundView` + triage de alertas. |
| **`AUDITOR`** | `auditor@acmecorp.com` | `demo-password` | Inspeccionar trazas sanitizadas (`LLM06`) con `latency_ms` real en `TracesView` y eventos `audit_events`. |
| **`VIEWER`** | `viewer@acmecorp.com` | `demo-password` | Consulta ejecutiva de KPIs y catálogo en modo estricto de solo lectura. |
