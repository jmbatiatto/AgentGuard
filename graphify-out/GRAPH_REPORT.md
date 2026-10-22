# Graph Report - AgentGuard  (2026-10-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 891 nodes · 2412 edges · 44 communities (31 shown, 13 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 320 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34605752`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_agents.py
- App.tsx
- enums.py
- convert_docs_to_docx.py
- main.py
- uuid
- schemas/__init__.py
- ToolAction
- PolicyDecision
- test_policies.py
- frontend/package.json
- typing
- ApprovalStatus
- test_schemas.py
- env.py
- test_tool_actions.py
- tool_actions.py
- test_organizations.py
- test_tools.py
- compilerOptions
- Tool
- PDPEngine
- compilerOptions
- scripts
- services/__init__.py
- ToolActionService
- UserService
- list_approvals
- create_organization
- create_policy
- create_policy_rule
- create_tool
- create_user
- PolicyRuleService
- ToolService
- test_approvals_get_by_id_success
- .oxlintrc.json
- execute_gateway_action
- 001_initial_schema.py
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `Tool` - 40 edges
2. `BaseSchema` - 36 edges
3. `ToolAction` - 36 edges
4. `PolicyDecision` - 36 edges
5. `Agent` - 35 edges
6. `RiskLevel` - 33 edges
7. `Organization` - 32 edges
8. `User` - 28 edges
9. `AgentStatus` - 26 edges
10. `Base` - 25 edges

## Surprising Connections (you probably didn't know these)
- `add_card()` --indirect_call--> `root()`  [INFERRED]
  scripts/generate_diagrams.py → backend/app/main.py
- `add_edge()` --indirect_call--> `root()`  [INFERRED]
  scripts/generate_diagrams.py → backend/app/main.py
- `add_textbox()` --indirect_call--> `root()`  [INFERRED]
  scripts/generate_diagrams.py → backend/app/main.py
- `AgentCreate` --uses--> `AgentStatus`  [INFERRED]
  backend/app/schemas/agent.py → backend/app/models/enums.py
- `AgentRead` --uses--> `AgentStatus`  [INFERRED]
  backend/app/schemas/agent.py → backend/app/models/enums.py

## Import Cycles
- None detected.

## Communities (44 total, 13 thin omitted)

### Community 0 - "test_agents.py"
Cohesion: 0.06
Nodes (19): assign_tool_to_agent(), create_agent(), get_agent(), list_agent_tools(), list_agents(), AgentCreate, AgentRead, AgentToolCreate (+11 more)

### Community 1 - "App.tsx"
Cohesion: 0.09
Nodes (40): App(), Header(), HeaderProps, Sidebar(), SidebarProps, Theme, ThemeContext, ThemeContextType (+32 more)

### Community 2 - "enums.py"
Cohesion: 0.15
Nodes (8): Base, Alert, AuditEvent, ActorType, AlertSeverity, AlertStatus, Execution, Organization

### Community 3 - "convert_docs_to_docx.py"
Cohesion: 0.06
Nodes (14): SanitizerService, test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys(), add_markdown_to_docx(), build_docx_files() (+6 more)

### Community 4 - "main.py"
Cohesion: 0.07
Nodes (13): check_database_health(), check_redis_health(), health_check(), lifespan(), ping(), root(), test_health_endpoint(), test_ping_endpoint() (+5 more)

