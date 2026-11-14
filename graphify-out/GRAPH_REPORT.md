# Graph Report - AgentGuard  (2026-11-14)

## Corpus Check
- 193 files · ~169,336 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .drawio 6, .example 3, .bat 3)

## Summary
- 2438 nodes · 6666 edges · 128 communities (93 shown, 35 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 705 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29b3daa5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typing
- domain.ts
- enums.py
- AuditService
- Execution
- _setup_admin_auth
- App.tsx
- test_gateway_api.py
- uuid
- labels.ts
- frontend/package.json
- postgres
- asyncio
- approvals.py
- api/auth.py
- PolicyRuleCreate
- User
- test_organization_settings.py
- react
- compilerOptions
- auth-ui.tsx
- test_audit_events.py
- compilerOptions
- test_tool_actions.py
- env.py
- list_executions
- asyncio
- seed_data
- websocket_manager.py
- update_user
- api.ts
- ToolService
- PolicyService
- AuthContext.tsx
- AgentService
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)
- OrganizationService
- BaseSchema
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- test_threat_detector.py
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKey
- env.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- OverviewView.tsx
- PolicyRuleService
- README.md
- convert_docs_to_docx.py
- get_analytics_overview
- ToolAction
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- ToolActionService
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- CLAUDE.md
- PlaygroundView.tsx
- copilot-instructions.md
- SanitizerService
- UserService
- services/__init__.py
- Original User Request
- demo.py
- 003_add_api_keys.py
- make_admin_jwt
- .matches_conditions
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)
- ensure_same_tenant
- PlaygroundView.tsx
- DemoConfig
- package.json
- ToastContext.tsx
- list_approvals
- policies.py
- test_seed_data_fresh_creation
- 002_add_latency_ms_to_executions.py
- cleanup_overrides
- scripts
- create_tool_action
- Organization
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- _AutoYieldOverrides
- _mock_user_auth
- 005_add_hashed_password_to_users.py
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- main
- simulate_gateway_action
- PEPGatewayService
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- test_list_executions_endpoint
- websocket_tenant_endpoint
- update_tool
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- cleanup_overrides
- test_agents.py
- pnpm-workspace.yaml
- threat_detector.py
- scripts
- cleanup_overrides
- list_alerts
- _make_auth
- Alcance de la Fase 2:
- Skeleton.tsx
- ApiKey
- agent_service.py
- run_demo.py
- clear_overrides

## God Nodes (most connected - your core abstractions)
1. `User` - 152 edges
2. `UserRole` - 97 edges
3. `make_admin_jwt()` - 86 edges
4. `ToolAction` - 69 edges
5. `Organization` - 69 edges
6. `Tool` - 67 edges
7. `BaseSchema` - 66 edges
8. `Agent` - 59 edges
9. `AgentTool` - 57 edges
10. `Execution` - 55 edges

## Surprising Connections (you probably didn't know these)
- `Los 4 Escenarios Canónicos de `agent-demo`` --references--> `AgentTool`  [INFERRED]
  agentguard_credenciales_demo.md → backend/app/models/agent.py
- `4.2 Estándares de Frontend (`TypeScript 6` / `React 19` / `Vite 8` / `pnpm`)` --references--> `ApiError`  [INFERRED]
  docs/archive/audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md → frontend/src/services/api.ts
- `A. Contenedor de Políticas vs. Reglas Atómicas (1:N Desalineado)` --references--> `PolicyRule`  [INFERRED]
  docs/archive/INFORME_MOCKUPS_FRONT_BACK.md → backend/app/models/policy.py
- `A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación` --references--> `ApiKey`  [INFERRED]
  agentguard_mer_relacional.md → backend/app/models/api_key.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`)` --references--> `AlertStatus`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/enums.py

## Import Cycles
- None detected.

## Communities (128 total, 35 thin omitted)

### Community 0 - "typing"
Cohesion: 0.06
Nodes (9): get_audit_event(), list_audit_events(), get_current_user(), require_admin_user(), ActorType, AuditEventBase, AuditEventCreate, AuditEventResponse (+1 more)

### Community 1 - "domain.ts"
Cohesion: 0.10
Nodes (13): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), AgentGuardApiClient (+5 more)

