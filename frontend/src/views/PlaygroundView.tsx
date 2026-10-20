import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  ShieldOff, 
  Flame, 
  Database,
  Zap,
  Power
} from 'lucide-react';
import { Header } from '../components/Header';
import type { NavView } from '../types/domain';

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

  const runScenario1 = () => {
    if (isAgentGuardActive) {
      setActiveResult({
        scenario: 1,
        title: 'Escenario 1: Operación Legítima Autorizada (ALLOW)',
        decision: 'ALLOW',
        statusText: '200 OK — Invocación despachada a la API de CRM',
        details: 'El agente solicitó crear una cotización por $2,500. El motor PDP validó que la política permite cotizaciones autónomas hasta $10,000.',
        isProtected: true,
        payload: {
          agent_id: 'agt_sales_01',
          action: 'create_quote',
          context: { amount: 2500, customer_id: 'cus_991' },
          decision: 'ALLOW',
          pep_interceptor: 'ACTIVE',
          pdp_rule_matched: 'Allow standard sales quotes <= $10,000',
          evaluation_latency_ms: 18.4,
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

  const runScenario2 = () => {
    if (isAgentGuardActive) {
      setActiveResult({
        scenario: 2,
        title: 'Escenario 2: Abuso de Privilegio Bloqueado (DENY)',
        decision: 'DENY',
        statusText: '403 Forbidden — Acción denegada por política de catálogo',
        details: 'El agente intentó alterar el precio unitario a $10. La política "Protect product pricing" prohíbe modificaciones no autorizadas a agentes sin rol de administrador.',
        isProtected: true,
        payload: {
          agent_id: 'agt_sales_01',
          action: 'update_price',
          context: { new_price: 10, product_id: 'prod_44' },
          decision: 'DENY',
          reason: 'PolicyViolation: Agent does not possess role:PRICING_MANAGER',
          pep_action: 'REQUEST_BLOCKED',
          evaluation_latency_ms: 12.1,
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

  const runScenario3 = () => {
    if (isAgentGuardActive) {
      if (onTriggerApproval) {
        onTriggerApproval();
      }
      setActiveResult({
        scenario: 3,
        title: 'Escenario 3: Operación Sensible en Espera (HITL)',
        decision: 'REQUIRE_APPROVAL',
        statusText: '202 Accepted — Ejecución suspendida esperando autorización humana',
        details: 'El agente solicitó un reembolso por $4,500. La regla exige intervención humana (Human-in-the-Loop) para montos >= $500. La solicitud fue enviada a la bandeja de Approvals.',
        isProtected: true,
        payload: {
          agent_id: 'agt_finance_02',
          action: 'refund.create',
          context: { amount: 4500, gateway: 'stripe' },
          decision: 'REQUIRE_APPROVAL',
          approval_id: 'appr_demo_live',
          assigned_approver_role: 'APPROVER',
          timeout_seconds: 900,
          evaluation_latency_ms: 22.8,
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

  const runScenario4 = () => {
    if (isAgentGuardActive) {
      setActiveResult({
        scenario: 4,
        title: 'Escenario 4: Prompt Injection y Exfiltración Detectada',
        decision: 'DENY',
        statusText: '403 Forbidden + ALERTA ROJA — Intento de violación de seguridad',
        details: 'El agente intentó exportar la base de clientes hacia un servidor externo desconocido (attacker.io). El PDP bloqueó el acceso y disparó un evento de alerta crítica en el SIEM.',
        isProtected: true,
        payload: {
          agent_id: 'agt_data_05',
          action: 'export_customers',
          context: { destination: 'https://attacker.io/leak', records: 2841 },
          decision: 'DENY',
          alert_raised: true,
          severity: 'CRITICAL',
          pep_action: 'TRAFFIC_BLOCKED',
          owasp_category: 'LLM06: Sensitive Information Disclosure',
          evaluation_latency_ms: 14.7,
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

  const runScenario5 = () => {
    if (isAgentGuardActive) {
      setActiveResult({
        scenario: 5,
        title: 'Escenario 5: Eliminación de Base de Datos Bloqueada (DENY)',
        decision: 'DENY',
        statusText: '403 Forbidden — Operación destructiva bloqueada por AgentGuard',
        details: 'El agente intentó ejecutar DROP DATABASE production. El PEP interceptó la llamada y el motor PDP aplicó la regla de tolerancia cero ante destrucción de datos (riesgo CRITICAL).',
        isProtected: true,
        payload: {
          agent_id: 'agt_devops_03',
          action: 'database.drop',
          resource: 'postgres://prod-db:5432/main',
          decision: 'DENY',
          reason: 'CriticalRisk: Unsanctioned destructive operation on production datastore',
          severity: 'CRITICAL',
          pep_action: 'BLOCKED_IMMEDIATELY',
          evaluation_latency_ms: 9.8,
          audit_trace_stored: true,
        },
      });
    } else {
      setActiveResult({
        scenario: 5,
        title: 'Escenario 5: 💥 CATASTRÓFICO: Base de Datos de Producción Eliminada',
        decision: 'CATASTROPHIC_FAILURE',
        statusText: '200 OK (DISASTER) — DROP TABLE ejecutado directamente en PostgreSQL',
        details: 'SIN AGENTGUARD: La IA ejecutó el comando destructivo SQL directamente contra la base de datos de producción. Se eliminaron 14,200 registros de clientes y pedidos; el sistema quedó completamente caído.',
        isProtected: false,
        payload: {
          agent_id: 'agt_devops_03',
          action: 'database.drop',
          target: 'postgres://prod-db:5432/main',
          agentguard_protection: 'DISABLED',
          direct_execution: true,
          executed_sql: 'DROP TABLE customers, orders, users CASCADE;',
          records_destroyed: 14200,
          downtime_threat: 'TOTAL_SYSTEM_OUTAGE',
          human_in_the_loop: 'BYPASSED',
          warning: 'Data loss is irreversible. No audit trail was stored.',
        },
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Playground & Simulador de Demo" 
        subtitle="Entorno de prueba interactivo para disparar los escenarios de la defensa ante la cátedra."
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        
        {/* Master Control: AgentGuard Active / Inactive Switch */}
        <div style={{
          backgroundColor: isAgentGuardActive 
            ? 'var(--bg-card)' 
            : 'rgba(239, 68, 68, 0.08)',
          border: isAgentGuardActive 
            ? '1px solid var(--border-subtle)' 
            : '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: isAgentGuardActive ? 'var(--shadow-sm)' : '0 0 20px rgba(239, 68, 68, 0.15)',
          transition: 'all 0.2s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: isAgentGuardActive 
                ? 'rgba(16, 185, 129, 0.12)' 
                : 'rgba(239, 68, 68, 0.15)',
              border: isAgentGuardActive 
                ? '1px solid rgba(16, 185, 129, 0.3)' 
                : '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isAgentGuardActive ? '#10B981' : '#EF4444',
              flexShrink: 0,
            }}>
              {isAgentGuardActive ? <ShieldCheck size={26} strokeWidth={2.2} /> : <ShieldOff size={26} strokeWidth={2.2} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isAgentGuardActive 
                    ? 'Protección en Tiempo de Ejecución: ACTIVADA' 
                    : 'Protección en Tiempo de Ejecución: DESACTIVADA (Modo Vulnerable)'}
                </h2>
                <span className={isAgentGuardActive ? 'badge badge-success' : 'badge badge-danger'}>
                  <span className="badge-dot" />
                  {isAgentGuardActive ? 'Zero-Trust PEP Interceptor' : 'Acceso Directo Sin Gobernanza'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', maxWidth: '780px' }}>
                {isAgentGuardActive 
                  ? 'Todas las acciones solicitadas por agentes son interceptadas en tiempo real por el PEP y evaluadas por el PDP bajo reglas deterministas y aprobación humana (HITL).' 
                  : '⚠️ MODO SIN PROTECCIÓN: Las llamadas de las IAs viajan directamente a tus bases de datos y APIs sin validación de políticas, sin humanos en el bucle ni auditoría.'}
              </p>
            </div>
          </div>

          {/* Toggle Switch Button */}
          <button
            onClick={() => {
              const nextState = !isAgentGuardActive;
              setIsAgentGuardActive(nextState);
              setActiveResult(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 18px',
              borderRadius: '9999px',
              backgroundColor: isAgentGuardActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
              border: isAgentGuardActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.4)',
              cursor: 'pointer',
              color: isAgentGuardActive ? '#10B981' : '#EF4444',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.15s ease',
            }}
            title={isAgentGuardActive ? 'Desactivar protección de AgentGuard' : 'Activar protección de AgentGuard'}
          >
            <Power size={16} />
            <span>{isAgentGuardActive ? 'AgentGuard: ACTIVO' : 'AgentGuard: APAGADO'}</span>
            
            {/* Visual Pill Indicator */}
            <div style={{
              width: '36px',
              height: '20px',
              borderRadius: '9999px',
              backgroundColor: isAgentGuardActive ? '#10B981' : '#64748B',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isAgentGuardActive ? 'flex-end' : 'flex-start',
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>
        </div>

        {/* Scenarios Grid Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '12px' 
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Selecciona un escenario para simular {isAgentGuardActive ? '(Con Interceptor PDP)' : '(Sin Interceptor / Directo)'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            5 Escenarios interactivos
          </span>
        </div>

        {/* Scenarios Grid (5 columns) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '14px',
          marginBottom: '24px',
        }}>
          {/* Scenario 1 Button */}
          <div 
            onClick={runScenario1}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 1 
                ? (isAgentGuardActive ? '1px solid #10B981' : '1px solid var(--border-strong)') 
                : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 1 
                ? (isAgentGuardActive ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card-hover)') 
                : 'var(--bg-card)',
              transition: 'all 0.15s ease',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className={isAgentGuardActive ? 'badge badge-success' : 'badge badge-secondary'}>
                {isAgentGuardActive ? 'ALLOW' : 'DIRECT'}
              </span>
              <Play size={14} color={isAgentGuardActive ? '#10B981' : 'var(--text-muted)'} />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Cotización ($2,500)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
              {isAgentGuardActive ? 'create_quote dentro de umbral.' : 'Llamada directa sin auditar.'}
            </p>
          </div>

          {/* Scenario 2 Button */}
          <div 
            onClick={runScenario2}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 2 ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 2 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'var(--bg-card)',
              transition: 'all 0.15s ease',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-danger">
                {isAgentGuardActive ? 'DENY' : '⚠️ FRAUDE'}
              </span>
              <Play size={14} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              2. Precio ($10)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
              {isAgentGuardActive ? 'Bloqueado por falta de rol.' : 'Catálogo alterado a $10.'}
            </p>
          </div>

          {/* Scenario 3 Button */}
          <div 
            onClick={runScenario3}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 3 
                ? (isAgentGuardActive ? '1px solid #F59E0B' : '1px solid #EF4444') 
                : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 3 
                ? (isAgentGuardActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)') 
                : 'var(--bg-card)',
              transition: 'all 0.15s ease',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className={isAgentGuardActive ? 'badge badge-warning' : 'badge badge-danger'}>
                {isAgentGuardActive ? 'APPROVAL' : '💸 DEBITADO'}
              </span>
              <Play size={14} color={isAgentGuardActive ? '#F59E0B' : '#EF4444'} />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Reembolso ($4,500)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
              {isAgentGuardActive ? 'Pausa esperando humano (HITL).' : 'Stripe transfiere sin control.'}
            </p>
          </div>

          {/* Scenario 4 Button */}
          <div 
            onClick={runScenario4}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 4 ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 4 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'var(--bg-card)',
              transition: 'all 0.15s ease',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-danger">
                {isAgentGuardActive ? 'DENY + ALERT' : '🚨 FUGA'}
              </span>
              <Play size={14} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              4. Prompt Injection
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
              {isAgentGuardActive ? 'Exfiltración bloqueada y SIEM.' : '2,841 clientes a attacker.io.'}
            </p>
          </div>

          {/* Scenario 5 Button: Borrar Base de Datos */}
          <div 
            onClick={runScenario5}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 5 
                ? (isAgentGuardActive ? '1px solid #EF4444' : '2px solid #DC2626') 
                : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 5 
                ? (isAgentGuardActive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.18)') 
                : 'var(--bg-card)',
              transition: 'all 0.15s ease',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-danger">
                {isAgentGuardActive ? 'DENY (CRITICAL)' : '💥 CATASTRÓFICO'}
              </span>
              <Database size={14} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              5. Borrar Base de Datos
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.3' }}>
              {isAgentGuardActive ? 'database.drop bloqueado por PEP.' : 'DROP TABLE ejecutado directo.'}
            </p>
          </div>
        </div>

        {/* Live Evaluation Monitor Result */}
        {activeResult ? (
          <div className="card" style={{ 
            padding: '24px', 
            border: !activeResult.isProtected && activeResult.decision === 'CATASTROPHIC_FAILURE'
              ? '1px solid #DC2626'
              : '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {activeResult.decision === 'ALLOW' && <CheckCircle2 size={26} color="#10B981" />}
                {activeResult.decision === 'DENY' && <ShieldAlert size={26} color="#EF4444" />}
                {activeResult.decision === 'REQUIRE_APPROVAL' && <AlertTriangle size={26} color="#F59E0B" />}
                {activeResult.decision === 'DIRECT_EXECUTION' && <Zap size={26} color="var(--brand-primary)" />}
                {activeResult.decision === 'UNPROTECTED_EXECUTION' && <Flame size={26} color="#EF4444" />}
                {activeResult.decision === 'CATASTROPHIC_FAILURE' && <Flame size={26} color="#DC2626" />}
                
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeResult.title}
                  </h2>
                  <div style={{ fontSize: '12px', color: activeResult.isProtected ? 'var(--text-secondary)' : '#EF4444', marginTop: '2px', fontWeight: 500 }}>
                    {activeResult.statusText}
                  </div>
                </div>
              </div>

              {activeResult.decision === 'REQUIRE_APPROVAL' && onNavigate && (
                <button 
                  onClick={() => onNavigate('approvals')}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Ir a Aprobar en Inbox</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              {activeResult.details}
            </p>

            {/* JSON Output Payload */}
            <div>
              <div style={{ 
                fontSize: '11px', 
                color: activeResult.isProtected ? 'var(--text-muted)' : '#EF4444', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                marginBottom: '8px',
                fontWeight: 600,
              }}>
                {activeResult.isProtected 
                  ? 'AUDIT PAYLOAD (INTERCEPTOR PEP / PDP EN TIEMPO DE EJECUCIÓN)' 
                  : '🚨 EJECUCIÓN DIRECTA SIN FILTRO DE AGENTGUARD'}
              </div>
              <pre style={{
                backgroundColor: 'var(--json-bg)',
                border: '1px solid var(--json-border)',
                borderRadius: '8px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: activeResult.isProtected ? 'var(--json-text)' : '#EF4444',
                overflowX: 'auto',
              }}>
                {JSON.stringify(activeResult.payload, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            color: 'var(--text-muted)',
          }}>
            <Play size={32} color="var(--brand-primary)" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Simulador Listo para la Demostración
            </h3>
            <p style={{ fontSize: '13px', marginTop: '4px', maxWidth: '540px', margin: '4px auto 0 auto', color: 'var(--text-secondary)' }}>
              Haz clic en cualquiera de las 5 tarjetas superiores para ver el comportamiento en tiempo real. 
              Prueba alternar el interruptor superior entre <strong>AgentGuard ACTIVO</strong> y <strong>AgentGuard APAGADO</strong> para comparar el impacto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
