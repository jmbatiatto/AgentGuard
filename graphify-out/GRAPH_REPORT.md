# Graph Report - AgentGuard  (2026-11-03)

## Corpus Check
- 180 files · ~147,301 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .drawio 6, .bat 5, (none) 2)

## Summary
- 2095 nodes · 5655 edges · 126 communities (86 shown, 40 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 894 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `960f38ad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- typing
- domain.ts
- User
- asyncio
- Execution
- asyncio
- App.tsx
- policies.py
- uuid
- labels.ts
- frontend/package.json
- SettingsView.tsx
- organizations.py
- 3. Catálogo Detallado de Maquetas y Elementos Mockup
- UserRole
- test_analytics.py
- main.py
- UserService
- ._dispatch_to_tool
- compilerOptions
- uuid
- api/auth.py
- compilerOptions
- asyncio
- env.py
- BaseSchema
- api_keys.py
- OverviewView.tsx
- websocket_manager.py
- UserRole
- asyncio
- update_tool
- PolicyService
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- agents.py
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- Tool
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- react
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- asyncio
- PolicyCache
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- api.ts
- domain.ts
- PolicyRule
- analytics_service.py
- asyncio
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- ToolAction
- 🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- SanitizerService
- 001_initial_schema.py
- PolicyRuleService
- lifespan
- ApiKey
- list_alerts
- execute_gateway_action
- asyncio
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- ToolActionService
- PlaygroundView.tsx
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- auth-ui.tsx
- test_schemas.py
- create_tool_action
- approvals.py
- get_analytics_overview
- list_audit_events
- asyncio
- 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro
- ApiKeyService
- asyncio
- 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4)
- get_attack_catalog
- ToolService
- test_api_get_attack_catalog
- test_seed_data_already_exists_without_reset
- main
- update_policy_rule
- test_threat_detector_goal_hijacking
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- test_threat_detector_data_exfiltration
- test_threat_detector_base64_obfuscation
- test_threat_detector_embedded_base64_obfuscation
- test_threat_detector_destructive_sql
- test_threat_detector_clean_parameters
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- ActorType
- schemas/api_key.py
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- require_admin_user
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- useToast
- test_approvals_get_by_id_success
- cleanup_overrides
- test_get_execution_by_id_not_found
- downgrade
- downgrade
- downgrade
- get_db
- test_tool_service_get_by_id
- list_executions

## God Nodes (most connected - your core abstractions)
1. `User` - 100 edges
2. `ToolAction` - 67 edges
3. `UserRole` - 65 edges
4. `Tool` - 65 edges
5. `Organization` - 62 edges
6. `BaseSchema` - 62 edges
7. `Agent` - 58 edges
8. `PolicyDecision` - 57 edges
9. `Execution` - 55 edges
10. `PolicyRule` - 53 edges

## Surprising Connections (you probably didn't know these)
- `4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens)` --references--> `require_admin_user()`  [INFERRED]
  AGENTS.md → backend/app/api/deps.py
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py
- `Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY)` --references--> `AgentTool`  [INFERRED]
  docs/PROPUESTAS_MEJORAS_FRONTEND.md → backend/app/models/agent.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`)` --references--> `Alert`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/alert.py
- `Paso 4: Intento de Exfiltración / Inyección de Prompt (DENY + ALERTA SIEM)` --references--> `Alert`  [INFERRED]
  docs/PROPUESTAS_MEJORAS_FRONTEND.md → backend/app/models/alert.py

## Import Cycles
- None detected.

## Communities (126 total, 40 thin omitted)

### Community 1 - "domain.ts"
Cohesion: 0.13
Nodes (11): 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, ApiError, extractApiError(), handleNetworkError(), AuthResponse, Decision (+3 more)

### Community 2 - "User"
Cohesion: 0.07
Nodes (13): upgrade(), upgrade(), upgrade(), Base, AuditEvent, Organization, User, test_api_create_agent_success() (+5 more)

### Community 3 - "asyncio"
Cohesion: 0.09
Nodes (10): test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_get_audit_event_not_found(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success(), test_api_list_audit_events_tenant_isolation_forbidden(), test_audit_service_get_by_id() (+2 more)

### Community 4 - "Execution"
Cohesion: 0.10
Nodes (18): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, 2. Matriz Maestra de Inconsistencias (Documentación vs. Código Real), 7. Orden de Evaluación OWASP vs. `AgentTool` en el Pipeline del Gateway (Escenario 5), 9. Granularidad de Máquinas de Estado (`ExecutionStatus`, `AlertStatus`, `Tool.status`) y Protocolos (`ADR-003`), 2.1 *Chain of Responsibility* (Pipeline Determinista) para el Interceptor PEP, Alert, Approval, AlertSeverity (+10 more)

### Community 5 - "asyncio"
Cohesion: 0.14
Nodes (6): test_api_create_policy_rule_policy_not_found(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_policy_rule_service_create(), test_policy_rule_service_get_by_id(), test_policy_rule_service_list_rules()

### Community 6 - "App.tsx"
Cohesion: 0.14
Nodes (31): 4.1 Componentes Visuales Presentes pero Sin Lógica Real (Cascarones), 4.2 Flujos Esenciales de la Propuesta de Valor que No Existen Aún, 4. Inventario de "Cascarones Vacíos" y Funcionalidades Faltantes del Alma Máter, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 3.2 Cuellos de Botella en Frontend (Renderizado, Red, Estado y Memoria), App(), AppContent() (+23 more)

### Community 7 - "policies.py"
Cohesion: 0.11
Nodes (11): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyCreate, PolicyRead (+3 more)

### Community 8 - "uuid"
Cohesion: 0.09
Nodes (15): ApiKey, test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash() (+7 more)

### Community 9 - "labels.ts"
Cohesion: 0.12
Nodes (12): AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_STYLES, RISK_LABELS, RISK_STYLES, ROLE_DESCRIPTIONS (+4 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.06
Nodes (30): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+22 more)

### Community 11 - "SettingsView.tsx"
Cohesion: 0.17
Nodes (18): EmptyState(), EmptyStateAction, EmptyStateProps, DEFAULT_WIDTHS, SkeletonCard(), SkeletonCardProps, SkeletonProps, SkeletonRow() (+10 more)

### Community 12 - "organizations.py"
Cohesion: 0.09
Nodes (8): create_organization(), get_organization(), get_organization_settings(), list_organizations(), update_organization_settings(), OrganizationSettings, OrganizationSettingsUpdate, OrganizationService

### Community 13 - "3. Catálogo Detallado de Maquetas y Elementos Mockup"
Cohesion: 0.06
Nodes (33): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox), 3.4 Gestión de Llaves de API del Gateway PEP (Settings Tab 2) (+25 more)

### Community 14 - "UserRole"
Cohesion: 0.12
Nodes (15): RuleEffect, UserRole, Policy, PolicyRule, clear_database(), seed_data(), test_mutation_policy_rules_logs_audit_events(), test_api_create_policy_success() (+7 more)

### Community 15 - "test_analytics.py"
Cohesion: 0.08
Nodes (14): MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield(), test_api_analytics_overview_cross_tenant_forbidden() (+6 more)

### Community 16 - "main.py"
Cohesion: 0.18
Nodes (4): check_database_health(), check_redis_health(), health_check(), ping()

### Community 18 - "._dispatch_to_tool"
Cohesion: 0.20
Nodes (8): 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3.3 Bug de Orden de Validación en el Pipeline del Gateway (Supresión de Alertas OWASP y Trazas), 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "uuid"
Cohesion: 0.09
Nodes (15): test_get_alert_by_id_not_found(), test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_get_settings_success(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_multi_tenant_isolation_patch_cross_tenant_denied() (+7 more)

### Community 21 - "api/auth.py"
Cohesion: 0.11
Nodes (8): get_me(), login(), register(), create_access_token(), get_password_hash(), verify_password(), RegisterRequest, TokenResponse

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "asyncio"
Cohesion: 0.14
Nodes (6): test_api_create_tool_organization_not_found(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_list_by_org()

### Community 24 - "env.py"
Cohesion: 0.06
Nodes (9): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online(), Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint() (+1 more)

### Community 25 - "BaseSchema"
Cohesion: 0.08
Nodes (14): AgentRead, AgentToolRead, AuditEventBase, AuditEventCreate, AuditEventPagination, AuditEventResponse, LoginRequest, UserMeResponse (+6 more)

### Community 26 - "api_keys.py"
Cohesion: 0.24
Nodes (3): get_api_key(), list_api_keys(), revoke_api_key()

### Community 27 - "OverviewView.tsx"
Cohesion: 0.17
Nodes (14): DEMO_IDS, UseAgentGuardWebSocketOptions, WebSocketEventMessage, ToolActionItem, ToolStatus, BackendHealthState, formatActionHuman(), formatHourLabel() (+6 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.08
Nodes (8): websocket_global_endpoint(), websocket_tenant_endpoint(), WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "UserRole"
Cohesion: 0.13
Nodes (9): create_user(), delete_user(), get_user(), list_users(), update_user(), UserCreate, UserRead, UserUpdate (+1 more)

### Community 30 - "asyncio"
Cohesion: 0.07
Nodes (13): test_api_create_user_organization_not_found(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found(), test_api_get_user_not_found(), test_api_list_users(), test_api_patch_user_role(), test_user_service_create() (+5 more)

### Community 31 - "update_tool"
Cohesion: 0.16
Nodes (5): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool()

### Community 33 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.11
Nodes (16): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas, 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🎓 Conclusión y Próximos Pasos (Semana 4), 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP) (+8 more)

### Community 35 - "agents.py"
Cohesion: 0.08
Nodes (9): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentUpdate (+1 more)

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
Cohesion: 0.17
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 47 - "Tool"
Cohesion: 0.09
Nodes (33): 3.1 Cuellos de Botella en Backend, Base de Datos y Concurrencia, Agent, AgentTool, AgentStatus, ExecutionStatus, PolicyDecision, RiskLevel, Tool (+25 more)

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 49 - "react"
Cohesion: 0.48
Nodes (4): Theme, ThemeContext, ThemeContextType, useTheme()

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 52 - "asyncio"
Cohesion: 0.12
Nodes (7): test_api_create_policy_organization_not_found(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 53 - "PolicyCache"
Cohesion: 0.19
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "api.ts"
Cohesion: 0.11
Nodes (34): AuthContext, AuthContextType, AuthProvider(), AuthUser, DEMO_PROFILES, formatAuthUser(), mockAgents, mockAlerts (+26 more)

### Community 56 - "domain.ts"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 58 - "PolicyRule"
Cohesion: 0.11
Nodes (8): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_priority_tie_deny_wins(), test_pdp_evaluate_require_approval()

### Community 59 - "analytics_service.py"
Cohesion: 0.20
Nodes (4): AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint, AnalyticsService

### Community 60 - "asyncio"
Cohesion: 0.14
Nodes (7): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_create_agent_owner_different_org(), test_api_list_agent_tools()

### Community 62 - "ToolAction"
Cohesion: 0.11
Nodes (8): test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_get_by_id(), test_tool_action_service_get_by_tool_and_name(), test_tool_action_service_list_actions()

### Community 64 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 66 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 67 - "SanitizerService"
Cohesion: 0.17
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 68 - "001_initial_schema.py"
Cohesion: 0.22
Nodes (4): downgrade(), upgrade(), downgrade(), upgrade()

### Community 69 - "PolicyRuleService"
Cohesion: 0.17
Nodes (3): PolicyRuleUpdate, _invalidate_policy_cache(), PolicyRuleService

### Community 70 - "lifespan"
Cohesion: 0.12
Nodes (15): 5. Hoja de Ruta Sugerida de Ejecución Incremental (Post-Aprobación de Decisiones), lifespan(), 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧱 PASO 1: Infraestructura Local Reproducible (`docker-compose.yml`), 🐍 PASO 2: Entorno Backend & Configuración Fail-Fast (`backend/`), 🗄️ PASO 3: Modelos Declarativos y Versionado DDL con Alembic (`backend/alembic/`), 🚀 PASO 4: Entrypoint FastAPI, Middlewares y Verificación (`backend/app/main.py`), ¿Por qué es necesaria cada tecnología y qué rol cumple? (+7 more)

### Community 71 - "ApiKey"
Cohesion: 0.08
Nodes (3): reset_demo_data(), _AutoYieldOverrides, _AutoYieldOverrides

### Community 72 - "list_alerts"
Cohesion: 0.19
Nodes (5): get_alert_by_id(), list_alerts(), update_alert_status(), AlertRead, AlertUpdateRequest

### Community 74 - "asyncio"
Cohesion: 0.10
Nodes (10): test_anti_ai_shielding_in_control_plane(), test_get_me_invalid_token(), test_get_me_missing_token(), test_get_me_success(), test_login_invalid_password(), test_login_nonexistent_user(), test_login_seed_user_fallback(), test_login_success() (+2 more)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.15
Nodes (13): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+5 more)

### Community 77 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.09
Nodes (21): SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, WorkspaceSwitcherProps, DECISION_LABELS, NavView (+13 more)

### Community 80 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.12
Nodes (16): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días) (+8 more)

### Community 81 - "auth-ui.tsx"
Cohesion: 0.05
Nodes (54): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+46 more)

### Community 82 - "test_schemas.py"
Cohesion: 0.08
Nodes (14): AgentCreate, AgentToolCreate, ApprovalResolveRequest, OrganizationCreate, PolicyRuleCreate, ToolActionCreate, ToolCreate, test_agent_and_agent_tool_schemas() (+6 more)

### Community 83 - "create_tool_action"
Cohesion: 0.24
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 84 - "approvals.py"
Cohesion: 0.20
Nodes (5): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead, ApprovalRead

### Community 85 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 87 - "asyncio"
Cohesion: 0.11
Nodes (9): test_create_rule_in_policy_anti_ai_blocked(), test_create_rule_in_policy_cross_tenant_rejected(), test_create_rule_in_policy_non_admin_forbidden(), test_delete_policy_rule_anti_ai_blocked(), test_delete_policy_rule_cross_tenant_rejected(), test_delete_policy_rule_preserves_policy_and_sister_rules(), test_update_policy_rule_anti_ai_blocked(), test_update_policy_rule_cross_tenant_rejected() (+1 more)

### Community 90 - "asyncio"
Cohesion: 0.11
Nodes (8): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 91 - "4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4)"
Cohesion: 0.40
Nodes (5): 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`), 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL, 4.4 Defectos en `SanitizerService` y Configuraciones Ignoradas, 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4)

