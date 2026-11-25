---
layout: doc
aside: false
title: Modo Presentación, Defensa Académica y Código QR
description: Panel de proyección en vivo para la defensa ante el tribunal de Desarrollo Web (ITU — UNCuyo, 2026), generador QR HD, cronograma SCRUM y comandos de demo.
---

# 🎤 Modo Defensa Académica y Acceso Rápido para el Tribunal

Página diseñada para proyectar en el aula durante la defensa oral de **AgentGuard** ante la cátedra de **Desarrollo Web (ITU — Universidad Nacional de Cuyo, 2026)**. Desde aquí los docentes pueden escanear el código QR para navegar los **11 volúmenes SSOT** y los **27 diagramas 4K** desde su propio dispositivo, o el equipo puede descargar el QR en alta definición para incrustarlo directamente en la **Slide 12 (Cierre)** de Canva.

<QrShareCard />

---

## ⏱️ Reparto Oficial del Guion (~15 Minutos · 4 Integrantes SCRUM)

La exposición oral está cronometrada en **15 minutos exactos** a lo largo de las **12 diapositivas** oficiales. El guion completo palabra por palabra y el banco de preguntas de respaldo se encuentran en [07 · Presentación Oficial en Canva y Guion de Defensa](/volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA).

### Distribución por Integrante y Rol SCRUM

| Integrante | Rol SCRUM y Especialidad | Diapositivas | Tiempo Estimado | Ejes Técnicos de su Intervención |
| :--- | :--- | :---: | :---: | :--- |
| **Agustín Belardinelli** | **Product Owner & Backend Core (PDP)** | **Slides 1, 2, 3 y 5** | `~4 min` | Tesis del producto, riesgos **OWASP Agentic Top 10 2026** (`ASI01`–`ASI05`) & `LLM06`, axioma Zero Trust fuera del LLM y pipeline determinista **PEP + PDP 5D Fail-Closed**. |
| **Jonathan Araujo** | **Backend Architecture, Gateway PEP, DB & ACME** | **Slides 4, 6, 10 y 12** | `~4 min 30 s` | Stack políglota (**ADR-001 a ADR-009**), persistencia dual (**PostgreSQL 16 con 13 tablas y 6 migraciones Alembic + SQLite ACME con 7 tablas**), portal **ACME Corp (`:9000`)** con auto-onboarding del CEO y cierre con los **4 escenarios canónicos** (`Zero-Regression`). |
| **Juan Martín Battiato** | **Scrum Master & Frontend Core / HITL** | **Slides 7 y 8** | `~3 min` | Protocolo **HITL Asíncrono (`HTTP 202 Accepted`)**, **WebSockets Multi-Tenant** (`/api/v1/ws/{org_id}`), bloqueo pesimista `SELECT ... FOR UPDATE` con TTL de `900 s`, alta B2B (`register-org`), `SERVER_BOOT_ID` y matriz **RBAC de 5 roles**. |
| **Mateo Ortega** | **UI/UX Designer & Frontend / Consultante BI** | **Slides 9 y 11** | `~3 min 30 s` | Recorrido por las **9 vistas del Dashboard SPA** en React 19 (100% español en `labels.ts`, Modo Claro/Oscuro, `QuickSetupWizard`, `PlaygroundView` real) y demo en vivo del **Copiloto "Consultante BI"** con **Google Gemini 3.8 Flash**, torta SVG y filtro visual seguro. |

### Hoja de Ruta Cronometrada (Slides 1 a 12)

| Slide | Minuto | Orador | Título de la Diapositiva | Apoyo Visual / Demo |
| :---: | :---: | :--- | :--- | :--- |
| **1** | `00:00 – 00:45` | **Agustín Belardinelli** | Portada: Gobernanza Zero Trust en Runtime para Agentes de IA | Portada Canva + login en `http://localhost:5173/#auth` |
| **2** | `00:45 – 01:45` | **Agustín Belardinelli** | El Problema: Riesgos Críticos en Agentes Autónomos (OWASP 2026) | Vectores `ASI01`, `ASI03`, `ASI04`, `ASI05` y `LLM06` |
| **3** | `01:45 – 02:45` | **Agustín Belardinelli** | Propuesta de Valor y Paradigma Zero Trust Fuera del LLM | Separación Data Plane vs. Control Plane (17 routers) |
| **4** | `02:45 – 03:50` | **Jonathan Araujo** | Arquitectura Políglota Full-Stack (ADR-001 a ADR-009) | Capas React 19 / FastAPI / PG 16 / Redis 7 / ACME `:9000` |
| **5** | `03:50 – 05:00` | **Agustín Belardinelli** | Flujo Runtime: Interceptor PEP y Motor Determinista PDP 5D | Pipeline `POST /api/v1/gateway/execute` ([Volumen 03](/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST)) |
| **6** | `05:00 – 06:15` | **Jonathan Araujo** | Modelo de Datos Dual: PostgreSQL 16 (13 Tablas) + SQLite ACME (7) | Diagrama MER en [Galería 4K](/galeria-diagramas) y [Volumen 01](/volumenes/01_MER_RELACIONAL_Y_FISICO_DB) |
| **7** | `06:15 – 07:45` | **Juan Martín Battiato** | Protocolo HITL Asíncrono (`202`), WebSockets y Bloqueo Pesimista | Máquina de estados HITL ([Volumen 04](/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO)) + `ApprovalsView` |
| **8** | `07:45 – 09:15` | **Juan Martín Battiato** | Onboarding SaaS B2B, Sesiones Efímeras y Matriz RBAC | Alta `register-org`, `SERVER_BOOT_ID` y 5 roles ([Volumen 05](/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES)) |
| **9** | `09:15 – 10:45` | **Mateo Ortega** | Dashboard Web SPA: 9 Vistas en Español y Modo Claro/Oscuro | Navegación rápida por `http://localhost:5173` |
| **10** | `10:45 – 12:00` | **Jonathan Araujo** | Portal Empresarial ACME Corp (`:9000`) y Auto-Onboarding CEO | Badge verde AgentGuard + Inspector SQLite en `http://localhost:9000` |
| **11** | `12:00 – 13:30` | **Mateo Ortega** | Caso Estrella: Copiloto Consultante BI con Gemini 3.8 Flash | Pasos `BI-1` (`ALLOW`), `BI-2` (Torta SVG) y `BI-3` (`DENY delete_sales`) |
| **12** | `13:30 – 15:00` | **Jonathan Araujo** | 4 Escenarios Canónicos, Calidad Zero-Regression y Conclusión | Ejecución `run_demo.py --all` / HITL en vivo + QR del portal |

