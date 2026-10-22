# Graph Report - AgentGuard  (2026-10-22)

## Corpus Check
- 117 files · ~61,682 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .drawio 6, (none) 2, .css 2)

## Summary
- 1102 nodes · 2788 edges · 67 communities (48 shown, 19 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 406 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5578ccfa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- services/__init__.py
- App.tsx
- Tool
- sanitizer_service.py
- generate_diagrams.py
- uuid
- schemas/__init__.py
- ToolAction
- test_agents.py
- asyncio
- frontend/package.json
- typing
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- test_schemas.py
- env.py
- test_tool_actions.py
- tool_actions.py
- test_organizations.py
- test_tools.py
- compilerOptions
- asyncio
- PDPEngine
- compilerOptions
- scripts
- Organization
- ToolActionService
- UserService
- list_approvals
- create_organization
- create_policy
- create_policy_rule
- create_tool
- create_user
- convert_docs_to_docx.py
- ToolService
- assign_tool_to_agent
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- downgrade
- tsconfig.json
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- SanitizerService
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- main.py
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- health_check
- 3. Análisis Semántico de las Relaciones y Cardinalidades
- tool_service.py
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- policy_service.py
- ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas
- agent-demo/README.md
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md

## God Nodes (most connected - your core abstractions)
1. `Tool` - 45 edges
2. `ToolAction` - 45 edges
3. `Agent` - 40 edges
4. `PolicyDecision` - 39 edges
5. `Organization` - 38 edges
6. `RiskLevel` - 36 edges
7. `BaseSchema` - 36 edges
8. `AgentTool` - 34 edges
9. `User` - 33 edges
10. `PolicyRule` - 32 edges

## Surprising Connections (you probably didn't know these)
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`)` --references--> `Alert`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/alert.py
- `5. Especificación Detallada del Caso de Uso Crítico: UC05` --references--> `Approval`  [INFERRED]
  agentguard_casos_de_uso.md → backend/app/models/approval.py
- `B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`)` --references--> `Approval`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/approval.py
- `A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`)` --references--> `Execution`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/execution.py

## Import Cycles
- None detected.

## Communities (67 total, 19 thin omitted)

### Community 0 - "services/__init__.py"
Cohesion: 0.07
Nodes (4): AgentToolCreate, AgentService, PolicyRuleService, PolicyService

### Community 1 - "App.tsx"
Cohesion: 0.09
Nodes (40): App(), Header(), HeaderProps, Sidebar(), SidebarProps, Theme, ThemeContext, ThemeContextType (+32 more)

### Community 2 - "Tool"
Cohesion: 0.05
Nodes (50): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, 4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core), execute_gateway_action(), Base, Agent, AgentTool, Alert, Approval (+42 more)

