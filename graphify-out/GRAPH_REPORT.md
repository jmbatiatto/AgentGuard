# Graph Report - AgentGuard  (2026-11-24)

## Corpus Check
- 215 files · ~236,772 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .drawio 6, (none) 4, .example 4)

## Summary
- 2989 nodes · 7953 edges · 173 communities (106 shown, 67 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 859 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `521aa1ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_tools.py
- domain.ts
- .resolve_approval
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- sanitizer_service.py
- api/auth.py
- bootstrap_acme_in_agentguard
- 2. Documentación Exhaustiva de las 9 Vistas (`frontend/src/views/`)
- PolicyRule
- App.tsx
- frontend/package.json
- postgres
- GeminiAgentClient
- 3. Catálogo Detallado de Maquetas y Elementos Mockup
- test_tool_actions.py
- domain.ts
- asyncio
- test_agent_service_assign_tool
- Agent
- compilerOptions
- auth-ui.tsx
- PolicyService
- compilerOptions
- run_demo.py
- convert_docs_to_docx.py
- OrganizationSettings
- AcmeDatabase
- organizations.py
- websocket_manager.py
- make_admin_jwt
- list_audit_events
- ensure_same_tenant
- typing
- 🖼️ 3. Desglose Técnico Diapositiva por Diapositiva (Slides 1 a 12)
- AgentService
- .oxlintrc.json
- cli.py
- test_audit_events.py
- tsconfig.json
- api/analytics.py
- update_policy_rule
- User
- AgentTool
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- test_seed_data_fresh_creation
- 🗄️ AgentGuard — MER Relacional y Modelo Físico de Datos (Versión Final Verificada)
- ApiKey
- 3.2 Tablas
- _make_auth
- generate_diagrams.py
- alerts.py
- 06 — Portal ACME Corp, Asistente Consultante BI y Cliente Agent Demo
- agent_service.py
- AgentTool
- AuditEvent
- ToolActionService
- test_siem_webhook_test_ping_missing_url
- CLAUDE.md
- ensure_same_tenant
- copilot-instructions.md
- app.py
- UserService
- websocket.py
- Original User Request
- 001_initial_schema.py
- health_check
- PDPEngine
- 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA
- asyncio
- 002_add_latency_ms_to_executions.py
- typing
- AuthContext.tsx
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- package.json
- test_health.py
- approvals.py
- create_app
- app.js
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- cleanup_overrides
- scripts
- test_acme_server.py
- UUID
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- 3.5 Recarga Ansiosa Anti-`MissingGreenlet` (`selectinload` vía `get_by_id`)
- _AutoYieldOverrides
- _mock_user_auth
- env.py
- 1.2 Inventario Individual (39 archivos `.md`)
- 2. Reglas Innegociables de Seguridad, Dominio e Idioma
- SanitizerService
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- test_register_org_success_atomic_onboarding
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- ToolRead
- 4. Biblioteca / Diccionario completo de atributos reales (96 atributos)
- cleanup_overrides
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- 💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- 🌐 AgentGuard — Frontend (Dashboard Web SPA SaaS B2B)
- pnpm-workspace.yaml
- threat_detector.py
- create_api_key
- scripts
- App.tsx
- ToolService
- PolicyRead
- 1.1 Principio: *"Never trust the model as the enforcement point"*
- create_tool_action
- Colors
- 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA
- schemas/gateway.py
- _setup_user_auth
- 🧭 AgentGuard: Índice Maestro y Guía de Navegación del Sistema
- ApiError
- asyncio
- 4. Resumen de Brechas por Documento Auditado (14 Archivos)
- list_executions
- 04 — Secuencias de Demo, Máquinas de Estado y Casos de Uso UML
- load_config
- 005_add_hashed_password_to_users.py
- 006_add_must_change_password_to_users.py
- get_attack_catalog
- test_organization_settings.py
- 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)
- Organization
- temp_db
- parse_args
- cleanup_overrides
- test_threat_detector_base64_obfuscation
- test_threat_detector_data_exfiltration
- test_threat_detector_destructive_sql
- models/user.py

## God Nodes (most connected - your core abstractions)
1. `User` - 192 edges
2. `make_admin_jwt()` - 91 edges
3. `Organization` - 80 edges
4. `AgentTool` - 74 edges
5. `ToolAction` - 74 edges
6. `BaseSchema` - 72 edges
7. `Tool` - 70 edges
8. `Agent` - 64 edges
9. `Execution` - 55 edges
10. `AgentGuardApiClient` - 53 edges

## Surprising Connections (you probably didn't know these)
- `4.5. Modelo Gemini Deprecado (`gemini-2.5-flash`) vs. `gemini-3.8-flash` + Fallback `gemini-3.5-flash-lite`` --references--> `_build_generation_config()`  [INFERRED]
  documentación final/00_INFORME_DISCREPANCIAS_DOC_VS_CODIGO_REAL.md → acme-corp/agent/gemini_client.py
- `5.2. Sesiones Efímeras (`SERVER_BOOT_ID` + `/health.boot_id` + `sessionStorage`)` --references--> `decode_access_token()`  [INFERRED]
  documentación final/00_INFORME_DISCREPANCIAS_DOC_VS_CODIGO_REAL.md → backend/app/core/security.py
- `4.2 Estándares de Frontend (`TypeScript 6` / `React 19` / `Vite 8` / `pnpm`)` --references--> `ApiError`  [INFERRED]
  docs/archive/audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md → frontend/src/services/api.ts
- `2. Logic Chain` --references--> `ApiError`  [INFERRED]
  docs/archive/handoff.md → frontend/src/services/api.ts
- `INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`)` --references--> `ApiError`  [INFERRED]
  docs/archive/ORIGINAL_REQUEST.md → frontend/src/services/api.ts

## Import Cycles
- None detected.

## Communities (173 total, 67 thin omitted)

### Community 0 - "test_tools.py"
Cohesion: 0.09
Nodes (15): Tool, test_list_executions_endpoint(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), _setup_admin_auth(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found() (+7 more)

### Community 1 - "domain.ts"
Cohesion: 0.12
Nodes (8): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), 1.3 Arquitectura de Integración HTTP: `src/services/api.ts`, 3.1 `QuickSetupWizard.tsx` — Asistente de Configuración Rápida en 3 Pasos, AgentGuardApiClient, ApiError, extractApiError(), handleNetworkError(), UserMember

### Community 2 - ".resolve_approval"
Cohesion: 0.11
Nodes (10): PEPGatewayService, 3.1 Ciclo de Vida de `Execution.status` (`ExecutionStatus`), 3.2 Ciclo de Vida de `Approval.status` (`ApprovalStatus`), 3.3 Ciclo de Vida de `Alert.status` (`AlertStatus`), 3. Máquinas de Estado Reales (`stateDiagram-v2`), Slide 5 — `Flujo Runtime: Interceptor PEP y Motor Determinista PDP 5D`, Slide 7 — `Protocolo HITL Asíncrono (202), WebSockets y Bloqueo Pesimista`, 1. Contexto y Problema (+2 more)

### Community 3 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.11
Nodes (17): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`) (+9 more)

### Community 4 - "sanitizer_service.py"
Cohesion: 0.13
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 5 - "api/auth.py"
Cohesion: 0.04
Nodes (30): register(), register_organization(), reset_demo_data(), create_access_token(), get_password_hash(), clear_database(), ensure_canonical_demo_users(), _resolve_demo_org() (+22 more)

### Community 6 - "bootstrap_acme_in_agentguard"
Cohesion: 0.08
Nodes (19): bootstrap_acme_in_agentguard(), persist_api_key_to_env(), lifespan(), _auto_onboard_when_ready(), onboard_agentguard(), ensure_acme_onboarded_if_needed(), test_bootstrap_acme_in_agentguard_mocked(), mock_handler() (+11 more)

### Community 7 - "2. Documentación Exhaustiva de las 9 Vistas (`frontend/src/views/`)"
Cohesion: 0.07
Nodes (29): 05 — Manual Frontend SPA, Sistema RBAC y Guía de Credenciales, 1.1 Dependencias y Versiones Exactas (`frontend/package.json`), 1.2 Comandos y Scripts Canónicos, 1.5 Ciclo de Autenticación, Hidratación y Protección Fail-Closed: `AuthContext.tsx`, 1.6 Sistema de Diseño y Temas: `ThemeProvider.tsx` e `index.css`, 1.7 Localización Canónica 100% en Español: `src/constants/labels.ts`, 1.8 Conexión WebSocket en Tiempo Real: `useAgentGuardWebSocket.ts`, 1. Ficha Técnica del Stack Frontend y Arquitectura de Cliente (+21 more)

### Community 9 - "App.tsx"
Cohesion: 0.09
Nodes (32): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, EmptyStateAction, EmptyStateProps, DEFAULT_WIDTHS, Skeleton() (+24 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "GeminiAgentClient"
Cohesion: 0.07
Nodes (19): _build_generation_config(), discover_agentguard_context(), GeminiAgentClient, resolve_agent_id(), resolve_tool_id_for_action(), get_preset_by_id(), test_api_agent_run_endpoint(), test_discover_agentguard_context() (+11 more)

### Community 13 - "3. Catálogo Detallado de Maquetas y Elementos Mockup"
Cohesion: 0.05
Nodes (41): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+33 more)

### Community 14 - "test_tool_actions.py"
Cohesion: 0.16
Nodes (7): _setup_admin_auth(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_list_actions()

### Community 15 - "domain.ts"
Cohesion: 0.07
Nodes (46): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, QuickSetupWizardProps, AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_LABELS (+38 more)

### Community 16 - "asyncio"
Cohesion: 0.13
Nodes (11): _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), mock_refresh() (+3 more)

### Community 17 - "test_agent_service_assign_tool"
Cohesion: 0.33
Nodes (3): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh()

### Community 18 - "Agent"
Cohesion: 0.06
Nodes (26): Agent, GatewayExecuteRequest, _setup_admin_auth(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org(), test_api_create_agent_success() (+18 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (18): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+10 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "run_demo.py"
Cohesion: 0.14
Nodes (11): build_payload(), _configure_stdio(), _decision_color(), DemoConfig, DemoScenario, main(), _mask_api_key(), run_all_scenarios() (+3 more)

### Community 24 - "convert_docs_to_docx.py"
Cohesion: 0.20
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 26 - "AcmeDatabase"
Cohesion: 0.12
Nodes (8): AcmeDatabase, 6.1 Diagrama MER — ACME Corp (7 tablas), 6.2 Diccionario físico ACME (SQLite), 6.3 Datos semilla Looney Tunes (`SEED_*` en `database.py`), 6. Persistencia Externa ACME Corp (SQLite — `acme-corp/acme_corp.db`), 1.4 Inspector Relacional SQLite en Vivo (`acme-corp/server/database.py`), Catálogo Semilla de 15 Ventas Históricas Canónicas (`SEED_SALES`):, Simulación de Sabotaje y Purga Catastrófica (`drop_acme_database`):

### Community 27 - "organizations.py"
Cohesion: 0.07
Nodes (12): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization(), update_organization_settings(), OrganizationSettings (+4 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.08
Nodes (15): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect(), 🎨 1. Ficha Técnica y Enlace Oficial de la Presentación en Canva, 👥 2. Distribución de Roles SCRUM y Asignación de Diapositivas (~15 Minutos) (+7 more)

### Community 29 - "make_admin_jwt"
Cohesion: 0.05
Nodes (28): make_admin_jwt(), MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield() (+20 more)

### Community 30 - "list_audit_events"
Cohesion: 0.31
Nodes (3): get_audit_event(), list_audit_events(), AuditEventResponse

### Community 31 - "ensure_same_tenant"
Cohesion: 0.15
Nodes (9): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentRead (+1 more)

### Community 32 - "typing"
Cohesion: 0.06
Nodes (19): get_current_user(), require_admin_user(), create_policy_rule_in_policy(), decode_access_token(), _safe_hashpw(), ActorType, PolicyCreate, PolicyUpdate (+11 more)

### Community 33 - "🖼️ 3. Desglose Técnico Diapositiva por Diapositiva (Slides 1 a 12)"
Cohesion: 0.25
Nodes (8): 🖼️ 3. Desglose Técnico Diapositiva por Diapositiva (Slides 1 a 12), Slide 10 — `Portal Empresarial ACME Corp (:9000) y Auto-Onboarding CEO`, Slide 11 — `Caso Estrella: Copiloto Consultante BI con Gemini 3.8 Flash`, Slide 12 — `4 Escenarios Canónicos, Calidad Zero-Regression y Conclusión`, Slide 1 — Portada: `AgentGuard: Gobernanza Zero Trust en Runtime para Agentes de IA`, Slide 2 — `El Problema: Riesgos Críticos en Agentes Autónomos (OWASP 2026)`, Slide 3 — `Propuesta de Valor y Paradigma Zero Trust Fuera del LLM`, Slide 6 — `Modelo de Datos Dual: PostgreSQL 16 (13 Tablas) + SQLite ACME (7)`

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "cli.py"
Cohesion: 0.10
Nodes (6): display_presets_table(), main(), main_async(), print_banner(), main(), main()

### Community 38 - "test_audit_events.py"
Cohesion: 0.09
Nodes (14): AuditEvent, test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_get_audit_event_not_found(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success(), test_api_list_audit_events_tenant_isolation_forbidden() (+6 more)

### Community 45 - "api/analytics.py"
Cohesion: 0.14
Nodes (6): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access(), AnalyticsOverviewResponse, AnalyticsTimeseriesResponse

### Community 46 - "update_policy_rule"
Cohesion: 0.18
Nodes (5): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule()

### Community 47 - "User"
Cohesion: 0.10
Nodes (19): User, _setup_admin_auth(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found() (+11 more)

### Community 48 - "AgentTool"
Cohesion: 0.06
Nodes (30): AgentTool, Policy, PolicyRule, ToolAction, test_create_rule_in_policy_success(), test_create_rule_target_agent_from_different_org(), test_delete_policy_rule_preserves_policy_and_sister_rules(), test_update_policy_rule_success() (+22 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.04
Nodes (40): lifespan(), ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI), 🏗️ Arquitectura de la API REST (`/api/v1`), 📋 Especificaciones Históricas Archivadas, 📁 Estructura del Código Fuente, 🧪 Pruebas Automatizadas, 🗄️ Versionado de Base de Datos con Alembic, 1. Levantar Servicios de Infraestructura (Paso 1) (+32 more)

### Community 50 - "test_seed_data_fresh_creation"
Cohesion: 0.13
Nodes (8): test_api_reset_demo_reissues_jwt_for_new_db_uuids(), test_api_reset_demo_success(), test_clear_database_executes_cascaded_deletes(), test_seed_data_already_exists_without_reset(), test_seed_data_fresh_creation(), mock_add(), mock_add_all(), test_seed_data_syncs_missing_canonical_users_without_reset()

### Community 51 - "🗄️ AgentGuard — MER Relacional y Modelo Físico de Datos (Versión Final Verificada)"
Cohesion: 0.17
Nodes (12): 0. Resumen ejecutivo (datos verificados contra el código), 1.1 Persistencia Core AgentGuard (PostgreSQL 16), 1.2 Persistencia Externa ACME Corp (SQLite), 1. Arquitectura de doble persistencia, 2. Diagrama MER físico completo — PostgreSQL (13 tablas), 3.3 Inventario de integridad referencial (resumen de `ON DELETE`), 3.4 Desvíos modelo ORM ↔ migración (hallazgos de auditoría), 3. Diccionario físico tabla por tabla (+4 more)

### Community 53 - "3.2 Tablas"
Cohesion: 0.14
Nodes (14): 3.2.10 `approvals` — bandeja HITL, 3.2.11 `alerts`, 3.2.12 `audit_events` — log administrativo inmutable, 3.2.13 `api_keys` — credenciales del Gateway (migración 003), 3.2.1 `organizations` — raíz del tenant, 3.2.2 `users`, 3.2.3 `agents`, 3.2.4 `tools` (+6 more)

### Community 54 - "_make_auth"
Cohesion: 0.27
Nodes (5): _make_auth(), test_get_alert_by_id_found(), test_get_alert_by_id_not_found(), test_list_alerts_endpoint(), test_update_alert_status()

### Community 56 - "generate_diagrams.py"
Cohesion: 0.21
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 57 - "alerts.py"
Cohesion: 0.17
Nodes (5): get_alert_by_id(), list_alerts(), update_alert_status(), AlertRead, AlertUpdateRequest

### Community 58 - "06 — Portal ACME Corp, Asistente Consultante BI y Cliente Agent Demo"
Cohesion: 0.06
Nodes (26): AcmeSettings, 06 — Portal ACME Corp, Asistente Consultante BI y Cliente Agent Demo, 1.1 Scripts de Ejecución y Lanzadores, 1.2 Variables de Entorno Reales (`acme-corp/server/config.py` y `.env.example`), 1.3 Arquitectura del Servidor FastAPI (`acme-corp/server/app.py`), 1. Documentación Integral del Portal Empresarial `acme-corp/` (`:9000`), 2. Auto-Onboarding Automático del CEO (`acme-corp/agent/onboarding.py`), 3.1 Configuración del Modelo y Pensamiento Determinista (+18 more)

### Community 59 - "agent_service.py"
Cohesion: 0.23
Nodes (4): AgentCreate, AgentToolCreate, AgentUpdate, test_agent_and_agent_tool_schemas()

### Community 60 - "AgentTool"
Cohesion: 0.05
Nodes (34): get_db(), AgentStatus, AlertSeverity, ApprovalStatus, ExecutionStatus, PolicyDecision, RiskLevel, RuleEffect (+26 more)

### Community 63 - "test_siem_webhook_test_ping_missing_url"
Cohesion: 0.24
Nodes (4): test_gateway_simulate_endpoint(), mock_execute(), test_siem_webhook_test_ping_missing_url(), test_siem_webhook_test_ping_success()

### Community 65 - "ensure_same_tenant"
Cohesion: 0.08
Nodes (17): ensure_same_tenant(), require_roles(), resolve_tenant_org_id(), create_user(), delete_user(), get_user(), list_users(), update_user() (+9 more)

### Community 67 - "app.py"
Cohesion: 0.18
Nodes (10): AgentDiscoverRequest, AgentRunRequest, DeleteSalesRequest, DropDatabaseRequest, ExportCustomersRequest, OnboardRequest, QuerySalesRequest, QuoteRequest (+2 more)

### Community 68 - "UserService"
Cohesion: 0.16
Nodes (4): UserService, Slide 8 — `Onboarding SaaS B2B, Sesiones Efímeras y Matriz RBAC`, 2. Decisión Tomada, 🎯 Problema y Propuesta de Valor (Zero Trust Fuera del LLM)

### Community 70 - "Original User Request"
Cohesion: 0.08
Nodes (23): Alcance de la Fase 2:, Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI (+15 more)

### Community 72 - "001_initial_schema.py"
Cohesion: 0.14
Nodes (6): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade()

### Community 73 - "health_check"
Cohesion: 0.25
Nodes (3): check_database_health(), health_check(), ping()

### Community 74 - "PDPEngine"
Cohesion: 0.16
Nodes (5): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), 8. Preguntas difíciles de cátedra y respuestas actualizadas

### Community 75 - "🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA"
Cohesion: 0.14
Nodes (14): 1. Caso de Uso Estrella: Copiloto Administrativo "Consultante BI" (`http://localhost:9000`), 2. Los 4 Escenarios Canónicos de Seguridad (`agent-demo` y Pestaña Seguridad ACME), 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA, 🚀 Arranque Local Exacto y Flujo Operativo, 🧪 Comandos Canónicos de Verificación y Testing, 🏛️ Contexto Institucional y Equipo, 🗂️ Estructura Completa y Real del Monorepositorio, 👥 Integrantes y Roles del Equipo (+6 more)

### Community 76 - "asyncio"
Cohesion: 0.29
Nodes (3): test_health_endpoint(), test_ping_endpoint(), test_root_endpoint()

### Community 78 - "typing"
Cohesion: 0.05
Nodes (31): change_password(), get_me(), login(), verify_password(), TimeseriesPoint, ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse (+23 more)

### Community 79 - "AuthContext.tsx"
Cohesion: 0.11
Nodes (25): ForcePasswordChangeModalProps, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav(), WorkspaceSwitcher() (+17 more)

### Community 80 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.29
Nodes (6): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 83 - "approvals.py"
Cohesion: 0.16
Nodes (6): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest

### Community 84 - "create_app"
Cohesion: 0.12
Nodes (17): list_presets(), create_app(), bi_delete_sales(), bi_query_sales(), catalog_update_price(), crm_create_quote(), crm_export_customers(), db_drop() (+9 more)

### Community 85 - "app.js"
Cohesion: 0.13
Nodes (31): applyLocalFilter(), dom, escapeHtml(), executeBiStep(), handleBiChatSubmit(), loadPresets(), onboardAgentguard(), PIE_COLORS (+23 more)

### Community 86 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.11
Nodes (18): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Asignación de Responsabilidades por Paquete, 2. Decisión Tomada (+10 more)

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "test_acme_server.py"
Cohesion: 0.11
Nodes (10): app_with_temp_db(), temp_db(), test_bi_delete_sales_endpoint(), test_bi_query_sales_endpoint(), test_catalog_update_price_and_tampering(), test_crm_create_quote_endpoint(), test_crm_export_customers_endpoint(), test_database_drop_and_503_wiped_with_sales() (+2 more)

### Community 90 - "UUID"
Cohesion: 0.09
Nodes (18): test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash(), test_api_multi_tenant_isolation_cross_tenant_forbidden() (+10 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "3.5 Recarga Ansiosa Anti-`MissingGreenlet` (`selectinload` vía `get_by_id`)"
Cohesion: 0.17
Nodes (8): 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 2. Diagrama de atributos de entidades núcleo (notación Chen), 3.5 Recarga Ansiosa Anti-`MissingGreenlet` (`selectinload` vía `get_by_id`), 1. Contexto y Problema, 2. Decisión Tomada, ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React)

### Community 94 - "_mock_user_auth"
Cohesion: 0.16
Nodes (10): clear_overrides(), _mock_user_auth(), test_anti_ai_agent_header_blocked_on_all_control_plane_routes(), test_anti_idor_cross_tenant_blocked_with_403(), test_rbac_matrix_admin_only_mutations_and_settings(), test_rbac_matrix_alerts_triage(), test_rbac_matrix_approvals_resolve(), test_rbac_matrix_audit_events() (+2 more)

### Community 95 - "env.py"
Cohesion: 0.20
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.12
Nodes (15): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2.2 Mapa de Contradicciones (Doc vs. Doc y Doc vs. Código/Graphify), 2. Mapa de Duplicaciones y Contradicciones (+7 more)

### Community 97 - "2. Reglas Innegociables de Seguridad, Dominio e Idioma"
Cohesion: 0.40
Nodes (5): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard

### Community 98 - "SanitizerService"
Cohesion: 0.13
Nodes (8): SanitizerService, 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`), 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL, 4.4 Defectos en `SanitizerService` y Configuraciones Ignoradas, 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4), 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 🎯 Problema y Propuesta de Valor (Zero Trust Fuera del LLM)

### Community 99 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.12
Nodes (15): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2. Arquitectura y Stack Tecnológico, 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`), 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`) (+7 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.17
Nodes (11): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+3 more)

### Community 104 - "ToolRead"
Cohesion: 0.15
Nodes (7): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolRead, ToolUpdate

### Community 105 - "4. Biblioteca / Diccionario completo de atributos reales (96 atributos)"
Cohesion: 0.12
Nodes (17): 0. Leyenda de notación (Chen adaptada a Mermaid), 1.1 Lectura del diagrama, 1.2 Conteo de relaciones y correspondencia con claves foráneas, 1. Diagrama conceptual completo — Dominio AgentGuard (13 entidades), 3.1 Resumen de participaciones, 3. Análisis formal de cardinalidades `(mín, máx)`, 4.1 Identificadores (clave primaria `UUID v4`), 4.2 Referencias (claves foráneas y referencia polimórfica) (+9 more)

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)"
Cohesion: 0.17
Nodes (11): 🌟 1. Propósito y Visión General del Sistema, 🦆 2. Caso de Uso Estrella: El Administrativo & el Asistente "Consultante BI", 🛡️ 3. Escenarios Oficiales de la Demostración, 🚀 4. Instalación y Puesta en Marcha, ⚙️ 5. Variables de Entorno (`acme-corp/.env`), 🧪 6. Pruebas Automatizadas, 💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition), Ejecución en Windows o Terminal (+3 more)

### Community 110 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.12
Nodes (15): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`), 2.4 *Strategy + Circuit Breaker* para Despacho de Herramientas (`LiveRestDispatcher` vs. `SandboxMockDispatcher`) (+7 more)

