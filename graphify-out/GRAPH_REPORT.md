# Graph Report - AgentGuard  (2026-11-13)

## Corpus Check
- 191 files · ~164,448 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .drawio 6, .example 3, .bat 3)

## Summary
- 2357 nodes · 6570 edges · 123 communities (86 shown, 37 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 1085 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `95af4c5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typing
- domain.ts
- enums.py
- test_audit_events.py
- Execution
- _setup_admin_auth
- SettingsView.tsx
- pytest
- uuid
- labels.ts
- frontend/package.json
- postgres
- User
- approvals.py
- register_organization
- test_policy_rules.py
- User
- sqlalchemy
- react
- compilerOptions
- auth-ui.tsx
- test_auth.py
- compilerOptions
- uuid
- env.py
- list_executions
- PolicyRuleRead
- test_policies.py
- websocket_manager.py
- update_user
- api.ts
- ToolService
- PolicyService
- _setup_user_auth
- agent_service.py
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)
- OrganizationSettings
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
- Colors
- ToolAction
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- tool_action_service.py
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- CLAUDE.md
- audit_event.py
- copilot-instructions.md
- SanitizerService
- UserService
- PolicyRuleService
- Original User Request
- main.py
- make_admin_jwt
- .matches_conditions
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- test_list_executions_endpoint
- PlaygroundView.tsx
- App.tsx
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- package.json
- ToastContext.tsx
- list_approvals
- policies.py
- test_api_reset_demo_success
- audit_events.py
- cleanup_overrides
- scripts
- create_tool_action
- Organization
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- _AutoYieldOverrides
- RiskLevel
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- run_demo.py
- execute_gateway_action
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- reset_demo_data
- websocket_tenant_endpoint
- 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- get_me
- ToolAction
- test_audit_service_log_audit_event
- pnpm-workspace.yaml
- threat_detector.py
- cleanup_overrides
- scripts
- cleanup_overrides
- list_alerts
- get_attack_catalog
- .verify_api_key
- 002_add_latency_ms_to_executions.py
- 005_add_hashed_password_to_users.py
- parse_args

## God Nodes (most connected - your core abstractions)
1. `User` - 203 edges
2. `UserRole` - 122 edges
3. `make_admin_jwt()` - 80 edges
4. `ToolAction` - 74 edges
5. `Tool` - 71 edges
6. `Organization` - 69 edges
7. `BaseSchema` - 66 edges
8. `PolicyDecision` - 62 edges
9. `Agent` - 61 edges
10. `Execution` - 60 edges

## Surprising Connections (you probably didn't know these)
- `❓ P1: *"¿Cómo garantizan consistencia entre políticas recién modificadas y evaluaciones en tiempo real?"*` --references--> `PDPEngine`  [INFERRED]
  agentguard_arquitectura_runtime.md → backend/app/services/pdp_engine.py
- `A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution.status`)` --references--> `ExecutionStatus`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/enums.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`)` --references--> `AlertStatus`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/enums.py
- `A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación` --references--> `ApiKey`  [INFERRED]
  agentguard_mer_relacional.md → backend/app/models/api_key.py
- `4.2 Estándares de Frontend (`TypeScript 6` / `React 19` / `Vite 8` / `pnpm`)` --references--> `ApiError`  [INFERRED]
  docs/archive/audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md → frontend/src/services/api.ts

## Import Cycles
- None detected.

## Communities (123 total, 37 thin omitted)

### Community 0 - "typing"
Cohesion: 0.10
Nodes (3): get_current_user(), require_admin_user(), get_db()

### Community 1 - "domain.ts"
Cohesion: 0.10
Nodes (12): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), AgentGuardApiClient (+4 more)

### Community 2 - "enums.py"
Cohesion: 0.15
Nodes (5): downgrade(), upgrade(), Base, Organization, Policy

