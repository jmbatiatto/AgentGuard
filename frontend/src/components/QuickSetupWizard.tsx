import React, { useState, useEffect } from 'react';
import {
  Bot,
  Wrench,
  ShieldCheck,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RISK_LABELS, DECISION_LABELS } from '../constants/labels';
import type { Agent, Policy, PolicyDecision, RiskLevel, Tool } from '../types/domain';

interface QuickSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const QuickSetupWizard: React.FC<QuickSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { currentOrganizationId, currentUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Paso 1: Herramienta y Acción Principal
  const [toolName, setToolName] = useState('Pasarela de Pagos Stripe');
  const [endpointUrl, setEndpointUrl] = useState('https://api.empresa.com/v1/payments');
  const [actionName, setActionName] = useState('refund_payment');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('HIGH');

  // Paso 2: Agente IA y Vinculación
  const [agentName, setAgentName] = useState('Agente de Finanzas y Soporte');
  const [agentPurpose, setAgentPurpose] = useState(
    'Gestión automatizada de reembolsos y atención comercial'
  );

  // Paso 3: Política y Regla de Gobernanza
  const [policyName, setPolicyName] = useState('Política de Control de Reembolsos');
  const [effect, setEffect] = useState<PolicyDecision>('REQUIRE_APPROVAL');
  const [maxAmount, setMaxAmount] = useState<string>('500');