### Community 113 - "threat_detector.py"
Cohesion: 0.17
Nodes (3): ThreatAnalysisResult, ThreatDetectorService, 5. Deuda Técnica y Riesgos Detectados

### Community 114 - "create_api_key"
Cohesion: 0.18
Nodes (4): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key()

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 116 - "App.tsx"
Cohesion: 0.13
Nodes (43): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, Alcance de la Fase 3:, INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, 1.4 Notificaciones Reactivas: `ToastContext.tsx`, App() (+35 more)

### Community 118 - "PolicyRead"
Cohesion: 0.12
Nodes (11): create_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyRead, 5.2. Sesiones Efímeras (`SERVER_BOOT_ID` + `/health.boot_id` + `sessionStorage`), 5.3. Ciclo Obligatorio de Cambio de Contraseña (`must_change_password` + `ForcePasswordChangeModal.tsx`) (+3 more)

### Community 119 - "1.1 Principio: *"Never trust the model as the enforcement point"*"
Cohesion: 0.14
Nodes (12): check_redis_health(), 03 — Arquitectura Runtime Zero Trust (PEP/PDP) e Inventario API REST, 1.1 Principio: *"Never trust the model as the enforcement point"*, 1.2 Esquema Arquitectónico en Capas (Runtime Real), 1. Principio Rector Zero Trust y Arquitectura en Capas, 3.2 Motor PDP Determinista 5D (`backend/app/services/pdp_engine.py`), 3.3 Sanitización (OWASP LLM06) y Detección de Amenazas (OWASP Agentic Top 10 2026), 3.4 Seguridad Criptográfica (`security.py`) y Tiempo Real (`websocket_manager.py`) (+4 more)

