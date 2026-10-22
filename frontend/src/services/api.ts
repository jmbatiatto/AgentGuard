/**
 * Capa de Integración HTTP / REST para AgentGuard Frontend.
 * 
 * Conecta con la API FastAPI (/api/v1) con resiliencia: si el backend no está
 * disponible o está offline, retorna graceful fallbacks desde mockData sin romper
 * la interfaz de usuario ni los estilos de la aplicación.
 */

import {
  mockAgents,
  mockTools,
  mockPolicies,
  mockApprovals,
  mockAlerts,
} from '../data/mockData';
import type {
  Agent,
  Tool,
  Policy,
  ApprovalRequest,
  SecurityAlert,
  ApprovalStatus,
  PolicyDecision,
} from '../types/domain';

// Constantes Deterministas de la Demo Oficial (Acme Corp)
export const DEMO_IDS = {
  ORG_ACME_ID: '11111111-1111-1111-1111-111111111111',
  USER_ADMIN_ID: '22222222-2222-2222-2222-222222222201',
  USER_APPROVER_ID: '22222222-2222-2222-2222-222222222202',
  USER_OPERATOR_ID: '22222222-2222-2222-2222-222222222203',
  AGENT_SALES_ID: '33333333-3333-3333-3333-333333333301',
  AGENT_FINANCE_ID: '33333333-3333-3333-3333-333333333302',
  AGENT_SUPPORT_ID: '33333333-3333-3333-3333-333333333303',
  TOOL_CRM_ID: '44444444-4444-4444-4444-444444444401',
  TOOL_STRIPE_ID: '44444444-4444-4444-4444-444444444402',
  TOOL_CATALOG_ID: '44444444-4444-4444-4444-444444444403',
  TOOL_DB_ID: '44444444-4444-4444-4444-444444444404',
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GatewayExecutionPayload {
  organization_id: string;
  agent_id: string;
  tool_id: string;
  action_name: string;
  parameters: Record<string, any>;
  resource?: string;
  delegator_user_id?: string;
}

export interface GatewayExecutionResult {
  execution_id: string;
  organization_id: string;
  agent_id: string;
  tool_id: string;
  action_name: string;
  decision: PolicyDecision;
  status: string;
  evaluated_policy_rule_id?: string | null;
  result?: Record<string, any> | null;
  error_message?: string | null;
  approval_id?: string | null;
  timestamp: string;
  evaluation_latency_ms?: number;
  isLiveBackend?: boolean;
}

class AgentGuardApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Healthcheck básico del backend FastAPI
   */
  async checkHealth(): Promise<{ status: string; isOnline: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        return { status: data.status || 'healthy', isOnline: true };
      }
      return { status: 'offline', isOnline: false };
    } catch {
      return { status: 'offline', isOnline: false };
    }
  }

  /**
   * Obtiene la lista de agentes registrados (con fallback a mockAgents)
   */
  async getAgents(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<Agent[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/agents?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            identifier: item.identifier || item.id.substring(0, 8),
            type: item.agent_type || 'AI agent',
            owner: item.owner_team || 'Core Team',
            assignedTools: item.assigned_tools || ['CRM', 'Catalog'],
            status: (item.status === 'ACTIVE' ? 'Active' : item.status === 'SUSPENDED' ? 'Suspended' : 'Inactive') as any,
            lastActivity: 'Reciente',
            initials: item.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
          }));
        }
      }
    } catch {
      // Graceful fallback a mocks
    }
    return mockAgents;
  }

  /**
   * Obtiene la lista de herramientas (con fallback a mockTools)
   */
  async getTools(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<Tool[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tools?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || 'Herramienta de integración externa',
            availableActions: t.actions?.map((a: any) => a.action_name) || ['execute'],
            assignedAgent: 'Todos los agentes autorizados',
            status: (t.status === 'ACTIVE' ? 'Active' : 'Inactive') as any,
            initials: t.name.substring(0, 2).toUpperCase(),
          }));
        }
      }
    } catch {
      // Graceful fallback
    }
    return mockTools;
  }

  /**
   * Obtiene la lista de políticas (con fallback a mockPolicies)
   */
  async getPolicies(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<Policy[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/policies?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            agent: 'Global / Multi-agent',
            action: p.rules?.[0]?.action_name || '*',
            condition: p.rules?.[0]?.condition_expression || 'contextual',
            decision: (p.rules?.[0]?.effect || 'ALLOW') as PolicyDecision,
            status: p.is_active ? 'Active' : 'Inactive',
          }));
        }
      }
    } catch {
      // Graceful fallback
    }
    return mockPolicies;
  }

  /**
   * Obtiene la lista de aprobaciones humanas (con fallback a mockApprovals)
   */
  async getApprovals(
    status?: ApprovalStatus,
    orgId: string = DEMO_IDS.ORG_ACME_ID
  ): Promise<ApprovalRequest[]> {
    try {
      const query = new URLSearchParams({ organization_id: orgId });
      if (status) query.append('status', status);

      const res = await fetch(`${this.baseUrl}/api/v1/approvals?${query.toString()}`, {
        signal: AbortSignal.timeout(2500),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => {
            const exec = item.execution || {};
            const params = exec.request_context || {};
            const amountVal = params.amount != null ? `$${Number(params.amount).toLocaleString('en-US')}.00` : '$1,240.00';
            
            return {
              id: item.id,
              agentName: exec.agent_name || (exec.agent_id === DEMO_IDS.AGENT_FINANCE_ID ? 'Finance Copilot' : 'AI Agent'),
              agentInitials: (exec.agent_name || 'AI').substring(0, 2).toUpperCase(),
              action: exec.action_name || 'refund.create',
              resource: exec.resource || 'payment/pay_live',
              amount: amountVal,
              requestedAt: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recién',
              status: item.status as ApprovalStatus,
              delegatedBy: 'Supervisor Humano',
              riskLevel: 'High',
              justification: params.reason || params.justification || 'Solicitud generada durante ejecución que requiere autorización humana.',
              appliedPolicy: {
                name: 'High-value threshold authorization',
                condition: 'amount >= $500',
              },
            };
          });
        }
      }
    } catch {
      // Fallback si el backend está desconectado
    }
    return mockApprovals;
  }

  /**
   * Resuelve una solicitud de aprobación (Approve / Reject)
   */
  async resolveApproval(
    approvalId: string,
    decision: 'APPROVED' | 'REJECTED',
    reason: string = 'Resolución emitida desde el Dashboard HITL',
    approverUserId: string = DEMO_IDS.USER_APPROVER_ID
  ): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/approvals/${approvalId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          resolution_reason: reason,
          approver_user_id: approverUserId,
        }),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return true; // Éxito optimista en modo offline
    }
  }

  /**
   * Invoca el Gateway PEP/PDP en tiempo real (/api/v1/gateway/execute)
   */
  async executeGateway(payload: GatewayExecutionPayload): Promise<GatewayExecutionResult> {
    const startTime = performance.now();
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/gateway/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });

      const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;
      const data = await res.json();

      return {
        ...data,
        evaluation_latency_ms: latencyMs,
        isLiveBackend: true,
      };
    } catch (err) {
      const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;
      console.warn('[AgentGuard API] Backend offline o inalcanzable. Retornando simulación local.', err);

      // Deterministic fallback matching our PDP rules:
      let decision: PolicyDecision = 'ALLOW';
      let error_message: string | null = null;
      let approval_id: string | null = null;
      let result: any = null;

      if (payload.action_name === 'export_customers' || payload.action_name === 'database.drop') {
        decision = 'DENY';
        error_message = `Operación crítica denegada por política de seguridad AgentGuard (${payload.action_name})`;
      } else if (payload.action_name === 'update_price') {
        decision = 'DENY';
        error_message = 'PolicyViolation: Agent does not possess role:PRICING_MANAGER';
      } else if (payload.action_name === 'refund' || payload.action_name === 'refund.create') {
        const amount = Number(payload.parameters?.amount || 0);
        if (amount >= 500) {
          decision = 'REQUIRE_APPROVAL';
          approval_id = `appr_${Date.now()}`;
        } else {
          decision = 'ALLOW';
          result = { status: 'success', refund_id: `ref_${Date.now()}` };
        }
      } else {
        decision = 'ALLOW';
        result = { status: 'success', quote_id: `q_${Date.now()}` };
      }

      return {
        execution_id: `exec_${Date.now()}`,
        organization_id: payload.organization_id,
        agent_id: payload.agent_id,
        tool_id: payload.tool_id,
        action_name: payload.action_name,
        decision,
        status: decision === 'ALLOW' ? 'EXECUTED' : decision === 'REQUIRE_APPROVAL' ? 'PENDING_APPROVAL' : 'REJECTED',
        error_message,
        approval_id,
        result,
        timestamp: new Date().toISOString(),
        evaluation_latency_ms: latencyMs,
        isLiveBackend: false,
      };
    }
  }

  /**
   * Obtiene alertas de seguridad (con fallback a mockAlerts)
   */
  async getAlerts(): Promise<SecurityAlert[]> {
    return mockAlerts;
  }
}

export const api = new AgentGuardApiClient();
export default api;
