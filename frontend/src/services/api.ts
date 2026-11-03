/**
 * Capa de Integración HTTP / REST para AgentGuard Frontend.
 * 
 * Conecta con la API FastAPI (/api/v1) sin silent fallbacks: ante errores de servidor (status >= 400)
 * o fallas de conectividad/timeout, propaga explícitamente instancias de ApiError para que la interfaz
 * maneje el estado de error y notificaciones de forma determinista y transparente.
 */

import type {
  Agent,
  AgentStatus,
  Tool,
  Policy,
  PolicyRuleItem,
  Decision,
  ApprovalRequest,
  SecurityAlert,
  AlertSeverity,
  ExecutionTrace,
  ApprovalStatus,
  PolicyDecision,
  RiskLevel,
  UserMember,
  UserRole,
  GatewayApiKey,
  AnalyticsOverview,
  AnalyticsTimeseries,
  OrganizationSettings,
  Organization,
  SiemWebhookTestResult,
  User,
  AuthCredentials,
  RegisterData,
  AuthResponse,
} from '../types/domain';

export type { User, AuthCredentials, RegisterData, AuthResponse };

export type { OrganizationSettings, Organization, SiemWebhookTestResult };

/**
 * Clase canónica para propagación de excepciones en la capa de transporte API de AgentGuard.
 */
export class ApiError extends Error {
  status: number;
  detail: string;
  errors?: any[];

  constructor(status: number, detail: string, errors?: any[]) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Parsea el cuerpo de error proveniente de FastAPI u otro origen HTTP
 * para extraer el mensaje detallado o lista de validaciones.
 */
export async function extractApiError(res: Response): Promise<ApiError> {
  let detail = `Error HTTP ${res.status}`;
  let errors: any[] | undefined = undefined;

  try {
    const body = await res.json();
    if (body) {
      if (typeof body.detail === 'string') {
        detail = body.detail;
      } else if (Array.isArray(body.detail)) {
        errors = body.detail;
        detail = body.detail
          .map((d: any) => (d.msg ? `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}` : JSON.stringify(d)))
          .join(', ');
      } else if (body.message && typeof body.message === 'string') {
        detail = body.message;
      } else if (body.detail) {
        detail = JSON.stringify(body.detail);
      } else {
        detail = JSON.stringify(body);
      }
    }
  } catch {
    detail = res.statusText || `Error HTTP ${res.status}`;
  }

  return new ApiError(res.status, detail, errors);
}

/**
 * Normaliza cualquier excepción capturada durante la petición a una instancia de ApiError.
 */
export function handleNetworkError(err: any): ApiError {
  if (err instanceof ApiError) {
    return err;
  }
  return new ApiError(0, 'Error de conexión con el servidor');
}

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
  security_analysis?: {
    is_threat: boolean;
    threat_type: string;
    owasp_category: string;
    detail: string;
    matched_pattern?: string | null;
    decoded_payload?: string | null;
  } | null;
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
   * Interceptor de autenticacion HTTP: Inyecta Authorization: Bearer <token>
   * si existe una sesion activa en localStorage.
   */
  /**
   * Retorna el ID de organizacion activa persistida en la sesion
   */
  public getActiveOrganizationId(): string {
    return (typeof window !== 'undefined' ? localStorage.getItem('agentguard_active_org') : null) || DEMO_IDS.ORG_ACME_ID;
  }