### Community 120 - "create_tool_action"
Cohesion: 0.23
Nodes (4): create_tool_action(), get_tool_action(), list_tool_actions(), ToolActionRead

### Community 122 - "🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA"
Cohesion: 0.14
Nodes (14): 1. Caso de Uso Estrella: Copiloto Administrativo "Consultante BI" (`http://localhost:9000`), 2. Los 4 Escenarios Canónicos de Seguridad (`agent-demo` y Pestaña Seguridad ACME), 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA, 🚀 Arranque Local Exacto y Flujo Operativo, 🧪 Comandos Canónicos de Verificación y Testing, 🏛️ Contexto Institucional y Equipo, 🗂️ Estructura Completa y Real del Monorepositorio, 👥 Integrantes y Roles del Equipo (+6 more)

### Community 123 - "schemas/gateway.py"
Cohesion: 0.12
Nodes (7): execute_gateway_action(), get_gateway_context(), simulate_gateway_action(), GatewayContextAction, GatewayContextAgent, GatewayContextResponse, GatewayContextTool

### Community 124 - "_setup_user_auth"
Cohesion: 0.19
Nodes (7): _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_forbidden_for_non_approver_roles(), test_approvals_resolve_success()

### Community 125 - "🧭 AgentGuard: Índice Maestro y Guía de Navegación del Sistema"
Cohesion: 0.17
Nodes (12): 1. Propósito de este Índice y de la Carpeta `documentación final/`, 2. Mapa Completo de los 11 Volúmenes Documentales, 3. Itinerarios de Lectura Recomendados, 4. Matriz de Trazabilidad: Código Fuente Real vs. Documentación Final, 5. Glosario Canónico de Términos del Dominio, 6. Certificación de Cero Regresiones y Estado del Repositorio, 🧭 AgentGuard: Índice Maestro y Guía de Navegación del Sistema, Itinerario 1: Defensa de Cátedra y Evaluación de Arquitectura Global (+4 more)