### Community 2 - "enums.py"
Cohesion: 0.14
Nodes (7): downgrade(), upgrade(), Base, AuditEvent, AlertSeverity, AlertStatus, ApprovalStatus

### Community 3 - "AuditService"
Cohesion: 0.05
Nodes (34): AuditService, 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`) (+26 more)

### Community 4 - "Execution"
Cohesion: 0.06
Nodes (28): 3. Análisis Detallado de Transiciones y Respuestas HTTP, 4. Concurrencia y Prevención de Condiciones de Carrera (TOCTOU), get_execution_by_id(), list_executions(), _to_execution_response(), Alert, Approval, ExecutionStatus (+20 more)

### Community 5 - "_setup_admin_auth"
Cohesion: 0.15
Nodes (9): _setup_admin_auth(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id() (+1 more)

### Community 6 - "App.tsx"
Cohesion: 0.28
Nodes (25): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, Alcance de la Fase 3:, INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, AppContent(), getInitialView(), EmptyState() (+17 more)

### Community 7 - "test_gateway_api.py"
Cohesion: 0.16
Nodes (8): make_api_key_pair(), test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_invalid_api_key_returns_401(), test_gateway_execute_missing_api_key_returns_401(), test_gateway_execute_org_mismatch_returns_403(), test_gateway_execute_validation_error()

### Community 8 - "uuid"
Cohesion: 0.10
Nodes (15): UserRole, test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash() (+7 more)

### Community 9 - "labels.ts"
Cohesion: 0.12
Nodes (11): AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_STYLES, RISK_STYLES, ROLE_DESCRIPTIONS, ROLE_STYLES (+3 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "asyncio"
Cohesion: 0.07
Nodes (14): test_create_rule_in_policy_anti_ai_blocked(), test_create_rule_in_policy_cross_tenant_rejected(), test_create_rule_in_policy_non_admin_forbidden(), test_create_rule_in_policy_success(), test_create_rule_target_agent_from_different_org(), test_create_rule_tool_action_from_different_org(), test_delete_policy_rule_anti_ai_blocked(), test_delete_policy_rule_cross_tenant_rejected() (+6 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (38): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+30 more)

### Community 14 - "api/auth.py"
Cohesion: 0.08
Nodes (10): login(), register(), register_organization(), create_access_token(), decode_access_token(), verify_password(), test_register_org_api_key_validates_in_gateway_service(), test_register_org_duplicate_email_returns_400() (+2 more)

### Community 15 - "PolicyRuleCreate"
Cohesion: 0.08
Nodes (19): RuleEffect, PolicyRule, PolicyRuleCreate, test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_priority_tie_deny_wins(), test_pdp_evaluate_require_approval(), _setup_admin_auth() (+11 more)

### Community 16 - "User"
Cohesion: 0.11
Nodes (17): User, _setup_admin_auth(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found() (+9 more)

### Community 17 - "test_organization_settings.py"
Cohesion: 0.07
Nodes (14): test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_get_settings_success(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_multi_tenant_isolation_patch_cross_tenant_denied(), test_api_patch_settings_not_found() (+6 more)

### Community 18 - "react"
Cohesion: 0.12
Nodes (18): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, App(), EmptyStateAction, EmptyStateProps, HeaderProps (+10 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (19): AuthContentProps, AuthFormContainer(), AuthUI(), AuthUIProps, Button, ButtonProps, buttonVariants, cn() (+11 more)

### Community 21 - "test_audit_events.py"
Cohesion: 0.05
Nodes (19): get_db(), get_password_hash(), test_anti_ai_shielding_in_control_plane(), test_control_plane_rejects_anonymous_and_x_user_id_without_jwt(), test_get_me_invalid_token(), test_get_me_missing_token(), test_login_demo_credentials_and_alias(), test_login_invalid_password() (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "test_tool_actions.py"
Cohesion: 0.10
Nodes (17): _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_forbidden_for_non_approver_roles(), test_approvals_resolve_success(), test_organization_schemas(), _setup_admin_auth(), test_api_create_tool_action_duplicate_conflict() (+9 more)

### Community 24 - "env.py"
Cohesion: 0.11
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 25 - "list_executions"
Cohesion: 0.12
Nodes (14): test_seed_data_already_exists_without_reset(), 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP (+6 more)

### Community 26 - "asyncio"
Cohesion: 0.07
Nodes (13): test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_get_audit_event_not_found(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success(), test_api_list_audit_events_tenant_isolation_forbidden(), test_audit_service_get_by_id() (+5 more)

### Community 27 - "seed_data"
Cohesion: 0.15
Nodes (6): _build_canonical_user(), clear_database(), ensure_canonical_demo_users(), main(), seed_data(), test_seed_data_syncs_missing_canonical_users_without_reset()

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.15
Nodes (8): ensure_same_tenant(), create_user(), delete_user(), get_user(), list_users(), update_user(), UserRead, UserUpdate

### Community 30 - "api.ts"
Cohesion: 0.14
Nodes (29): B. Matriz Comparativa de Enums, QuickSetupWizardProps, RISK_LABELS, ROLE_LABELS, api, GatewayExecutionPayload, GatewayExecutionResult, Agent (+21 more)

### Community 32 - "PolicyService"
Cohesion: 0.10
Nodes (8): Policy, PolicyService, test_api_get_policy_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org(), 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`

