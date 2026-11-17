# Graph Report - AgentGuard  (2026-11-17)

## Corpus Check
- 212 files · ~197,118 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .drawio 6, (none) 4, .example 4)

## Summary
- 2824 nodes · 7588 edges · 159 communities (98 shown, 61 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 655 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50d77077`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_tools.py
- domain.ts
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- sanitizer_service.py
- api/auth.py
- httpx
- PolicyDecision
- PolicyRule
- App.tsx
- frontend/package.json
- postgres
- GeminiAgentClient
- 3. Catálogo Detallado de Maquetas y Elementos Mockup
- domain.ts
- asyncio
- test_agent_service_assign_tool
- seed_data
- compilerOptions
- auth-ui.tsx
- PolicyService
- compilerOptions
- run_demo.py
- convert_docs_to_docx.py
- test_organization_settings.py
- AcmeDatabase
- organization_service.py
- websocket_manager.py
- update_user
- audit_events.py
- ensure_same_tenant
- update_policy
- ExecutionStatus
- AgentService
- .oxlintrc.json
- gemini_client.py
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)
- User
- UUID
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- logging
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKeyService
- test_agents.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- generate_diagrams.py
- AlertRead
- AcmeSettings
- agent_service.py
- Tool
- AuditEvent
- ToolActionService
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- CLAUDE.md
- typing
- copilot-instructions.md
- app.py
- UserService
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)
- Original User Request
- sqlalchemy
- test_analytics.py
- PDPEngine
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- update_policy_rule
- 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)
- BaseSchema
- labels.ts
- AgentTool
- package.json
- test_health.py
- approvals.py
- create_app
- app.js
- test_gateway_simulate_endpoint
- cleanup_overrides
- scripts
- test_acme_server.py
- Organization
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- PolicyRule
- _AutoYieldOverrides
- _mock_user_auth
- env.py
- 1.2 Inventario Individual (39 archivos `.md`)
- get_analytics_overview
- SanitizerService
- test_register_org_success_atomic_onboarding
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- ToolRead
- UserMeResponse
- cleanup_overrides
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- 💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)
- UserCreate
- README.md
- pnpm-workspace.yaml
- run.py
- create_api_key
- scripts
- OverviewView.tsx
- test_api_get_attack_catalog
- create_tool_action
- ApiError
- schemas/gateway.py
- ApiError
- asyncio
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- asyncio
- list_executions
- test_list_executions_endpoint
- temp_db
- parse_args
- cleanup_overrides
- Colors
- Organization

## God Nodes (most connected - your core abstractions)
1. `User` - 173 edges
2. `make_admin_jwt()` - 91 edges
3. `Organization` - 85 edges
4. `Tool` - 74 edges
5. `ToolAction` - 74 edges
6. `BaseSchema` - 72 edges
7. `Agent` - 67 edges
8. `UserRole` - 67 edges
9. `AgentTool` - 63 edges
10. `AgentGuardApiClient` - 52 edges

## Surprising Connections (you probably didn't know these)
- `3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`` --references--> `ApiKey`  [INFERRED]
  agentguard_credenciales_demo.md → backend/app/models/api_key.py
- `A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación` --references--> `ApiKey`  [INFERRED]
  agentguard_mer_relacional.md → backend/app/models/api_key.py
- `INC-08: Modelo, Migración y Router de API Keys PEP (`/api/v1/api-keys`)` --references--> `ApiKey`  [INFERRED]
  docs/archive/ORIGINAL_REQUEST.md → backend/app/models/api_key.py
- `4.2 Estándares de Frontend (`TypeScript 6` / `React 19` / `Vite 8` / `pnpm`)` --references--> `ApiError`  [INFERRED]
  docs/archive/audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md → frontend/src/services/api.ts
- `INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`)` --references--> `ApiError`  [INFERRED]
  docs/archive/ORIGINAL_REQUEST.md → frontend/src/services/api.ts

## Import Cycles
- None detected.

## Communities (159 total, 61 thin omitted)

### Community 0 - "test_tools.py"
Cohesion: 0.13
Nodes (11): _setup_admin_auth(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), mock_refresh() (+3 more)

### Community 1 - "domain.ts"
Cohesion: 0.13
Nodes (5): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, extractApiError(), handleNetworkError(), UserMember

### Community 3 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.11
Nodes (17): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`) (+9 more)