---

## 🔗 Enlaces Oficiales de la Cátedra y Gestión del Proyecto

| Recurso Oficial | Enlace Directo Verificado | Identificador / Detalle |
| :--- | :--- | :--- |
| 🎨 **Presentación Oficial en Canva (12 Slides)** | [**https://canva.link/59p7pjdurhxr1vk**](https://canva.link/59p7pjdurhxr1vk) | Diseño `16:9` en español (`design_id: DAHbl5SRXbM`) |
| 📋 **Tablero Trello SCRUM Oficial** | [**https://trello.com/b/2Ay99TRz/agentguard-tablero-scrum-itu-2026**](https://trello.com/b/2Ay99TRz/agentguard-tablero-scrum-itu-2026) | Gestión ágil de sprints, backlog y entregables (ITU 2026) |
| 💻 **Repositorio Oficial en GitHub** | [**https://github.com/jmbatiatto/AgentGuard**](https://github.com/jmbatiatto/AgentGuard) | Monorepositorio rama `main` (`Zero-Regression Verified`) |
| 🌐 **Portal Documental Web (GitHub Pages)** | [**https://jmbatiatto.github.io/AgentGuard/**](https://jmbatiatto.github.io/AgentGuard/) | Despliegue continuo vía `.github/workflows/deploy-docs.yml` |

---

## 🚀 Comandos Rápidos y Credenciales para la Demo en Vivo

### 1. Lanzadores Oficiales en Windows (ejecutar desde la raíz del repositorio)

```powershell
# 1. Levantar infraestructura Docker (PG 16 :5433 + Redis 7 :6379), Alembic (001-006),
#    Backend FastAPI (:8000) y Dashboard SPA (:5173/#auth) en arranque limpio:
.\start_all.bat

# 2. Levantar Portal Empresarial ACME Corp (:9000) + SQLite (7 tablas) +
#    Auto-Onboarding automático del CEO Lucas Duck + Consultante BI (Gemini 3.8 Flash):
acme-corp\start_acme.bat

# 3. Levantar este Portal Documental VitePress en vista previa local (:4173):
.\start_docs.bat
# (Usar ".\start_docs.bat --rebuild" si se actualizaron archivos en documentación final/)

# 4. (Opcional) Ejecutar los 4 escenarios canónicos desde el demostrador CLI:
backend\.venv\Scripts\python.exe agent-demo\run_demo.py --all

# 5. Detener ordenadamente procesos y contenedores al finalizar:
.\stop_all.bat
```

### 2. Puertos Locales Activos Durante la Demostración

| Servicio | URL Local | Verificación Rápida |
| :--- | :--- | :--- |
| **Dashboard Control Plane SPA** | `http://localhost:5173/#auth` | Login con un clic para los 5 roles RBAC o alta B2B |
| **Backend API REST + Gateway PEP/PDP** | `http://localhost:8000/health` | Retorna `status: "healthy"`, estado PG/Redis y `boot_id` |
| **Portal Cliente ACME Corp + Consultante BI** | `http://localhost:9000` | Badge **"Vinculado con AgentGuard"** + 15 ventas SQLite |
| **Portal Interactivo de Documentación** | `http://localhost:4173` | Inicio, [Galería 4K](/galeria-diagramas) y [Índice Maestro](/volumenes/INDICE_MAESTRO) |

### 3. Credenciales Operativas (`Acme Corp` — Contraseña Uniforme: `demo-password`)

::: info Inicio de Sesión con Un Clic en `AuthView`
Tras el auto-onboarding de `acme-corp\start_acme.bat` (o al iniciar con `-SeedAcme` / `-Reset`), las cuentas canónicas de `Acme Corp` están listas para usar en `http://localhost:5173/#auth`:
:::

| Rol RBAC | Correo Electrónico | Contraseña | Uso Principal Durante la Defensa en Vivo |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** *(Principal)* | `admin@acmecorp.com` | `demo-password` | Control total del tenant, políticas PDP, agentes, herramientas, usuarios, API Keys y *Factory Reset* demo. |
| **`APPROVER`** *(HITL)* | `approver@acmecorp.com` | `demo-password` | Aprobar o rechazar en vivo reembolsos retenidos (`HTTP 202 Accepted`) desde `ApprovalsView` (Escenario 3). |
| **`OPERATOR`** | `operator@acmecorp.com` | `demo-password` | Simular payloads `dry_run=True` y vectores OWASP 2026 en `PlaygroundView` + triage de alertas. |
| **`AUDITOR`** | `auditor@acmecorp.com` | `demo-password` | Inspeccionar trazas sanitizadas (`LLM06`) con `latency_ms` real en `TracesView` y eventos `audit_events`. |
| **`VIEWER`** | `viewer@acmecorp.com` | `demo-password` | Consulta ejecutiva de KPIs y catálogo en modo estricto de solo lectura. |