### Community 3 - "test_audit_events.py"
Cohesion: 0.16
Nodes (7): AuditEvent, ActorType, AuditService, test_audit_service_get_by_id(), test_audit_service_list_and_count_events(), 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`)

### Community 4 - "Execution"
Cohesion: 0.06
Nodes (31): 3. Componentes Clave de Runtime, 3. Análisis Detallado de Transiciones y Respuestas HTTP, 4. Concurrencia y Prevención de Condiciones de Carrera (TOCTOU), AgentTool, Alert, Approval, AlertSeverity, AlertStatus (+23 more)

### Community 5 - "_setup_admin_auth"
Cohesion: 0.12
Nodes (9): _setup_admin_auth(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id() (+1 more)

### Community 6 - "SettingsView.tsx"
Cohesion: 0.17
Nodes (27): 1. Observation, Alcance de la Fase 3:, INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, EmptyState(), EmptyStateAction, EmptyStateProps, DEFAULT_WIDTHS (+19 more)

### Community 7 - "pytest"
Cohesion: 0.17
Nodes (6): test_alert_schema(), test_approval_resolve_schema(), test_gateway_schemas(), test_organization_schemas(), test_policy_and_policy_rule_schemas_fail_closed(), test_tool_and_action_schemas()

### Community 8 - "uuid"
Cohesion: 0.07
Nodes (16): decode_access_token(), verify_password(), ApiKey, test_api_create_api_key_blocks_ai_agents(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash(), test_api_revoke_api_key_blocks_ai_agents() (+8 more)

### Community 9 - "labels.ts"
Cohesion: 0.11
Nodes (15): QuickSetupWizardProps, AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_LABELS, DECISION_STYLES, RISK_LABELS (+7 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "User"
Cohesion: 0.05
Nodes (41): UserRole, User, make_admin_jwt(), _setup_admin_auth(), test_api_create_agent_owner_different_org(), test_api_create_agent_success(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash() (+33 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (38): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+30 more)

### Community 14 - "register_organization"
Cohesion: 0.23
Nodes (4): login(), register(), register_organization(), create_access_token()

### Community 15 - "test_policy_rules.py"
Cohesion: 0.09
Nodes (16): RuleEffect, PolicyRule, PolicyRuleCreate, test_pdp_evaluate_allow(), test_pdp_evaluate_priority_tie_deny_wins(), test_pdp_evaluate_require_approval(), _setup_admin_auth(), test_api_create_policy_rule_policy_not_found() (+8 more)

### Community 16 - "User"
Cohesion: 0.10
Nodes (16): _setup_admin_auth(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found(), test_api_get_user_not_found() (+8 more)

### Community 17 - "sqlalchemy"
Cohesion: 0.18
Nodes (4): downgrade(), upgrade(), downgrade(), upgrade()

### Community 18 - "react"
Cohesion: 0.19
Nodes (11): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, HeaderProps, Theme, ThemeContext, ThemeContextType (+3 more)

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

### Community 23 - "uuid"
Cohesion: 0.08
Nodes (25): RiskLevel, test_pdp_evaluate_deny_fail_closed(), test_create_rule_in_policy_anti_ai_blocked(), test_create_rule_in_policy_cross_tenant_rejected(), test_create_rule_in_policy_non_admin_forbidden(), test_create_rule_in_policy_success(), test_create_rule_target_agent_from_different_org(), test_create_rule_tool_action_from_different_org() (+17 more)

### Community 24 - "env.py"
Cohesion: 0.11
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 25 - "list_executions"
Cohesion: 0.09
Nodes (17): get_execution_by_id(), list_executions(), _to_execution_response(), 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed) (+9 more)

### Community 26 - "PolicyRuleRead"
Cohesion: 0.16
Nodes (5): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule()

### Community 27 - "test_policies.py"
Cohesion: 0.13
Nodes (9): _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id() (+1 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.11
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.13
Nodes (9): create_user(), delete_user(), get_user(), list_users(), update_user(), UserCreate, UserRead, UserUpdate (+1 more)

### Community 30 - "api.ts"
Cohesion: 0.11
Nodes (37): B. Matriz Comparativa de Enums, AuthContext, AuthContextType, AuthUser, DEFAULT_DEMO_ORGS, DEMO_PROFILES, GatewayExecutionPayload, GatewayExecutionResult (+29 more)

### Community 31 - "ToolService"
Cohesion: 0.09
Nodes (8): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolRead, ToolUpdate, ToolService

### Community 33 - "_setup_user_auth"
Cohesion: 0.23
Nodes (6): _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success()

### Community 35 - "agent_service.py"
Cohesion: 0.05
Nodes (18): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentCreate (+10 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)"
Cohesion: 0.20
Nodes (9): 1. Modelado de Estados en Arquitecturas Asíncronas (`202 Accepted`), 2. Diagramas de Estados Reales (Mermaid), 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution.status`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval.status`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`), 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted), ❓ P1: *"¿Por qué cambiaron de mantener la conexión HTTP abierta a devolver `202 Accepted` en HITL?"* (+1 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.11
Nodes (19): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 2. Asignación por Paquete (+11 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid — 13 Tablas), 3. Decisiones Arquitectónicas y Justificación Técnica, 4. Capacidades Clave de la Persistencia, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación, B. Uso de `UUID v4` como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` con Índices GIN (+4 more)

### Community 47 - "OrganizationSettings"
Cohesion: 0.06
Nodes (12): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization_settings(), OrganizationSettings, OrganizationSettingsUpdate (+4 more)

### Community 48 - "BaseSchema"
Cohesion: 0.06
Nodes (21): AgentRead, AgentToolRead, AlertUpdateRequest, TimeseriesPoint, ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse, ApprovalRead (+13 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.05
Nodes (39): ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI), 🏗️ Arquitectura de la API REST (`/api/v1`), 📋 Especificaciones Históricas Archivadas, 📁 Estructura del Código Fuente, 🧪 Pruebas Automatizadas, 🗄️ Versionado de Base de Datos con Alembic, 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2) (+31 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.29
Nodes (6): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime Real (Mermaid), 4. Preguntas Difíciles del Profesor y Respuestas Recomendadas, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Cómo garantizan consistencia entre políticas recién modificadas y evaluaciones en tiempo real?"*, ❓ P2: *"¿Qué ocurre si una petición activa `REQUIRE_APPROVAL` y nadie responde?"*

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia Real (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. Cierre Forense en `TracesView` (`GET /api/v1/executions`), Escenario 1: Operación Normal (`ALLOW` — HTTP `200 OK`), Escenario 2: Privilegio Mínimo / Abuso Bloqueado (`DENY` — HTTP `403 Forbidden`), Escenario 3: Operación Sensible con Human-in-the-Loop (`REQUIRE_APPROVAL` — HTTP `202 Accepted`), Escenario 4: Exfiltración de Datos y Alerta Crítica (`DENY + CRITICAL ALERT` — HTTP `403 Forbidden`) (+1 more)

### Community 53 - "env.py"
Cohesion: 0.19
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "OverviewView.tsx"
Cohesion: 0.22
Nodes (12): QuickSetupWizard(), DEMO_IDS, UseAgentGuardWebSocketOptions, WebSocketEventMessage, BackendHealthState, formatActionHuman(), formatHourLabel(), formatTick() (+4 more)

### Community 56 - "convert_docs_to_docx.py"
Cohesion: 0.12
Nodes (8): check_database_health(), health_check(), ping(), root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 57 - "README.md"
Cohesion: 0.20
Nodes (7): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard, 🌐 AgentGuard — Frontend (Dashboard Web SPA SaaS B2B), 🛠️ Comandos Útiles (`pnpm`)

### Community 58 - "convert_docs_to_docx.py"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 60 - "ToolAction"
Cohesion: 0.07
Nodes (34): Agent, AgentStatus, ExecutionStatus, PolicyDecision, Tool, GatewayExecuteRequest, GatewayExecuteResponse, GatewayExecutionTraceRead (+26 more)

### Community 63 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.29
Nodes (6): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

### Community 65 - "audit_event.py"
Cohesion: 0.24
Nodes (4): AuditEventBase, AuditEventCreate, AuditEventPagination, AuditEventResponse

### Community 67 - "SanitizerService"
Cohesion: 0.12
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 70 - "Original User Request"
Cohesion: 0.08
Nodes (23): Alcance de la Fase 2:, Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI (+15 more)

### Community 73 - "make_admin_jwt"
Cohesion: 0.06
Nodes (21): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access(), AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, AnalyticsService, MockOverviewRow (+13 more)

### Community 74 - ".matches_conditions"
Cohesion: 0.17
Nodes (4): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric()

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA, 🚀 Arranque Rápido Local, 🏛️ Contexto Institucional y Equipo, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles, 🎬 La Secuencia de la Demo Principal (En Vivo) (+4 more)

### Community 78 - "PlaygroundView.tsx"
Cohesion: 0.20
Nodes (9): ATTACK_VECTORS, AttackVectorOption, CompanyDatabaseState, INITIAL_DATABASE_STATE, SimulatedCustomer, SimulatedProduct, SimulatedTransaction, SimulationDecision (+1 more)

### Community 79 - "App.tsx"
Cohesion: 0.12
Nodes (29): 2.1 Arquitectura de Ruteo y Navegación Hash, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, App(), AppContent(), getInitialView(), Sidebar(), SidebarProps (+21 more)

### Community 80 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.12
Nodes (16): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días) (+8 more)

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 82 - "ToastContext.tsx"
Cohesion: 0.31
Nodes (7): TOAST_CONFIG, ToastContainer(), ToastItem(), Toast, ToastContext, ToastContextType, ToastType

### Community 83 - "list_approvals"
Cohesion: 0.17
Nodes (5): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead, ApprovalResolveRequest

### Community 84 - "policies.py"
Cohesion: 0.11
Nodes (12): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyCreate, PolicyRead (+4 more)

### Community 85 - "test_api_reset_demo_success"
Cohesion: 0.33
Nodes (3): test_api_reset_demo_success(), test_seed_data_already_exists_without_reset(), 6. Diagnóstico de la Suite de Pruebas (`backend/tests/`)

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "create_tool_action"
Cohesion: 0.24
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 90 - "Organization"
Cohesion: 0.15
Nodes (9): _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id() (+1 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.15
Nodes (12): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico, 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`) (+4 more)

