# Graph Report - AgentGuard  (2026-11-02)

## Corpus Check
- 171 files · ~144,394 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .drawio 6, .bat 5, (none) 2)

## Summary
- 2006 nodes · 5226 edges · 105 communities (82 shown, 23 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 866 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6126601f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- sqlalchemy_ext_asyncio
- domain.ts
- enums.py
- test_audit_events.py
- enums.py
- PolicyRule
- App.tsx
- policies.py
- uuid
- labels.ts
- frontend/package.json
- ActorType
- test_organization_settings.py
- 4. Puntos de Desincronización y Discrepancias de Contrato (Frontend vs Backend)
- 🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents
- test_analytics.py
- main.py
- test_policy_rules_management.py
- ._dispatch_to_tool
- compilerOptions
- uuid
- PDPEngine
- compilerOptions
- asyncio
- env.py
- BaseSchema
- api_keys.py
- OverviewView.tsx
- websocket_manager.py
- UserRole
- 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)
- typing
- PolicyService
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- test_schemas.py
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
- test_organizations.py
- 002_add_latency_ms_to_executions.py
- AgentService
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- ToolAction
- 🤖 AgentGuard — Cliente Agéntico Autónomo de Demostración (CLI)
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- SanitizerService
- 001_initial_schema.py
- PolicyRuleService
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- ApiKey
- list_alerts
- asyncio
- Alert
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué
- PlaygroundView.tsx
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- auth-ui.tsx
- test_health.py
- AuthContext.tsx
- approvals.py
- get_analytics_overview
- list_audit_events
- ⚡ Protocolo de Eficiencia Multi-Agente y Economía de Tokens (Lean Teamwork)
- ApprovalResolveRequest
- Organization
- Settings
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- 🛡️ AgentGuard — Informe Técnico Integral de Auditoría: Mockups de Frontend, Capacidades de Backend y Plan de Sincronización
- ToolService
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- 3. Catálogo Detallado de Maquetas y Elementos Mockup
- 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural
- main
- 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo
- test_agent_service_assign_tool
- test_get_execution_by_id_not_found
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- get_db
- list_executions

## God Nodes (most connected - your core abstractions)
1. `User` - 92 edges
2. `ToolAction` - 67 edges
3. `Tool` - 65 edges
4. `Organization` - 59 edges
5. `Agent` - 58 edges
6. `PolicyDecision` - 57 edges
7. `BaseSchema` - 57 edges
8. `UserRole` - 55 edges
9. `Execution` - 55 edges
10. `PolicyRule` - 53 edges

## Surprising Connections (you probably didn't know these)
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py
- `Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY)` --references--> `AgentTool`  [INFERRED]
  docs/PROPUESTAS_MEJORAS_FRONTEND.md → backend/app/models/agent.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`)` --references--> `Alert`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/alert.py
- `Paso 4: Intento de Exfiltración / Inyección de Prompt (DENY + ALERTA SIEM)` --references--> `Alert`  [INFERRED]
  docs/PROPUESTAS_MEJORAS_FRONTEND.md → backend/app/models/alert.py
- `5. Especificación Detallada del Caso de Uso Crítico: UC05` --references--> `Approval`  [INFERRED]
  agentguard_casos_de_uso.md → backend/app/models/approval.py

## Import Cycles
- None detected.

## Communities (105 total, 23 thin omitted)

### Community 0 - "sqlalchemy_ext_asyncio"
Cohesion: 0.12
Nodes (3): require_admin_user(), execute_gateway_action(), get_attack_catalog()

### Community 1 - "domain.ts"
Cohesion: 0.08
Nodes (7): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, Decision, GatewayApiKey, OrganizationSettings, 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, Riesgos Técnicos Asociados:

### Community 3 - "test_audit_events.py"
Cohesion: 0.12
Nodes (10): test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_get_audit_event_not_found(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_success(), test_api_list_audit_events_tenant_isolation_forbidden(), test_audit_service_get_by_id() (+2 more)

### Community 4 - "enums.py"
Cohesion: 0.07
Nodes (21): 1. Resumen Ejecutivo de Divergencia Arquitectónica, AlertSeverity, AlertStatus, ApprovalStatus, RuleEffect, PDPEngine, test_get_alert_by_id_found(), test_get_alert_by_id_not_found() (+13 more)

### Community 5 - "PolicyRule"
Cohesion: 0.07
Nodes (13): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro, PolicyRule, PolicyRuleService, test_api_create_policy_rule_policy_not_found(), test_api_create_policy_rule_success(), test_api_create_policy_rule_target_agent_different_org(), test_api_get_policy_rule_found() (+5 more)

### Community 6 - "App.tsx"
Cohesion: 0.16
Nodes (30): 4.2 Flujos Esenciales de la Propuesta de Valor que No Existen Aún, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 3.2 Cuellos de Botella en Frontend (Renderizado, Red, Estado y Memoria), App(), getInitialView(), Header(), HeaderProps (+22 more)

### Community 7 - "policies.py"
Cohesion: 0.06
Nodes (20): 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`, create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), create_policy_rule() (+12 more)

### Community 8 - "uuid"
Cohesion: 0.12
Nodes (14): test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash(), test_api_multi_tenant_isolation_cross_tenant_forbidden() (+6 more)

### Community 9 - "labels.ts"
Cohesion: 0.07
Nodes (21): AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_LABELS, DECISION_STYLES, RISK_LABELS, RISK_STYLES (+13 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.06
Nodes (30): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+22 more)

### Community 11 - "ActorType"
Cohesion: 0.19
Nodes (5): 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`), AuditEvent, ActorType, AuditService