### Community 33 - "AuthContext.tsx"
Cohesion: 0.24
Nodes (13): AuthContext, AuthContextType, AuthProvider(), formatAuthUser(), normalizeRole(), UNAUTHENTICATED_USER, VALID_ROLES, AuthCredentials (+5 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)"
Cohesion: 0.20
Nodes (9): 1. Modelado de Estados en Arquitecturas Asíncronas (`202 Accepted`), 2. Diagramas de Estados Reales (Mermaid), 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution.status`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval.status`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`), 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted), ❓ P1: *"¿Por qué cambiaron de mantener la conexión HTTP abierta a devolver `202 Accepted` en HITL?"* (+1 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.11
Nodes (18): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 2. Asignación por Paquete (+10 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid — 13 Tablas), 3. Decisiones Arquitectónicas y Justificación Técnica, 4. Capacidades Clave de la Persistencia, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación, B. Uso de `UUID v4` como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` con Índices GIN (+4 more)

### Community 47 - "OrganizationService"
Cohesion: 0.07
Nodes (9): get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization_settings(), OrganizationSettings, OrganizationSettingsUpdate, OrganizationService (+1 more)

### Community 48 - "BaseSchema"
Cohesion: 0.05
Nodes (27): get_me(), create_organization(), AlertUpdateRequest, ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse, ApprovalDetailRead, ApprovalRead (+19 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.04
Nodes (40): lifespan(), ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI), 🏗️ Arquitectura de la API REST (`/api/v1`), 📋 Especificaciones Históricas Archivadas, 📁 Estructura del Código Fuente, 🧪 Pruebas Automatizadas, 🗄️ Versionado de Base de Datos con Alembic, 1. Levantar Servicios de Infraestructura (Paso 1) (+32 more)

