# Graph Report - AgentGuard  (2026-11-13)

## Corpus Check
- 190 files · ~162,550 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .drawio 6, .bat 3, (none) 2)

## Summary
- 2319 nodes · 6503 edges · 121 communities (89 shown, 32 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 1066 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `49c0317e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typing
- domain.ts
- Organization
- AuditService
- test_schemas.py
- AgentService
- App.tsx
- policies.py
- uuid
- api.ts
- frontend/package.json
- postgres
- organization_service.py
- approvals.py
- UserRead
- uuid
- User
- enums.py
- react
- compilerOptions
- auth-ui.tsx
- test_auth.py
- compilerOptions
- asyncio
- env.py
- ApprovalStatus
- PolicyRuleRead
- test_policies.py
- websocket_manager.py
- update_user
- api.ts
- ToolService
- PolicyService
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- AgentCreate
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- pytest
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
- convert_docs_to_docx.py
- ToolActionService
- PolicyDecision
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- test_tool_actions.py
- 🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- SanitizerService
- UserService
- PolicyRuleService
- Original User Request
- conftest.py
- Execution
- test_analytics.py
- .matches_conditions
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- list_alerts
- OrganizationSettings
- PlaygroundView.tsx
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- package.json
- services/__init__.py
- list_approvals
- policy_service.py
- get_analytics_overview
- audit_events.py
- cleanup_overrides
- scripts
- create_tool_action
- Organization
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- test_siem_webhook_test_ping_missing_url
- ToolAction
- list_executions
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- main.py
- ToolActionCreate
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- UserCreate
- reset_demo_data
- websocket_tenant_endpoint
- ApprovalResolveRequest
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- Agent
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- pnpm-workspace.yaml
- PolicyCreate
- react
- scripts
- 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)
- get_me
- cleanup_overrides
- get_attack_catalog
- cleanup_overrides

## God Nodes (most connected - your core abstractions)
1. `User` - 203 edges
2. `UserRole` - 123 edges
3. `make_admin_jwt()` - 80 edges
4. `ToolAction` - 73 edges
5. `Tool` - 71 edges
6. `Organization` - 69 edges
7. `BaseSchema` - 66 edges
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

## Communities (121 total, 32 thin omitted)

### Community 0 - "typing"
Cohesion: 0.08
Nodes (6): get_current_user(), require_admin_user(), get_db(), decode_access_token(), AnalyticsOverviewResponse, AnalyticsTimeseriesResponse

### Community 1 - "domain.ts"
Cohesion: 0.08
Nodes (24): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos (+16 more)

### Community 2 - "Organization"
Cohesion: 0.08
Nodes (14): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade() (+6 more)

### Community 4 - "test_schemas.py"
Cohesion: 0.13
Nodes (12): AlertSeverity, AlertStatus, AlertRead, AlertUpdateRequest, PolicyRuleCreate, _make_auth(), test_get_alert_by_id_found(), test_get_alert_by_id_not_found() (+4 more)

### Community 5 - "AgentService"
Cohesion: 0.09
Nodes (7): delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentUpdate, AgentService

### Community 6 - "App.tsx"
Cohesion: 0.18
Nodes (30): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, Alcance de la Fase 3:, INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, AppContent(), EmptyState(), DEFAULT_WIDTHS (+22 more)

### Community 7 - "policies.py"
Cohesion: 0.16
Nodes (7): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyRead

### Community 8 - "uuid"
Cohesion: 0.09
Nodes (13): ApiKey, test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash(), test_api_multi_tenant_isolation_cross_tenant_forbidden(), test_api_revoke_api_key_blocks_ai_agents() (+5 more)

### Community 9 - "api.ts"
Cohesion: 0.11
Nodes (22): EmptyStateAction, EmptyStateProps, QuickSetupWizardProps, AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_LABELS (+14 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "organization_service.py"
Cohesion: 0.07
Nodes (20): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization_settings(), User, OrganizationCreate (+12 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (38): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+30 more)

### Community 14 - "UserRead"
Cohesion: 0.13
Nodes (9): login(), register(), register_organization(), create_access_token(), RegisterOrgRequest, RegisterOrgResponse, TokenResponse, OrganizationRead (+1 more)

### Community 15 - "uuid"
Cohesion: 0.05
Nodes (49): RuleEffect, UserRole, Policy, PolicyRule, make_admin_jwt(), test_analytics_service_get_timeseries_empty_state(), test_api_analytics_anti_ai_shield(), test_api_analytics_overview_cross_tenant_forbidden() (+41 more)

### Community 16 - "User"
Cohesion: 0.10
Nodes (16): _setup_admin_auth(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found(), test_api_get_user_not_found() (+8 more)

### Community 17 - "enums.py"
Cohesion: 0.10
Nodes (11): AuditEvent, ActorType, test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success(), test_audit_service_get_by_id() (+3 more)

### Community 18 - "react"
Cohesion: 0.15
Nodes (14): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, HeaderProps, ResetDemoModal(), ResetDemoModalProps, ROLE_LABELS (+6 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (18): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+10 more)

### Community 21 - "test_auth.py"
Cohesion: 0.10
Nodes (13): get_password_hash(), test_anti_ai_shielding_in_control_plane(), test_control_plane_rejects_anonymous_and_x_user_id_without_jwt(), test_get_me_invalid_token(), test_get_me_missing_token(), test_get_me_success(), test_login_demo_credentials_and_alias(), test_login_invalid_password() (+5 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "asyncio"
Cohesion: 0.15
Nodes (9): _setup_admin_auth(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id() (+1 more)

### Community 24 - "env.py"
Cohesion: 0.11
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 25 - "ApprovalStatus"
Cohesion: 0.24
Nodes (6): _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success()

### Community 26 - "PolicyRuleRead"
Cohesion: 0.16
Nodes (6): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule(), PolicyRuleRead

### Community 27 - "test_policies.py"
Cohesion: 0.18
Nodes (8): _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.17
Nodes (5): delete_user(), get_user(), list_users(), update_user(), UserUpdate

### Community 30 - "api.ts"
Cohesion: 0.12
Nodes (34): B. Matriz Comparativa de Enums, AuthContext, AuthContextType, AuthUser, DEFAULT_DEMO_ORGS, DEMO_PROFILES, DEMO_IDS, GatewayExecutionPayload (+26 more)

### Community 31 - "ToolService"
Cohesion: 0.10
Nodes (6): delete_tool(), get_tool(), list_tools(), update_tool(), ToolUpdate, ToolService

### Community 33 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.33
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 35 - "AgentCreate"
Cohesion: 0.18
Nodes (5): assign_tool_to_agent(), create_agent(), AgentCreate, AgentToolRead, test_agent_and_agent_tool_schemas()

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

### Community 47 - "pytest"
Cohesion: 0.21
Nodes (4): _make_auth(), test_get_execution_by_id_not_found(), test_list_executions_endpoint(), test_organization_schemas()

### Community 48 - "BaseSchema"
Cohesion: 0.08
Nodes (15): AgentRead, AgentToolCreate, ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse, AuditEventBase, AuditEventCreate, AuditEventPagination (+7 more)

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
Cohesion: 0.16
Nodes (5): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online(), main()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "OverviewView.tsx"
Cohesion: 0.23
Nodes (11): QuickSetupWizard(), UseAgentGuardWebSocketOptions, WebSocketEventMessage, BackendHealthState, formatActionHuman(), formatHourLabel(), formatTick(), generateSplinePath() (+3 more)

### Community 56 - "convert_docs_to_docx.py"
Cohesion: 0.12
Nodes (8): check_database_health(), health_check(), ping(), root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 57 - "README.md"
Cohesion: 0.29
Nodes (5): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard

### Community 58 - "convert_docs_to_docx.py"
Cohesion: 0.20
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 60 - "PolicyDecision"
Cohesion: 0.06
Nodes (28): execute_gateway_action(), simulate_gateway_action(), ExecutionStatus, PolicyDecision, GatewayExecuteRequest, GatewayExecuteResponse, GatewayExecutionTraceRead, PDPDecisionResult (+20 more)

### Community 62 - "test_tool_actions.py"
Cohesion: 0.13
Nodes (11): _setup_admin_auth(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create() (+3 more)

### Community 67 - "SanitizerService"
Cohesion: 0.13
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 70 - "Original User Request"
Cohesion: 0.08
Nodes (23): Alcance de la Fase 2:, Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI (+15 more)

### Community 72 - "Execution"
Cohesion: 0.06
Nodes (26): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, AgentTool, Alert, Approval, ApprovalStatus, Execution, PEPGatewayService, clear_database() (+18 more)

### Community 73 - "test_analytics.py"
Cohesion: 0.17
Nodes (7): MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_overview_success(), test_api_analytics_timeseries_success()

### Community 74 - ".matches_conditions"
Cohesion: 0.17
Nodes (4): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric()

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.15
Nodes (13): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+5 more)

### Community 76 - "threat_detector.py"
Cohesion: 0.17
Nodes (3): ThreatAnalysisResult, ThreatDetectorService, 5. Deuda Técnica y Riesgos Detectados

### Community 77 - "list_alerts"
Cohesion: 0.27
Nodes (3): get_alert_by_id(), list_alerts(), update_alert_status()

### Community 78 - "OrganizationSettings"
Cohesion: 0.10
Nodes (4): OrganizationSettings, SiemWebhookTestResponse, OrganizationService, WebhookService

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.10
Nodes (22): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+14 more)

### Community 80 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.11
Nodes (17): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`) (+9 more)

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 83 - "list_approvals"
Cohesion: 0.20
Nodes (5): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead, ApprovalRead