### Community 94 - "RiskLevel"
Cohesion: 0.11
Nodes (8): test_api_get_attack_catalog(), test_gateway_execute_blocks_prompt_injection(), test_threat_detector_base64_obfuscation(), test_threat_detector_clean_parameters(), test_threat_detector_data_exfiltration(), test_threat_detector_destructive_sql(), test_threat_detector_embedded_base64_obfuscation(), test_threat_detector_goal_hijacking()

### Community 95 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.12
Nodes (15): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo (+7 more)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.13
Nodes (14): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+6 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.18
Nodes (4): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key()

### Community 98 - "run_demo.py"
Cohesion: 0.12
Nodes (12): build_payload(), _configure_stdio(), _decision_color(), DemoConfig, DemoScenario, load_config(), main(), _mask_api_key() (+4 more)

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.11
Nodes (17): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP (+9 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.15
Nodes (12): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+4 more)

### Community 106 - "01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)"
Cohesion: 0.50
Nodes (3): 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 3. Análisis Específico de Contradicciones Internas en la Documentación

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 110 - "ToolAction"
Cohesion: 0.10
Nodes (12): ToolAction, test_demo_scenario_2_privilege_abuse_deny(), test_demo_scenario_3_high_impact_require_approval_and_resolve(), test_demo_scenario_4_prompt_injection_deny_and_critical_alert(), test_pep_resolve_approval_approved_with_for_update(), test_gateway_simulate_endpoint(), mock_execute(), test_api_create_policy_rule_target_agent_different_org() (+4 more)

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 117 - "list_alerts"
Cohesion: 0.24
Nodes (4): get_alert_by_id(), list_alerts(), update_alert_status(), AlertRead