### Community 93 - "ToolService"
Cohesion: 0.20
Nodes (3): 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`, ToolUpdate, ToolService

### Community 96 - "test_seed_data_already_exists_without_reset"
Cohesion: 0.33
Nodes (3): 6. Diagnóstico de la Suite de Pruebas (`backend/tests/`), test_api_reset_demo_success(), test_seed_data_already_exists_without_reset()

### Community 98 - "main"
Cohesion: 0.20
Nodes (8): 1. Identidad, Stack Políglota y Equipo, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard, 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 3. Análisis Específico de Contradicciones Internas en la Documentación, main()

### Community 99 - "update_policy_rule"
Cohesion: 0.16
Nodes (5): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule()

### Community 102 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.12
Nodes (16): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`) (+8 more)

### Community 108 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.14
Nodes (13): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`), 2.4 *Strategy + Circuit Breaker* para Despacho de Herramientas (`LiveRestDispatcher` vs. `SandboxMockDispatcher`) (+5 more)

### Community 110 - "schemas/api_key.py"
Cohesion: 0.22
Nodes (4): create_api_key(), ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse

### Community 111 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.20
Nodes (9): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+1 more)

### Community 112 - "require_admin_user"
Cohesion: 0.24
Nodes (3): get_current_user(), require_admin_user(), decode_access_token()

### Community 113 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.20
Nodes (10): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1, 📊 Matriz Resumen de Tecnologías y Roles para la Defensa (+2 more)

### Community 114 - "useToast"
Cohesion: 0.31
Nodes (8): TOAST_CONFIG, ToastContainer(), ToastItem(), Toast, ToastContext, ToastContextType, ToastType, useToast()

### Community 115 - "test_approvals_get_by_id_success"
Cohesion: 0.22
Nodes (4): test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success()

### Community 123 - "get_db"
Cohesion: 0.22
Nodes (4): test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error()

### Community 136 - "list_executions"
Cohesion: 0.22
Nodes (6): 3.4 Latencia Forense Ficticia (`latency_ms=21.5`), 5. Deuda Técnica Estructural, Contratos Incompletos y Configuración, get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse

## Knowledge Gaps
- **7 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 982 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `domain.ts` to `require_admin_user`, `useToast`, `main`, `Tool`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Are the 65 inferred relationships involving `User` (e.g. with `get_analytics_overview()` and `get_analytics_timeseries()`) actually correct?**
  _`User` has 65 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `typing` be split into smaller, more focused modules?**
  _Cohesion score 0.0929281122150789 - nodes in this community are weakly interconnected._
- **Why does `AgentTool` connect `Tool` to `typing`, `domain.ts`, `User`, `agents.py`, `Execution`, `📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa`, `App.tsx`, `lifespan`, `🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)`, `UserRole`, `._dispatch_to_tool`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `asyncio`, `ToolService`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 42 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `2. Reglas Innegociables de Seguridad, Dominio e Idioma`) actually correct?**
  _`ToolAction` has 42 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13277428371767994 - nodes in this community are weakly interconnected._