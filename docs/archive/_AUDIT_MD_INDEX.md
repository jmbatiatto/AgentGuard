# `_AUDIT_MD_INDEX.md` — Auditoría, Mapa de Contradicciones y Propuesta de Poda Documental

> **Alcance de la auditoría:** Inventario completo de documentación Markdown (`.md`) en `c:\Users\jonat\Downloads\Codigos\AgentGuard` sobre rama `main` (`HEAD` `597d3d97f7ce04d057c30e8a1179451bdf9896b9`), contrastado contra el reporte AST de Graphify (`graphify-out/GRAPH_REPORT.md`, commit `b7646228`, 182 archivos) y verificación directa del código fuente (`backend/`, `frontend/`, `agent-demo/`, `backend/alembic/versions/`).
>
> **Cifras globales auditadas** (ignorando `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `target/`, `__pycache__/`, `.venv/`, `venv/`):
> - **Total de archivos `.md` reales:** **191**
> - **Inventariados individualmente (fuera de logs históricos):** **39** (`12` en raíz, `5` en `.agents/` raíz/rules/workflows, `1` en `.github/`, `6` en `audit_reports/`, `5` en `backend/`, `1` en `frontend/`, `1` en `agent-demo/`, `1` en `docs/`, `1` en `.pytest_cache/`, `6` en `graphify-out/`)
> - **Agrupados como Logs históricos de ejecución (`.agents/teamwork/*/`):** **152 `.md`** distribuidos en **33 subcarpetas**
> - **Duplicaciones principales detectadas:** **7** grupos principales (**D1–D7**)
> - **Contradicciones clave detectadas:** **12** (**C1–C12**)

---

## Índice

1. [Inventario Completo de Archivos Markdown (`.md`)](#1-inventario-completo-de-archivos-markdown-md)
   - [1.1 Árbol Documental del Repositorio](#11-árbol-documental-del-repositorio)
   - [1.2 Inventario Individual (39 archivos `.md`)](#12-inventario-individual-39-archivos-md)
   - [1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`)](#13-bloque-aparte-logs-históricos-de-ejecución-agentsteamwork)
   - [1.4 Artefactos No-Markdown Relacionados](#14-artefactos-no-markdown-relacionados)
2. [Mapa de Duplicaciones y Contradicciones](#2-mapa-de-duplicaciones-y-contradicciones)
   - [2.1 Mapa de Duplicaciones Principales (7 grupos)](#21-mapa-de-duplicaciones-principales-7-grupos)
   - [2.2 Mapa de Contradicciones (Doc vs. Doc y Doc vs. Código/Graphify)](#22-mapa-de-contradicciones-doc-vs-doc-y-doc-vs-códigographify)
3. [Propuesta de Poda y Estructura Oficial Recomendada](#3-propuesta-de-poda-y-estructura-oficial-recomendada)

---

## 1. Inventario Completo de Archivos Markdown (`.md`)

### 1.1 Árbol Documental del Repositorio

```text
AgentGuard/
├── AGENTS.md                                                    [Regla/Workflow de Agentes]
├── CLAUDE.md                                                    [Regla/Workflow de Agentes]
├── DECISIONS.md                                                 [Arquitectura/Datos]
├── INFORME_MOCKUPS_FRONT_BACK.md                                [Handoff/Estado]
├── README.md                                                    [Spec Funcional]
├── agentguard_arquitectura_runtime.md                           [Arquitectura/Datos]
├── agentguard_casos_de_uso.md                                   [Spec Funcional]
├── agentguard_er_conceptual_chen.md                             [Arquitectura/Datos]
├── agentguard_estados_ciclo_vida.md                             [Arquitectura/Datos]
├── agentguard_mer_relacional.md                                 [Arquitectura/Datos]
├── agentguard_secuencia_demo.md                                 [Spec Funcional]
├── guia_simple_proyecto_agentguard.md                           [Spec Funcional]
├── .agents/
│   ├── rules/graphify.md                                        [Regla/Workflow de Agentes]
│   ├── workflows/graphify.md                                    [Regla/Workflow de Agentes]
│   └── teamwork/
│       ├── BRIEFING.md                                          [Handoff/Estado]
│       ├── ORIGINAL_REQUEST.md                                  [Spec Funcional]
│       ├── handoff.md                                           [Handoff/Estado]
│       └── <33 subcarpetas históricas>/ (152 .md)               [Logs históricos agrupados]
├── .github/
│   └── copilot-instructions.md                                  [Regla/Workflow de Agentes]
├── .pytest_cache/
│   └── README.md                                                [Duplicado/Obsoleto]
├── agent-demo/
│   └── README.md                                                [Spec Funcional]
├── audit_reports/
│   ├── 01_AUDITORIA_GAP_DOCUMENTACION.md                        [Handoff/Estado]
│   ├── 02_ESTADO_FRONTEND_ALMA_MATER.md                         [Handoff/Estado]
│   ├── 03_ESTADO_BACKEND_PENDIENTES.md                          [Handoff/Estado]
│   ├── 04_INVENTARIO_LIMPIEZA_ARCHIVOS_HUERFANOS.md             [Handoff/Estado]
│   ├── 05_PREGUNTAS_CLAVE_USUARIO.md                            [Handoff/Estado]
│   └── 06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md   [Arquitectura/Datos]
├── backend/
│   ├── .pytest_cache/README.md                                  [Duplicado/Obsoleto]
│   ├── README.md                                                [Arquitectura/Datos]
│   ├── desglose_de_pasos_semana_1_base_de_datos_y_setup_inicial.md [Spec Funcional]
│   ├── desglose_de_pasos_semana_2_api_rest_de_gestion.md        [Spec Funcional]
│   └── desglose_de_pasos_semana_3_gateway_interceptor_y_pdp.md  [Spec Funcional]
├── docs/
│   └── PROPUESTAS_MEJORAS_FRONTEND.md                           [Spec Funcional]
├── frontend/
│   └── README.md                                                [Arquitectura/Datos]
└── graphify-out/
    ├── GRAPH_REPORT.md                                          [Arquitectura/Datos]
    └── 2026-10-22..2026-11-03/GRAPH_REPORT.md (5 archivos)      [Duplicado/Obsoleto]
```

---

### 1.2 Inventario Individual (39 archivos `.md`)

#### Raíz del repositorio (12 archivos)

| Ruta | Categoría | Resumen en 1 línea | Estado |
| :--- | :--- | :--- | :--- |
| [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md) | Regla/Workflow de Agentes | Constitución operativa del proyecto: identidad, stack, SDD, 9 reglas de seguridad/UI, comandos Windows, Lean Teamwork v2 y protocolo de verificación. | **Vigente** |
| [README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/README.md) | Spec Funcional | Portada del proyecto con problema OWASP, modelo 5D, índice a diagramas `.drawio`/`.md`, 4 escenarios demo, stack, Quickstart y estructura monorepo. | **Contradictorio con código real y `agent-demo/README.md`** (promete PG RLS, Redis Policy Cache y `agent-demo/` en Python; presenta typo "Batiatto"). |
| [DECISIONS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/DECISIONS.md) | Arquitectura/Datos | Registro de 5 ADRs (`ADR-001` a `ADR-005`): stack políglota, monorepo, eliminación de MCP a favor de REST, multitenancy en esquema compartido y Alembic. | **Contradictorio con código real y `agent-demo/README.md`** (`ADR-002` marca `agent-demo/` como `[Python]`; `ADR-003` cita `POST /api/gateway/execute` sin `/v1/`). |
| [CLAUDE.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/CLAUDE.md) | Regla/Workflow de Agentes | Instrucciones de sesión para Claude Code sobre consulta/actualización de Graphify, uso exclusivo de `start_all.bat`/`stop_all.bat` y protocolo de saludo. | **Redundante** (subconjunto casi literal de [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md) y [.github/copilot-instructions.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.github/copilot-instructions.md)). |
| [INFORME_MOCKUPS_FRONT_BACK.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/INFORME_MOCKUPS_FRONT_BACK.md) | Handoff/Estado | Auditoría detallada (2-nov) que mapeó 45 endpoints vs. mockups de React, reveló fallbacks silenciosos en `api.ts`, `latency_ms=21.5` y trazó Plan Fases 1–5. | **Redundante y desfasado (pre-implementación)** — Fases 1–5 ya ejecutadas en commits `50aa557`..`597d3d9`; solapa parcialmente con `audit_reports/` y `handoff.md`. |
| [guia_simple_proyecto_agentguard.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/guia_simple_proyecto_agentguard.md) | Spec Funcional | Explicación pedagógica del proyecto y plan hasta el 30-nov-2026 con analogía de juguetería, 4 vistas UI y Acto 1/Acto 2 de la demo. | **Redundante y contradictorio con código real/`DECISIONS.md`** (cita rutas sin `/v1/`, `PostgreSQL/SQLite`, `Node.js o Python`, y está duplicado en `.html`/`.pdf` en raíz). |
| [agentguard_arquitectura_runtime.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_arquitectura_runtime.md) | Arquitectura/Datos | Guía de defensa oral de la arquitectura PEP/PDP RFC 2904 en 5 capas (Gateway, PDP+Redis, PG RLS+GIN, HITL+WS, Audit Service asíncrono). | **Contradictorio con código real** (promete Redis Policy Cache activo en PDP, PostgreSQL RLS, `Audit Service` off-path asíncrono y resúmenes que no reflejan los fallos reales del código). |
| [agentguard_casos_de_uso.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_casos_de_uso.md) | Spec Funcional | Guía de defensa del diagrama UML de casos de uso (`UC01`–`UC10`) con actores humanos, Agente IA y API destino mapeados a `RF-01`..`RF-12`. | **Contradictorio con `audit_reports/01` y código** (`audit_reports/01` referencia un `CU-11` ausente aquí; los routers Admin no están protegidos de forma uniforme y `UC10` no distingue JWT vs `X-User-Id`). |
| [agentguard_er_conceptual_chen.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_er_conceptual_chen.md) | Arquitectura/Datos | Guía de defensa del DER conceptual Chen (11 entidades, cardinalidades y catálogo de atributos previos al pase a tablas). | **Redundante / Desfasado** respecto a las 13 tablas reales en PostgreSQL (omite `AUDIT_EVENT` y `API_KEY`, además de `organizations.settings` y `users.hashed_password`). |
| [agentguard_estados_ciclo_vida.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_estados_ciclo_vida.md) | Arquitectura/Datos | Guía de defensa de máquinas de estado UML para `Execution` (9 estados), `Approval` (`PENDING/APPROVED/REJECTED/EXPIRED`) y `Alert` (4 estados). | **Contradictorio con `agentguard_mer_relacional.md` y código real** (`enums.py` e inicial `001` solo tienen 3 estados en `Execution`; no existe long-polling `asyncio` bloqueante ni `UPDATE ... WHERE status='PENDING'` atómico). |
| [agentguard_mer_relacional.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_mer_relacional.md) | Arquitectura/Datos | Especificación física inicial de 12 tablas PostgreSQL 16 (UUID v4, JSONB+GIN, RLS y masking LLM06) para la defensa de arquitectura de datos. | **Contradictorio con código real y migraciones `001`–`005`** (omite tabla `api_keys` de `003`, `organizations.settings` de `004`, `hashed_password` de `005`, `latency_ms` de `002`, lista 3 `UserRole` en lugar de 5 y promete RLS inexistente). |
| [agentguard_secuencia_demo.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_secuencia_demo.md) | Spec Funcional | Guion paso a paso de los 4 escenarios core de la defensa en vivo sobre un único Agente de Ventas y Acme Corp. | **Contradictorio con código real y `docs/PROPUESTAS_MEJORAS_FRONTEND.md`** (cita endpoint `POST /execute`, long-polling que devuelve `200 OK` al agente tras aprobar en lugar de `202 Accepted`, y actualmente `resolve_approval` falla por `NameError`). |

#### Configuración de Agentes y GitHub (`.agents/` raíz/rules/workflows y `.github/`) — 6 archivos

| Ruta | Categoría | Resumen en 1 línea | Estado |
| :--- | :--- | :--- | :--- |
| [.agents/rules/graphify.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/rules/graphify.md) | Regla/Workflow de Agentes | Regla operativa para consultar `graphify-out/graph.json` antes de greps amplios y ejecutar `python -m graphify update .` al cierre de fase. | **Vigente** (referenciada explícitamente por [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md); en este host el paquete `graphify` no está instalado en Python 3.12). |
| [.agents/workflows/graphify.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/workflows/graphify.md) | Regla/Workflow de Agentes | Stub de workflow `/graphify` (10 líneas) con descripción genérica para invocar el skill `graphify`. | **Redundante** (duplica [.agents/rules/graphify.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/rules/graphify.md)). |
| [.agents/teamwork/ORIGINAL_REQUEST.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/teamwork/ORIGINAL_REQUEST.md) | Spec Funcional | Acumula los pedidos literales del usuario para Fase 1 (`INC-01`..`04`), Fase 2 (`INC-05`..`10`) y Fase 3 (`INC-11`..`13`). | **Redundante / Histórico** (fases completadas; referencia un `PLAN_IMPLEMENTACION_SINCRONIZACION.md` inexistente en el repo). |
| [.agents/teamwork/BRIEFING.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/teamwork/BRIEFING.md) | Handoff/Estado | Briefing maestro del Sentinel para la corrida de Fase 3 (`INC-11`..`INC-13`, erradicación de mock fallbacks, toasts, skeletons). | **Redundante / Histórico** (corrida concluida y reflejada en commits `50aa557`, `ddd77f1`, `5f9d06c`). |
| [.agents/teamwork/handoff.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/teamwork/handoff.md) | Handoff/Estado | Acta consolidada del Sentinel certificando `VICTORY CONFIRMED` para Fases 1, 2 y 3 (`INC-01` a `INC-13`). | **Desfasado respecto a `HEAD`** (cierra en Fase 3 el 3-nov; no cubre Fase 4 JWT ni Fase 5 Webhooks SIEM / Simulate / WorkspaceSwitcher). |
| [.github/copilot-instructions.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.github/copilot-instructions.md) | Regla/Workflow de Agentes | Copia casi exacta de `CLAUDE.md` adaptada a GitHub Copilot (Graphify, `start_all.bat`/`stop_all.bat`, Saludo Imperial). | **Redundante** (duplica [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md) y [CLAUDE.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/CLAUDE.md)). |

#### Reportes de Auditoría Previos (`audit_reports/`) — 6 archivos (todos generados el 30-oct-2026)

| Ruta | Categoría | Resumen en 1 línea | Estado |
| :--- | :--- | :--- | :--- |
| [audit_reports/01_AUDITORIA_GAP_DOCUMENTACION.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/01_AUDITORIA_GAP_DOCUMENTACION.md) | Handoff/Estado | Diagnóstico del 30-oct identificando 18 brechas (`GAP-01`..`GAP-18`) y 5 contradicciones internas entre documentación y código base. | **Parcialmente desfasado** (gaps como JWT, `api_keys`, `audit_events`, `analytics` y `labels.ts` se cerraron en Fases 1–5; otros como RLS, Redis PDP y `agent-demo/` persisten). |
| [audit_reports/02_ESTADO_FRONTEND_ALMA_MATER.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/02_ESTADO_FRONTEND_ALMA_MATER.md) | Handoff/Estado | Auditoría del frontend React previa a Fases 1–5: bugs WebSocket en `TracesView`, `data.length > 0` fallbacks, Spanglish y tabs huecos. | **Desfasado en gran parte** (fallbacks silenciosos, idioma, auth y Settings tabs 2/4/5 ya implementados; persisten 0 tests frontend y `activeOrgId` parcialmente desconectado). |
| [audit_reports/03_ESTADO_BACKEND_PENDIENTES.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/03_ESTADO_BACKEND_PENDIENTES.md) | Handoff/Estado | Auditoría backend del 30-oct con `MissingGreenlet`, endpoints sin auth, `_dispatch_to_tool` falso éxito, HITL `***REDACTED***`, TOCTOU y tests con `AsyncMock`. | **Parcialmente vigente / desfasado** (`selectinload` corrigió `MissingGreenlet` en varios servicios y `auth.py`/`deps.py` existen, pero persisten `_dispatch_to_tool` simulado, HITL `***REDACTED***`, falta de auth en 10 routers y bypass `return None` en `deps.py`). |
| [audit_reports/04_INVENTARIO_LIMPIEZA_ARCHIVOS_HUERFANOS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/04_INVENTARIO_LIMPIEZA_ARCHIVOS_HUERFANOS.md) | Handoff/Estado | Inventario de archivos huérfanos/muertos, scripts duplicados `start_dev.bat`/`stop_dev.bat` y dependencias Python no usadas en el backend. | **Mayormente vigente** (confirmado en disco que `App.css`, `hero.png`, `react.svg`, `vite.svg`, `mockData.ts`, `start_dev.bat`, `stop_dev.bat`, `guia_simple*.html`, `scripts/generate_diagrams.py`, `psycopg2-binary`, `python-jose` y `passlib` siguen presentes). |
| [audit_reports/05_PREGUNTAS_CLAVE_USUARIO.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/05_PREGUNTAS_CLAVE_USUARIO.md) | Handoff/Estado | Cuestionario de 14 decisiones de producto y seguridad (Auth, HITL 202 vs long-polling, Redis/RLS, WORM vs `retention_days`, `agent-demo/`). | **Parcialmente resuelto** (Auth JWT, `audit_events`, SIEM webhooks y Playground Sandbox se implementaron; quedan abiertos HITL vault, RLS/Redis real, `agent-demo/` y WORM vs retención). |
| [audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md) | Arquitectura/Datos | Propuesta de refactoring profundo a Arquitectura Hexagonal backend, Feature-Sliced frontend (`TanStack Query`, `Vitest`, `Playwright`) y patrones GoF. | **Solo en papel / Descartado por SDD** (propone reemplazo arquitectónico no aprobado y excede el alcance SDD en [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md)). |

#### Backend (`backend/`) — 5 archivos

| Ruta | Categoría | Resumen en 1 línea | Estado |
| :--- | :--- | :--- | :--- |
| [backend/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/README.md) | Arquitectura/Datos | Resumen de arquitectura por capas FastAPI, lista de endpoints y pruebas unitarias del backend (creado el 19-oct). | **Contradictorio con código real** (lista `/api/v1/traces` cuando la ruta real es `/api/v1/executions`, y omite `auth`, `analytics`, `api-keys`, `audit-events`, `gateway/simulate`, `demo`). |
| [backend/desglose_de_pasos_semana_1_base_de_datos_y_setup_inicial.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/desglose_de_pasos_semana_1_base_de_datos_y_setup_inicial.md) | Spec Funcional | Plan detallado Semana 1: Docker Compose, PostgreSQL, modelos SQLAlchemy 2.0, Alembic y endpoint `/health`. | **Contradictorio con código real / Obsoleto** (documenta puerto PG `5432` vs `5433` actual, rol `SECURITY_OFFICER` ausente en `enums.py` y payload `/health` `{"status": "ok", "version": "1.0.0"}` vs `"healthy"/"degraded"`). |
| [backend/desglose_de_pasos_semana_2_api_rest_de_gestion.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/desglose_de_pasos_semana_2_api_rest_de_gestion.md) | Spec Funcional | Plan detallado Semana 2: routers CRUD de gestión (orgs, users, tools, actions, agents, policies), validadores y 69 tests iniciales. | **Histórico / Desfasado** (describe sprint inicial previo a granularidad `policy_rules`, `api_keys`, `audit_events`, `analytics` y JWT `auth`). |
| [backend/desglose_de_pasos_semana_3_gateway_interceptor_y_pdp.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/desglose_de_pasos_semana_3_gateway_interceptor_y_pdp.md) | Spec Funcional | Plan detallado Semana 3: PEP Interceptor, PDP engine, Sanitizer LLM06, HITL Approvals, WebSockets y suite de 4 escenarios demo. | **Contradictorio con `pdp_engine.py`** (especifica soporte PDP para operadores `neq` y `contains`, inexistentes en `pdp_engine.py`, y un total histórico de 100 tests). |
| [backend/.pytest_cache/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/.pytest_cache/README.md) | Duplicado/Obsoleto | Archivo de caché autogenerado por `pytest`. | **Duplicado/Obsoleto** (idéntico a `.pytest_cache/README.md`). |

#### Frontend, Demo, Docs, Cache y Graphify (`frontend/`, `agent-demo/`, `docs/`, `.pytest_cache/`, `graphify-out/`) — 10 archivos

| Ruta | Categoría | Resumen en 1 línea | Estado |
| :--- | :--- | :--- | :--- |
| [frontend/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/README.md) | Arquitectura/Datos | Guía de inicio del frontend React 19 + Vite + Tailwind CSS v4 enumerando 4 vistas iniciales (`Resumen`, `Agentes`, `Políticas`, `Trazas`). | **Desfasado / Redundante** (la app real tiene 9 vistas en `frontend/src/views/` incluyendo `AuthView`, `ToolsView`, `ApprovalsView`, `PlaygroundView` y `SettingsView`). |
| [agent-demo/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agent-demo/README.md) | Spec Funcional | Describe el simulador de agente corporativo como un módulo `Node.js / TypeScript` con los 4 escenarios demo. | **Contradictorio con `README.md`/`DECISIONS.md` y código** (`README.md` y `DECISIONS.md` definen `[Python]`, mientras la carpeta solo contiene este README y 0 código). |
| [docs/PROPUESTAS_MEJORAS_FRONTEND.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/docs/PROPUESTAS_MEJORAS_FRONTEND.md) | Spec Funcional | Propuesta de "Presenter Tour / Live Demo Runner" paso a paso dentro del `PlaygroundView`. | **Contradictorio con `agentguard_secuencia_demo.md` y no implementado** (usa `customer-support-agent` en paso 2 y reembolso `$8,500` en paso 3 frente a `$4,500` sobre `sales-agent` de la spec core). |
| [.pytest_cache/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.pytest_cache/README.md) | Duplicado/Obsoleto | Archivo de caché autogenerado por `pytest` en raíz. | **Duplicado/Obsoleto** (artefacto de ejecución efímero). |
| [graphify-out/GRAPH_REPORT.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/graphify-out/GRAPH_REPORT.md) | Arquitectura/Datos | Reporte AST vigente de Graphify (3-nov, commit `b7646228`): 182 archivos, 2.146 nodos, 5.809 aristas, 107 comunidades, 0 ciclos y Top-10 God Nodes. | **Vigente pero 4 commits detrás de `HEAD`** (falta ejecutar `graphify update` para incluir `f1e4f59`..`597d3d9`: `webhook_service`, `simulate`, `switchOrganization`). |
| `graphify-out/2026-10-22/GRAPH_REPORT.md` | Duplicado/Obsoleto | Snapshot histórico del reporte Graphify al commit `211f917e`. | **Redundante / Obsoleto** (reemplazado por `graphify-out/GRAPH_REPORT.md`). |
| `graphify-out/2026-10-23/GRAPH_REPORT.md` | Duplicado/Obsoleto | Snapshot histórico del reporte Graphify al commit `fec15723`. | **Redundante / Obsoleto** (reemplazado por `graphify-out/GRAPH_REPORT.md`). |
| `graphify-out/2026-11-01/GRAPH_REPORT.md` | Duplicado/Obsoleto | Snapshot histórico del reporte Graphify al commit `dfd73597`. | **Redundante / Obsoleto** (reemplazado por `graphify-out/GRAPH_REPORT.md`). |
| `graphify-out/2026-11-02/GRAPH_REPORT.md` | Duplicado/Obsoleto | Snapshot histórico del reporte Graphify al commit `6126601f`. | **Redundante / Obsoleto** (reemplazado por `graphify-out/GRAPH_REPORT.md`). |
| `graphify-out/2026-11-03/GRAPH_REPORT.md` | Duplicado/Obsoleto | Snapshot histórico del reporte Graphify al commit `960f38ad`. | **Redundante / Obsoleto** (reemplazado por `graphify-out/GRAPH_REPORT.md`). |

---

### 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`)

Excluidos de lectura línea a línea por regla de economía de tokens. Contienen **152 archivos `.md`** repartidos en **33 subcarpetas** generadas durante la orquestación de las Fases 1, 2 y 3 (2–3 de noviembre de 2026). Todas siguen plantillas estándar (`BRIEFING.md`, `DISPATCH.md`, `handoff.md`, `progress.md`, más `context.md`/`report_*.md`/`GATE_STATUS.md`/`PROJECT.md`/`SCOPE.md` según rol):

| Patrón de Subcarpeta | Cant. Carpetas | Cant. `.md` | Carpetas Exactas | Categoría y Rol Histórico |
| :--- | :---: | :---: | :--- | :--- |
| `interviewer` | 1 | 1 | `interviewer` (`prompt_draft.md`) | **Duplicado/Obsoleto** — Borrador inicial de prompt de entrevista para `/teamwork`. |
| `explorer_*` | 6 | 30 | `explorer_be_1`, `explorer_contracts_1`, `explorer_fe_1`, `explorer_p1_be_rules_1`, `explorer_p1_fe_1`, `explorer_p1_latency_hier_1` | **Duplicado/Obsoleto** — Relevamientos exploratorios puntuales previos a la ejecución de Fases 1–2. |
| `orchestrator_*` | 3 | 20 | `orchestrator_1` (6), `orchestrator_2` (7), `orchestrator_3` (7) | **Duplicado/Obsoleto** — Planes, gates (`GATE_STATUS.md`) y handoffs de coordinación por fase. |
| `worker_*` | 13 | 58 | `worker_1`, `worker_inc01_1`..`worker_inc04_1` (4 c/u), `worker_inc05_1`..`worker_inc10_1` (5 c/u), `worker_p3_api_toast_1`, `worker_p3_views_1` (4 c/u) | **Duplicado/Obsoleto** — Bitácoras de ejecución atómica de incrementos `INC-01`..`INC-13`. |
| `auditor_*` | 2 | 8 | `auditor_1`, `auditor_p3_1` | **Duplicado/Obsoleto** — Auditorías intermedias internas de workers. |
| `reviewer_*` | 2 | 8 | `reviewer_1`, `reviewer_2` | **Duplicado/Obsoleto** — Revisiones intermedias (práctica luego prohibida por Lean Teamwork v2 en `AGENTS.md`). |
| `victory_auditor_*` | 6 | 27 | `victory_auditor_1`, `victory_auditor_p1_1`, `victory_auditor_p2_1` (5), `victory_auditor_sentinel_1`, `victory_auditor_sentinel_2` (5), `victory_auditor_sentinel_3` (5) | **Duplicado/Obsoleto** — Actas finales de auditoría Sentinel por fase. |
| **Subtotal** | **33** | **152** | — | **100% logs históricos cerrados (Fases 1–3).** |

> **Nota de integridad referencial:** [.agents/teamwork/ORIGINAL_REQUEST.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/.agents/teamwork/ORIGINAL_REQUEST.md) referencia explícitamente el archivo `PLAN_IMPLEMENTACION_SINCRONIZACION.md`, el cual **no existe** en ninguna ruta del repositorio.

---

### 1.4 Artefactos No-Markdown Relacionados

| Ruta | Tipo | Relación con los `.md` | Estado |
| :--- | :--- | :--- | :--- |
| [AgentGuard_Propuesta_Desarrollo_Web_v2.pdf](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AgentGuard_Propuesta_Desarrollo_Web_v2.pdf) | PDF (12 pág., 6-sep) | Documento fundacional SaaS B2B (`RF-01`..`RF-12`, Sprints 0–6). Aún enfocado en **MCP + OAuth 2.1**. | **Histórico / Contradictorio con ADR-003**. |
| `guia_simple_proyecto_agentguard.html` | HTML en raíz | Exportación directa de `guia_simple_proyecto_agentguard.md`. | **Duplicado redundante** (flaggeado en `audit_reports/04`). |
| `guia_simple_proyecto_agentguard.pdf` | PDF en raíz | Exportación directa de `guia_simple_proyecto_agentguard.md`. | **Duplicado redundante**. |
| `.cursor/rules/graphify.mdc` | Regla Cursor | Repite `.agents/rules/graphify.md` para Cursor IDE. | **Redundante operativo** (solo si se usa Cursor). |
| `.cursor/rules/local_dev_orchestration.mdc` | Regla Cursor | Repite regla de `start_all.bat`/`stop_all.bat` de `AGENTS.md`. | **Redundante operativo** (solo si se usa Cursor). |
| `docs/diagrams/*.drawio` (referenciados) | Diagramas UML/MER | Referenciados por [README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/README.md) junto a los 6 archivos `agentguard_*.md`. | **Material visual de cátedra**. |

---

## 2. Mapa de Duplicaciones y Contradicciones

### 2.1 Mapa de Duplicaciones Principales (7 grupos)

Se identificaron **7 núcleos de duplicación** donde múltiples documentos repiten el mismo conocimiento o artefacto con distinto nivel de actualización:

1. **D1 — Instrucciones y reglas para agentes IA (5 `.md` + 2 `.mdc`):**
   - **Archivos:** `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.agents/rules/graphify.md`, `.agents/workflows/graphify.md`, `.cursor/rules/graphify.mdc`, `.cursor/rules/local_dev_orchestration.mdc`.
   - **Qué duplican:** Directiva de consultar `graphify-out/graph.json` antes de greps amplios, ejecutar `python -m graphify update .` al cierre, prohibición de levantar servidores persistentes (`start_all.bat`/`stop_all.bat`) y el protocolo del saludo imperial (`¡Viva el emperador Jonathan Araujo!`).
2. **D2 — Reportes del grafo AST Graphify (6 `.md`):**
   - **Archivos:** `graphify-out/GRAPH_REPORT.md` + `graphify-out/{2026-10-22,2026-10-23,2026-11-01,2026-11-02,2026-11-03}/GRAPH_REPORT.md`.
   - **Qué duplican:** Snapshots completos sucesivos de la misma estructura AST (comunidades, god nodes, aristas) que quedan obsoletos con cada actualización.
3. **D3 — Narrativa introductoria y guion de los escenarios de demo (5 `.md` + 2 exportaciones):**
   - **Archivos:** `README.md`, `guia_simple_proyecto_agentguard.md` (+ `.html` y `.pdf`), `agentguard_secuencia_demo.md`, `agent-demo/README.md`, `docs/PROPUESTAS_MEJORAS_FRONTEND.md`.
   - **Qué duplican:** Explicación funcional de AgentGuard, actores y secuencia de los 4 casos demo (cotización, cambio de precio, reembolso HITL, exfiltración), introduciendo además variantes divergentes en montos y agentes.
4. **D4 — Auditorías de estado e informes de brechas front/back (10 `.md`):**
   - **Archivos:** `audit_reports/01`..`06`, `INFORME_MOCKUPS_FRONT_BACK.md`, `.agents/teamwork/{ORIGINAL_REQUEST.md,BRIEFING.md,handoff.md}`.
   - **Qué duplican:** Diagnósticos sucesivos (30-oct, 2-nov, 3-nov) sobre endpoints no consumidos, fallbacks en `api.ts`, ausencia de auth, `latency_ms` hardcodeado y falta de localización en español. La mayoría de los hallazgos ya fueron implementados entre el 2 y el 3 de noviembre, dejando los informes antiguos como ruido contradictorio frente al código actual.
5. **D5 — Especificación de stack, arquitectura y plan de implementación backend (7 `.md`):**
   - **Archivos:** `README.md`, `DECISIONS.md`, `agentguard_arquitectura_runtime.md`, `agentguard_mer_relacional.md`, `backend/README.md`, `backend/desglose_de_pasos_semana_1..3*.md`.
   - **Qué duplican:** Listados de tecnologías (FastAPI, SQLAlchemy 2.0, PostgreSQL 16, Redis 7, React 19, Vite, Tailwind), diagrama lógico PEP/PDP y tablas del MER, con discrepancias acumuladas por cambios posteriores.
6. **D6 — Bitácoras históricas multi-agente en `.agents/teamwork/*/` (152 `.md` en 33 subcarpetas):**
   - **Archivos:** `explorer_*`, `orchestrator_*`, `worker_*`, `auditor_*`, `reviewer_*`, `victory_auditor_*`, `interviewer`.
   - **Qué duplican:** Briefings, despachos, contextos y handoffs redundantes por incremento (`INC-01`..`INC-13`) cuyo resultado ya vive consolidado en `.agents/teamwork/handoff.md` y en el historial de Git.
7. **D7 — Boilerplate autogenerado de pytest (2 `.md`):**
   - **Archivos:** `.pytest_cache/README.md` y `backend/.pytest_cache/README.md`.
   - **Qué duplican:** Texto estándar autogenerado por `pytest` en caché local.

---

### 2.2 Mapa de Contradicciones (Doc vs. Doc y Doc vs. Código/Graphify)

| ID | Eje de Conflicto | Qué dicen los Docs / Planes | Qué muestra el Código / Otros Docs | Impacto |
| :--- | :--- | :--- | :--- | :--- |
| **C1** | **Modelo de Negocio (PaaS Superadmin vs. SaaS B2B)** | Referencia solicitada a `superadmin PaaS vs admin empresa cliente` y flujo en `pocos clics`. | Búsqueda en todo `.md`, `.py`, `.ts`, `.tsx` arroja **0 coincidencias** para `superadmin`, `platform_admin` o `paas`. `AgentGuard_Propuesta_Desarrollo_Web_v2.pdf`, `README.md`, `AGENTS.md` y `enums.py` definen un **SaaS B2B** con roles acotados al tenant (`Organization`); además `GET/POST /api/v1/organizations` carece de auth y `switchOrganization` permite al usuario frontend cambiar de tenant desde el sidebar. | Crítico (definición de producto y aislamiento multi-tenant). |
| **C2** | **Stack y existencia real de `agent-demo/`** | `README.md` y `DECISIONS.md` (`ADR-002`) listan `agent-demo/` como `[Python]`; `guia_simple` dice `Node.js o Python`; `agent-demo/README.md` afirma `Node.js / TypeScript`. | El directorio `agent-demo/` contiene **únicamente `README.md`** y **0 archivos de código** (ni Python ni Node.js). | Alto (entregable de demo externo inexistente). |
| **C3** | **Protocolo MCP vs. REST puro** | `AgentGuard_Propuesta_Desarrollo_Web_v2.pdf` plantea un Gateway MCP con OAuth 2.1. | `DECISIONS.md` (`ADR-003`) y `guia_simple` eliminan MCP y adoptan 100% HTTP REST. Sin embargo, `backend/app/schemas/tool.py` y `frontend/src/views/ToolsView.tsx` (selector `<option value="gRPC">` y `<option value="MCP">`) siguen exponiendo `MCP` y `gRPC` sin implementación runtime en `_dispatch_to_tool`. | Medio (deuda conceptual/UI). |
| **C4** | **Rutas HTTP reales vs. documentadas** | `agentguard_secuencia_demo.md` usa `/execute`; `DECISIONS.md` y `guia_simple` usan `/api/gateway/execute` y `/api/traces`; `backend/README.md` usa `/api/v1/traces`. | Todos los routers FastAPI montan bajo `/api/v1/` ([api/__init__.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/__init__.py) y [main.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/main.py)): `/api/v1/gateway/execute`, `/api/v1/gateway/simulate`, `/api/v1/gateway/attacks` y `/api/v1/executions` (`/traces` no existe). | Medio (confusión de integradores/demo). |
| **C5** | **Roles (`UserRole`), Estados (`ExecutionStatus`) y Tablas (11 vs 12 vs 13)** | `agentguard_mer_relacional.md` lista 12 tablas y 3 roles (`ADMIN`, `OPERATOR`, `APPROVER`); `desglose_...semana_1` añade `SECURITY_OFFICER`; `agentguard_er_conceptual_chen.md` define 11 entidades; `agentguard_estados_ciclo_vida.md` define **9 estados** de `Execution`. | La BD real (migraciones `001`–`005`) tiene **13 tablas** (sumando `api_keys` en `003`), columna `settings` en `organizations` (`004`) y `hashed_password` en `users` (`005`). [enums.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/models/enums.py) y [domain.ts](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/types/domain.ts) definen **5 roles** (`ADMIN, OPERATOR, APPROVER, AUDITOR, VIEWER` — sin `SECURITY_OFFICER`) y **solo 3 estados** en `ExecutionStatus` (`PENDING_APPROVAL, REJECTED, EXECUTED`). | Alto (contrato de datos y defensa oral). |
| **C6** | **Puerto de PostgreSQL (`5432` vs. `5433`)** | `backend/desglose_de_pasos_semana_1_...md` documenta puerto expuesto `5432:5432`. | `docker-compose.yml`, `backend/alembic.ini`, `backend/.env.example` y `backend/app/core/config.py` configuran el puerto **`5433`** para evitar colisión con Postgres local en Windows. | Bajo/Operativo (fallo de conexión si se sigue el doc viejo). |
| **C7** | **Protocolo HITL (`200` long-polling vs. `202` asíncrono) + bug activo** | `agentguard_estados_ciclo_vida.md` y `agentguard_secuencia_demo.md` describen un gateway que retiene la conexión HTTP del agente vía `asyncio` long-polling y le responde `200 OK` al aprobar. | [gateway.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/api/gateway.py) devuelve inmediatamente **`202 Accepted`** en `REQUIRE_APPROVAL` sin long-polling. Además, en `HEAD` actual, `resolve_approval()` en [pep_gateway_service.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pep_gateway_service.py#L561-L661) contiene bloques huérfanos pegados de `execute()` (`if alert and not request.dry_run:` / `if request.dry_run:`) que disparan **`NameError`** en runtime al resolver o expirar una aprobación, y reenvía `request_context` ya sanitizado (`"***REDACTED***"`). | **Crítico** (bloqueante real en flujo HITL). |
| **C8** | **Escenarios Demo (4 vs. 5) y datos de prueba divergentes** | `README.md`, `AGENTS.md` y `agentguard_secuencia_demo.md` fijan **4 escenarios** (`create_quote` \$2500, `update_price` \$10, `refund` \$4500, `export_customers` `attacker.io`). | `docs/PROPUESTAS_MEJORAS_FRONTEND.md` usa `customer-support-agent` en paso 2 y reembolso **`$8,500`** en paso 3; `PlaygroundView`, `gateway.py (/attacks)` y `audit_reports` añaden un 5.º escenario destructivo (`database.drop` / OWASP ASI01–ASI05). | Medio (inconsistencia en demos y tests). |
| **C9** | **Capacidades arquitectónicas prometidas vs. implementadas** | Los docs de arquitectura prometen: caché de políticas en Redis en PDP, Row-Level Security (RLS) en PG, logging off-path asíncrono, operadores `neq`/`contains`/`allowed_hours` en PDP y autenticación de API Keys en Gateway. | En código real: [pdp_engine.py](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/app/services/pdp_engine.py) consulta siempre PostgreSQL (Redis solo recibe `ping` en `/health` y `delete` de claves nunca escritas desde `policy_rule_service.py`); no existe `ROW LEVEL SECURITY` en Alembic `001`–`005`; `pdp_engine.py` no soporta `neq`, `contains` ni `allowed_hours`; `api_key_service.verify_api_key()` no tiene ningún llamador en `gateway.py` ni en producción. | **Crítico** (brecha de seguridad y arquitectura). |
| **C10** | **Desfase temporal de auditorías e informes previos** | `audit_reports/01..06` (30-oct), `INFORME_MOCKUPS_FRONT_BACK.md` (2-nov) y `frontend/README.md` (8-oct) reportan ausencia de JWT, `api_keys`, `audit_events`, `analytics`, `latency_ms`, `labels.ts`, manejo de `ApiError`, toasts y solo 4 vistas React. | Entre el 2 y 3-nov (Fases 1–5, commits `50aa557`..`597d3d9`) se implementaron las 5 fases: 9 vistas React, `labels.ts`, `ToastContext`, `Skeleton`/`EmptyState`, `latency_ms`, `audit_events`, `analytics`, `api_keys`, `organizations.settings`, JWT `/api/v1/auth/*`, `/gateway/simulate` y webhooks SIEM. | Alto (ruido documental que induce a re-implementar lo ya hecho). |
| **C11** | **Inmutabilidad WORM vs. `retention_days` y `UC10` vs. `CU-11`** | `AGENTS.md` §2.7 prohíbe alterar o borrar trazas (`WORM`); `audit_reports/01` menciona `CU-11` para gestión UI de alertas. | `OrganizationSettings` ([SettingsView.tsx](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/views/SettingsView.tsx) y migración `004`) expone `retention_days` configurable (sin job de purga); `agentguard_casos_de_uso.md` termina en `UC10` y `App.tsx` no posee una vista dedicada de Alertas (solo badges/overview). | Bajo/Medio (ambigüedad funcional). |
| **C12** | **Grafo Graphify desactualizado respecto a `HEAD`** | `graphify-out/GRAPH_REPORT.md` se presenta como mapa AST completo del repo (3-nov, `b7646228`). | Existen **4 commits posteriores** (`f1e4f59`, `1d04e25`, `b9591ad`, `597d3d9`) con código nuevo (`webhook_service.py`, `/gateway/simulate`, `switchOrganization`, puerto PG `5433`) no reflejados en el reporte actual ni instalados en el Python del entorno actual. | Medio (lectura parcial del codebase vía grafo). |

---

## 3. Propuesta de Poda y Estructura Oficial Recomendada

> [!CAUTION]
> Este índice **no modifica ni elimina ningún archivo**. La tabla siguiente define el plan recomendado para que el equipo ejecute la limpieza de forma segura en un PR posterior.

| Acción | Archivos / Carpetas Afectados | Justificación Técnica |
| :--- | :--- | :--- |
| **ELIMINAR** (basura, duplicados exactos y exportaciones redundantes) | • `guia_simple_proyecto_agentguard.html` y `guia_simple_proyecto_agentguard.pdf`<br>• `.pytest_cache/README.md` y `backend/.pytest_cache/README.md` (asegurar `.pytest_cache/` en `.gitignore`)<br>• `graphify-out/2026-10-22/` .. `graphify-out/2026-11-03/` (5 snapshots viejos)<br>• Huérfanos de template/entorno aún presentes en disco (auditados en `audit_reports/04`): `start_dev.bat`, `stop_dev.bat`, `frontend/src/App.css`, `frontend/src/data/mockData.ts`, `frontend/src/assets/{hero.png,react.svg,vite.svg}` | Eliminan artefactos autogenerados, copias derivadas de la guía simple y código muerto de Vite que generan falsos positivos al buscar símbolos. |
| **ARCHIVAR** en `docs/archive/` (trazabilidad académica e histórica sin contaminar la raíz) | • `.agents/teamwork/` completo (3 archivos raíz + 33 subcarpetas / 152 `.md` de bitácoras Fases 1–3)<br>• `audit_reports/01`..`06`<br>• `INFORME_MOCKUPS_FRONT_BACK.md`<br>• `backend/desglose_de_pasos_semana_{1,2,3}*.md`<br>• `docs/PROPUESTAS_MEJORAS_FRONTEND.md`<br>• `AgentGuard_Propuesta_Desarrollo_Web_v2.pdf`<br>• `guia_simple_proyecto_agentguard.md` | Conserva el historial de auditorías, sprints iniciales y propuesta fundacional de la cátedra fuera del plano operativo activo para evitar que humanos o agentes lean planes viejos como specs actuales. |
| **CONSOLIDAR** (reducir duplicación D1 y D5) | • **Instrucciones de agentes (`D1`):** Dejar [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md) como única fuente normativa y reducir `CLAUDE.md`, `.github/copilot-instructions.md` y `.cursor/rules/*.mdc` a punteros breves (3–5 líneas) hacia `AGENTS.md` y `.agents/rules/graphify.md`. Eliminar `.agents/workflows/graphify.md` si no agrega lógica al skill.<br>• **Specs técnicas de raíz (`agentguard_*.md`):** Mover a `docs/architecture/` actualizando cardinalidades (13 tablas, 5 roles, `5433`, HITL `202`, estado real de Redis/RLS). | Evita divergencias entre asistentes IA (Claude, Copilot, Cursor, Antigravity) y separa la guía académica de diagramas de la portada del repositorio. |
| **MANTENER Y ACTUALIZAR** como SSOT oficial | • [README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/README.md) (corregir estado de `agent-demo/`, Redis/RLS y apellido Battiato)<br>• [AGENTS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/AGENTS.md)<br>• [DECISIONS.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/DECISIONS.md) (agregar ADRs faltantes: Auth JWT, HITL `202` vs long-polling, puerto `5433`, eliminación de MCP en UI `ToolsView`)<br>• [backend/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/README.md) y [frontend/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/README.md) (sincronizar rutas `/api/v1/executions`, 9 vistas y lista real de routers)<br>• [agent-demo/README.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agent-demo/README.md) (definir stack único acordado e implementar o retirar)<br>• [graphify-out/GRAPH_REPORT.md](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/graphify-out/GRAPH_REPORT.md) (regenerar contra `HEAD`) | Garantiza un árbol mínimo, navegable y 100% alineado entre documentación y código antes de la entrega final. |