### Community 122 - ".verify_api_key"
Cohesion: 0.25
Nodes (4): 4.1 Módulos construidos y verificables en código, 4.2 Módulos a medio hacer o parcialmente cableados, 4.3 Elementos que quedaron solo en papel, 4. Estado Real del Proyecto (Código vs. Graphify vs. Docs)

## Knowledge Gaps
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `typing`, `enums.py`, `Execution`, `_setup_admin_auth`, `uuid`, `register_organization`, `test_policy_rules.py`, `User`, `test_auth.py`, `uuid`, `list_executions`, `PolicyRuleRead`, `test_policies.py`, `update_user`, `ToolService`, `_setup_user_auth`, `agent_service.py`, `OrganizationSettings`, `ToolAction`, `UserService`, `main.py`, `make_admin_jwt`, `list_approvals`, `policies.py`, `test_api_reset_demo_success`, `audit_events.py`, `create_tool_action`, `Organization`, `revoke_api_key`, `reset_demo_data`, `get_me`, `ToolAction`, `list_alerts`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Are the 137 inferred relationships involving `User` (e.g. with `assign_tool_to_agent()` and `create_agent()`) actually correct?**
  _`User` has 137 INFERRED edges - model-reasoned connections that need verification._
- **Should `typing` be split into smaller, more focused modules?**
  _Cohesion score 0.09730301427815971 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `README.md` to `typing`, `domain.ts`, `Execution`, `SettingsView.tsx`, `ToolAction`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Are the 89 inferred relationships involving `UserRole` (e.g. with `register()` and `register_organization()`) actually correct?**
  _`UserRole` has 89 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10240655401945725 - nodes in this community are weakly interconnected._
- **Why does `ApiKey` connect `uuid` to `typing`, `enums.py`, `🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard`, `SettingsView.tsx`, `Original User Request`, `User`, `🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)`, `register_organization`, `ToolAction`, `📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial`, `ApiKey`, `.verify_api_key`, `ToolAction`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._