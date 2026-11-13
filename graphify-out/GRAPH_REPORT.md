# Graph Report - AgentGuard  (2026-11-13)

## Corpus Check
- 191 files · ~164,047 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .drawio 6, .example 3, .bat 3)

## Summary
- 2357 nodes · 6546 edges · 127 communities (92 shown, 35 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 1070 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b5434da5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typing
- domain.ts
- enums.py
- test_audit_events.py
- AgentTool
- AgentService
- App.tsx
- policies.py
- uuid
- labels.ts
- frontend/package.json
- postgres
- test_organization_settings.py
- approvals.py
- register_organization
- test_policy_rules.py
- User
- sqlalchemy
- ThemeContext.ts
- compilerOptions
- auth-ui.tsx
- test_auth.py
- compilerOptions
- test_policy_rules_management.py
- env.py
- 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural
- PolicyRuleRead
- test_policies.py
- websocket_manager.py
- update_user
- api.ts
- ToolService
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- update_agent
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- update_organization_settings
- BaseSchema
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKey
- test_auth_register_org.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- OverviewView.tsx
- convert_docs_to_docx.py
- README.md
- convert_docs_to_docx.py
- run_demo.py
- ToolAction
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- test_tool_actions.py
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- SanitizerService
- UserService
- PolicyRuleService
- Original User Request
- conftest.py
- Tool
- make_admin_jwt
- .matches_conditions
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- PolicyDecision
- OrganizationSettings
- PlaygroundView.tsx
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- package.json
- services/__init__.py
- list_approvals
- policies.py
- get_analytics_overview
- audit_events.py
- cleanup_overrides
- scripts
- create_tool_action
- Organization
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- health_check
- RiskLevel
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- run_scenario
- execute_gateway_action
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- reset_demo_data
- websocket_tenant_endpoint
- test_siem_webhook_test_ping_missing_url
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- Agent
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- pnpm-workspace.yaml
- threat_detector.py
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- scripts
- ApiError
- list_alerts
- test_websocket.py
- get_attack_catalog
- build_payload
- .verify_api_key
- 002_add_latency_ms_to_executions.py
- 005_add_hashed_password_to_users.py
- dependencies
- parse_args

## God Nodes (most connected - your core abstractions)
1. `User` - 203 edges
2. `UserRole` - 122 edges
3. `make_admin_jwt()` - 80 edges
4. `ToolAction` - 73 edges
5. `Tool` - 71 edges
6. `Organization` - 69 edges
7. `BaseSchema` - 66 edges
8. `PolicyDecision` - 62 edges
9. `Execution` - 62 edges
10. `Agent` - 61 edges

## Surprising Connections (you probably didn't know these)
- `5. Los 4 Escenarios Canónicos` --references--> `AgentTool`  [INFERRED]
  agent-demo/README.md → backend/app/models/agent.py
- `4.2 Estándares de Frontend (`TypeScript 6` / `React 19` / `Vite 8` / `pnpm`)` --references--> `ApiError`  [INFERRED]
  docs/archive/audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md → frontend/src/services/api.ts
- `A. Contenedor de Políticas vs. Reglas Atómicas (1:N Desalineado)` --references--> `PolicyRule`  [INFERRED]
  docs/archive/INFORME_MOCKUPS_FRONT_BACK.md → backend/app/models/policy.py
- `Fase 2: Implementación de Endpoints Faltantes en Backend` --references--> `AuditEvent`  [INFERRED]
  docs/archive/INFORME_MOCKUPS_FRONT_BACK.md → backend/app/models/audit.py
- `3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`)` --references--> `AgentRead`  [INFERRED]
  docs/archive/audit_reports/02_ESTADO_FRONTEND_ALMA_MATER.md → backend/app/schemas/agent.py

## Import Cycles
- None detected.

## Communities (127 total, 35 thin omitted)

### Community 0 - "typing"
Cohesion: 0.10
Nodes (3): get_current_user(), require_admin_user(), get_db()

### Community 1 - "domain.ts"
Cohesion: 0.13
Nodes (5): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, extractApiError(), handleNetworkError(), UserMember

### Community 2 - "enums.py"
Cohesion: 0.10
Nodes (8): Base, Approval, ApprovalStatus, Execution, test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_success(), Raíz del repositorio (12 archivos)

### Community 3 - "test_audit_events.py"
Cohesion: 0.10
Nodes (12): AuditEvent, ActorType, AuditService, test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success(), test_audit_service_get_by_id() (+4 more)

### Community 4 - "AgentTool"
Cohesion: 0.07
Nodes (29): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, AgentTool, Alert, AlertSeverity, AlertStatus, clear_database(), main(), seed_data() (+21 more)

### Community 6 - "App.tsx"
Cohesion: 0.10
Nodes (53): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, App(), AppContent(), getInitialView(), EmptyState(), EmptyStateAction (+45 more)

### Community 7 - "policies.py"
Cohesion: 0.15
Nodes (6): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy()

### Community 8 - "uuid"
Cohesion: 0.08
Nodes (20): ApiKey, test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash() (+12 more)

### Community 9 - "labels.ts"
Cohesion: 0.12
Nodes (10): AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_STYLES, RISK_STYLES, ROLE_DESCRIPTIONS, ROLE_STYLES (+2 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "test_organization_settings.py"
Cohesion: 0.06
Nodes (19): OrganizationCreate, OrganizationSettings, OrganizationSettingsUpdate, OrganizationService, test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found() (+11 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (41): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+33 more)

### Community 15 - "test_policy_rules.py"
Cohesion: 0.16
Nodes (11): RuleEffect, _setup_admin_auth(), test_api_create_policy_rule_policy_not_found(), test_api_create_policy_rule_success(), test_api_create_policy_rule_target_agent_different_org(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_api_list_policy_rules() (+3 more)

### Community 16 - "User"
Cohesion: 0.08
Nodes (24): UserRole, User, test_api_get_audit_event_not_found(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_tenant_isolation_forbidden(), test_mutation_agent_lifecycle_logs_audit_events(), test_register_org_duplicate_email_returns_400(), test_api_reset_demo_success() (+16 more)

### Community 17 - "sqlalchemy"
Cohesion: 0.14
Nodes (6): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade()

### Community 18 - "ThemeContext.ts"
Cohesion: 0.48
Nodes (4): Theme, ThemeContext, ThemeContextType, useTheme()

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (18): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+10 more)

### Community 21 - "test_auth.py"
Cohesion: 0.08
Nodes (16): register(), create_access_token(), get_password_hash(), cleanup_overrides(), test_anti_ai_shielding_in_control_plane(), test_control_plane_rejects_anonymous_and_x_user_id_without_jwt(), test_get_me_invalid_token(), test_get_me_missing_token() (+8 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "test_policy_rules_management.py"
Cohesion: 0.10
Nodes (13): test_create_rule_in_policy_anti_ai_blocked(), test_create_rule_in_policy_cross_tenant_rejected(), test_create_rule_in_policy_non_admin_forbidden(), test_create_rule_in_policy_success(), test_create_rule_target_agent_from_different_org(), test_create_rule_tool_action_from_different_org(), test_delete_policy_rule_anti_ai_blocked(), test_delete_policy_rule_cross_tenant_rejected() (+5 more)

### Community 24 - "env.py"
Cohesion: 0.11
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 25 - "03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural"
Cohesion: 0.14
Nodes (11): test_seed_data_already_exists_without_reset(), 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`), 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL (+3 more)

