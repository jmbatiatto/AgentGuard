import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Policy, PolicyDecision } from '../types/domain';
import {
  Plus,
  Search,
  ShieldCheck,
  X,
  Shield,
  CheckCircle,
  AlertTriangle,
  Play,
  Copy,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  Layers,
  Bot,
  Zap
} from 'lucide-react';
import { Header } from '../components/Header';
import { mockPolicies } from '../data/mockData';

export const PoliciesView: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [toolActions, setToolActions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal: Create Policy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(100);
  const [decision, setDecision] = useState<PolicyDecision>('ALLOW');
  const [selectedActionId, setSelectedActionId] = useState<string>('');
  const [conditionStr, setConditionStr] = useState('{"amount": {"lte": 5000}}');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal: Review Coverage
  const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);

  // Drawer / Inspection State
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    const [pols, actions] = await Promise.all([
      api.getPolicies(),
      api.getToolActions(),
    ]);

    if (pols && pols.length > 0) {
      setPolicies(pols);
      if (selectedPolicy) {
        const updated = pols.find(p => p.id === selectedPolicy.id);
        if (updated) setSelectedPolicy(updated);
      }
    }
    if (actions && actions.length > 0) {
      setToolActions(actions);
      if (!selectedActionId && actions[0]) {
        setSelectedActionId(actions[0].id);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Create Policy Handler
  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let parsedConditions: Record<string, any> = {};
    try {
      if (conditionStr.trim()) {
        parsedConditions = JSON.parse(conditionStr);
      }
    } catch {
      alert('Las condiciones deben ser un JSON válido (ej: {"amount": {"lte": 5000}})');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createPolicy({
        name: name.trim(),
        description: description.trim() || undefined,
        priority: Number(priority),
        effect: decision,
        tool_action_id: selectedActionId || undefined,
        conditions: parsedConditions,
      });

      showToast(`Política "${name}" creada y registrada en el motor PDP`);

      // Reset & close
      setName('');
      setDescription('');
      setPriority(100);
      setDecision('ALLOW');
      setConditionStr('{"amount": {"lte": 5000}}');
      setIsModalOpen(false);

      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Policy Status (Active <-> Inactive)
  const handleTogglePolicyStatus = async (policy: Policy) => {
    const targetPolicyId = policy.policyId || policy.id;
    const newStatus = policy.status === 'Active' ? 'Inactive' : 'Active';
    setIsTogglingStatus(true);

    try {
      const ok = await api.updatePolicyStatus(targetPolicyId, newStatus === 'Active');
      if (ok) {
        showToast(`Política "${policy.name}" ahora está ${newStatus === 'Active' ? 'ACTIVADA' : 'DESACTIVADA'}`);
        // Optimistic update
        setPolicies(prev => prev.map(p => (p.policyId === targetPolicyId || p.id === policy.id) ? { ...p, status: newStatus } : p));
        if (selectedPolicy && (selectedPolicy.policyId === targetPolicyId || selectedPolicy.id === policy.id)) {
          setSelectedPolicy({ ...selectedPolicy, status: newStatus });
        }
        await loadData();
      } else {
        alert('No se pudo actualizar el estado de la política');
      }
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Delete Policy
  const handleDeletePolicy = async (policy: Policy) => {
    const targetPolicyId = policy.policyId || policy.id;
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la política "${policy.name}"?\nEsta acción removerá sus reglas asociadas del motor PDP.`
    );
    if (!confirmed) return;

    const ok = await api.deletePolicy(targetPolicyId);
    if (ok) {
      showToast(`Política "${policy.name}" eliminada.`);
      setSelectedPolicy(null);
      await loadData();
    } else {
      alert('Error eliminando la política del catálogo');
    }
  };

  // Shortcut to Playground
  const handleTestInPlayground = (policy: Policy) => {
    const testPayload = {
      action: policy.action !== 'Todas (*)' ? policy.action : 'create_quote',
      context: policy.rawConditions || { amount: 2500 },
    };
    try {
      sessionStorage.setItem('agentguard_test_payload', JSON.stringify(testPayload));
    } catch {
      // ignore
    }
    window.location.hash = '#playground';
  };

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Unique agents list for filter dropdown
  const uniqueAgents = Array.from(new Set(policies.map(p => p.agent).filter(Boolean)));

  // Filtered Policies
  const filteredPolicies = policies.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      p.agent.toLowerCase().includes(term) ||
      p.action.toLowerCase().includes(term) ||
      p.condition.toLowerCase().includes(term);

    const matchesAgent = agentFilter === 'ALL' || p.agent.toLowerCase() === agentFilter.toLowerCase();
    const matchesDecision = decisionFilter === 'ALL' || p.decision === decisionFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesAgent && matchesDecision && matchesStatus;
  });

  // Dynamic Metrics & Counts
  const allowCount = filteredPolicies.filter(p => p.decision === 'ALLOW').length;
  const hitlCount = filteredPolicies.filter(p => p.decision === 'REQUIRE_APPROVAL').length;
  const denyCount = filteredPolicies.filter(p => p.decision === 'DENY').length;

  // Real Coverage Calculation
  const totalActions = toolActions.length || 5;
  const coveredActionsList = toolActions.filter(act => 
    policies.some(p => p.action.toLowerCase() === act.action_name.toLowerCase())
  );
  const uncoveredActionsList = toolActions.filter(act => 
    !policies.some(p => p.action.toLowerCase() === act.action_name.toLowerCase())
  );
  const coveragePercent = totalActions > 0 
    ? Math.round((coveredActionsList.length / totalActions) * 100) 
    : 90;

  // Pagination
  const totalPages = Math.ceil(filteredPolicies.length / pageSize) || 1;
  const paginatedPolicies = filteredPolicies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, agentFilter, decisionFilter, statusFilter]);

  // Decision badge helper
  const getDecisionBadge = (decision: PolicyDecision) => {
    switch (decision) {
      case 'DENY':
        return <span className="badge badge-danger"><span className="badge-dot" /><span>DENY</span></span>;
      case 'REQUIRE_APPROVAL':
        return <span className="badge badge-warning"><span className="badge-dot" /><span>REQUIRE_APPROVAL</span></span>;
      case 'ALLOW':
      default:
        return <span className="badge badge-success"><span className="badge-dot" /><span>ALLOW</span></span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          backgroundColor: '#064E3B',
          border: '1px solid #10B981',
          color: '#ECFDF5',
          borderRadius: '8px',
          padding: '12px 18px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} color="#34D399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Review Coverage Breakdown */}
      {isCoverageModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }} onClick={() => setIsCoverageModalOpen(false)}>
          <div 
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '560px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38BDF8' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
                    Cobertura de Gobernanza ({coveragePercent}%)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    {uncoveredActionsList.length === 0 
                      ? 'Todas las acciones atómicas tienen al menos una regla explícita.'
                      : `${uncoveredActionsList.length} acciones no tienen regla explícita y caerán en Fail-Closed DENY.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCoverageModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Acciones No Cubiertas */}
              {uncoveredActionsList.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    <span>Acciones sin regla explícita (Fail-Closed DENY)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {uncoveredActionsList.map(act => (
                      <div key={act.id} style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                            {act.action_name}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '10px' }}>
                            Riesgo: {act.risk_level}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedActionId(act.id);
                            setName(`Regla para ${act.action_name}`);
                            setIsCoverageModalOpen(false);
                            setIsModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
                        >
                          <Plus size={12} />
                          <span>Crear regla</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones Cubiertas */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>Acciones con Políticas Activas ({coveredActionsList.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {coveredActionsList.map(act => (
                    <div key={act.id} style={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#E2E8F0' }}>
                        {act.action_name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                        ✓ Protegida
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 22px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsCoverageModalOpen(false)} className="btn btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Drawer: Detalle e Inspección de Política */}
      {selectedPolicy && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            justifyContent: 'flex-end',
          }} 
          onClick={() => setSelectedPolicy(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '480px',
              height: '100%',
              backgroundColor: '#0F172A',
              borderLeft: '1px solid #334155',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              gap: '20px',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#38BDF8',
                }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>
                    {selectedPolicy.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {getDecisionBadge(selectedPolicy.decision)}
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      color: '#38BDF8',
                      fontWeight: 600,
                    }}>
                      Prioridad {selectedPolicy.priority || 100}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                title="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Identificador UUID */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Regla ID / Policy UUID
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#1E293B',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #334155',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#E2E8F0',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPolicy.id}</span>
                <button
                  onClick={() => handleCopy(selectedPolicy.id)}
                  style={{ background: 'none', border: 'none', color: copiedId ? '#10B981' : '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                >
                  <Copy size={13} />
                  <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Estado Operativo con Switch */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Estado de Gobernanza
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#1E293B',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={selectedPolicy.status === 'Active' ? 'badge badge-success' : 'badge badge-warning'}>
                    <span className="badge-dot" />
                    <span>{selectedPolicy.status}</span>
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {selectedPolicy.status === 'Active' ? 'Evaluada activamente por el PDP' : 'Desactivada temporalmente'}
                  </span>
                </div>
                <button
                  onClick={() => handleTogglePolicyStatus(selectedPolicy)}
                  disabled={isTogglingStatus}
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '11px', gap: '6px' }}
                >
                  <Power size={13} color={selectedPolicy.status === 'Active' ? '#F59E0B' : '#10B981'} />
                  <span>{selectedPolicy.status === 'Active' ? 'Desactivar' : 'Activar'}</span>
                </button>
              </div>
            </div>

            {/* Agente y Acción Gobernados */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Agente Destino
                </label>
                <div style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Bot size={14} color="#38BDF8" />
                  <span>{selectedPolicy.agent}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Acción Atómica
                </label>
                <div style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: '#38BDF8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Zap size={14} color="#38BDF8" />
                  <span>{selectedPolicy.action}</span>
                </div>
              </div>
            </div>

            {/* Condiciones Contextuales JSONB */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Condiciones Contextuales (JSONB Engine)
              </label>
              <pre style={{
                backgroundColor: '#020617',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#38BDF8',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: '1.6',
                overflowX: 'auto',
                margin: 0,
              }}>
                {selectedPolicy.rawConditions && Object.keys(selectedPolicy.rawConditions).length > 0
                  ? JSON.stringify(selectedPolicy.rawConditions, null, 2)
                  : '{\n  // Sin restricciones contextuales\n}'}
              </pre>
            </div>

            {/* Descripción */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Alcance y Justificación
              </label>
              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5', backgroundColor: '#1E293B', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
                {selectedPolicy.description || 'Política de autorización determinista perimetral.'}
              </div>
            </div>

            {/* Botones de Acción Final */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleTestInPlayground(selectedPolicy)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              >
                <Play size={15} fill="#FFFFFF" />
                <span>Probar esta regla en Playground</span>
              </button>

              <button
                onClick={() => handleDeletePolicy(selectedPolicy)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Trash2 size={15} />
                <span>Eliminar Política</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Policy */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 189, 248, 0.1)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '540px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38BDF8' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
                    Crear Nueva Política de Gobernanza
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Regla determinista evaluada en tiempo de ejecución por el Motor PDP.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Nombre de la Política *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. High-Value Financial Operations"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Acción Atómica a Gobernar (ToolAction) *
                </label>
                <select
                  value={selectedActionId}
                  onChange={(e) => setSelectedActionId(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  {toolActions.map(act => (
                    <option key={act.id} value={act.id}>
                      {act.action_name} ({act.risk_level})
                    </option>
                  ))}
                  {toolActions.length === 0 && (
                    <option value="">Todas las acciones (*)</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                    Decisión del PDP (Effect)
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as PolicyDecision)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#F8FAFC',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="ALLOW">ALLOW (Permitir)</option>
                    <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL (HITL)</option>
                    <option value="DENY">DENY (Bloquear)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                    Prioridad (1 - 1000)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    style={{
                      width: '100%',
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#F8FAFC',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Condiciones Contextuales (JSONB)
                </label>
                <textarea
                  rows={2}
                  value={conditionStr}
                  onChange={(e) => setConditionStr(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#38BDF8',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '6px',
                paddingTop: '16px',
                borderTop: '1px solid #1E293B',
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Política'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Header 
        title="Policies" 
        subtitle="Define and enforce authorization rules across your workspace."
        actionButton={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Create policy</span>
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Policy Coverage Alert Banner */}
        <div style={{
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Policy coverage: {coveragePercent}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--brand-primary)' }}>
                {uncoveredActionsList.length === 0 
                  ? 'Todas las acciones atómicas del tenant cuentan con reglas de gobernanza.'
                  : `${uncoveredActionsList.length} de ${totalActions} acciones registradas no tienen regla explícita.`}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsCoverageModalOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Review coverage
          </button>
        </div>

        {/* Table Filters */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px 10px 0 0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {/* Search Input */}
          <div className="input-search" style={{ flex: 1, minWidth: '220px', maxWidth: '340px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search policies, actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter: Agent */}
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="btn btn-secondary"
              style={{
                cursor: 'pointer',
                outline: 'none',
                padding: '7px 12px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
              }}
            >
              <option value="ALL">All agents</option>
              {uniqueAgents.map(ag => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>

            {/* Filter: Decision */}
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="btn btn-secondary"
              style={{
                cursor: 'pointer',
                outline: 'none',
                padding: '7px 12px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
              }}
            >
              <option value="ALL">All decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL</option>
              <option value="DENY">DENY</option>
            </select>

            {/* Filter: Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="btn btn-secondary"
              style={{
                cursor: 'pointer',
                outline: 'none',
                padding: '7px 12px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
              }}
            >
              <option value="ALL">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Policies Table */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--table-header-bg)',
              }}>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>POLICY</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>AGENT</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>ACTION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>CONDITION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>DECISION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPolicies.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron políticas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedPolicies.map((policy) => (
                  <tr 
                    key={policy.id}
                    onClick={() => setSelectedPolicy(policy)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Policy Name */}
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div>{policy.name}</div>
                      {policy.priority && (
                        <span style={{ fontSize: '10px', color: '#64748B' }}>
                          Prioridad: {policy.priority}
                        </span>
                      )}
                    </td>

                    {/* Agent */}
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {policy.agent}
                    </td>

                    {/* Action in Monospace */}
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {policy.action}
                    </td>

                    {/* Condition Box */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className="code-pill">
                        {policy.condition}
                      </span>
                    </td>

                    {/* Decision Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      {getDecisionBadge(policy.decision)}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className={policy.status === 'Active' ? 'badge badge-success' : 'badge badge-warning'}>
                        <span className="badge-dot" />
                        <span>{policy.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setSelectedPolicy(policy)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px', gap: '4px' }}
                        title="Ver detalles de la política"
                      >
                        <Layers size={13} />
                        <span>Detalles</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer: Dynamic Counters & Pagination */}
          <div style={{
            padding: '14px 18px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>
                {filteredPolicies.length}
              </strong> de <strong style={{ color: 'var(--text-primary)' }}>{policies.length}</strong> políticas mostradas · <span style={{ color: '#10B981', fontWeight: 600 }}>{allowCount} ALLOW</span> · <span style={{ color: '#F59E0B', fontWeight: 600 }}>{hitlCount} HITL</span> · <span style={{ color: '#EF4444', fontWeight: 600 }}>{denyCount} DENY</span>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={14} />
                  <span>Anterior</span>
                </button>

                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 4px' }}>
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <span>Siguiente</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
