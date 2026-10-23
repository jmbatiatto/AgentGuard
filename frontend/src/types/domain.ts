export type NavView = 
  | 'overview' 
  | 'agents' 
  | 'tools' 
  | 'policies' 
  | 'approvals' 
  | 'traces' 
  | 'playground' 
  | 'settings';

export type AgentStatus = 'Active' | 'Inactive' | 'Suspended';
export type ToolStatus = 'Active' | 'Paused' | 'Inactive';
export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

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
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
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
  severity: 'critical' | 'warning' | 'info';
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
  decision: PolicyDecision;
  status: string;
  evaluatedPolicyRuleId?: string | null;
  timestamp: string;
  latencyMs: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | null;
  approvalResolvedAt?: string | null;
  resolutionReason?: string | null;
}