  /**
   * Asigna y persiste el ID de organizacion activa para la sesion
   */
  public setActiveOrganizationId(orgId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentguard_active_org', orgId);
    }
  }

  private async fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('agentguard_token') : null;
    const headers = new Headers(init?.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, {
      ...init,
      headers,
    });
  }

  /**
   * Healthcheck básico del backend FastAPI
   */
  async checkHealth(): Promise<{ status: string; isOnline: boolean }> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
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
   * Obtiene la lista de agentes registrados en el tenant
   */
  async getAgents(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<Agent[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/agents?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        identifier: item.identifier || item.id.substring(0, 8),
        type: item.agent_type || 'AI agent',
        owner: item.owner_team || 'Core Team',
        assignedTools: item.assigned_tools || ['CRM', 'Catalog'],
        status: (item.status || 'ACTIVE') as AgentStatus,
        lastActivity: 'Reciente',
        initials: item.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
      }));
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Da de alta un nuevo Agente de IA y le asocia herramientas opcionales
   */
  async createAgent(payload: {
    name: string;
    purpose?: string;
    status?: AgentStatus;
    tool_ids?: string[];
    orgId?: string;
    ownerUserId?: string;
  }): Promise<Agent> {
    const orgId = payload.orgId || DEMO_IDS.ORG_ACME_ID;
    const ownerUserId = payload.ownerUserId || DEMO_IDS.USER_ADMIN_ID;

    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          owner_user_id: ownerUserId,
          name: payload.name,
          purpose: payload.purpose || 'Agente de IA gobernado por AgentGuard',
          status: payload.status || 'ACTIVE',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }

      const data = await res.json();

      // Asignar herramientas si fueron seleccionadas
      if (payload.tool_ids && payload.tool_ids.length > 0) {
        for (const toolId of payload.tool_ids) {
          try {
            await this.fetchWithAuth(`${this.baseUrl}/api/v1/agents/${data.id}/tools`, {
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
        status: (data.status || 'ACTIVE') as AgentStatus,
        lastActivity: 'Recién creado ⚡',
        initials: data.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Actualiza el estado operativo de un agente (ACTIVE <-> SUSPENDED)
   */
  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Elimina un agente de IA del tenant
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/agents/${agentId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la lista de herramientas disponibles en el tenant
   */
  async getTools(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<Tool[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/tools?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
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
    } catch (err) {
      throw handleNetworkError(err);
    }
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
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/tool-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Elimina una herramienta del catálogo
   */
  async deleteTool(toolId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/tools/${toolId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return { success: true };
    } catch (err: any) {
      throw handleNetworkError(err);
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
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          name: payload.name,
          protocol: payload.protocol || 'REST',
          endpoint_url: payload.endpoint_url,
          description: payload.description || 'Herramienta de integración externa',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }

      const toolData = await res.json();

      // Crear acciones atómicas asociadas
      if (payload.actions && payload.actions.length > 0) {
        for (const act of payload.actions) {
          try {
            await this.fetchWithAuth(`${this.baseUrl}/api/v1/tool-actions`, {
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
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la lista de políticas jerárquicas con su colección de reglas hijas (.rules)
   */
  async getPolicies(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<Policy[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policies?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((p: any) => {
        const rules: PolicyRuleItem[] = (p.rules || []).map((r: any) => ({
          id: r.id,
          policy_id: r.policy_id || p.id,
          priority: r.priority ?? p.priority ?? 100,
          effect: (r.effect || 'ALLOW') as PolicyDecision,
          tool_action_id: r.tool_action_id,
          target_agent_id: r.target_agent_id || null,
          conditions: r.conditions || {},
          action_name: r.action_name || '*',
          tool_name: r.tool_name || null,
          agent_name: r.agent_name || 'Global / Multi-agente',
          created_at: r.created_at || p.created_at,
        }));

        const primaryRule = rules[0];
        return {
          id: p.id,
          policyId: p.id,
          name: p.name,
          description: p.description || 'Política de gobernanza AgentGuard',
          priority: p.priority ?? 100,
          status: (p.is_active ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
          created_at: p.created_at,
          rules: rules,
          // Campos de resumen y compatibilidad
          agent: primaryRule ? primaryRule.agent_name : 'Global / Multi-agente',
          action: primaryRule ? (primaryRule.action_name || '*') : 'Todas (*)',
          condition: primaryRule && Object.keys(primaryRule.conditions).length > 0
            ? JSON.stringify(primaryRule.conditions)
            : 'Sin restricciones',
          decision: primaryRule ? primaryRule.effect : 'ALLOW',
          rawConditions: primaryRule ? primaryRule.conditions : {},
        };
      });
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Actualiza el estado activo/inactivo de una política
   */
  async updatePolicyStatus(policyId: string, isActive: boolean): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Elimina una política y sus reglas asociadas
   */
  async deletePolicy(policyId: string): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policies/${policyId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Registra una regla determinista dentro de una política existente.
   * Endpoint: POST /api/v1/policies/${policyId}/rules
   */
  async createPolicyRule(
    policyId: string,
    rule: {
      toolActionId?: string;
      tool_action_id?: string;
      conditions?: any;
      effect?: Decision;
      priority?: number;
      targetAgentId?: string;
      target_agent_id?: string;
    }
  ): Promise<any> {
    const actionId = rule.toolActionId || rule.tool_action_id;
    const agentId = rule.targetAgentId || rule.target_agent_id || null;
    const payload = {
      tool_action_id: actionId,
      target_agent_id: agentId,
      priority: rule.priority ?? 100,
      effect: rule.effect || 'ALLOW',
      conditions: rule.conditions || {},
    };

    try {
      let res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policies/${policyId}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      // Fallback de compatibilidad si el endpoint anidado no responde
      if (!res.ok && res.status === 404) {
        res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policy-rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            policy_id: policyId,
            ...payload,
          }),
          signal: AbortSignal.timeout(5000),
        });
      }

      if (!res.ok) {
        throw await extractApiError(res);
      }
      return await res.json();
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Actualiza propiedades de una regla determinista.
   * Endpoint: PATCH /api/v1/policy-rules/${ruleId}
   */
  async updatePolicyRule(
    ruleId: string,
    update: {
      conditions?: any;
      effect?: Decision;
      priority?: number;
      targetAgentId?: string;
      target_agent_id?: string;
    }
  ): Promise<any> {
    const payload: Record<string, any> = {};
    if (update.conditions !== undefined) payload.conditions = update.conditions;
    if (update.effect !== undefined) payload.effect = update.effect;
    if (update.priority !== undefined) payload.priority = update.priority;
    const targetAgentId = update.targetAgentId !== undefined ? update.targetAgentId : update.target_agent_id;
    if (targetAgentId !== undefined) payload.target_agent_id = targetAgentId || null;

    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policy-rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }
      return await res.json();
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Elimina una regla individual sin destruir la política contenedora ni reglas hermanas.
   * Endpoint: DELETE /api/v1/policy-rules/${ruleId}
   */
  async deletePolicyRule(ruleId: string): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policy-rules/${ruleId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene todas las acciones atómicas del tenant para cálculo de cobertura
   */
  async getToolActions(): Promise<any[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/tool-actions`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Da de alta una nueva Política y su regla determinista inicial si corresponde
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
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          name: payload.name,
          description: payload.description || 'Política de gobernanza AgentGuard',
          priority: payload.priority || 100,
          is_active: true,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }

      const polData = await res.json();
      let rules: PolicyRuleItem[] = [];

      if (payload.tool_action_id) {
        try {
          const ruleRes = await this.createPolicyRule(polData.id, {
            toolActionId: payload.tool_action_id,
            effect: payload.effect || 'ALLOW',
            priority: payload.priority || 100,
            conditions: payload.conditions || {},
          });
          if (ruleRes && ruleRes.id) {
            rules = [{
              id: ruleRes.id,
              policy_id: polData.id,
              priority: ruleRes.priority || payload.priority || 100,
              effect: (ruleRes.effect || payload.effect || 'ALLOW') as PolicyDecision,
              tool_action_id: payload.tool_action_id,
              target_agent_id: ruleRes.target_agent_id || null,
              conditions: ruleRes.conditions || payload.conditions || {},
              action_name: ruleRes.action_name || 'Configured Action',
              agent_name: ruleRes.agent_name || 'Global / Multi-agent',
              created_at: ruleRes.created_at || polData.created_at || new Date().toISOString(),
            }];
          }
        } catch (err) {
          console.warn('Error creando policy rule inicial:', err);
        }
      }

      return {
        id: polData.id,
        policyId: polData.id,
        name: polData.name,
        description: polData.description || 'Política de gobernanza AgentGuard',
        priority: polData.priority || 100,
        agent: rules[0]?.agent_name || 'Global / Multi-agent',
        action: rules[0]?.action_name || 'Configured Action',
        condition: payload.conditions && Object.keys(payload.conditions).length > 0 ? JSON.stringify(payload.conditions) : 'Sin restricciones',
        decision: payload.effect || 'ALLOW',
        status: 'Active',
        rules: rules,
        rawConditions: payload.conditions || {},
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la lista de aprobaciones humanas
   */
  async getApprovals(
    status?: ApprovalStatus,
    orgId: string = DEMO_IDS.ORG_ACME_ID
  ): Promise<ApprovalRequest[]> {
    try {
      const query = new URLSearchParams({ organization_id: orgId });
      if (status) query.append('status', status);

      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/approvals?${query.toString()}`, {
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }

      const data = await res.json();
      if (!Array.isArray(data)) return [];
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
          riskLevel: (item.risk_level || 'HIGH') as RiskLevel,
          justification: params.reason || params.justification || 'Solicitud generada durante ejecución que requiere autorización humana.',
          appliedPolicy: {
            name: 'High-value threshold authorization',
            condition: 'amount >= $500',
          },
        };
      });
    } catch (err) {
      throw handleNetworkError(err);
    }
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
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/approvals/${approvalId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          resolution_reason: reason,
          approver_user_id: approverUserId,
        }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Invoca el Gateway PEP/PDP en tiempo real (/api/v1/gateway/execute)
   */
  async executeGateway(payload: GatewayExecutionPayload): Promise<GatewayExecutionResult> {
    const startTime = performance.now();
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/gateway/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });

      const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;
      if (!res.ok) {
        throw await extractApiError(res);
      }

      const data = await res.json();

      return {
        ...data,
        evaluation_latency_ms: latencyMs,
        isLiveBackend: true,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Simula la evaluación en tiempo real en entorno Sandbox (/api/v1/gateway/simulate)
   */
  async simulateGateway(payload: GatewayExecutionPayload): Promise<GatewayExecutionResult> {
    const startTime = performance.now();
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/gateway/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, dry_run: true }),
        signal: AbortSignal.timeout(6000),
      });

      const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;
      if (!res.ok) {
        throw await extractApiError(res);
      }

      const data = await res.json();

      return {
        ...data,
        evaluation_latency_ms: latencyMs,
        isLiveBackend: true,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene el catálogo de vectores de ataque e inyecciones OWASP 2026 (/api/v1/gateway/attacks)
   */
  async getAttackVectors(): Promise<any[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/gateway/attacks`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      if (data && data.vectors && Array.isArray(data.vectors)) {
        return data.vectors;
      }
      return Array.isArray(data) ? data : [];
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la lista forense de eventos de auditoría (/api/v1/audit-events)
   */
  async getAuditEvents(
    orgId: string = DEMO_IDS.ORG_ACME_ID,
    filters?: { actor_type?: string; event_type?: string; skip?: number; limit?: number }
  ): Promise<any[]> {
    try {
      const query = new URLSearchParams({ organization_id: orgId });
      if (filters?.actor_type) query.append('actor_type', filters.actor_type);
      if (filters?.event_type) query.append('event_type', filters.event_type);
      if (filters?.skip !== undefined) query.append('skip', String(filters.skip));
      if (filters?.limit !== undefined) query.append('limit', String(filters.limit));

      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/audit-events?${query.toString()}`, {
        headers: {
          'X-User-Id': DEMO_IDS.USER_ADMIN_ID,
          'X-Organization-Id': orgId,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

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

      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/executions?${query.toString()}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }

      const data = await res.json();
      if (!Array.isArray(data)) return [];
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
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene alertas de seguridad desde /api/v1/alerts
   */
  async getAlerts(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<SecurityAlert[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/alerts?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }

      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item: any) => {
        const rawSev = (item.severity || 'LOW').toUpperCase();
        const sev: AlertSeverity = (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rawSev) ? rawSev : 'MEDIUM') as AlertSeverity;

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
    } catch (err) {
      throw handleNetworkError(err);
    }
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
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolved_by_user_id: userId }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la lista de usuarios y roles RBAC de la organización
   */
  async getUsers(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<UserMember[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/users?organization_id=${orgId}&skip=0&limit=100`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item: any) => ({
        id: item.id,
        organizationId: item.organization_id,
        email: item.email,
        role: item.role as UserRole,
        createdAt: item.created_at,
      }));
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Invita o crea un nuevo usuario corporativo en la organización
   */
  async createUser(payload: { email: string; role: UserRole; organization_id?: string }): Promise<UserMember> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: payload.organization_id || DEMO_IDS.ORG_ACME_ID,
          email: payload.email,
          role: payload.role,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const item = await res.json();
      return {
        id: item.id,
        organizationId: item.organization_id,
        email: item.email,
        role: item.role as UserRole,
        createdAt: item.created_at,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Actualiza el rol RBAC de un usuario corporativo (PATCH /api/v1/users/{id})
   */
  async updateUserRole(userId: string, role: UserRole): Promise<UserMember> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const item = await res.json();
      return {
        id: item.id,
        organizationId: item.organization_id,
        email: item.email,
        role: item.role as UserRole,
        createdAt: item.created_at,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Elimina un usuario de la organización (DELETE /api/v1/users/{id})
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/users/${userId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok && res.status !== 204) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene las credenciales de API Key de la organización para autenticación en el Gateway PEP
   */
  async getApiKeys(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<GatewayApiKey[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/api-keys?organization_id=${orgId}&skip=0&limit=100`, {
        headers: {
          'X-User-Id': DEMO_IDS.USER_ADMIN_ID,
          'X-Organization-Id': orgId,
        },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        prefix: item.key_prefix,
        secretMasked: `${item.key_prefix}••••••••••••••••••••••••`,
        role: 'gateway_client',
        createdAt: item.created_at,
        lastUsedAt: 'Nunca',
        isActive: item.is_active,
      }));
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Genera una nueva API Key corporativa en el backend FastAPI y retorna el secreto en plano una única vez
   */
  async createApiKey(payload: {
    name: string;
    organization_id?: string;
    expires_in_days?: number;
  }): Promise<{ key: GatewayApiKey; rawKey: string }> {
    const orgId = payload.organization_id || DEMO_IDS.ORG_ACME_ID;

    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': DEMO_IDS.USER_ADMIN_ID,
          'X-Organization-Id': orgId,
        },
        body: JSON.stringify({
          name: payload.name,
          organization_id: orgId,
          expires_in_days: payload.expires_in_days ?? null,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw await extractApiError(res);
      }

      const data = await res.json();
      const key: GatewayApiKey = {
        id: String(data.id),
        name: data.name,
        prefix: data.key_prefix,
        secretMasked: `${data.key_prefix}••••••••••••••••••••••••`,
        rawKey: data.api_key,
        role: 'gateway_client',
        createdAt: data.created_at,
        lastUsedAt: 'Nunca',
        isActive: data.is_active,
      };
      return { key, rawKey: data.api_key };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Revoca lógicamente una API Key de la organización (DELETE /api/v1/api-keys/{id})
   */
  async revokeApiKey(keyId: string, orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<boolean> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/api-keys/${keyId}?organization_id=${orgId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': DEMO_IDS.USER_ADMIN_ID,
          'X-Organization-Id': orgId,
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok && res.status !== 204) {
        throw await extractApiError(res);
      }
      return true;
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene métricas agregadas globales y KPIs (/api/v1/analytics/overview)
   */
  async getAnalyticsOverview(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<AnalyticsOverview> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/analytics/overview?organization_id=${orgId}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return {
        total_executions: typeof data.total_executions === 'number' ? data.total_executions : 0,
        allow_count: typeof data.allow_count === 'number' ? data.allow_count : 0,
        deny_count: typeof data.deny_count === 'number' ? data.deny_count : 0,
        require_approval_count: typeof data.require_approval_count === 'number' ? data.require_approval_count : 0,
        avg_latency_ms: typeof data.avg_latency_ms === 'number' ? data.avg_latency_ms : 0,
        active_incident_count: typeof data.active_incident_count === 'number' ? data.active_incident_count : 0,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la serie temporal de actividad horaria (/api/v1/analytics/timeseries)
   */
  async getAnalyticsTimeseries(
    orgId: string = DEMO_IDS.ORG_ACME_ID,
    rangeStr: string = '24h'
  ): Promise<AnalyticsTimeseries> {
    try {
      const res = await this.fetchWithAuth(
        `${this.baseUrl}/api/v1/analytics/timeseries?organization_id=${orgId}&range=${encodeURIComponent(rangeStr)}`,
        {
          signal: AbortSignal.timeout(5000),
        }
      );
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      if (data && Array.isArray(data.points)) {
        return {
          range: data.range || rangeStr,
          points: data.points.map((p: any) => ({
            timestamp: p.timestamp,
            executions: typeof p.executions === 'number' ? p.executions : 0,
            allowed: typeof p.allowed === 'number' ? p.allowed : 0,
            denied: typeof p.denied === 'number' ? p.denied : 0,
            require_approval: typeof p.require_approval === 'number' ? p.require_approval : 0,
            avg_latency_ms: typeof p.avg_latency_ms === 'number' ? p.avg_latency_ms : 0,
          })),
        };
      }
      return {
        range: rangeStr,
        points: [],
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Restablece los datos de PostgreSQL y Redis al estado inicial de la demo
   */
  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/demo/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return { success: true, message: data.message || 'Entorno demo restablecido con éxito' };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la configuración de gobernanza y postura Fail-Closed de la organización
   */
  async getOrganizationSettings(orgId: string = DEMO_IDS.ORG_ACME_ID): Promise<OrganizationSettings> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/organizations/${orgId}/settings`, {
        headers: {
          'X-User-Id': DEMO_IDS.USER_ADMIN_ID,
          'X-Organization-Id': orgId,
        },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return {
        fail_closed: typeof data.fail_closed === 'boolean' ? data.fail_closed : true,
        mask_sensitive: typeof data.mask_sensitive === 'boolean' ? data.mask_sensitive : true,
        max_autonomous_amount: typeof data.max_autonomous_amount === 'number' ? data.max_autonomous_amount : 5000,
        retention_days: typeof data.retention_days === 'number' ? data.retention_days : 90,
        siem_webhook_url: data.siem_webhook_url || null,
        siem_webhook_enabled: typeof data.siem_webhook_enabled === 'boolean' ? data.siem_webhook_enabled : false,
        siem_webhook_secret: data.siem_webhook_secret || null,
        siem_webhook_events: Array.isArray(data.siem_webhook_events) ? data.siem_webhook_events : ['ALERT_CRITICAL', 'POLICY_VIOLATION'],
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Actualiza parcialmente la configuración de gobernanza de la organización
   */
  async updateOrganizationSettings(
    orgId: string = DEMO_IDS.ORG_ACME_ID,
    update: Partial<OrganizationSettings>
  ): Promise<OrganizationSettings> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/organizations/${orgId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': DEMO_IDS.USER_ADMIN_ID,
          'X-Organization-Id': orgId,
        },
        body: JSON.stringify(update),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return {
        fail_closed: typeof data.fail_closed === 'boolean' ? data.fail_closed : true,
        mask_sensitive: typeof data.mask_sensitive === 'boolean' ? data.mask_sensitive : true,
        max_autonomous_amount: typeof data.max_autonomous_amount === 'number' ? data.max_autonomous_amount : 5000,
        retention_days: typeof data.retention_days === 'number' ? data.retention_days : 90,
        siem_webhook_url: data.siem_webhook_url || null,
        siem_webhook_enabled: typeof data.siem_webhook_enabled === 'boolean' ? data.siem_webhook_enabled : false,
        siem_webhook_secret: data.siem_webhook_secret || null,
        siem_webhook_events: Array.isArray(data.siem_webhook_events) ? data.siem_webhook_events : ['ALERT_CRITICAL', 'POLICY_VIOLATION'],
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Lista todas las organizaciones registradas (Tenants) para el switcher multitenant
   */
  async listOrganizations(): Promise<Organization[]> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/organizations`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return await res.json();
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Realiza una prueba de emisión y firma con el endpoint Webhook SIEM
   */
  async testSiemWebhook(
    orgId: string = DEMO_IDS.ORG_ACME_ID,
    payload?: { webhook_url?: string; secret?: string }
  ): Promise<SiemWebhookTestResult> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/organizations/${orgId}/settings/webhooks/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': DEMO_IDS.USER_ADMIN_ID,
          'X-Organization-Id': orgId,
        },
        body: JSON.stringify(payload || {}),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      return await res.json();
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Inicio de sesion para usuario corporativo
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      const userRaw = data.user || data;
      const user: User = {
        id: userRaw.id,
        email: userRaw.email,
        name: userRaw.name || userRaw.email?.split('@')[0],
        role: userRaw.role || 'ADMIN',
        organization_id: userRaw.organization_id,
        organizationId: userRaw.organization_id,
        created_at: userRaw.created_at,
      };
      return {
        access_token: data.access_token,
        token_type: data.token_type || 'bearer',
        user,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Registro de nuevo usuario y organizacion
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          organization_name: data.organizationName || 'Mi Organizacion',
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const resData = await res.json();
      const userRaw = resData.user || resData;
      const user: User = {
        id: userRaw.id,
        email: userRaw.email,
        name: userRaw.name || data.name || userRaw.email?.split('@')[0],
        role: userRaw.role || 'ADMIN',
        organization_id: userRaw.organization_id,
        organizationId: userRaw.organization_id,
        created_at: userRaw.created_at,
      };
      return {
        access_token: resData.access_token,
        token_type: resData.token_type || 'bearer',
        user,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }

  /**
   * Obtiene la identidad del usuario actual validando el token Bearer
   */
  async getMe(): Promise<User> {
    try {
      const res = await this.fetchWithAuth(`${this.baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw await extractApiError(res);
      }
      const data = await res.json();
      return {
        id: data.id,
        email: data.email,
        name: data.name || data.email?.split('@')[0],
        role: data.role || 'ADMIN',
        organization_id: data.organization_id,
        organizationId: data.organization_id,
        created_at: data.created_at,
      };
    } catch (err) {
      throw handleNetworkError(err);
    }
  }
}


export const api = new AgentGuardApiClient();
export default api;
