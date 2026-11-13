# Graph Report - AgentGuard  (2026-11-13)

## Corpus Check
- 188 files · ~158,784 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .drawio 6, .bat 3, (none) 2)

## Summary
- 2294 nodes · 6371 edges · 118 communities (87 shown, 31 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 1049 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67b72180`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typing
- domain.ts
- sqlalchemy
- AuditService
- PEPGatewayService
- AgentService
- App.tsx
- enums.py
- uuid
- api.ts
- frontend/package.json
- postgres
- organization_service.py
- approvals.py
- test_policy_rules.py
- make_admin_jwt
- User
- asyncio
- 2. Patrones de Diseño Recomendados para Desacoplar el Dominio
- compilerOptions
- test_organization_settings.py
- UserRole
- compilerOptions
- asyncio
- env.py
- ApprovalStatus
- create_api_key
- test_policies.py
- websocket_manager.py
- update_user
- domain.ts
- update_tool
- PolicyService
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- agents.py
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- models/user.py
- BaseSchema
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKey
- env.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- OverviewView.tsx
- convert_docs_to_docx.py
- README.md
- PolicyRule
- ToolActionService
- ToolAction
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- test_tool_actions.py
- 🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- SanitizerService
- asyncio
- PolicyRuleService
- Original User Request
- conftest.py
- AgentTool
- api/gateway.py
- .matches_conditions
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- list_alerts
- webhook_service.py
- PlaygroundView.tsx
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- auth-ui.tsx
- 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo
- list_approvals
- threat_detector.py
- get_analytics_overview
- audit_events.py
- cleanup_overrides
- Alcance de la Fase 2:
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- Organization
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- test_siem_webhook_test_ping_missing_url
- tests/conftest.py
- 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- main.py
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- Incrementos a Ejecutar:
- reset_demo_data
- test_seed_data_already_exists_without_reset
- Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio
- 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel)
- BRIEFING — 2026-11-03 02:34:00 UTC
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- Agent
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- pnpm-workspace.yaml
- ApiError
- react
- get_attack_catalog
- test_gateway_api.py
- list_executions

## God Nodes (most connected - your core abstractions)
1. `User` - 199 edges
2. `UserRole` - 120 edges
3. `make_admin_jwt()` - 80 edges
4. `ToolAction` - 73 edges
5. `Tool` - 71 edges
6. `Organization` - 66 edges
7. `BaseSchema` - 64 edges
8. `PolicyDecision` - 63 edges
9. `Execution` - 62 edges
10. `Agent` - 61 edges

## Surprising Connections (you probably didn't know these)
- `Fase 4: Autenticación JWT y Propagación Formal de Tenant Isolation` --references--> `get_current_user()`  [INFERRED]
  docs/archive/INFORME_MOCKUPS_FRONT_BACK.md → backend/app/api/deps.py
- `3.2 Superficie HTTP/WebSocket real (`backend/app/api/`)` --references--> `get_current_user()`  [INFERRED]
  docs/archive/_MASTER_PROJECT_SNAPSHOT.md → backend/app/api/deps.py
- `4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens)` --references--> `require_admin_user()`  [INFERRED]
  AGENTS.md → backend/app/api/deps.py
- `¿Qué se hace concretamente?` --references--> `get_db()`  [INFERRED]
  docs/archive/desglose_de_pasos_semana_1_base_de_datos_y_setup_inicial.md → backend/app/core/database.py
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py

## Import Cycles
- None detected.

## Communities (118 total, 31 thin omitted)

### Community 0 - "typing"
Cohesion: 0.08
Nodes (5): get_current_user(), require_admin_user(), websocket_global_endpoint(), websocket_tenant_endpoint(), get_db()

### Community 1 - "domain.ts"
Cohesion: 0.10
Nodes (20): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, extractApiError(), GatewayExecutionResult, handleNetworkError(), Agent, AgentStatus, AnalyticsOverview (+12 more)

### Community 2 - "sqlalchemy"
Cohesion: 0.11
Nodes (10): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade() (+2 more)

### Community 4 - "PEPGatewayService"
Cohesion: 0.15
Nodes (3): PEPGatewayService, 2.2 Mapa de Contradicciones (Doc vs. Doc y Doc vs. Código/Graphify), 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro

### Community 5 - "AgentService"
Cohesion: 0.07
Nodes (3): AgentService, OrganizationService, UserService

### Community 6 - "App.tsx"
Cohesion: 0.17
Nodes (32): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, AppContent(), getInitialView(), EmptyState(), EmptyStateAction, EmptyStateProps (+24 more)

### Community 7 - "enums.py"
Cohesion: 0.06
Nodes (21): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), create_policy_rule(), delete_policy_rule() (+13 more)

### Community 8 - "uuid"
Cohesion: 0.08
Nodes (21): _make_auth(), test_get_alert_by_id_not_found(), test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents() (+13 more)

### Community 9 - "api.ts"
Cohesion: 0.09
Nodes (24): HeaderProps, ResetDemoModal(), ResetDemoModalProps, AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_STYLES (+16 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.08
Nodes (29): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18 (+21 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "organization_service.py"
Cohesion: 0.09
Nodes (13): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization_settings(), OrganizationCreate, OrganizationRead (+5 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (41): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+33 more)

### Community 14 - "test_policy_rules.py"
Cohesion: 0.11
Nodes (11): Policy, test_create_rule_in_policy_anti_ai_blocked(), test_create_rule_in_policy_success(), test_create_rule_target_agent_from_different_org(), test_create_rule_tool_action_from_different_org(), test_delete_policy_rule_anti_ai_blocked(), test_delete_policy_rule_preserves_policy_and_sister_rules(), test_update_policy_rule_anti_ai_blocked() (+3 more)

### Community 15 - "make_admin_jwt"
Cohesion: 0.06
Nodes (22): make_admin_jwt(), MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield() (+14 more)

### Community 16 - "User"
Cohesion: 0.11
Nodes (17): User, _setup_admin_auth(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found() (+9 more)

### Community 17 - "asyncio"
Cohesion: 0.08
Nodes (11): test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_get_audit_event_not_found(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success(), test_api_list_audit_events_tenant_isolation_forbidden(), test_audit_service_log_audit_event() (+3 more)

### Community 18 - "2. Patrones de Diseño Recomendados para Desacoplar el Dominio"
Cohesion: 0.50
Nodes (4): 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`), 2.4 *Strategy + Circuit Breaker* para Despacho de Herramientas (`LiveRestDispatcher` vs. `SandboxMockDispatcher`), 2. Patrones de Diseño Recomendados para Desacoplar el Dominio

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "test_organization_settings.py"
Cohesion: 0.09
Nodes (14): test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_get_settings_success(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_multi_tenant_isolation_patch_cross_tenant_denied(), test_api_patch_settings_not_found() (+6 more)

### Community 21 - "UserRole"
Cohesion: 0.04
Nodes (29): get_me(), login(), register(), create_user(), create_access_token(), decode_access_token(), get_password_hash(), verify_password() (+21 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "asyncio"
Cohesion: 0.12
Nodes (7): test_api_create_tool_organization_not_found(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 24 - "env.py"
Cohesion: 0.11
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 25 - "ApprovalStatus"
Cohesion: 0.20
Nodes (8): ApprovalStatus, _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success(), test_approval_resolve_schema()

### Community 27 - "test_policies.py"
Cohesion: 0.15
Nodes (9): _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id() (+1 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.21
Nodes (4): delete_user(), get_user(), list_users(), update_user()

### Community 30 - "domain.ts"
Cohesion: 0.15
Nodes (14): AuthContext, AuthContextType, AuthProvider(), DEFAULT_DEMO_ORGS, DEMO_PROFILES, formatAuthUser(), ApprovalRequest, ApprovalStatus (+6 more)

### Community 31 - "update_tool"
Cohesion: 0.16
Nodes (5): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool()

### Community 32 - "PolicyService"
Cohesion: 0.10
Nodes (3): PolicyService, ToolService, 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`

### Community 33 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.33
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 35 - "agents.py"
Cohesion: 0.10
Nodes (13): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentCreate (+5 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.11
Nodes (19): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada (+11 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 48 - "BaseSchema"
Cohesion: 0.04
Nodes (26): create_tool_action(), get_tool_action(), list_tool_actions(), AlertRead, AlertUpdateRequest, AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint (+18 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.08
Nodes (23): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1 (+15 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 53 - "env.py"
Cohesion: 0.20
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "OverviewView.tsx"
Cohesion: 0.31
Nodes (9): AlertSeverity, BackendHealthState, formatActionHuman(), formatHourLabel(), formatTick(), generateSplinePath(), OverviewSkeleton(), OverviewStats (+1 more)

### Community 56 - "convert_docs_to_docx.py"
Cohesion: 0.08
Nodes (16): check_database_health(), health_check(), ping(), root(), add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins() (+8 more)

### Community 57 - "README.md"
Cohesion: 0.29
Nodes (5): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard

### Community 58 - "PolicyRule"
Cohesion: 0.12
Nodes (9): RuleEffect, PolicyRule, PDPEngine, test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_priority_tie_deny_wins() (+1 more)

### Community 60 - "ToolAction"
Cohesion: 0.09
Nodes (32): AgentStatus, ExecutionStatus, PolicyDecision, RiskLevel, Tool, ToolAction, GatewayExecuteRequest, PDPDecisionResult (+24 more)

### Community 62 - "test_tool_actions.py"
Cohesion: 0.13
Nodes (11): _setup_admin_auth(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create() (+3 more)

### Community 67 - "SanitizerService"
Cohesion: 0.13
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 68 - "asyncio"
Cohesion: 0.17
Nodes (5): test_api_get_policy_rule_found(), test_api_list_policy_rules(), test_policy_rule_service_create(), test_policy_rule_service_get_by_id(), test_policy_rule_service_list_rules()

### Community 70 - "Original User Request"
Cohesion: 0.17
Nodes (11): Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, Initial Request — 2026-11-02 17:46:15 UTC, Original User Request (+3 more)

### Community 72 - "AgentTool"
Cohesion: 0.09
Nodes (26): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, AgentTool, Alert, Approval, AlertSeverity, AlertStatus, clear_database(), main() (+18 more)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.15
Nodes (13): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+5 more)

### Community 77 - "list_alerts"
Cohesion: 0.27
Nodes (3): get_alert_by_id(), list_alerts(), update_alert_status()

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.09
Nodes (24): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+16 more)

### Community 80 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.14
Nodes (13): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 4. Protocolo de Espera y Entrega de Resultados en HITL (`REQUIRE_APPROVAL`), 5. Custodia de Parámetros Originales para Re-Despacho HITL (Problema `"***REDACTED***"`) (+5 more)

### Community 81 - "auth-ui.tsx"
Cohesion: 0.05
Nodes (55): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+47 more)

### Community 82 - "4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo"
Cohesion: 0.33
Nodes (6): 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo, SecurityStanceSettings

### Community 83 - "list_approvals"
Cohesion: 0.27
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 85 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 86 - "audit_events.py"
Cohesion: 0.18
Nodes (5): get_audit_event(), list_audit_events(), AuditEventBase, AuditEventCreate, AuditEventResponse

### Community 88 - "Alcance de la Fase 2:"
Cohesion: 0.29
Nodes (7): Alcance de la Fase 2:, INC-05: Router y Servicios para la Tabla Formal `audit_events`, INC-06: Router de Analítica y Series Temporales (`/analytics/overview` y `/timeseries`), INC-07: Conexión de Métricas Reales en `OverviewView.tsx`, INC-08: Modelo, Migración y Router de API Keys PEP (`/api/v1/api-keys`), INC-09: Conexión de Gestión de API Keys en `SettingsView.tsx`, INC-10: Persistencia de Configuración de Gobernanza de la Organización

### Community 89 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.15
Nodes (12): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+4 more)

### Community 90 - "Organization"
Cohesion: 0.12
Nodes (13): Organization, _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create() (+5 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.14
Nodes (13): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1.3 Flujo principal operativo vs. onboarding en "pocos clics", 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`), 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`), 3. Modelo de Datos y Contratos Clave, 4.1 Módulos construidos y verificables en código (+5 more)

### Community 93 - "test_siem_webhook_test_ping_missing_url"
Cohesion: 0.20
Nodes (5): test_list_organizations_success(), test_siem_webhook_settings_update(), mock_execute(), test_siem_webhook_test_ping_missing_url(), test_siem_webhook_test_ping_success()

### Community 94 - "tests/conftest.py"
Cohesion: 0.08
Nodes (7): test_api_get_attack_catalog(), test_threat_detector_base64_obfuscation(), test_threat_detector_clean_parameters(), test_threat_detector_data_exfiltration(), test_threat_detector_destructive_sql(), test_threat_detector_embedded_base64_obfuscation(), test_threat_detector_goal_hijacking()

### Community 95 - "03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural"
Cohesion: 0.15
Nodes (12): 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP, 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs (+4 more)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.13
Nodes (14): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+6 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.24
Nodes (3): get_api_key(), list_api_keys(), revoke_api_key()

### Community 99 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.18
Nodes (10): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz), 5. Dependencias Huérfanas y Scripts de Monorepo Rotos, 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA (+2 more)

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.14
Nodes (13): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 3.2 Cuellos de Botella en Frontend (Renderizado, Red, Estado y Memoria) (+5 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "Incrementos a Ejecutar:"
Cohesion: 0.40
Nodes (5): INC-01: Homogeneización de Enums y Localización Integral al Español en la UI, INC-02: Endpoints Granulares de Reglas, Aislamiento por Empresa y Blindaje Anti-IA, INC-03: Rediseño Jerárquico y Desacoplamiento de Borrado en `PoliciesView.tsx`, INC-04: Persistencia y Serialización de Latencia Real de Ejecuciones, Incrementos a Ejecutar:

### Community 106 - "Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio"
Cohesion: 0.50
Nodes (4): 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días), Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio

### Community 107 - "2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel)"
Cohesion: 0.50
Nodes (4): 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.33
Nodes (5): 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final, 🧪 Métricas de Calidad y Cobertura (Pytest), 🎯 Resumen Ejecutivo de Entrega de la Semana 3

### Community 110 - "Agent"
Cohesion: 0.14
Nodes (11): Agent, _setup_admin_auth(), test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success() (+3 more)

### Community 111 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.18
Nodes (8): PolicyRuleCreate, test_policy_and_policy_rule_schemas_fail_closed(), 🛡️ Cumplimiento de Reglas Innegociables del Dominio, 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas

### Community 113 - "ApiError"
Cohesion: 0.17
Nodes (10): 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), Alcance de la Fase 3:, INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión (+2 more)

### Community 114 - "react"
Cohesion: 0.15
Nodes (14): App(), TOAST_CONFIG, ToastContainer(), ToastItem(), Theme, ThemeContext, ThemeContextType, ThemeProvider() (+6 more)

### Community 123 - "test_gateway_api.py"
Cohesion: 0.14
Nodes (9): GatewayExecuteResponse, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_invalid_api_key_returns_401(), test_gateway_execute_missing_api_key_returns_401(), test_gateway_execute_org_mismatch_returns_403(), test_gateway_execute_validation_error() (+1 more)

### Community 136 - "list_executions"
Cohesion: 0.22
Nodes (6): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse, 3.4 Latencia Forense Ficticia (`latency_ms=21.5`), 5. Deuda Técnica Estructural, Contratos Incompletos y Configuración

## Knowledge Gaps
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `typing`, `PEPGatewayService`, `AgentService`, `enums.py`, `list_executions`, `uuid`, `organization_service.py`, `test_policy_rules.py`, `make_admin_jwt`, `asyncio`, `test_organization_settings.py`, `UserRole`, `ApprovalStatus`, `create_api_key`, `test_policies.py`, `update_user`, `update_tool`, `agents.py`, `models/user.py`, `BaseSchema`, `ToolAction`, `test_tool_actions.py`, `AgentTool`, `list_alerts`, `list_approvals`, `get_analytics_overview`, `audit_events.py`, `Organization`, `test_siem_webhook_test_ping_missing_url`, `revoke_api_key`, `reset_demo_data`, `Agent`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Are the 134 inferred relationships involving `User` (e.g. with `assign_tool_to_agent()` and `create_agent()`) actually correct?**
  _`User` has 134 INFERRED edges - model-reasoned connections that need verification._
- **Should `typing` be split into smaller, more focused modules?**
  _Cohesion score 0.08469945355191257 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `README.md` to `typing`, `App.tsx`, `AgentTool`, `ApiError`, `ToolAction`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Are the 88 inferred relationships involving `UserRole` (e.g. with `register()` and `require_admin_user()`) actually correct?**
  _`UserRole` has 88 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09626216077828981 - nodes in this community are weakly interconnected._
- **Why does `useToast()` connect `App.tsx` to `README.md`, `react`, `ApiError`, `api.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._