# Graph Report - AgentGuard  (2026-10-23)

## Corpus Check
- 137 files · ~95,460 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .drawio 6, .bat 5, (none) 2)

## Summary
- 1389 nodes · 3518 edges · 90 communities (64 shown, 26 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 488 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fec15723`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_gateway_scenarios.py
- AgentGuardApiClient
- asyncio
- test_schemas.py
- asyncio
- App.tsx
- Policy
- tool_action_service.py
- api.ts
- frontend/package.json
- test_gateway_api.py
- organizations.py
- PolicyRule
- env.py
- ToolService
- main.py
- test_organizations.py
- 3. Análisis Semántico de las Relaciones y Cardinalidades
- compilerOptions
- uuid
- PDPEngine
- compilerOptions
- scripts
- UserRole
- get_db
- typing
- UserService
- WebSocketConnectionManager
- UserRole
- 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)
- tools.py
- AgentService
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
- domain.ts
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- test_tool_actions.py
- generate_diagrams.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- FastAPI
- convert_docs_to_docx.py
- asyncio
- downgrade
- react
- SanitizerService
- test_seed_data_already_exists_without_reset
- agent-demo/README.md
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- test_sanitizer_service.py
- PolicyRuleCreate
- sqlalchemy_ext_asyncio
- health_check
- list_alerts
- PolicyRuleService
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- executions.py
- PlaygroundView.tsx
- ._inspect_recursive
- test_approvals_get_by_id_success
- test_health.py
- reset_demo_data
- ThemeContext.ts
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- test_get_execution_by_id_not_found
- ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic
- ADR-004: Modelo Relacional Multi-Tenant con Identificadores UUID v4 e Índices JSONB en PostgreSQL
- ToolAction

## God Nodes (most connected - your core abstractions)
1. `ToolAction` - 53 edges
2. `Tool` - 51 edges
3. `PolicyDecision` - 47 edges
4. `Agent` - 45 edges
5. `BaseSchema` - 43 edges
6. `AgentTool` - 39 edges
7. `RiskLevel` - 38 edges
8. `Organization` - 38 edges
9. `PolicyRule` - 38 edges
10. `User` - 38 edges

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

## Communities (90 total, 26 thin omitted)

### Community 0 - "test_gateway_scenarios.py"
Cohesion: 0.15
Nodes (11): Alert, AlertSeverity, AlertStatus, 🎓 Conclusión y Próximos Pasos (Semana 4), clear_database(), seed_data(), test_get_alert_by_id_found(), test_get_alert_by_id_not_found() (+3 more)

### Community 1 - "AgentGuardApiClient"
Cohesion: 0.09
Nodes (4): AgentGuardApiClient, Agent, Policy, Tool

### Community 2 - "asyncio"
Cohesion: 0.11
Nodes (8): test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 3 - "test_schemas.py"
Cohesion: 0.06
Nodes (23): AgentCreate, AgentRead, AgentToolCreate, AgentToolRead, AgentUpdate, AlertRead, AlertUpdateRequest, ApprovalDetailRead (+15 more)

### Community 5 - "asyncio"
Cohesion: 0.11
Nodes (8): test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 6 - "App.tsx"
Cohesion: 0.23
Nodes (17): App(), getInitialView(), Header(), Sidebar(), AuthProvider(), useAuth(), ThemeProvider(), useAgentGuardWebSocket() (+9 more)

### Community 7 - "Policy"
Cohesion: 0.09
Nodes (7): create_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyUpdate, PolicyService

### Community 9 - "api.ts"
Cohesion: 0.18
Nodes (15): mockAgents, mockAlerts, mockApprovals, mockPolicies, mockTools, DEMO_IDS, GatewayExecutionPayload, GatewayExecutionResult (+7 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+21 more)

### Community 11 - "test_gateway_api.py"
Cohesion: 0.10
Nodes (9): execute_gateway_action(), get_attack_catalog(), GatewayExecuteRequest, GatewayExecuteResponse, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error() (+1 more)

### Community 12 - "organizations.py"
Cohesion: 0.23
Nodes (3): create_organization(), get_organization(), list_organizations()

### Community 13 - "PolicyRule"
Cohesion: 0.07
Nodes (16): RuleEffect, Policy, PolicyRule, PDPEngine, test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_priority_tie_deny_wins(), test_pdp_evaluate_require_approval() (+8 more)

### Community 14 - "env.py"
Cohesion: 0.05
Nodes (21): 10.1 Comandos de Arranque y Parada Oficiales, 10.2 Secuencia Estricta de Inicialización, 10. Orquestación y Arranque Secuencial Local (`start_all` / `start-all.ps1`), 11. Protocolo Anti-Interrupciones y Estabilidad de Sesión (Anti "Worker User Agent Cancelled"), 1. Identidad y Configuración General, 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto, 3. Metodología de Desarrollo: SDD (Spec-Driven Development) (+13 more)

### Community 17 - "test_organizations.py"
Cohesion: 0.14
Nodes (8): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 18 - "3. Análisis Semántico de las Relaciones y Cardinalidades"
Cohesion: 0.29
Nodes (7): 3. Análisis Semántico de las Relaciones y Cardinalidades, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$), D. Herramienta y Acción: `EXPONE`, E. Ejecución en Runtime: `SOLICITA` e `INVOCA`, F. Aprobación Humana: `REQUIERE_INTERVENCIÓN`

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "uuid"
Cohesion: 0.08
Nodes (15): test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found(), test_api_get_user_not_found(), test_api_list_users() (+7 more)

### Community 21 - "PDPEngine"
Cohesion: 0.15
Nodes (3): test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric()

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.10
Nodes (19): description, engines, node, name, packageManager, private, scripts, build:frontend (+11 more)

### Community 24 - "UserRole"
Cohesion: 0.21
Nodes (4): delete_user(), get_user(), list_users(), update_user()

### Community 25 - "get_db"
Cohesion: 0.05
Nodes (29): get_approval(), list_approvals(), resolve_approval(), create_policy_rule(), get_policy_rule(), list_policy_rules(), get_db(), 1. Levantar Servicios de Infraestructura (Paso 1) (+21 more)

### Community 26 - "typing"
Cohesion: 0.14
Nodes (5): Base, AuditEvent, ActorType, Execution, Organization

### Community 28 - "WebSocketConnectionManager"
Cohesion: 0.11
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "UserRole"
Cohesion: 0.17
Nodes (6): create_user(), UserRole, UserCreate, UserRead, UserUpdate, test_user_schemas()

### Community 30 - "🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)"
Cohesion: 0.33
Nodes (5): Comandos Oficiales:, 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard), Parada Limpia:, 🚨 Regla Innegociable para Agentes de IA (Anti "Worker User Agent Cancelled"):, Secuencia que ejecuta el orquestador:

### Community 31 - "tools.py"
Cohesion: 0.16
Nodes (5): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool()

### Community 33 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.25
Nodes (5): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas

### Community 35 - "agents.py"
Cohesion: 0.16
Nodes (7): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent()

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.17
Nodes (12): 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada, 3. Asignación por Paquete, 3. Justificación Técnica, ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React) (+4 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.17
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 47 - "Tool"
Cohesion: 0.09
Nodes (21): Agent, Approval, AgentStatus, ApprovalStatus, ExecutionStatus, PolicyDecision, RiskLevel, Tool (+13 more)

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 49 - "domain.ts"
Cohesion: 0.14
Nodes (13): AuthContext, AuthContextType, AuthUser, DEMO_PROFILES, AgentStatus, GatewayApiKey, PolicyRuleItem, RiskLevel (+5 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 52 - "test_tool_actions.py"
Cohesion: 0.07
Nodes (16): create_tool_action(), get_tool_action(), list_tool_actions(), ToolActionCreate, ToolActionRead, ToolRead, test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success() (+8 more)

### Community 53 - "generate_diagrams.py"
Cohesion: 0.19
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.25
Nodes (7): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos, ❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*, ❓ P2: *"¿Por qué la relación entre `EJECUCIÓN` y `APROBACIÓN` es `(0,1)` y no `(1,1)`?"*

### Community 56 - "convert_docs_to_docx.py"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 58 - "asyncio"
Cohesion: 0.14
Nodes (7): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_create_agent_owner_different_org(), test_api_list_agent_tools()

### Community 59 - "downgrade"
Cohesion: 0.39
Nodes (6): 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), downgrade(), upgrade(), ¿Qué se hace concretamente?, 3. Justificación Técnica, 💻 Stack Tecnológico Oficial (Arquitectura Políglota)

### Community 60 - "react"
Cohesion: 0.41
Nodes (6): HeaderProps, ResetDemoModal(), ResetDemoModalProps, api, lucide-react, react

### Community 64 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 66 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 67 - "test_sanitizer_service.py"
Cohesion: 0.17
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 68 - "PolicyRuleCreate"
Cohesion: 0.22
Nodes (4): PolicyCreate, PolicyRuleCreate, test_policy_rule_service_create(), test_policy_and_policy_rule_schemas_fail_closed()

### Community 70 - "health_check"
Cohesion: 0.25
Nodes (3): check_database_health(), health_check(), ping()

### Community 72 - "list_alerts"
Cohesion: 0.26
Nodes (3): get_alert_by_id(), list_alerts(), update_alert_status()

### Community 74 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.40
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+4 more)

### Community 77 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 78 - "executions.py"
Cohesion: 0.27
Nodes (4): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.24
Nodes (8): SidebarProps, NavView, OverviewViewProps, ATTACK_VECTORS, AttackVectorOption, PlaygroundViewProps, SimulationDecision, SimulationResult

### Community 81 - "test_approvals_get_by_id_success"
Cohesion: 0.22
Nodes (4): test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success()

### Community 82 - "test_health.py"
Cohesion: 0.28
Nodes (3): test_health_endpoint(), test_ping_endpoint(), test_root_endpoint()

### Community 84 - "ThemeContext.ts"
Cohesion: 0.48
Nodes (4): Theme, ThemeContext, ThemeContextType, useTheme()

### Community 85 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.40
Nodes (5): 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final, 🧪 Métricas de Calidad y Cobertura (Pytest), 🎯 Resumen Ejecutivo de Entrega de la Semana 3

### Community 87 - "ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic"
Cohesion: 0.67
Nodes (3): 1. Contexto y Problema, 2. Decisión Tomada, ADR-005: Control de Versiones y Migraciones de Base de Datos con Alembic

### Community 88 - "ADR-004: Modelo Relacional Multi-Tenant con Identificadores UUID v4 e Índices JSONB en PostgreSQL"
Cohesion: 0.67
Nodes (3): 1. Decisión Tomada, 2. Justificación Técnica, ADR-004: Modelo Relacional Multi-Tenant con Identificadores UUID v4 e Índices JSONB en PostgreSQL

### Community 90 - "ToolAction"
Cohesion: 0.09
Nodes (14): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, 4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core), AgentTool, ToolAction, 🛡️ Cumplimiento de Reglas Innegociables del Dominio, test_api_assign_tool_to_agent_success(), test_api_get_attack_catalog(), test_gateway_execute_blocks_prompt_injection() (+6 more)

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 685 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents` connect `env.py` to `README.md`, `ToolAction`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Are the 30 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 30 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_gateway_scenarios.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14666666666666667 - nodes in this community are weakly interconnected._
- **Why does `Reglas para Agentes de IA:` connect `env.py` to `api.ts`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Tool` (e.g. with `PEPGatewayService` and `ToolService`) actually correct?**
  _`Tool` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Should `AgentGuardApiClient` be split into smaller, more focused modules?**
  _Cohesion score 0.08615384615384615 - nodes in this community are weakly interconnected._