### Community 4 - "sanitizer_service.py"
Cohesion: 0.12
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 5 - "api/auth.py"
Cohesion: 0.06
Nodes (26): change_password(), login(), register(), register_organization(), reset_demo_data(), create_access_token(), get_password_hash(), verify_password() (+18 more)

### Community 6 - "httpx"
Cohesion: 0.10
Nodes (9): bootstrap_acme_in_agentguard(), persist_api_key_to_env(), ensure_acme_onboarded_if_needed(), test_bootstrap_acme_in_agentguard_mocked(), mock_handler(), test_ensure_acme_onboarded_relinks_on_stale_api_key(), test_ensure_acme_onboarded_skips_when_key_valid_and_consultante_present(), test_run_scenario_gemini3_fallback_and_thought_signature() (+1 more)

### Community 7 - "PolicyDecision"
Cohesion: 0.08
Nodes (15): AlertStatus, PolicyDecision, RuleEffect, AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint, AnalyticsService, test_pdp_evaluate_allow() (+7 more)

### Community 8 - "PolicyRule"
Cohesion: 0.13
Nodes (3): PolicyRuleUpdate, _invalidate_policy_cache(), PolicyRuleService

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (48): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, AppContent(), getInitialView(), EmptyState(), EmptyStateAction, EmptyStateProps (+40 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "GeminiAgentClient"
Cohesion: 0.08
Nodes (14): _build_generation_config(), discover_agentguard_context(), GeminiAgentClient, resolve_agent_id(), resolve_tool_id_for_action(), discover_context(), test_discover_agentguard_context(), test_execute_in_direct_mode_delete_sales() (+6 more)

### Community 13 - "3. Catálogo Detallado de Maquetas y Elementos Mockup"
Cohesion: 0.05
Nodes (38): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+30 more)

### Community 15 - "domain.ts"
Cohesion: 0.11
Nodes (34): ForcePasswordChangeModalProps, QuickSetupWizardProps, AuthContextType, GatewayExecutionPayload, GatewayExecutionResult, Agent, AgentStatus, AlertSeverity (+26 more)

### Community 16 - "asyncio"
Cohesion: 0.11
Nodes (11): _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), mock_refresh() (+3 more)

### Community 17 - "test_agent_service_assign_tool"
Cohesion: 0.33
Nodes (3): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh()

### Community 18 - "seed_data"
Cohesion: 0.11
Nodes (10): clear_database(), ensure_canonical_demo_users(), _resolve_demo_org(), test_clear_database_executes_cascaded_deletes(), test_seed_data_already_exists_without_reset(), test_seed_data_fresh_creation(), mock_add(), mock_add_all() (+2 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (18): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+10 more)