### Community 50 - "test_threat_detector.py"
Cohesion: 0.14
Nodes (6): test_threat_detector_base64_obfuscation(), test_threat_detector_clean_parameters(), test_threat_detector_data_exfiltration(), test_threat_detector_destructive_sql(), test_threat_detector_embedded_base64_obfuscation(), test_threat_detector_goal_hijacking()

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia Real (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. Cierre Forense en `TracesView` (`GET /api/v1/executions`), Escenario 1: Operación Normal (`ALLOW` — HTTP `200 OK`), Escenario 2: Privilegio Mínimo / Abuso Bloqueado (`DENY` — HTTP `403 Forbidden`), Escenario 3: Operación Sensible con Human-in-the-Loop (`REQUIRE_APPROVAL` — HTTP `202 Accepted`), Escenario 4: Exfiltración de Datos y Alerta Crítica (`DENY + CRITICAL ALERT` — HTTP `403 Forbidden`) (+1 more)

### Community 53 - "env.py"
Cohesion: 0.21
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "OverviewView.tsx"
Cohesion: 0.23
Nodes (11): QuickSetupWizard(), UseAgentGuardWebSocketOptions, WebSocketEventMessage, BackendHealthState, formatActionHuman(), formatHourLabel(), formatTick(), generateSplinePath() (+3 more)

### Community 56 - "PolicyRuleService"
Cohesion: 0.07
Nodes (11): check_database_health(), check_redis_health(), health_check(), ping(), root(), _invalidate_policy_cache(), PolicyRuleService, build_drawio_xml() (+3 more)

### Community 57 - "README.md"
Cohesion: 0.20
Nodes (7): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard, 🌐 AgentGuard — Frontend (Dashboard Web SPA SaaS B2B), 🛠️ Comandos Útiles (`pnpm`)

### Community 58 - "convert_docs_to_docx.py"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 59 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 60 - "ToolAction"
Cohesion: 0.06
Nodes (41): 3. Componentes Clave de Runtime, Agent, AgentTool, AgentStatus, PolicyDecision, RiskLevel, Tool, ToolAction (+33 more)

### Community 63 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.29
Nodes (6): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

### Community 65 - "PlaygroundView.tsx"
Cohesion: 0.17
Nodes (11): DECISION_LABELS, DEMO_IDS, ATTACK_VECTORS, AttackVectorOption, CompanyDatabaseState, INITIAL_DATABASE_STATE, SimulatedCustomer, SimulatedProduct (+3 more)

### Community 67 - "SanitizerService"
Cohesion: 0.17
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 69 - "services/__init__.py"
Cohesion: 0.16
Nodes (4): AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint, AnalyticsService

### Community 70 - "Original User Request"
Cohesion: 0.12
Nodes (16): Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI, INC-02: Endpoints Granulares de Reglas, Aislamiento por Empresa y Blindaje Anti-IA (+8 more)

### Community 72 - "003_add_api_keys.py"
Cohesion: 0.18
Nodes (4): downgrade(), upgrade(), downgrade(), upgrade()

### Community 73 - "make_admin_jwt"
Cohesion: 0.09
Nodes (18): make_admin_jwt(), MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield() (+10 more)

### Community 74 - ".matches_conditions"
Cohesion: 0.11
Nodes (10): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime Real (Mermaid), 4. Preguntas Difíciles del Profesor y Respuestas Recomendadas, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Cómo garantizan consistencia entre políticas recién modificadas y evaluaciones en tiempo real?"*, ❓ P2: *"¿Qué ocurre si una petición activa `REQUIRE_APPROVAL` y nadie responde?"*, PDPEngine, test_matches_conditions_destinations() (+2 more)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA, 🚀 Arranque Rápido Local, 🏛️ Contexto Institucional y Equipo, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles, 🎬 La Secuencia de la Demo Principal (En Vivo) (+4 more)

### Community 77 - "🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)"
Cohesion: 0.20
Nodes (9): 1. Credenciales de Usuarios (Acme Corp), 2. Matriz Resumida de Permisos por Rol (RBAC), 4. Guión Sugerido de Logins para la Demo en Vivo, 5. IDs Canónicos de Acme Corp (para `agent-demo/.env` y Pruebas), 6. Comandos de Reinicio (Factory Reset) de Acme Corp, 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp), Entorno y Agentes, Herramientas, Acciones y Políticas (+1 more)

### Community 78 - "ensure_same_tenant"
Cohesion: 0.15
Nodes (9): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentRead (+1 more)

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.16
Nodes (15): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+7 more)

### Community 80 - "DemoConfig"
Cohesion: 0.38
Nodes (3): DemoConfig, run_all_scenarios(), run_interactive_menu()

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 82 - "ToastContext.tsx"
Cohesion: 0.31
Nodes (7): TOAST_CONFIG, ToastContainer(), ToastItem(), Toast, ToastContext, ToastContextType, ToastType

### Community 83 - "list_approvals"
Cohesion: 0.24
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 84 - "policies.py"
Cohesion: 0.07
Nodes (17): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), create_policy_rule(), delete_policy_rule() (+9 more)

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "create_tool_action"
Cohesion: 0.25
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 90 - "Organization"
Cohesion: 0.09
Nodes (15): Organization, _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create() (+7 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.15
Nodes (12): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`), 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`), 3. Modelo de Datos y Contratos Clave, 4.1 Módulos construidos y verificables en código, 4.2 Módulos a medio hacer o parcialmente cableados (+4 more)