### Community 5 - "uuid"
Cohesion: 0.12
Nodes (15): UserRole, User, UserCreate, UserRead, test_user_schemas(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success() (+7 more)

### Community 6 - "schemas/__init__.py"
Cohesion: 0.11
Nodes (10): AlertRead, ApprovalDetailRead, ApprovalRead, BaseSchema, ExecutionRead, OrganizationRead, PolicyRead, PolicyRuleRead (+2 more)

### Community 7 - "ToolAction"
Cohesion: 0.10
Nodes (15): RuleEffect, PolicyRule, ToolAction, test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_require_approval(), test_api_create_policy_rule_policy_not_found(), test_api_create_policy_rule_success() (+7 more)

### Community 8 - "PolicyDecision"
Cohesion: 0.14
Nodes (15): AgentStatus, ExecutionStatus, PolicyDecision, RiskLevel, GatewayExecuteRequest, GatewayExecuteResponse, PDPDecisionResult, test_gateway_execute_endpoint_allow() (+7 more)

### Community 9 - "test_policies.py"
Cohesion: 0.10
Nodes (11): Policy, PolicyCreate, PolicyService, test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies() (+3 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+21 more)

### Community 12 - "ApprovalStatus"
Cohesion: 0.14
Nodes (6): Approval, ApprovalStatus, PEPGatewayService, test_approvals_list_endpoint(), test_approvals_resolve_success(), test_demo_scenario_3_high_impact_require_approval_and_resolve()

### Community 13 - "test_schemas.py"
Cohesion: 0.10
Nodes (10): ApprovalResolveRequest, OrganizationCreate, PolicyRuleCreate, test_agent_and_agent_tool_schemas(), test_alert_schema(), test_approval_resolve_schema(), test_gateway_schemas(), test_organization_schemas() (+2 more)

### Community 14 - "env.py"
Cohesion: 0.10
Nodes (5): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online(), Settings

### Community 15 - "test_tool_actions.py"
Cohesion: 0.13
Nodes (10): test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_get_by_id() (+2 more)

### Community 16 - "tool_actions.py"
Cohesion: 0.17
Nodes (5): create_tool_action(), get_tool_action(), list_tool_actions(), ToolActionCreate, ToolActionRead

### Community 17 - "test_organizations.py"
Cohesion: 0.14
Nodes (8): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 18 - "test_tools.py"
Cohesion: 0.14
Nodes (8): test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "Tool"
Cohesion: 0.19
Nodes (6): Agent, AgentTool, Tool, test_demo_scenario_1_normal_operation_allow(), test_demo_scenario_2_privilege_abuse_deny(), test_demo_scenario_4_prompt_injection_deny_and_critical_alert()

### Community 21 - "PDPEngine"
Cohesion: 0.17
Nodes (4): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric()

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.12
Nodes (15): description, engines, node, name, packageManager, private, scripts, build:frontend (+7 more)

### Community 27 - "list_approvals"
Cohesion: 0.27
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 28 - "create_organization"
Cohesion: 0.22
Nodes (3): create_organization(), get_organization(), list_organizations()

### Community 29 - "create_policy"
Cohesion: 0.24
Nodes (3): create_policy(), get_policy(), list_policies()

### Community 30 - "create_policy_rule"
Cohesion: 0.24
Nodes (3): create_policy_rule(), get_policy_rule(), list_policy_rules()

### Community 31 - "create_tool"
Cohesion: 0.24
Nodes (3): create_tool(), get_tool(), list_tools()

### Community 32 - "create_user"
Cohesion: 0.24
Nodes (3): create_user(), get_user(), list_users()

### Community 35 - "test_approvals_get_by_id_success"
Cohesion: 0.29
Nodes (3): test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_resolve_already_resolved_or_not_found()

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Knowledge Gaps
- **5 isolated node(s):** `oxlint`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 418 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tool` connect `Tool` to `test_agents.py`, `enums.py`, `ToolService`, `ToolAction`, `PolicyDecision`, `typing`, `ApprovalStatus`, `test_tool_actions.py`, `test_tools.py`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `Tool` (e.g. with `PEPGatewayService` and `ToolService`) actually correct?**
  _`Tool` has 21 INFERRED edges - model-reasoned connections that need verification._
- **What connects `oxlint`, `@types/node`, `@types/react` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_agents.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05625 - nodes in this community are weakly interconnected._
- **Why does `SanitizerService` connect `convert_docs_to_docx.py` to `services/__init__.py`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `ToolAction` (e.g. with `RiskLevel` and `PEPGatewayService`) actually correct?**
  _`ToolAction` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09398496240601503 - nodes in this community are weakly interconnected._