### Community 3 - "sanitizer_service.py"
Cohesion: 0.12
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 4 - "generate_diagrams.py"
Cohesion: 0.19
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 5 - "uuid"
Cohesion: 0.11
Nodes (14): UserRole, User, UserCreate, test_user_schemas(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_get_user_found() (+6 more)

### Community 6 - "schemas/__init__.py"
Cohesion: 0.13
Nodes (7): AgentRead, AgentToolRead, ApprovalDetailRead, ApprovalRead, BaseSchema, ExecutionRead, PolicyRead

### Community 7 - "ToolAction"
Cohesion: 0.13
Nodes (10): RuleEffect, PolicyRuleCreate, test_api_create_policy_rule_policy_not_found(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_api_list_policy_rules(), test_policy_rule_service_create(), test_policy_rule_service_get_by_id() (+2 more)

### Community 8 - "test_agents.py"
Cohesion: 0.10
Nodes (7): test_api_create_agent_success(), test_gateway_execute_validation_error(), test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_api_create_policy_success(), test_organization_schemas()

### Community 9 - "asyncio"
Cohesion: 0.12
Nodes (7): test_api_create_policy_organization_not_found(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 10 - "frontend/package.json"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+21 more)

### Community 12 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.10
Nodes (20): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1 (+12 more)

### Community 13 - "test_schemas.py"
Cohesion: 0.12
Nodes (8): AgentCreate, AlertRead, ApprovalResolveRequest, ToolRead, UserRead, test_agent_and_agent_tool_schemas(), test_alert_schema(), test_approval_resolve_schema()

### Community 14 - "env.py"
Cohesion: 0.06
Nodes (17): 1. Identidad y Configuración General, 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto, 3. Metodología de Desarrollo: SDD (Spec-Driven Development), 5. Control de Versiones y Convención de Commits, 6. Calidad de Software, Testing y Regresión Continua, 7. Persistencia y Base de Datos (PostgreSQL), 8. Variables de Entorno y Configuración Fail-Fast (+9 more)

### Community 15 - "test_tool_actions.py"
Cohesion: 0.10
Nodes (12): test_approvals_get_by_id_not_found(), test_approvals_resolve_already_resolved_or_not_found(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions() (+4 more)

### Community 16 - "tool_actions.py"
Cohesion: 0.18
Nodes (5): create_tool_action(), get_tool_action(), list_tool_actions(), ToolActionCreate, ToolActionRead

### Community 17 - "test_organizations.py"
Cohesion: 0.14
Nodes (8): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 18 - "test_tools.py"
Cohesion: 0.12
Nodes (7): test_api_create_tool_organization_not_found(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "asyncio"
Cohesion: 0.12
Nodes (8): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org(), test_api_list_agent_tools()

### Community 21 - "PDPEngine"
Cohesion: 0.11
Nodes (7): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_require_approval()

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.12
Nodes (15): description, engines, node, name, packageManager, private, scripts, build:frontend (+7 more)

### Community 24 - "Organization"
Cohesion: 0.16
Nodes (4): Organization, OrganizationCreate, OrganizationService, test_api_create_tool_success()

### Community 27 - "list_approvals"
Cohesion: 0.27
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 28 - "create_organization"
Cohesion: 0.22
Nodes (4): create_organization(), get_organization(), list_organizations(), OrganizationRead

### Community 29 - "create_policy"
Cohesion: 0.24
Nodes (3): create_policy(), get_policy(), list_policies()

### Community 30 - "create_policy_rule"
Cohesion: 0.23
Nodes (4): create_policy_rule(), get_policy_rule(), list_policy_rules(), PolicyRuleRead

### Community 31 - "create_tool"
Cohesion: 0.24
Nodes (3): create_tool(), get_tool(), list_tools()

### Community 32 - "create_user"
Cohesion: 0.24
Nodes (3): create_user(), get_user(), list_users()

### Community 33 - "convert_docs_to_docx.py"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 35 - "assign_tool_to_agent"
Cohesion: 0.21
Nodes (5): assign_tool_to_agent(), create_agent(), get_agent(), list_agent_tools(), list_agents()

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "downgrade"
Cohesion: 0.21
Nodes (11): 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), downgrade(), upgrade(), 🗄️ PASO 3: Modelos Declarativos y Versionado DDL con Alembic (`backend/alembic/`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Qué se hace concretamente?, 1. Contexto y Problema, 2. Decisión Tomada (+3 more)

### Community 44 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.15
Nodes (10): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas, ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo (+2 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.17
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 49 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.18
Nodes (11): 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Decisión Tomada, 2. Justificación Técnica, 3. Justificación Técnica, ADR-001: Arquitectura Políglota — Backend en Python (FastAPI) y Frontend en TypeScript (React), ADR-003: Supresión de MCP y Estandarización en Protocolo HTTP REST Puro (+3 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 53 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.20
Nodes (10): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles, 🎬 La Secuencia de la Demo Principal (En Vivo) (+2 more)

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.25
Nodes (7): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos, ❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*, ❓ P2: *"¿Por qué la relación entre `EJECUCIÓN` y `APROBACIÓN` es `(0,1)` y no `(1,1)`?"*

### Community 55 - "health_check"
Cohesion: 0.25
Nodes (3): check_database_health(), health_check(), ping()

### Community 56 - "3. Análisis Semántico de las Relaciones y Cardinalidades"
Cohesion: 0.29
Nodes (7): 3. Análisis Semántico de las Relaciones y Cardinalidades, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$), D. Herramienta y Acción: `EXPONE`, E. Ejecución en Runtime: `SOLICITA` e `INVOCA`, F. Aprobación Humana: `REQUIERE_INTERVENCIÓN`

### Community 59 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.40
Nodes (5): 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final, 🧪 Métricas de Calidad y Cobertura (Pytest), 🎯 Resumen Ejecutivo de Entrega de la Semana 3

### Community 62 - "ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas"
Cohesion: 0.50
Nodes (4): 1. Contexto y Problema, 2. Decisión Tomada, 3. Asignación por Paquete, ADR-002: Estructura Monorepo Políglota y Distribución Modular de Carpetas

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 541 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Approval` connect `Tool` to `🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime`, `🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `Tool` (e.g. with `PEPGatewayService` and `ToolService`) actually correct?**
  _`Tool` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `services/__init__.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07084785133565621 - nodes in this community are weakly interconnected._
- **Why does `AgentTool` connect `Tool` to `services/__init__.py`, `test_agents.py`, `⚙️ AgentGuard — Backend (Python + FastAPI)`, `asyncio`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09398496240601503 - nodes in this community are weakly interconnected._