### Community 12 - "test_organization_settings.py"
Cohesion: 0.06
Nodes (23): create_organization(), get_organization(), get_organization_settings(), list_organizations(), update_organization_settings(), OrganizationCreate, OrganizationRead, OrganizationSettings (+15 more)

### Community 13 - "4. Puntos de Desincronización y Discrepancias de Contrato (Frontend vs Backend)"
Cohesion: 0.18
Nodes (11): 4.1 Desajustes Estructurales de Modelo y Granularidad, 4.2 Desalineación de Enumeraciones (Enums) y Convenciones de Casing, 4.3 Aislamiento Multi-Tenant, Cabeceras HTTP y Autenticación, 4.4 Endpoints del Backend Ignorados o Subutilizados por el Frontend, 4.6 Persistencia Huérfana en Base de Datos: La Tabla `audit_events`, 4. Puntos de Desincronización y Discrepancias de Contrato (Frontend vs Backend), A. Contenedor de Políticas vs. Reglas Atómicas (1:N Desalineado), A. Convención de Nomenclatura: camelCase vs. snake_case (+3 more)

### Community 14 - "🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.13
Nodes (15): 10.1 Comandos de Arranque y Parada Oficiales, 10.2 Secuencia Estricta de Inicialización, 10. Orquestación y Arranque Secuencial Local (`start_all` / `start-all.ps1`), 11. Protocolo Anti-Interrupciones y Estabilidad de Sesión (Anti "Worker User Agent Cancelled"), 12. Protocolo de Eficiencia Multi-Agente y Economía de Tokens (Lean Teamwork), 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto, 3. Metodología de Desarrollo: SDD (Spec-Driven Development) (+7 more)

### Community 15 - "test_analytics.py"
Cohesion: 0.10
Nodes (14): MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield(), test_api_analytics_overview_cross_tenant_forbidden() (+6 more)

### Community 16 - "main.py"
Cohesion: 0.13
Nodes (6): check_database_health(), check_redis_health(), health_check(), lifespan(), ping(), ¿Por qué es necesaria cada tecnología y qué rol cumple?

### Community 17 - "test_policy_rules_management.py"
Cohesion: 0.07
Nodes (18): Policy, User, UserService, test_mutation_policy_rules_logs_audit_events(), test_create_rule_in_policy_anti_ai_blocked(), test_create_rule_in_policy_cross_tenant_rejected(), test_create_rule_in_policy_non_admin_forbidden(), test_create_rule_in_policy_success() (+10 more)