  // Recursos creados entre pasos
  const [createdTool, setCreatedTool] = useState<Tool | null>(null);
  const [createdActionId, setCreatedActionId] = useState<string>('');
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [createdPolicy, setCreatedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setIsSubmitting(false);
      setIsCompleted(false);
      setCreatedTool(null);
      setCreatedActionId('');
      setCreatedAgent(null);
      setCreatedPolicy(null);
      setToolName('Pasarela de Pagos Stripe');
      setEndpointUrl('https://api.empresa.com/v1/payments');
      setActionName('refund_payment');
      setRiskLevel('HIGH');
      setAgentName('Agente de Finanzas y Soporte');
      setAgentPurpose('Gestión automatizada de reembolsos y atención comercial');
      setPolicyName('Política de Control de Reembolsos');
      setEffect('REQUIRE_APPROVAL');
      setMaxAmount('500');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !endpointUrl.trim() || !actionName.trim()) {
      toast.error('Completá el nombre de herramienta, URL y acción principal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanAction = actionName.trim().toLowerCase().replace(/\s+/g, '_');
      const created = await api.createTool({
        name: toolName.trim(),
        protocol: 'REST',
        endpoint_url: endpointUrl.trim(),
        description: `Herramienta configurada con el asistente rápido (${toolName.trim()})`,
        actions: [
          {
            action_name: cleanAction,
            risk_level: riskLevel,
            description: `Acción principal ${cleanAction}`,
          },
        ],
        orgId: currentOrganizationId,
      });

      let actionId = created.actionsList?.[0]?.id || '';
      if (!actionId) {
        const actions = await api.getToolActions();
        const found = actions.find(
          (a: any) => a.tool_id === created.id && a.action_name === cleanAction
        );
        if (found?.id) {
          actionId = found.id;
        }
      }

      if (!actionId) {
        toast.error('La herramienta se creó pero no se pudo obtener el ID de su acción.');
        return;
      }

      setCreatedTool(created);
      setCreatedActionId(actionId);
      toast.success(`Herramienta "${created.name}" y acción "${cleanAction}" creadas`);
      setStep(2);
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Error al registrar herramienta y acción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !createdTool) {
      toast.error('Ingresá un nombre válido para el agente IA.');
      return;
    }

    setIsSubmitting(true);
    try {
      const agent = await api.createAgent({
        name: agentName.trim(),
        purpose: agentPurpose.trim() || 'Agente de IA gobernado por AgentGuard',
        status: 'ACTIVE',
        tool_ids: [createdTool.id],
        orgId: currentOrganizationId,
        ownerUserId: currentUser?.id,
      });

      setCreatedAgent(agent);
      toast.success(`Agente "${agent.name}" creado y vinculado a "${createdTool.name}"`);
      setStep(3);
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Error al crear y vincular el agente IA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName.trim() || !createdActionId || !createdAgent) {
      toast.error('Completá el nombre de la política de gobernanza.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedMax = maxAmount.trim() !== '' ? Number(maxAmount) : NaN;
      const conditions: Record<string, any> =
        !Number.isNaN(parsedMax) && parsedMax > 0 ? { max_amount: parsedMax } : {};

      const policy = await api.createPolicy({
        name: policyName.trim(),
        description: `Regla ${DECISION_LABELS[effect]} para ${createdAgent.name}`,
        priority: 100,
        tool_action_id: createdActionId,
        target_agent_id: createdAgent.id,
        effect,
        conditions,
        orgId: currentOrganizationId,
      });

      setCreatedPolicy(policy);
      setIsCompleted(true);
      toast.success('¡Agente protegido con éxito en 3 pasos!');
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Error al crear la política y regla PDP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#F8FAFC',
    fontSize: '13px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#CBD5E1',
    marginBottom: '6px',
  };

  const stepMeta = [
    { num: 1, title: 'Herramienta y Acción', icon: Wrench },
    { num: 2, title: 'Agente IA', icon: Bot },
    { num: 3, title: 'Política PDP', icon: ShieldCheck },
  ] as const;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-wizard-title"
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 28px rgba(56, 189, 248, 0.12)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '580px',
          overflow: 'hidden',
        }}
      >
        {/* Header del Modal */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                borderRadius: '8px',
                color: '#38BDF8',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 id="quick-wizard-title" style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
                Proteger Agente en 3 Clics
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                Configuración guiada de herramienta, agente y política de control en tiempo real.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar asistente"
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Progreso 3 Pasos */}
        <div
          style={{
            padding: '14px 22px',
            backgroundColor: '#0B1220',
            borderBottom: '1px solid #1E293B',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}
        >
          {stepMeta.map((item) => {
            const Icon = item.icon;
            const isActive = !isCompleted && step === item.num;
            const isDone = isCompleted || step > item.num;

            return (
              <div
                key={item.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: isActive
                    ? '1px solid rgba(56, 189, 248, 0.45)'
                    : isDone
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : '1px solid #1E293B',
                  backgroundColor: isActive
                    ? 'rgba(56, 189, 248, 0.1)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'transparent',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: isDone ? '#10B981' : isActive ? '#38BDF8' : '#1E293B',
                    color: isDone || isActive ? '#0F172A' : '#64748B',
                    flexShrink: 0,
                  }}
                >
                  {isDone ? <CheckCircle2 size={14} /> : item.num}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isDone ? '#34D399' : isActive ? '#F8FAFC' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Icon size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contenido según Paso */}
        {isCompleted ? (
          <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
                  ¡Tu agente ya está protegido y operativo!
                </h4>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                  Podés probar esta regla de inmediato desde el Playground o consultar sus trazas.
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span style={{ color: '#94A3B8' }}>Herramienta y Acción:</span>
                <strong style={{ color: '#F8FAFC' }}>
                  {createdTool?.name} ({actionName})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span style={{ color: '#94A3B8' }}>Agente IA vinculado:</span>
                <strong style={{ color: '#38BDF8' }}>{createdAgent?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
                <span style={{ color: '#94A3B8' }}>Política y Regla PDP:</span>
                <strong style={{ color: '#34D399' }}>
                  {createdPolicy?.name} ({DECISION_LABELS[effect]})
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
              <button type="button" onClick={onClose} className="btn btn-primary">
                <span>Finalizar y ver en el panel</span>
              </button>
            </div>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleStep1Submit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="wizard-tool-name" style={labelStyle}>
                1. Nombre de la Herramienta Externa *
              </label>
              <input
                id="wizard-tool-name"
                type="text"
                required
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="ej. Pasarela de Pagos Stripe"
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="wizard-endpoint-url" style={labelStyle}>
                URL del Endpoint Destino *
              </label>
              <input
                id="wizard-endpoint-url"
                type="url"
                required
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="https://api.empresa.com/v1/payments"
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="wizard-action-name" style={labelStyle}>
                  Acción Principal (ToolAction) *
                </label>
                <input
                  id="wizard-action-name"
                  type="text"
                  required
                  value={actionName}
                  onChange={(e) => setActionName(e.target.value)}
                  placeholder="ej. refund_payment"
                  style={inputStyle}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="wizard-risk-level" style={labelStyle}>
                  Nivel de Riesgo *
                </label>
                <select
                  id="wizard-risk-level"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  style={inputStyle}
                  disabled={isSubmitting}
                >
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as RiskLevel[]).map((lvl) => (
                    <option key={lvl} value={lvl} style={{ backgroundColor: '#0F172A' }}>
                      {RISK_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '6px',
                paddingTop: '14px',
                borderTop: '1px solid #1E293B',
              }}
            >
              <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={15} className="spin" /> : <ArrowRight size={15} />}
                <span>{isSubmitting ? 'Registrando...' : 'Siguiente: Crear Agente IA'}</span>
              </button>
            </div>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleStep2Submit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#A7F3D0',
              }}
            >
              Herramienta lista: <strong>{createdTool?.name}</strong> (acción{' '}
              <code style={{ fontFamily: 'monospace' }}>{actionName}</code>). Se vinculará automáticamente al nuevo agente.
            </div>

            <div>
              <label htmlFor="wizard-agent-name" style={labelStyle}>
                2. Nombre del Agente IA *
              </label>
              <input
                id="wizard-agent-name"
                type="text"
                required
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="ej. Agente de Finanzas y Soporte"
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="wizard-agent-purpose" style={labelStyle}>
                Propósito Operativo
              </label>
              <textarea
                id="wizard-agent-purpose"
                rows={2}
                value={agentPurpose}
                onChange={(e) => setAgentPurpose(e.target.value)}
                placeholder="Describe qué tareas ejecutará este agente."
                style={{ ...inputStyle, resize: 'none' }}
                disabled={isSubmitting}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                marginTop: '6px',
                paddingTop: '14px',
                borderTop: '1px solid #1E293B',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                <ArrowLeft size={15} />
                <span>Atrás</span>
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={15} className="spin" /> : <ArrowRight size={15} />}
                <span>{isSubmitting ? 'Vinculando...' : 'Siguiente: Configurar Política'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStep3Submit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#BAE6FD',
              }}
            >
              Agente vinculado: <strong>{createdAgent?.name}</strong> →{' '}
              <code style={{ fontFamily: 'monospace' }}>{actionName}</code>
            </div>

            <div>
              <label htmlFor="wizard-policy-name" style={labelStyle}>
                3. Nombre de la Política de Gobernanza *
              </label>
              <input
                id="wizard-policy-name"
                type="text"
                required
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="ej. Política de Control de Reembolsos"
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="wizard-policy-effect" style={labelStyle}>
                  Decisión del Motor PDP *
                </label>
                <select
                  id="wizard-policy-effect"
                  value={effect}
                  onChange={(e) => setEffect(e.target.value as PolicyDecision)}
                  style={inputStyle}
                  disabled={isSubmitting}
                >
                  {(['ALLOW', 'REQUIRE_APPROVAL', 'DENY'] as PolicyDecision[]).map((dec) => (
                    <option key={dec} value={dec} style={{ backgroundColor: '#0F172A' }}>
                      {DECISION_LABELS[dec]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="wizard-max-amount" style={labelStyle}>
                  Límite de monto (max_amount, opcional)
                </label>
                <input
                  id="wizard-max-amount"
                  type="number"
                  min="0"
                  step="1"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="500"
                  style={inputStyle}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                marginTop: '6px',
                paddingTop: '14px',
                borderTop: '1px solid #1E293B',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                <ArrowLeft size={15} />
                <span>Atrás</span>
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={15} className="spin" /> : <ShieldCheck size={15} />}
                <span>{isSubmitting ? 'Activando protección...' : 'Activar Política de Protección'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuickSetupWizard;