### Community 26 - "PolicyRuleRead"
Cohesion: 0.16
Nodes (5): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule()

### Community 27 - "test_policies.py"
Cohesion: 0.11
Nodes (13): Policy, test_mutation_policy_lifecycle_logs_audit_events(), test_mutation_policy_rules_logs_audit_events(), _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found() (+5 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.16
Nodes (4): WebSocketConnectionManager, test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup()

### Community 29 - "update_user"
Cohesion: 0.12
Nodes (9): create_user(), delete_user(), get_user(), list_users(), update_user(), UserCreate, UserRead, UserUpdate (+1 more)

### Community 30 - "api.ts"
Cohesion: 0.11
Nodes (38): QuickSetupWizardProps, DECISION_LABELS, AuthContext, AuthContextType, AuthProvider(), DEFAULT_DEMO_ORGS, DEMO_PROFILES, formatAuthUser() (+30 more)

### Community 31 - "ToolService"
Cohesion: 0.06
Nodes (17): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolCreate, ToolUpdate, ToolService (+9 more)

### Community 33 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.33
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 35 - "update_agent"
Cohesion: 0.13
Nodes (8): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentUpdate

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

### Community 47 - "update_organization_settings"
Cohesion: 0.14
Nodes (7): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization_settings(), SiemWebhookTestRequest

### Community 48 - "BaseSchema"
Cohesion: 0.05
Nodes (27): get_me(), AgentCreate, AgentRead, AgentToolCreate, AgentToolRead, AlertRead, AlertUpdateRequest, AnalyticsOverviewResponse (+19 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.13
Nodes (14): lifespan(), 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧱 PASO 1: Infraestructura Local Reproducible (`docker-compose.yml`), 🐍 PASO 2: Entorno Backend & Configuración Fail-Fast (`backend/`), 🗄️ PASO 3: Modelos Declarativos y Versionado DDL con Alembic (`backend/alembic/`), 🚀 PASO 4: Entrypoint FastAPI, Middlewares y Verificación (`backend/app/main.py`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple? (+6 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 53 - "test_auth_register_org.py"
Cohesion: 0.07
Nodes (9): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online(), decode_access_token(), verify_password(), cleanup_overrides(), test_register_org_api_key_validates_in_gateway_service() (+1 more)

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "OverviewView.tsx"
Cohesion: 0.36
Nodes (8): BackendHealthState, formatActionHuman(), formatHourLabel(), formatTick(), generateSplinePath(), OverviewSkeleton(), OverviewStats, OverviewView()

### Community 56 - "convert_docs_to_docx.py"
Cohesion: 0.21
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 57 - "README.md"
Cohesion: 0.29
Nodes (5): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard

### Community 58 - "convert_docs_to_docx.py"
Cohesion: 0.21
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 59 - "run_demo.py"
Cohesion: 0.17
Nodes (5): Colors, _configure_stdio(), _decision_color(), load_config(), _mask_api_key()

### Community 60 - "ToolAction"
Cohesion: 0.08
Nodes (20): ToolAction, GatewayExecuteRequest, PDPDecisionResult, test_executions_api_get_by_id_serializes_db_latency(), test_executions_api_list_serializes_db_latency_not_hardcoded(), test_gateway_execute_endpoint_serializes_real_latency(), test_pep_gateway_latency_is_dynamic_across_invocations(), mock_eval() (+12 more)

### Community 62 - "test_tool_actions.py"
Cohesion: 0.07
Nodes (14): ToolActionCreate, ToolActionService, test_tool_and_action_schemas(), _setup_admin_auth(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found() (+6 more)

### Community 63 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.29
Nodes (6): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

### Community 67 - "SanitizerService"
Cohesion: 0.17
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 69 - "PolicyRuleService"
Cohesion: 0.13
Nodes (4): PolicyRule, _invalidate_policy_cache(), PolicyRuleService, 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`

### Community 70 - "Original User Request"
Cohesion: 0.08
Nodes (23): Alcance de la Fase 2:, Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI (+15 more)

### Community 72 - "Tool"
Cohesion: 0.16
Nodes (4): Tool, PEPGatewayService, 2.2 Mapa de Contradicciones (Doc vs. Doc y Doc vs. Código/Graphify), 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro

### Community 73 - "make_admin_jwt"
Cohesion: 0.11
Nodes (15): make_admin_jwt(), MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield() (+7 more)

### Community 74 - ".matches_conditions"
Cohesion: 0.11
Nodes (8): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_priority_tie_deny_wins(), test_pdp_evaluate_require_approval()

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.15
Nodes (13): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+5 more)

### Community 77 - "PolicyDecision"
Cohesion: 0.09
Nodes (18): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionStatus, PolicyDecision, ExecutionResponse, GatewayExecuteResponse, GatewayExecutionTraceRead (+10 more)

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.09
Nodes (24): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+16 more)

### Community 80 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.12
Nodes (16): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días) (+8 more)

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 83 - "list_approvals"
Cohesion: 0.15
Nodes (6): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest

### Community 84 - "policies.py"
Cohesion: 0.13
Nodes (9): PolicyCreate, PolicyRead, PolicyUpdate, PolicyRuleCreate, PolicyRuleCreateInPolicy, PolicyRuleRead, PolicyRuleUpdate, PolicyService (+1 more)

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
Cohesion: 0.14
Nodes (11): Organization, _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create() (+3 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.20
Nodes (9): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1.3 Flujo principal operativo vs. onboarding en "pocos clics", 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`), 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`), 3. Modelo de Datos y Contratos Clave, `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard (+1 more)

### Community 93 - "health_check"
Cohesion: 0.16
Nodes (4): check_database_health(), check_redis_health(), health_check(), ping()

### Community 94 - "RiskLevel"
Cohesion: 0.09
Nodes (11): RiskLevel, test_approval_resolve_schema(), test_gateway_schemas(), test_api_get_attack_catalog(), test_gateway_execute_blocks_prompt_injection(), test_threat_detector_base64_obfuscation(), test_threat_detector_clean_parameters(), test_threat_detector_data_exfiltration() (+3 more)

### Community 95 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.12
Nodes (15): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo (+7 more)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.13
Nodes (14): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+6 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.16
Nodes (6): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key(), ApiKeyCreatedResponse, ApiKeyResponse

### Community 98 - "run_scenario"
Cohesion: 0.26
Nodes (6): DemoConfig, main(), run_all_scenarios(), run_interactive_menu(), run_scenario(), validate_config()

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.11
Nodes (17): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP (+9 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.15
Nodes (12): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+4 more)

### Community 106 - "test_siem_webhook_test_ping_missing_url"
Cohesion: 0.20
Nodes (5): test_list_organizations_success(), test_siem_webhook_settings_update(), mock_execute(), test_siem_webhook_test_ping_missing_url(), test_siem_webhook_test_ping_success()

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
Cohesion: 0.08
Nodes (17): Agent, AgentStatus, _setup_admin_auth(), test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org() (+9 more)

### Community 111 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.29
Nodes (6): 🛡️ Cumplimiento de Reglas Innegociables del Dominio, 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas

### Community 114 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.18
Nodes (10): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1, 📊 Matriz Resumen de Tecnologías y Roles para la Defensa (+2 more)

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 116 - "ApiError"
Cohesion: 0.18
Nodes (9): 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), Alcance de la Fase 3:, INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión (+1 more)

### Community 117 - "list_alerts"
Cohesion: 0.27
Nodes (3): get_alert_by_id(), list_alerts(), update_alert_status()

### Community 122 - ".verify_api_key"
Cohesion: 0.20
Nodes (8): 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico, 4.1 Módulos construidos y verificables en código, 4.2 Módulos a medio hacer o parcialmente cableados, 4.3 Elementos que quedaron solo en papel, 4. Estado Real del Proyecto (Código vs. Graphify vs. Docs)

### Community 125 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, react-dom

## Knowledge Gaps
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `typing`, `enums.py`, `test_audit_events.py`, `AgentTool`, `policies.py`, `uuid`, `test_organization_settings.py`, `register_organization`, `test_policy_rules.py`, `test_auth.py`, `test_policy_rules_management.py`, `PolicyRuleRead`, `test_policies.py`, `update_user`, `ToolService`, `update_agent`, `update_organization_settings`, `BaseSchema`, `test_auth_register_org.py`, `ToolAction`, `test_tool_actions.py`, `UserService`, `Tool`, `make_admin_jwt`, `PolicyDecision`, `list_approvals`, `policies.py`, `get_analytics_overview`, `audit_events.py`, `create_tool_action`, `Organization`, `revoke_api_key`, `reset_demo_data`, `test_siem_webhook_test_ping_missing_url`, `Agent`, `list_alerts`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Are the 137 inferred relationships involving `User` (e.g. with `assign_tool_to_agent()` and `create_agent()`) actually correct?**
  _`User` has 137 INFERRED edges - model-reasoned connections that need verification._
- **Should `typing` be split into smaller, more focused modules?**
  _Cohesion score 0.09586466165413533 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `README.md` to `typing`, `AgentTool`, `App.tsx`, `ApiError`, `ToolAction`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Are the 89 inferred relationships involving `UserRole` (e.g. with `register()` and `register_organization()`) actually correct?**
  _`UserRole` has 89 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13277428371767994 - nodes in this community are weakly interconnected._
- **Why does `AgentTool` connect `AgentTool` to `typing`, `enums.py`, `06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas`, `AgentService`, `🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)`, `3. Hallazgos Críticos y Bugs Funcionales en el Frontend`, `Tool`, `Agent`, `ToolAction`, `📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa`, ``_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural`, `README.md`, `ToolService`, `RiskLevel`, `🤖 AgentGuard — Agent Demo (Cliente CLI Python)`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._