### Community 21 - "PolicyService"
Cohesion: 0.05
Nodes (21): PolicyService, ToolService, 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`, 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean) (+13 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "run_demo.py"
Cohesion: 0.11
Nodes (13): build_payload(), _configure_stdio(), _decision_color(), DemoConfig, DemoScenario, discover_gateway_context(), load_config(), main() (+5 more)

### Community 24 - "convert_docs_to_docx.py"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 25 - "test_organization_settings.py"
Cohesion: 0.06
Nodes (15): OrganizationSettings, OrganizationSettingsUpdate, SiemWebhookTestResponse, WebhookService, test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_patch_settings_siem_format_invalid_rejected() (+7 more)

### Community 26 - "AcmeDatabase"
Cohesion: 0.10
Nodes (5): AcmeDatabase, test_bi_delete_sales_endpoint(), test_catalog_update_price_and_tampering(), test_initial_seed_data(), test_execute_in_direct_mode_tampering()

### Community 27 - "organization_service.py"
Cohesion: 0.16
Nodes (8): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization(), update_organization_settings(), ping()

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.18
Nodes (5): create_user(), delete_user(), get_user(), list_users(), update_user()

### Community 30 - "audit_events.py"
Cohesion: 0.20
Nodes (3): get_audit_event(), list_audit_events(), require_roles()

### Community 31 - "ensure_same_tenant"
Cohesion: 0.13
Nodes (10): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentRead (+2 more)

### Community 32 - "update_policy"
Cohesion: 0.17
Nodes (6): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy()

### Community 33 - "ExecutionStatus"
Cohesion: 0.07
Nodes (23): 2. Diagramas de Estados Reales (Mermaid), A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution.status`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval.status`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`), ExecutionStatus, ExecutionResponse, GatewayExecuteResponse, test_gateway_execute_endpoint_allow() (+15 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "gemini_client.py"
Cohesion: 0.12
Nodes (7): display_presets_table(), main(), main_async(), print_banner(), get_preset_by_id(), list_presets(), get_agent_presets()

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.10
Nodes (20): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 2. Asignación por Paquete (+12 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid — 13 Tablas), 3. Decisiones Arquitectónicas y Justificación Técnica, 4. Capacidades Clave de la Persistencia, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación, B. Uso de `UUID v4` como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` con Índices GIN (+4 more)

### Community 47 - "User"
Cohesion: 0.09
Nodes (18): _setup_admin_auth(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found(), test_api_get_user_not_found() (+10 more)

### Community 48 - "UUID"
Cohesion: 0.03
Nodes (63): ApiKey, Policy, User, make_admin_jwt(), test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found() (+55 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.05
Nodes (39): lifespan(), ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI), 📋 Especificaciones Históricas Archivadas, 📁 Estructura del Código Fuente, 🧪 Pruebas Automatizadas, 🗄️ Versionado de Base de Datos con Alembic, 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2) (+31 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia Real (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. Cierre Forense en `TracesView` (`GET /api/v1/executions`), Escenario 1: Operación Normal (`ALLOW` — HTTP `200 OK`), Escenario 2: Privilegio Mínimo / Abuso Bloqueado (`DENY` — HTTP `403 Forbidden`), Escenario 3: Operación Sensible con Human-in-the-Loop (`REQUIRE_APPROVAL` — HTTP `202 Accepted`), Escenario 4: Exfiltración de Datos y Alerta Crítica (`DENY + CRITICAL ALERT` — HTTP `403 Forbidden`) (+1 more)

### Community 52 - "ApiKeyService"
Cohesion: 0.05
Nodes (20): ApiKeyService, ThreatAnalysisResult, ThreatDetectorService, 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant (+12 more)

### Community 53 - "test_agents.py"
Cohesion: 0.17
Nodes (7): _setup_admin_auth(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org(), test_api_create_agent_success(), test_api_list_agent_tools()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 56 - "generate_diagrams.py"
Cohesion: 0.12
Nodes (8): check_database_health(), check_redis_health(), health_check(), root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 57 - "AlertRead"
Cohesion: 0.18
Nodes (5): get_alert_by_id(), list_alerts(), update_alert_status(), AlertRead, test_alert_schema()

### Community 59 - "agent_service.py"
Cohesion: 0.23
Nodes (4): AgentCreate, AgentToolCreate, AgentUpdate, test_agent_and_agent_tool_schemas()

### Community 60 - "Tool"
Cohesion: 0.05
Nodes (45): Agent, Tool, ToolAction, GatewayExecuteRequest, PDPDecisionResult, seed_data(), make_api_key_pair(), test_executions_api_get_by_id_serializes_db_latency() (+37 more)

### Community 63 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.29
Nodes (6): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

### Community 65 - "typing"
Cohesion: 0.09
Nodes (8): ensure_same_tenant(), get_current_user(), require_admin_user(), resolve_tenant_org_id(), simulate_gateway_action(), get_db(), decode_access_token(), ActorType

### Community 67 - "app.py"
Cohesion: 0.18
Nodes (10): AgentDiscoverRequest, AgentRunRequest, DeleteSalesRequest, DropDatabaseRequest, ExportCustomersRequest, OnboardRequest, QuerySalesRequest, QuoteRequest (+2 more)

### Community 69 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)"
Cohesion: 0.29
Nodes (6): 1. Modelado de Estados en Arquitecturas Asíncronas (`202 Accepted`), 4. Concurrencia y Prevención de Condiciones de Carrera (TOCTOU), 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted), ❓ P1: *"¿Por qué cambiaron de mantener la conexión HTTP abierta a devolver `202 Accepted` en HITL?"*, ❓ P2: *"¿Por qué consideraron el estado `EXPIRED` a los 15 minutos?"*

### Community 70 - "Original User Request"
Cohesion: 0.08
Nodes (23): Alcance de la Fase 2:, Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI (+15 more)

### Community 72 - "sqlalchemy"
Cohesion: 0.09
Nodes (12): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade() (+4 more)

### Community 73 - "test_analytics.py"
Cohesion: 0.11
Nodes (15): UserRole, MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield() (+7 more)

### Community 74 - "PDPEngine"
Cohesion: 0.11
Nodes (10): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime Real (Mermaid), 4. Preguntas Difíciles del Profesor y Respuestas Recomendadas, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Cómo garantizan consistencia entre políticas recién modificadas y evaluaciones en tiempo real?"*, ❓ P2: *"¿Qué ocurre si una petición activa `REQUIRE_APPROVAL` y nadie responde?"*, PDPEngine, test_matches_conditions_destinations() (+2 more)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA, 🚀 Arranque Rápido Local, 🏛️ Contexto Institucional y Equipo, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles, 🎬 La Secuencia de la Demo Principal (En Vivo) (+4 more)

### Community 76 - "update_policy_rule"
Cohesion: 0.18
Nodes (5): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule()

### Community 77 - "🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)"
Cohesion: 0.18
Nodes (10): 1. Credenciales de Usuarios (Acme Corp), 2. Matriz Resumida de Permisos por Rol (RBAC), 3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`, 4. Guión Sugerido de Logins para la Demo en Vivo, 5. Entidades y Descubrimiento Dinámico de Acme Corp, 6. Comandos de Reinicio (Factory Reset) de Acme Corp, 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp), Entorno y Agentes (+2 more)