### Community 18 - "._dispatch_to_tool"
Cohesion: 0.20
Nodes (8): 1. Veredicto Ejecutivo del Backend, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP, 4. Protocolo de Espera y Entrega de Resultados en HITL (`REQUIRE_APPROVAL`), 5. Custodia de Parámetros Originales para Re-Despacho HITL (Problema `"***REDACTED***"`), 6. Política de Despacho a Herramientas Externas (`_dispatch_to_tool`: Sandbox Mock vs. REST Real), Bloque B — Flujo Runtime del Gateway PEP, HITL y Herramientas

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "uuid"
Cohesion: 0.09
Nodes (17): UserRole, test_mutation_policy_lifecycle_logs_audit_events(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found() (+9 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "asyncio"
Cohesion: 0.14
Nodes (8): test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 24 - "env.py"
Cohesion: 0.19
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 25 - "BaseSchema"
Cohesion: 0.08
Nodes (12): AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint, ApiKeyCreate, ApprovalRead, AuditEventBase, AuditEventCreate, AuditEventPagination (+4 more)

### Community 26 - "api_keys.py"
Cohesion: 0.16
Nodes (6): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key(), ApiKeyCreatedResponse, ApiKeyResponse

### Community 27 - "OverviewView.tsx"
Cohesion: 0.17
Nodes (14): DEMO_IDS, UseAgentGuardWebSocketOptions, WebSocketEventMessage, ToolActionItem, ToolStatus, BackendHealthState, formatActionHuman(), formatHourLabel() (+6 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.08
Nodes (8): websocket_global_endpoint(), websocket_tenant_endpoint(), WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "UserRole"
Cohesion: 0.12
Nodes (9): create_user(), delete_user(), get_user(), list_users(), update_user(), UserCreate, UserRead, UserUpdate (+1 more)

### Community 30 - "🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)"
Cohesion: 0.33
Nodes (5): Comandos Oficiales:, 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard), Parada Limpia:, 🚨 Regla Innegociable para Agentes de IA (Anti "Worker User Agent Cancelled"):, Secuencia que ejecuta el orquestador:

### Community 31 - "typing"
Cohesion: 0.06
Nodes (15): create_tool_action(), get_tool_action(), list_tool_actions(), create_tool(), delete_tool(), get_tool(), list_tools(), update_tool() (+7 more)

### Community 33 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.11
Nodes (15): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas, 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final (+7 more)

### Community 35 - "test_schemas.py"
Cohesion: 0.09
Nodes (14): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentCreate (+6 more)

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
Cohesion: 0.07
Nodes (38): 4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core), 3.1 Cuellos de Botella en Backend, Base de Datos y Concurrencia, Agent, AgentTool, AgentStatus, ExecutionStatus, PolicyDecision, RiskLevel (+30 more)

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 49 - "react"
Cohesion: 0.39
Nodes (4): Theme, ThemeContext, ThemeContextType, react

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 52 - "asyncio"
Cohesion: 0.14
Nodes (8): test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 53 - "PolicyCache"
Cohesion: 0.21
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "api.ts"
Cohesion: 0.16
Nodes (22): mockAgents, mockAlerts, mockApprovals, mockPolicies, mockTools, GatewayExecutionPayload, GatewayExecutionResult, Agent (+14 more)

### Community 56 - "domain.ts"
Cohesion: 0.20
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 58 - "test_organizations.py"
Cohesion: 0.14
Nodes (8): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 62 - "ToolAction"
Cohesion: 0.12
Nodes (10): test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_get_by_id() (+2 more)

### Community 64 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 66 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 67 - "SanitizerService"
Cohesion: 0.13
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 68 - "001_initial_schema.py"
Cohesion: 0.14
Nodes (6): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade()

### Community 70 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.12
Nodes (15): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`) (+7 more)

### Community 71 - "ApiKey"
Cohesion: 0.05
Nodes (5): reset_demo_data(), ApiKey, ApiKeyService, _AutoYieldOverrides, _AutoYieldOverrides

### Community 72 - "list_alerts"
Cohesion: 0.16
Nodes (6): get_alert_by_id(), list_alerts(), update_alert_status(), AlertRead, AlertUpdateRequest, test_alert_schema()

### Community 73 - "asyncio"
Cohesion: 0.15
Nodes (6): test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org(), test_api_create_agent_success(), test_api_list_agent_tools()

### Community 74 - "Alert"
Cohesion: 0.10
Nodes (12): 2. Matriz Maestra de Inconsistencias (Documentación vs. Código Real), 3.3 Bug de Orden de Validación en el Pipeline del Gateway (Supresión de Alertas OWASP y Trazas), 7. Orden de Evaluación OWASP vs. `AgentTool` en el Pipeline del Gateway (Escenario 5), 9. Granularidad de Máquinas de Estado (`ExecutionStatus`, `AlertStatus`, `Tool.status`) y Protocolos (`ADR-003`), 2.1 *Chain of Responsibility* (Pipeline Determinista) para el Interceptor PEP, Alert, Approval, 🎓 Conclusión y Próximos Pasos (Semana 4) (+4 more)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.15
Nodes (13): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+5 more)

### Community 77 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 78 - "🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué"
Cohesion: 0.17
Nodes (12): 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧱 PASO 1: Infraestructura Local Reproducible (`docker-compose.yml`), 🐍 PASO 2: Entorno Backend & Configuración Fail-Fast (`backend/`), 🗄️ PASO 3: Modelos Declarativos y Versionado DDL con Alembic (`backend/alembic/`), 🚀 PASO 4: Entrypoint FastAPI, Middlewares y Verificación (`backend/app/main.py`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple? (+4 more)

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.12
Nodes (20): Sidebar(), SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav(), WorkspaceSwitcher() (+12 more)

### Community 80 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.17
Nodes (11): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días), 8. Unificación de `UserRole` y Usuarios Semilla (`Lucia Vance`) (+3 more)

### Community 81 - "auth-ui.tsx"
Cohesion: 0.05
Nodes (54): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+46 more)

### Community 82 - "test_health.py"
Cohesion: 0.16
Nodes (5): test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast(), test_organization_schemas()

### Community 83 - "AuthContext.tsx"
Cohesion: 0.24
Nodes (6): AuthContext, AuthContextType, AuthUser, DEMO_PROFILES, UserMember, UserRole

### Community 84 - "approvals.py"
Cohesion: 0.22
Nodes (5): get_approval(), list_approvals(), resolve_approval(), ApprovalDetailRead, C. Contexto y Métricas en Aprobaciones Humanas (HITL)

### Community 85 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 86 - "list_audit_events"
Cohesion: 0.29
Nodes (3): get_audit_event(), list_audit_events(), AuditEventResponse

### Community 87 - "⚡ Protocolo de Eficiencia Multi-Agente y Economía de Tokens (Lean Teamwork)"
Cohesion: 0.33
Nodes (5): 1. Saltear Explorers usando Graphify (Cero Redundancia), 2. Alcance Consolidado del Worker (Incremento Atómico Completo), 3. Cero Reviewers Intermedios (Auditoría Semántica en Git Diff), 4. Poda del Victory Auditor y Pytest Silencioso, ⚡ Protocolo de Eficiencia Multi-Agente y Economía de Tokens (Lean Teamwork)

### Community 89 - "Organization"
Cohesion: 0.18
Nodes (3): Organization, OrganizationService, test_mutation_agent_lifecycle_logs_audit_events()

### Community 91 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.20
Nodes (10): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1, 📊 Matriz Resumen de Tecnologías y Roles para la Defensa (+2 more)

### Community 92 - "🛡️ AgentGuard — Informe Técnico Integral de Auditoría: Mockups de Frontend, Capacidades de Backend y Plan de Sincronización"
Cohesion: 0.22
Nodes (8): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 6.1 Registro de Estado de Git (`git status --porcelain`), 6. Verificación de Integridad y Cumplimiento Read-Only, 7. Conclusión y Veredicto Final, 🛡️ AgentGuard — Informe Técnico Integral de Auditoría: Mockups de Frontend, Capacidades de Backend y Plan de Sincronización

### Community 94 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.15
Nodes (12): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+4 more)

### Community 95 - "3. Catálogo Detallado de Maquetas y Elementos Mockup"
Cohesion: 0.22
Nodes (9): 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox), 3.4 Gestión de Llaves de API del Gateway PEP (Settings Tab 2), 3.5 Salida y Testeo de Webhooks hacia SIEM (Settings Tab 5), 3.6 Parámetros Globales de Postura de Seguridad (Settings Tab 4), 3.7 Selector de Espacios de Trabajo / Multi-Tenant (Sidebar), 3.8 Selector de Identidades RBAC y Perfiles de Demostración (Header) (+1 more)

### Community 96 - "03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural"
Cohesion: 0.13
Nodes (11): 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`), 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL, 4.4 Defectos en `SanitizerService` y Configuraciones Ignoradas, 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4) (+3 more)