### Community 84 - "policy_service.py"
Cohesion: 0.26
Nodes (3): PolicyUpdate, PolicyRuleCreateInPolicy, PolicyRuleUpdate

### Community 85 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "create_tool_action"
Cohesion: 0.24
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 90 - "Organization"
Cohesion: 0.15
Nodes (8): _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id()

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.12
Nodes (16): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico, 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`) (+8 more)

### Community 93 - "test_siem_webhook_test_ping_missing_url"
Cohesion: 0.20
Nodes (5): test_list_organizations_success(), test_siem_webhook_settings_update(), mock_execute(), test_siem_webhook_test_ping_missing_url(), test_siem_webhook_test_ping_success()

### Community 94 - "ToolAction"
Cohesion: 0.08
Nodes (24): Agent, AgentStatus, RiskLevel, Tool, ToolAction, make_api_key_pair(), test_mutation_agent_lifecycle_logs_audit_events(), test_gateway_execute_endpoint_serializes_real_latency() (+16 more)

### Community 95 - "list_executions"
Cohesion: 0.05
Nodes (36): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse, test_seed_data_already_exists_without_reset(), 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`) (+28 more)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.13
Nodes (14): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+6 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.18
Nodes (4): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key()

### Community 98 - "main.py"
Cohesion: 0.08
Nodes (6): verify_password(), check_redis_health(), lifespan(), test_register_org_api_key_validates_in_gateway_service(), test_register_org_duplicate_email_returns_400(), test_register_org_success_atomic_onboarding()

