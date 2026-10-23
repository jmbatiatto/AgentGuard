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
  ExecutionTrace,
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
  alert_id?: string | null;
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
   * Da de alta un nuevo Agente de IA y le asocia herramientas opcionales
   */
  async createAgent(payload: {
    name: string;
    purpose?: string;
    status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    tool_ids?: string[];
    orgId?: string;
    ownerUserId?: string;
  }): Promise<Agent> {
    const orgId = payload.orgId || DEMO_IDS.ORG_ACME_ID;
    const ownerUserId = payload.ownerUserId || DEMO_IDS.USER_ADMIN_ID;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          owner_user_id: ownerUserId,
          name: payload.name,
          purpose: payload.purpose || 'Agente de IA gobernado por AgentGuard',
          status: payload.status || 'ACTIVE',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Asignar herramientas si fueron seleccionadas
        if (payload.tool_ids && payload.tool_ids.length > 0) {
          for (const toolId of payload.tool_ids) {
            try {
              await fetch(`${this.baseUrl}/api/v1/agents/${data.id}/tools`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tool_id: toolId,
                  enabled: true,
                  config: {},
                }),
              });
            } catch (err) {
              console.warn(`Error asociando herramienta ${toolId}:`, err);
            }
          }
        }

        return {
          id: data.id,
          name: data.name,
          identifier: data.id.substring(0, 8),
          type: 'AI agent',
          owner: 'Acme Admin',
          assignedTools: payload.tool_ids && payload.tool_ids.length > 0 ? ['Herramientas Asignadas'] : ['Sin herramientas'],
          status: (data.status === 'ACTIVE' ? 'Active' : data.status === 'SUSPENDED' ? 'Suspended' : 'Inactive') as any,
          lastActivity: 'Recién creado ⚡',
          initials: data.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
        };
      }
    } catch (err) {
      console.warn('Error en createAgent hacia backend, usando fallback local:', err);
    }

    const fallbackId = `agt_local_${Date.now()}`;
    return {
      id: fallbackId,
      name: payload.name,
      identifier: fallbackId.substring(0, 8),
      type: 'AI agent',
      owner: 'Acme Admin',
      assignedTools: payload.tool_ids && payload.tool_ids.length > 0 ? ['Herramientas Asignadas'] : ['Sin herramientas'],
      status: (payload.status === 'ACTIVE' ? 'Active' : 'Inactive') as any,
      lastActivity: 'Recién creado ⚡',
      initials: payload.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
    };
  }

  /**
   * Actualiza el estado operativo de un agente (ACTIVE <-> SUSPENDED)
   */
  async updateAgentStatus(agentId: string, status: 'Active' | 'Suspended' | 'Inactive'): Promise<boolean> {
    const backendStatus = status === 'Active' ? 'ACTIVE' : status === 'Suspended' ? 'SUSPENDED' : 'INACTIVE';
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Elimina un agente de IA del tenant
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/agents/${agentId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
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
          return data.map((t: any) => {
            const rawActions: Array<any> = t.actions || [];
            const actionNames = rawActions.map((a: any) => a.action_name);
            const assigned = (t.assigned_agents && t.assigned_agents.length > 0)
              ? t.assigned_agents.join(', ')
              : 'Todos los agentes autorizados';

            return {
              id: t.id,
              name: t.name,
              description: t.description || 'Herramienta de integración externa',
              availableActions: actionNames.length > 0 ? actionNames : ['execute'],
              assignedAgent: assigned,
              status: (t.status === 'PAUSED' ? 'Paused' : t.status === 'INACTIVE' ? 'Inactive' : 'Active') as any,
              initials: t.name.substring(0, 2).toUpperCase(),
              protocol: t.protocol || 'REST',
              endpoint_url: t.endpoint_url || '',
              actionsList: rawActions.map((a: any) => ({
                id: a.id,
                action_name: a.action_name,
                risk_level: a.risk_level,
                description: a.description,
              })),
              created_at: t.created_at,
            };
          });
        }
      }
    } catch {
      // Graceful fallback
    }
    return mockTools;
  }

  /**
   * Crea una nueva acción atómica vinculada a una herramienta en tiempo de ejecución
   */
  async createToolAction(payload: {
    tool_id: string;
    action_name: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tool-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
      const err = await res.json().catch(() => ({ detail: 'Error registrando acción' }));
      return { success: false, error: err.detail || 'Error en registro' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  }

  /**
   * Elimina una herramienta del catálogo
   */
  async deleteTool(toolId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tools/${toolId}`, {
        method: 'DELETE',
      });
      if (res.ok) return { success: true };
      const err = await res.json().catch(() => ({ detail: 'Error eliminando herramienta' }));
      return { success: false, error: err.detail || 'No se pudo eliminar la herramienta' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  }


  /**
   * Da de alta una nueva herramienta externa y sus acciones atómicas
   */
  async createTool(payload: {
    name: string;
    protocol?: string;
    endpoint_url: string;
    description?: string;
    actions?: Array<{ action_name: string; risk_level: string; description?: string }>;
    orgId?: string;
  }): Promise<Tool> {
    const orgId = payload.orgId || DEMO_IDS.ORG_ACME_ID;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          name: payload.name,
          protocol: payload.protocol || 'REST',
          endpoint_url: payload.endpoint_url,
          description: payload.description || 'Herramienta de integración externa',
        }),
      });

      if (res.ok) {
        const toolData = await res.json();

        // Crear acciones atómicas asociadas
        if (payload.actions && payload.actions.length > 0) {
          for (const act of payload.actions) {
            try {
              await fetch(`${this.baseUrl}/api/v1/tool-actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tool_id: toolData.id,
                  action_name: act.action_name,
                  risk_level: act.risk_level || 'LOW',
                  description: act.description || `Acción ${act.action_name}`,
                }),
              });
            } catch (err) {
              console.warn(`Error creando acción ${act.action_name}:`, err);
            }
          }
        }

        return {
          id: toolData.id,
          name: toolData.name,
          description: toolData.description || 'Herramienta externa conectada',
          availableActions: payload.actions?.map(a => a.action_name) || ['execute'],
          assignedAgent: 'Todos los agentes autorizados',
          status: 'Active',
          initials: toolData.name.substring(0, 2).toUpperCase(),
        };
      }
    } catch (err) {
      console.warn('Error en createTool hacia backend, usando fallback local:', err);
    }

    const fallbackId = `tool_local_${Date.now()}`;
    return {
      id: fallbackId,
      name: payload.name,
      description: payload.description || 'Herramienta conectada',
      availableActions: payload.actions?.map(a => a.action_name) || ['execute'],
      assignedAgent: 'Agentes autorizados',
      status: 'Active',
      initials: payload.name.substring(0, 2).toUpperCase(),
    };
  }

  /**
   * Obtiene la lista de políticas (con fallback a mockPolicies)
   */
  /**
   * Obtiene la lista de políticas (con reglas desglosadas o fallback a mockPolicies)
   */
  async getPolicies(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<Policy[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/policies?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const result: Policy[] = [];

          for (const p of data) {
            const rules: any[] = p.rules || [];
            if (rules.length > 0) {
              for (const r of rules) {
                const condStr = r.conditions && Object.keys(r.conditions).length > 0
                  ? JSON.stringify(r.conditions)
                  : 'Sin restricciones';

                result.push({
                  id: r.id,
                  policyId: p.id,
                  name: p.name,
                  description: p.description || 'Política de gobernanza AgentGuard',
                  agent: r.agent_name || 'Global / Multi-agent',
                  action: r.action_name || '*',
                  condition: condStr,
                  decision: (r.effect || 'ALLOW') as PolicyDecision,
                  status: p.is_active ? 'Active' : 'Inactive',
                  priority: r.priority || p.priority || 100,
                  created_at: r.created_at || p.created_at,
                  rules: [r],
                  rawConditions: r.conditions || {},
                });
              }
            } else {
              result.push({
                id: p.id,
                policyId: p.id,
                name: p.name,
                description: p.description || 'Política de gobernanza AgentGuard',
                agent: 'Global / Multi-agent',
                action: 'Todas (*)',
                condition: 'Base Policy',
                decision: 'ALLOW',
                status: p.is_active ? 'Active' : 'Inactive',
                priority: p.priority || 100,
                created_at: p.created_at,
                rules: [],
                rawConditions: {},
              });
            }
          }

          if (result.length > 0) return result;
        }
      }
    } catch {
      // Graceful fallback
    }
    return mockPolicies;
  }

  /**
   * Actualiza el estado activo/inactivo de una política
   */
  async updatePolicyStatus(policyId: string, isActive: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Elimina una política y sus reglas asociadas
   */
  async deletePolicy(policyId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/policies/${policyId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene todas las acciones atómicas del tenant para cálculo de cobertura
   */
  async getToolActions(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/tool-actions`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // ignore
    }
    return [];
  }


  /**
   * Da de alta una nueva Política y su regla determinista
   */
  async createPolicy(payload: {
    name: string;
    description?: string;
    priority?: number;
    tool_action_id?: string;
    effect?: PolicyDecision;
    conditions?: Record<string, any>;
    orgId?: string;
  }): Promise<Policy> {
    const orgId = payload.orgId || DEMO_IDS.ORG_ACME_ID;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          name: payload.name,
          description: payload.description || 'Política de gobernanza AgentGuard',
          priority: payload.priority || 50,
          is_active: true,
        }),
      });

      if (res.ok) {
        const polData = await res.json();

        if (payload.tool_action_id) {
          try {
            await fetch(`${this.baseUrl}/api/v1/policy-rules`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                policy_id: polData.id,
                tool_action_id: payload.tool_action_id,
                effect: payload.effect || 'ALLOW',
                priority: payload.priority || 50,
                conditions: payload.conditions || {},
                is_active: true,
              }),
            });
          } catch (err) {
            console.warn('Error creando policy rule:', err);
          }
        }

        return {
          id: polData.id,
          name: polData.name,
          agent: 'Global / Multi-agent',
          action: 'Configured Action',
          condition: payload.conditions ? JSON.stringify(payload.conditions) : 'contextual',
          decision: payload.effect || 'ALLOW',
          status: 'Active',
        };
      }
    } catch (err) {
      console.warn('Error en createPolicy hacia backend, usando fallback:', err);
    }

    const fallbackId = `pol_local_${Date.now()}`;
    return {
      id: fallbackId,
      name: payload.name,
      agent: 'Global / Multi-agent',
      action: 'Custom Action',
      condition: payload.conditions ? JSON.stringify(payload.conditions) : 'contextual',
      decision: payload.effect || 'ALLOW',
      status: 'Active',
    };
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
      let alert_id: string | null = null;
      let result: any = null;

      if (payload.action_name === 'export_customers' || payload.action_name === 'database.drop') {
        decision = 'DENY';
        error_message = `Operación crítica denegada por política de seguridad AgentGuard (${payload.action_name})`;
        alert_id = `alert_${Date.now()}`;
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
        alert_id,
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

  /**
   * Obtiene la lista forense de ejecuciones (/api/v1/executions)
   */
  async getExecutions(
    orgId: string = DEMO_IDS.ORG_ACME_ID,
    decision?: PolicyDecision
  ): Promise<ExecutionTrace[]> {
    try {
      const query = new URLSearchParams({ organization_id: orgId });
      if (decision) query.append('decision', decision);

      const res = await fetch(`${this.baseUrl}/api/v1/executions?${query.toString()}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            organizationId: item.organization_id,
            agentId: item.agent_id,
            agentName: item.agent_name || 'AI Agent',
            toolId: item.tool_id,
            toolName: item.tool_name || 'External Tool',
            actionName: item.action_name || 'execute',
            resource: item.resource || 'global/resource',
            requestContext: item.request_context || {},
            decision: item.decision as PolicyDecision,
            status: item.status || 'EXECUTED',
            evaluatedPolicyRuleId: item.evaluated_policy_rule_id,
            timestamp: item.timestamp,
            latencyMs: item.latency_ms || 22.0,
            approvalStatus: item.approval_status || null,
            approvalResolvedAt: item.approval_resolved_at || null,
            resolutionReason: item.resolution_reason || null,
          }));
        }
      }
    } catch (err) {
      console.warn('[AgentGuard API] No se pudo obtener ejecuciones del backend:', err);
    }

    // Retorna arreglo vacío o datos iniciales si no hay backend
    return [];
  }

  /**
   * Obtiene alertas de seguridad desde /api/v1/alerts (con fallback a mockAlerts)
   */
  async getAlerts(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<SecurityAlert[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/alerts?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => {
            const rawSev = (item.severity || '').toLowerCase();
            let sev: 'critical' | 'warning' | 'info' = 'warning';
            if (rawSev === 'critical' || rawSev === 'high') {
              sev = 'critical';
            } else if (rawSev === 'low') {
              sev = 'info';
            }

            const timeStr = item.created_at
              ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Reciente';

            return {
              id: item.id,
              title: item.title,
              description: item.description || 'Intento de violación de política detectado por el Gateway PEP',
              timeAgo: timeStr,
              severity: sev,
              status: item.status,
              createdAt: item.created_at,
              executionId: item.execution_id,
            };
          });
        }
      }
    } catch (err) {
      console.warn('[AgentGuard API] No se pudo obtener alertas del backend:', err);
    }
    return mockAlerts;
  }

  /**
   * Actualiza el estado de una alerta de seguridad (PATCH /api/v1/alerts/{id}/status)
   */
  async updateAlertStatus(
    alertId: string,
    status: 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED',
    userId: string = DEMO_IDS.USER_ADMIN_ID
  ): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolved_by_user_id: userId }),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new AgentGuardApiClient();
export default api;