### Community 98 - "main"
Cohesion: 0.29
Nodes (5): 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), 1. Identidad y Configuración General, 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 3. Análisis Específico de Contradicciones Internas en la Documentación, main()

### Community 99 - "4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo"
Cohesion: 0.33
Nodes (5): 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo, SecurityStanceSettings

### Community 100 - "test_agent_service_assign_tool"
Cohesion: 0.33
Nodes (3): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh()

### Community 102 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.18
Nodes (10): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz), 5. Dependencias Huérfanas y Scripts de Monorepo Rotos, 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA (+2 more)

### Community 123 - "get_db"
Cohesion: 0.18
Nodes (5): get_db(), test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error()

### Community 136 - "list_executions"
Cohesion: 0.22
Nodes (6): 3.4 Latencia Forense Ficticia (`latency_ms=21.5`), 5. Deuda Técnica Estructural, Contratos Incompletos y Configuración, get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse

## Knowledge Gaps
- **7 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 959 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `4.2 Flujos Esenciales de la Propuesta de Valor que No Existen Aún` connect `App.tsx` to `PolicyRule`, `Tool`, `AuthContext.tsx`, `Organization`, `3. Hallazgos Críticos y Bugs Funcionales en el Frontend`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Are the 59 inferred relationships involving `User` (e.g. with `5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt)` and `get_analytics_overview()`) actually correct?**
  _`User` has 59 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `sqlalchemy_ext_asyncio` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `AgentTool` connect `Tool` to `📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa`, `enums.py`, `test_schemas.py`, `enums.py`, `PolicyRule`, `App.tsx`, `06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas`, `asyncio`, `Alert`, `🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)`, `._dispatch_to_tool`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `AgentService`, `ToolService`, `typing`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 42 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 42 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._