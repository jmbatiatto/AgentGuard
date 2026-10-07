-- ==========================================================
-- AgentGuard: Runtime Authorization & Governance for AI Agents
-- Modelo Entidad-Relación (MER) - Versión Mejorada v2.0
-- Compatible con Draw.io (Import SQL DDL) & PostgreSQL
-- ==========================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR', 'APPROVER');
CREATE TYPE agent_status AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');
CREATE TYPE tool_protocol AS ENUM ('MCP', 'REST');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE rule_effect AS ENUM ('ALLOW', 'DENY', 'REQUIRE_APPROVAL');
CREATE TYPE execution_decision AS ENUM ('ALLOW', 'DENY', 'REQUIRE_APPROVAL');
CREATE TYPE execution_status AS ENUM ('PENDING_APPROVAL', 'REJECTED', 'EXECUTED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');
CREATE TYPE actor_type AS ENUM ('USER', 'AGENT', 'SYSTEM');

-- 1. Organization (Tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. User
CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Agent
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    purpose TEXT,
    status agent_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tool
CREATE TABLE tools (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    protocol tool_protocol NOT NULL,
    endpoint_url VARCHAR(1024) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. ToolAction
CREATE TABLE tool_actions (
    id UUID PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    action_name VARCHAR(255) NOT NULL,
    risk_level risk_level NOT NULL DEFAULT 'MEDIUM',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tool_action UNIQUE (tool_id, action_name)
);

-- 6. AgentTool (N:N)
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_agent_tool UNIQUE (agent_id, tool_id)
);

-- 7. Policy
CREATE TABLE policies (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. PolicyRule
CREATE TABLE policy_rules (
    id UUID PRIMARY KEY,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 100,
    effect rule_effect NOT NULL,
    tool_action_id UUID NOT NULL REFERENCES tool_actions(id) ON DELETE CASCADE,
    target_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    conditions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Execution
CREATE TABLE executions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id),
    delegator_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tool_id UUID NOT NULL REFERENCES tools(id),
    tool_action_id UUID NOT NULL REFERENCES tool_actions(id),
    resource VARCHAR(1024) NOT NULL,
    request_context JSONB NOT NULL DEFAULT '{}',
    decision execution_decision NOT NULL,
    status execution_status NOT NULL,
    evaluated_policy_rule_id UUID REFERENCES policy_rules(id) ON DELETE SET NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Approval
CREATE TABLE approvals (
    id UUID PRIMARY KEY,
    execution_id UUID NOT NULL UNIQUE REFERENCES executions(id) ON DELETE CASCADE,
    assigned_approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status approval_status NOT NULL DEFAULT 'PENDING',
    resolution_reason TEXT,
    resolved_at TIMESTAMP
);

-- 11. Alert
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity alert_severity NOT NULL,
    status alert_status NOT NULL DEFAULT 'OPEN',
    resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. AuditEvent
CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_type actor_type NOT NULL,
    actor_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