### Community 94 - "_mock_user_auth"
Cohesion: 0.17
Nodes (9): _mock_user_auth(), test_anti_ai_agent_header_blocked_on_all_control_plane_routes(), test_anti_idor_cross_tenant_blocked_with_403(), test_rbac_matrix_admin_only_mutations_and_settings(), test_rbac_matrix_alerts_triage(), test_rbac_matrix_approvals_resolve(), test_rbac_matrix_audit_events(), test_rbac_matrix_gateway_simulate() (+1 more)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.13
Nodes (14): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+6 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.18
Nodes (4): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key()

### Community 98 - "main"
Cohesion: 0.17
Nodes (5): _configure_stdio(), load_config(), main(), parse_args(), validate_config()

### Community 99 - "simulate_gateway_action"
Cohesion: 0.20
Nodes (3): execute_gateway_action(), get_attack_catalog(), simulate_gateway_action()

### Community 100 - "PEPGatewayService"
Cohesion: 0.06
Nodes (19): PEPGatewayService, 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`) (+11 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.15
Nodes (12): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+4 more)

### Community 106 - "update_tool"
Cohesion: 0.18
Nodes (5): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool()

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 111 - "test_agents.py"
Cohesion: 0.22
Nodes (6): _setup_admin_auth(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_create_agent_owner_different_org(), test_api_create_agent_success(), test_api_list_agent_tools()

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 117 - "list_alerts"
Cohesion: 0.13
Nodes (7): get_alert_by_id(), list_alerts(), update_alert_status(), require_roles(), resolve_tenant_org_id(), AlertRead, test_alert_schema()

### Community 119 - "_make_auth"
Cohesion: 0.27
Nodes (5): _make_auth(), test_get_alert_by_id_found(), test_get_alert_by_id_not_found(), test_list_alerts_endpoint(), test_update_alert_status()

### Community 120 - "Alcance de la Fase 2:"
Cohesion: 0.33
Nodes (6): Alcance de la Fase 2:, INC-05: Router y Servicios para la Tabla Formal `audit_events`, INC-06: Router de Analítica y Series Temporales (`/analytics/overview` y `/timeseries`), INC-07: Conexión de Métricas Reales en `OverviewView.tsx`, INC-09: Conexión de Gestión de API Keys en `SettingsView.tsx`, INC-10: Persistencia de Configuración de Gobernanza de la Organización

### Community 121 - "Skeleton.tsx"
Cohesion: 0.29
Nodes (6): DEFAULT_WIDTHS, Skeleton(), SkeletonCardProps, SkeletonProps, SkeletonRowProps, SkeletonTableProps

### Community 122 - "ApiKey"
Cohesion: 0.20
Nodes (8): 3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`, ApiKey, 2. Decisión Tomada, 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico, INC-08: Modelo, Migración y Router de API Keys PEP (`/api/v1/api-keys`)

### Community 124 - "agent_service.py"
Cohesion: 0.14
Nodes (7): AgentCreate, AgentToolCreate, AgentUpdate, test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_and_agent_tool_schemas()

### Community 125 - "run_demo.py"
Cohesion: 0.17
Nodes (6): build_payload(), Colors, _decision_color(), DemoScenario, _mask_api_key(), run_scenario()

## Knowledge Gaps
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToast()` connect `App.tsx` to `AuthContext.tsx`, `PlaygroundView.tsx`, `labels.ts`, `ToastContext.tsx`, `react`, `OverviewView.tsx`, `README.md`, `api.ts`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Are the 63 inferred relationships involving `User` (e.g. with `create_api_key()` and `get_api_key()`) actually correct?**
  _`User` has 63 INFERRED edges - model-reasoned connections that need verification._
- **Should `typing` be split into smaller, more focused modules?**
  _Cohesion score 0.062456140350877196 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `README.md` to `typing`, `domain.ts`, `ToolAction`, `App.tsx`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Are the 58 inferred relationships involving `UserRole` (e.g. with `register()` and `register_organization()`) actually correct?**
  _`UserRole` has 58 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10119047619047619 - nodes in this community are weakly interconnected._
- **Why does `ApiKey` connect `ApiKey` to `typing`, `enums.py`, `App.tsx`, `test_gateway_api.py`, `uuid`, `🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)`, `api/auth.py`, `BaseSchema`, `📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial`, `ApiKey`, `test_audit_events.py`, `ToolAction`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._