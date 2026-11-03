export type NavView = 
  | 'overview' 
  | 'agents' 
  | 'tools' 
  | 'policies' 
  | 'approvals' 
  | 'traces' 
  | 'playground' 
  | 'settings';

export type AgentStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type ToolStatus = 'Active' | 'Paused' | 'Inactive';
export type Decision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
export type PolicyDecision = Decision;
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Agent {
  id: string;
  name: string;
  identifier: string;
  type: string;
  owner: string;
  assignedTools: string[];
  status: AgentStatus;
  lastActivity: string;
  initials: string;
}

export interface ToolActionItem {
  id: string;
  action_name: string;
  risk_level: RiskLevel;
  description?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  availableActions: string[];
  assignedAgent: string;
  status: ToolStatus;
  initials: string;
  protocol?: string;
  endpoint_url?: string;
  actionsList?: ToolActionItem[];
  created_at?: string;
}


export interface PolicyRuleItem {
  id: string;
  policy_id: string;
  priority: number;
  effect: PolicyDecision;
  tool_action_id: string;
  target_agent_id?: string | null;
  conditions: Record<string, any>;
  action_name?: string | null;
  tool_name?: string | null;
  agent_name: string;
  created_at: string;
}

export interface Policy {
  id: string;
  policyId?: string;
  name: string;
  description?: string;
  priority?: number;
  agent: string;
  action: string;
  condition: string;
  decision: PolicyDecision;
  status: 'Active' | 'Inactive';
  created_at?: string;
  rules?: PolicyRuleItem[];
  rawConditions?: Record<string, any>;
}



export interface ApprovalRequest {
  id: string;
  agentName: string;
  agentInitials: string;
  action: string;
  resource: string;
  amount: string;
  requestedAt: string;
  status: ApprovalStatus;
  delegatedBy: string;
  riskLevel: RiskLevel;
  justification: string;
  appliedPolicy: {
    name: string;
    condition: string;
  };
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  severity: AlertSeverity;
  status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  createdAt?: string;
  executionId?: string;
}

export interface ExecutionTrace {
  id: string;
  organizationId: string;
  agentId: string;
  agentName: string;
  toolId: string;
  toolName: string;
  actionName: string;
  resource: string;
  requestContext: Record<string, any>;
  decision: Decision;
  status: string;
  evaluatedPolicyRuleId?: string | null;
  timestamp: string;
  latencyMs: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | null;
  approvalResolvedAt?: string | null;
  resolutionReason?: string | null;
}

export type UserRole = 'ADMIN' | 'APPROVER' | 'OPERATOR' | 'AUDITOR' | 'VIEWER';

export interface UserMember {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface GatewayApiKey {
  id: string;
  name: string;
  prefix: string;
  secretMasked: string;
  rawKey?: string;
  role: string;
  createdAt: string;
  lastUsedAt?: string;
  isActive?: boolean;
}

export interface SecurityStanceSettings {
  defaultDecision: 'DENY' | 'ALLOW';
  strictMultiTenant: boolean;
  maskSensitiveContext: boolean;
  maxAutonomousRefund: number;
  siemWebhookUrl: string;
  siemFormat: 'SPLUNK' | 'DATADOG' | 'ELASTIC' | 'GENERIC_JSON';
}

export interface AnalyticsOverview {
  total_executions: number;
  allow_count: number;
  deny_count: number;
  require_approval_count: number;
  avg_latency_ms: number;
  active_incident_count: number;
}

export interface TimeseriesPoint {
  timestamp: string;
  executions: number;
  allowed: number;
  denied: number;
  require_approval: number;
  avg_latency_ms: number;
}

export interface AnalyticsTimeseries {
  range: string;
  points: TimeseriesPoint[];
}

export interface OrganizationSettings {
  fail_closed: boolean;
  mask_sensitive: boolean;
  max_autonomous_amount: number;
  retention_days: number;
}



export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  organization_id?: string;
  organizationId?: string;
  avatarInitials?: string;
  avatarBg?: string;
  badgeColor?: string;
  description?: string;
  canApproveHITL?: boolean;
  canConfigurePolicies?: boolean;
  canManageTeam?: boolean;
  created_at?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