### Community 126 - "ApiError"
Cohesion: 0.33
Nodes (5): 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3)

### Community 127 - "asyncio"
Cohesion: 0.29
Nodes (3): test_gateway_context_invalid_api_key_returns_401(), test_gateway_context_missing_header_returns_401(), test_gateway_context_success_isolated_by_org()

### Community 128 - "4. Resumen de Brechas por Documento Auditado (14 Archivos)"
Cohesion: 0.20
Nodes (10): 1. Resumen Ejecutivo y Metodología, 3.1. Historial Real de Migraciones Alembic (`001`–`006`) vs. Documentación (`001`–`005`), 3.2. Conteo de Entidades / Tablas (11 vs. 12 vs. 13) y Omisión de `API_KEY` en Chen, 3.3. Generación Nativa de `UUID v4` en PostgreSQL vs. Afirmación en `agentguard_mer_relacional.md`, 3.4. Columnas `JSONB` e Índices GIN Reales, 3. Análisis Detallado por Foco Obligatorio, 5. Recomendaciones y Criterios Adoptados en `documentación final/`, Distribución de Hallazgos por Severidad (+2 more)

### Community 129 - "list_executions"
Cohesion: 0.06
Nodes (30): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse, 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución (+22 more)

### Community 131 - "04 — Secuencias de Demo, Máquinas de Estado y Casos de Uso UML"
Cohesion: 0.40
Nodes (5): 04 — Secuencias de Demo, Máquinas de Estado y Casos de Uso UML, 1. Diagrama de Secuencia: Los 4 Escenarios Canónicos (Gateway PEP/PDP), 2. Diagrama de Secuencia: Flujo Estrella "Consultante BI" con Gemini 3.8 Flash, 4.1 Diagrama de Casos de Uso UML (Mermaid), 4. Diagrama de Casos de Uso UML, Especificación y Preguntas de Defensa