### Community 78 - "BaseSchema"
Cohesion: 0.05
Nodes (26): AlertUpdateRequest, ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse, ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest, AuditEventBase (+18 more)

### Community 79 - "labels.ts"
Cohesion: 0.07
Nodes (30): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+22 more)

### Community 80 - "AgentTool"
Cohesion: 0.10
Nodes (22): 3. Componentes Clave de Runtime, 3. Análisis Detallado de Transiciones y Respuestas HTTP, AgentTool, Alert, Approval, PEPGatewayService, 🏗️ Arquitectura de la API REST (`/api/v1`), _make_auth() (+14 more)

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 82 - "test_health.py"
Cohesion: 0.10
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 83 - "approvals.py"
Cohesion: 0.24
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 84 - "create_app"
Cohesion: 0.13
Nodes (17): create_app(), bi_delete_sales(), bi_query_sales(), catalog_update_price(), crm_create_quote(), crm_export_customers(), db_drop(), get_state() (+9 more)

### Community 85 - "app.js"
Cohesion: 0.13
Nodes (31): applyLocalFilter(), dom, escapeHtml(), executeBiStep(), handleBiChatSubmit(), loadPresets(), onboardAgentguard(), PIE_COLORS (+23 more)

### Community 86 - "test_gateway_simulate_endpoint"
Cohesion: 0.16
Nodes (7): test_gateway_simulate_endpoint(), mock_execute(), test_list_organizations_success(), test_siem_webhook_settings_update(), mock_execute(), test_siem_webhook_test_ping_missing_url(), test_siem_webhook_test_ping_success()

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "test_acme_server.py"
Cohesion: 0.13
Nodes (7): app_with_temp_db(), temp_db(), test_bi_query_sales_endpoint(), test_crm_create_quote_endpoint(), test_crm_export_customers_endpoint(), test_database_drop_and_503_wiped_with_sales(), test_stripe_refund_endpoint()

### Community 90 - "Organization"
Cohesion: 0.06
Nodes (18): OrganizationUpdate, OrganizationService, _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations() (+10 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "PolicyRule"
Cohesion: 0.11
Nodes (12): PolicyRule, _setup_admin_auth(), test_api_create_policy_rule_policy_not_found(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_api_list_policy_rules(), test_policy_rule_service_create(), test_policy_rule_service_get_by_id() (+4 more)

### Community 94 - "_mock_user_auth"
Cohesion: 0.17
Nodes (9): _mock_user_auth(), test_anti_ai_agent_header_blocked_on_all_control_plane_routes(), test_anti_idor_cross_tenant_blocked_with_403(), test_rbac_matrix_admin_only_mutations_and_settings(), test_rbac_matrix_alerts_triage(), test_rbac_matrix_approvals_resolve(), test_rbac_matrix_audit_events(), test_rbac_matrix_gateway_simulate() (+1 more)

### Community 95 - "env.py"
Cohesion: 0.20
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.13
Nodes (14): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+6 more)

### Community 97 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 100 - "test_register_org_success_atomic_onboarding"
Cohesion: 0.29
Nodes (3): test_register_org_api_key_validates_in_gateway_service(), test_register_org_duplicate_email_returns_400(), test_register_org_success_atomic_onboarding()

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.17
Nodes (11): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes, 3. Hallazgos Críticos y Bugs Funcionales en el Frontend (+3 more)

### Community 104 - "ToolRead"
Cohesion: 0.17
Nodes (6): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolRead

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)"
Cohesion: 0.17
Nodes (11): 🌟 1. Propósito y Visión General del Sistema, 🦆 2. Caso de Uso Estrella: El Administrativo & el Asistente "Consultante BI", 🛡️ 3. Escenarios Oficiales de la Demostración, 🚀 4. Instalación y Puesta en Marcha, ⚙️ 5. Variables de Entorno (`acme-corp/.env`), 🧪 6. Pruebas Automatizadas, 💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition), Ejecución en Windows o Terminal (+3 more)