### Community 99 - "ToolActionCreate"
Cohesion: 0.22
Nodes (4): create_tool(), ToolActionCreate, ToolCreate, test_tool_and_action_schemas()

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.11
Nodes (17): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP (+9 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "UserCreate"
Cohesion: 0.29
Nodes (3): create_user(), UserCreate, test_user_schemas()

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.33
Nodes (5): 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final, 🧪 Métricas de Calidad y Cobertura (Pytest), 🎯 Resumen Ejecutivo de Entrega de la Semana 3

### Community 110 - "Agent"
Cohesion: 0.14
Nodes (10): _setup_admin_auth(), test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org() (+2 more)

### Community 111 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.33
Nodes (5): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas

### Community 114 - "react"
Cohesion: 0.18
Nodes (13): App(), getInitialView(), TOAST_CONFIG, ToastContainer(), ToastItem(), AuthProvider(), formatAuthUser(), ThemeProvider() (+5 more)

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 116 - "01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)"
Cohesion: 0.50
Nodes (3): 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 3. Análisis Específico de Contradicciones Internas en la Documentación

## Knowledge Gaps
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `organization_service.py` to `typing`, `Organization`, `test_schemas.py`, `AgentService`, `policies.py`, `uuid`, `UserRead`, `uuid`, `User`, `enums.py`, `test_auth.py`, `asyncio`, `ApprovalStatus`, `PolicyRuleRead`, `test_policies.py`, `update_user`, `ToolService`, `AgentCreate`, `pytest`, `PolicyDecision`, `test_tool_actions.py`, `UserService`, `Execution`, `test_analytics.py`, `list_alerts`, `list_approvals`, `get_analytics_overview`, `audit_events.py`, `create_tool_action`, `Organization`, `test_siem_webhook_test_ping_missing_url`, `ToolAction`, `list_executions`, `revoke_api_key`, `main.py`, `ToolActionCreate`, `UserCreate`, `reset_demo_data`, `Agent`, `get_me`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Are the 137 inferred relationships involving `User` (e.g. with `assign_tool_to_agent()` and `create_agent()`) actually correct?**
  _`User` has 137 INFERRED edges - model-reasoned connections that need verification._
- **Should `typing` be split into smaller, more focused modules?**
  _Cohesion score 0.0780399274047187 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `README.md` to `typing`, `domain.ts`, `App.tsx`, `Execution`, `ToolAction`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Are the 90 inferred relationships involving `UserRole` (e.g. with `register()` and `register_organization()`) actually correct?**
  _`UserRole` has 90 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07508771929824562 - nodes in this community are weakly interconnected._
- **Why does `useToast()` connect `App.tsx` to `api.ts`, `react`, `OverviewView.tsx`, `README.md`, `api.ts`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._