### Community 149 - "test_organization_settings.py"
Cohesion: 0.06
Nodes (19): test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_get_settings_success(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_multi_tenant_isolation_patch_cross_tenant_denied(), test_api_patch_settings_not_found() (+11 more)

### Community 150 - "01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)"
Cohesion: 0.50
Nodes (3): 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 3. Análisis Específico de Contradicciones Internas en la Documentación

### Community 151 - "Organization"
Cohesion: 0.09
Nodes (19): Organization, _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_api_patch_organization_ai_agent_blocked() (+11 more)

### Community 165 - "test_threat_detector_base64_obfuscation"
Cohesion: 0.20
Nodes (3): test_threat_detector_base64_obfuscation(), test_threat_detector_clean_parameters(), test_threat_detector_goal_hijacking()

### Community 171 - "models/user.py"
Cohesion: 0.09
Nodes (20): Base, Alert, Approval, AlertStatus, Execution, AnalyticsService, test_pep_resolve_approval_approved_with_for_update(), test_pep_resolve_approval_expired_ttl() (+12 more)

## Knowledge Gaps
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToast()` connect `App.tsx` to `2. Reglas Innegociables de Seguridad, Dominio e Idioma`, `App.tsx`, `🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA`, `domain.ts`, `AuthContext.tsx`, `PolicyService`, `🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Are the 105 inferred relationships involving `User` (e.g. with `get_analytics_overview()` and `get_analytics_timeseries()`) actually correct?**
  _`User` has 105 INFERRED edges - model-reasoned connections that need verification._
- **Should `test_tools.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09411764705882353 - nodes in this community are weakly interconnected._
- **Why does `User` connect `User` to `test_tools.py`, `.resolve_approval`, `api/auth.py`, `test_tool_actions.py`, `asyncio`, `get_attack_catalog`, `Agent`, `test_organization_settings.py`, `Organization`, `organizations.py`, `make_admin_jwt`, `list_audit_events`, `ensure_same_tenant`, `typing`, `test_audit_events.py`, `models/user.py`, `api/analytics.py`, `AgentTool`, `test_seed_data_fresh_creation`, `_make_auth`, `alerts.py`, `AgentTool`, `test_siem_webhook_test_ping_missing_url`, `ensure_same_tenant`, `UserService`, `typing`, `approvals.py`, `UUID`, `_mock_user_auth`, `create_api_key`, `create_tool_action`, `schemas/gateway.py`, `_setup_user_auth`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Organization` (e.g. with `test_api_create_agent_owner_different_org()` and `test_api_create_agent_success()`) actually correct?**
  _`Organization` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11977401129943503 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `2. Reglas Innegociables de Seguridad, Dominio e Idioma` to `typing`, `domain.ts`, `AgentTool`, `App.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._