### Community 111 - "README.md"
Cohesion: 0.20
Nodes (7): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard, 🌐 AgentGuard — Frontend (Dashboard Web SPA SaaS B2B), 🛠️ Comandos Útiles (`pnpm`)

### Community 114 - "create_api_key"
Cohesion: 0.18
Nodes (4): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key()

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 116 - "OverviewView.tsx"
Cohesion: 0.23
Nodes (11): QuickSetupWizard(), UseAgentGuardWebSocketOptions, WebSocketEventMessage, BackendHealthState, formatActionHuman(), formatHourLabel(), formatTick(), generateSplinePath() (+3 more)

### Community 120 - "create_tool_action"
Cohesion: 0.25
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 121 - "ApiError"
Cohesion: 0.10
Nodes (22): Alcance de la Fase 3:, INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, App() (+14 more)

### Community 123 - "schemas/gateway.py"
Cohesion: 0.11
Nodes (8): execute_gateway_action(), get_attack_catalog(), get_gateway_context(), GatewayContextAction, GatewayContextAgent, GatewayContextResponse, GatewayContextTool, GatewayExecutionTraceRead

### Community 126 - "ApiError"
Cohesion: 0.25
Nodes (6): 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), ApiError

### Community 127 - "asyncio"
Cohesion: 0.29
Nodes (3): test_gateway_context_invalid_api_key_returns_401(), test_gateway_context_missing_header_returns_401(), test_gateway_context_org_not_found_returns_404()

### Community 129 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.12
Nodes (16): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`) (+8 more)

### Community 145 - "asyncio"
Cohesion: 0.08
Nodes (13): test_api_agent_run_endpoint(), test_resolve_tool_id_matches_agentguard_action_name_and_accented_names(), main(), test_anti_ai_shielding_in_control_plane(), test_change_password_missing_token(), test_change_password_rejects_x_agent_id(), test_control_plane_rejects_anonymous_and_x_user_id_without_jwt(), test_get_me_invalid_token() (+5 more)

### Community 146 - "list_executions"
Cohesion: 0.09
Nodes (17): get_execution_by_id(), list_executions(), _to_execution_response(), 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed) (+9 more)

### Community 154 - "test_list_executions_endpoint"
Cohesion: 0.40
Nodes (3): _make_auth(), test_get_execution_by_id_not_found(), test_list_executions_endpoint()

### Community 171 - "Organization"
Cohesion: 0.07
Nodes (15): Base, AuditEvent, AgentStatus, AlertSeverity, ApprovalStatus, RiskLevel, Execution, Organization (+7 more)

## Knowledge Gaps
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToast()` connect `App.tsx` to `OverviewView.tsx`, `ApiError`, `domain.ts`, `README.md`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Are the 59 inferred relationships involving `User` (e.g. with `create_api_key()` and `get_api_key()`) actually correct?**
  _`User` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Should `test_tools.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `README.md` to `typing`, `App.tsx`, `AgentTool`, `Tool`, `ApiError`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `Organization` (e.g. with `reset_demo_data()` and `get_gateway_context()`) actually correct?**
  _`Organization` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1305194805194805 - nodes in this community are weakly interconnected._
- **Why does `ApiKey` connect `UUID` to `test_register_org_success_atomic_onboarding`, `api/auth.py`, `🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard`, `Original User Request`, `PolicyRule`, `App.tsx`, `Organization`, `🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)`, `🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)`, `PolicyRule`, `AgentTool`, `ApiKeyService`, `Tool`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._