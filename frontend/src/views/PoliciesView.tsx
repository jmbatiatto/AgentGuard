import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Policy, PolicyDecision, PolicyRuleItem, Agent } from '../types/domain';
import { DECISION_LABELS } from '../constants/labels';
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
  ChevronDown,
  Layers,
  Bot,
  Zap,
} from 'lucide-react';
import { Header } from '../components/Header';
import { mockPolicies } from '../data/mockData';

export const PoliciesView: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [toolActions, setToolActions] = useState<any[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal: Crear Política Maestra
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(100);
  const [decision, setDecision] = useState<PolicyDecision>('ALLOW');
  const [selectedActionId, setSelectedActionId] = useState<string>('');
  const [conditionStr, setConditionStr] = useState('{"amount": {"lte": 5000}}');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal: Añadir Regla a Política Específica
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [targetPolicyForRule, setTargetPolicyForRule] = useState<Policy | null>(null);
  const [newRuleActionId, setNewRuleActionId] = useState<string>('');
  const [newRuleAgentId, setNewRuleAgentId] = useState<string>('');
  const [newRuleDecision, setNewRuleDecision] = useState<PolicyDecision>('ALLOW');
  const [newRulePriority, setNewRulePriority] = useState<number>(100);
  const [newRuleConditions, setNewRuleConditions] = useState<string>('{"amount": {"lte": 1000}}');
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);

  // Modal: Revisar Cobertura
  const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);

  // Drawer / Inspección de Política
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Notificación Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    const [pols, actions, ags] = await Promise.all([
      api.getPolicies(),
      api.getToolActions(),
      api.getAgents(),
    ]);

    if (pols && pols.length > 0) {
      setPolicies(pols);
      setExpandedPolicies(prev => {
        if (prev.size === 0) {
          return new Set(pols.map(p => p.id));
        }
        return prev;
      });
      if (selectedPolicy) {
        const updated = pols.find(p => p.id === selectedPolicy.id || p.policyId === selectedPolicy.id);
        if (updated) setSelectedPolicy(updated);
      }
    }
    if (actions && actions.length > 0) {
      setToolActions(actions);
      if (!selectedActionId && actions[0]) {
        setSelectedActionId(actions[0].id);
      }
      if (!newRuleActionId && actions[0]) {
        setNewRuleActionId(actions[0].id);
      }
    }
    if (ags && ags.length > 0) {
      setAgents(ags);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Alternar expansión de una política
  const toggleExpand = (policyId: string) => {
    setExpandedPolicies(prev => {
      const next = new Set(prev);
      if (next.has(policyId)) next.delete(policyId);
      else next.add(policyId);
      return next;
    });
  };

  // Expandir todas las políticas
  const expandAll = () => {
    setExpandedPolicies(new Set(policies.map(p => p.id)));
  };

  // Colapsar todas las políticas
  const collapseAll = () => {
    setExpandedPolicies(new Set());
  };

  // Crear Política Maestra
  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let parsedConditions: Record<string, any> = {};
    try {
      if (conditionStr.trim()) {
        parsedConditions = JSON.parse(conditionStr);
      }
    } catch {
      alert('Las condiciones deben ser un formato JSON válido (ej: {"amount": {"lte": 5000}})');
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

      showToast(`Política "${name}" registrada en el motor PDP.`);

      // Resetear formulario
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

  // Abrir Modal para Añadir Regla a una Política Específica
  const handleOpenAddRuleModal = (policy: Policy) => {
    setTargetPolicyForRule(policy);
    if (toolActions.length > 0 && !newRuleActionId) {
      setNewRuleActionId(toolActions[0].id);
    }
    setNewRuleAgentId('');
    setNewRuleDecision('ALLOW');
    setNewRulePriority(policy.priority || 100);
    setNewRuleConditions('{"amount": {"lte": 1000}}');
    setIsAddRuleModalOpen(true);
  };

  // Enviar Nueva Regla para una Política Específica
  const handleAddRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPolicyForRule) return;

    let parsedConditions: Record<string, any> = {};
    try {
      if (newRuleConditions.trim()) {
        parsedConditions = JSON.parse(newRuleConditions);
      }
    } catch {
      alert('Las condiciones deben ser un formato JSON válido (ej: {"amount": {"lte": 1000}})');
      return;
    }

    setIsSubmittingRule(true);
    try {
      const selectedAction = toolActions.find(a => a.id === newRuleActionId);
      const actionName = selectedAction ? selectedAction.action_name : 'Acción';

      await api.createPolicyRule(targetPolicyForRule.id || targetPolicyForRule.policyId!, {
        toolActionId: newRuleActionId,
        targetAgentId: newRuleAgentId || undefined,
        effect: newRuleDecision,
        priority: Number(newRulePriority),
        conditions: parsedConditions,
      });

      showToast(`Regla para "${actionName}" añadida a la política "${targetPolicyForRule.name}".`);
      setIsAddRuleModalOpen(false);
      setTargetPolicyForRule(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error registrando la regla en el motor PDP');
    } finally {
      setIsSubmittingRule(false);
    }
  };

  // Alternar Estado Activo / Inactivo de Política
  const handleTogglePolicyStatus = async (policy: Policy) => {
    const targetPolicyId = policy.policyId || policy.id;
    const newStatus = policy.status === 'Active' ? 'Inactive' : 'Active';
    setIsTogglingStatus(true);

    try {
      const ok = await api.updatePolicyStatus(targetPolicyId, newStatus === 'Active');
      if (ok) {
        showToast(`Política "${policy.name}" ahora está ${newStatus === 'Active' ? 'ACTIVADA' : 'DESACTIVADA'}.`);
        setPolicies(prev => prev.map(p => (p.policyId === targetPolicyId || p.id === policy.id) ? { ...p, status: newStatus } : p));
        if (selectedPolicy && (selectedPolicy.policyId === targetPolicyId || selectedPolicy.id === policy.id)) {
          setSelectedPolicy({ ...selectedPolicy, status: newStatus });
        }
        await loadData();
      } else {
        alert('No se pudo actualizar el estado de la política en el servidor.');
      }
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Desacoplamiento de Borrado: Eliminar Regla Individual sin tocar la política
  const handleDeleteRule = async (rule: PolicyRuleItem, policyName: string) => {
    const actionLabel = rule.action_name || 'esta acción';
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la regla para "${actionLabel}" de la política "${policyName}"?\n\nEsta acción removerá únicamente esta regla determinista del motor PDP. La política contenedora y sus demás reglas se mantendrán activas.`
    );
    if (!confirmed) return;

    const ok = await api.deletePolicyRule(rule.id);
    if (ok) {
      showToast(`Regla para "${actionLabel}" eliminada correctamente.`);
      // Actualización optimista local
      setPolicies(prev => prev.map(p => {
        if (p.id === rule.policy_id || p.policyId === rule.policy_id) {
          const updatedRules = (p.rules || []).filter(r => r.id !== rule.id);
          return {
            ...p,
            rules: updatedRules,
          };
        }
        return p;
      }));
      if (selectedPolicy && (selectedPolicy.id === rule.policy_id || selectedPolicy.policyId === rule.policy_id)) {
        setSelectedPolicy(prev => prev ? {
          ...prev,
          rules: (prev.rules || []).filter(r => r.id !== rule.id),
        } : null);
      }
      await loadData();
    } else {
      alert('Error eliminando la regla del motor PDP.');
    }
  };

  // Borrado de Contenedor Maestro de Política
  const handleDeletePolicy = async (policy: Policy) => {
    const ruleCount = policy.rules?.length || 0;
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la política contenedora "${policy.name}"?\n\nADVERTENCIA: Esta acción eliminará permanentemente la política y todas sus ${ruleCount} reglas asociadas del motor PDP.`
    );
    if (!confirmed) return;

    const targetPolicyId = policy.policyId || policy.id;
    const ok = await api.deletePolicy(targetPolicyId);
    if (ok) {
      showToast(`Política "${policy.name}" y sus reglas han sido eliminadas.`);
      if (selectedPolicy && (selectedPolicy.id === targetPolicyId || selectedPolicy.policyId === targetPolicyId)) {
        setSelectedPolicy(null);
      }
      await loadData();
    } else {
      alert('Error eliminando la política del catálogo.');
    }
  };

  // Probar en Sandbox / Playground
  const handleTestRuleInPlayground = (rule: PolicyRuleItem) => {
    const testPayload = {
      action: rule.action_name && rule.action_name !== '*' ? rule.action_name : 'create_quote',
      context: rule.conditions || { amount: 2500 },
    };
    try {
      sessionStorage.setItem('agentguard_test_payload', JSON.stringify(testPayload));
    } catch {
      // ignore
    }
    window.location.hash = '#playground';
  };

  const handleTestPolicyInPlayground = (policy: Policy) => {
    const primaryRule = policy.rules && policy.rules[0];
    const testPayload = {
      action: primaryRule?.action_name || (policy.action !== 'Todas (*)' ? policy.action : 'create_quote'),
      context: primaryRule?.conditions || policy.rawConditions || { amount: 2500 },
    };
    try {
      sessionStorage.setItem('agentguard_test_payload', JSON.stringify(testPayload));
    } catch {
      // ignore
    }
    window.location.hash = '#playground';
  };

  // Copiar identificador
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Lista única de agentes para filtro
  const uniqueAgents = Array.from(new Set([
    ...policies.map(p => p.agent),
    ...policies.flatMap(p => (p.rules || []).map(r => r.agent_name)),
    ...agents.map(a => a.name),
  ].filter(Boolean)));

  // Filtrado Jerárquico de Políticas
  const filteredPolicies = policies.filter(p => {
    const term = searchTerm.toLowerCase();
    const rules = p.rules || [];

    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      p.agent.toLowerCase().includes(term) ||
      p.action.toLowerCase().includes(term) ||
      p.condition.toLowerCase().includes(term) ||
      rules.some(r => 
        (r.action_name && r.action_name.toLowerCase().includes(term)) ||
        (r.agent_name && r.agent_name.toLowerCase().includes(term)) ||
        JSON.stringify(r.conditions || {}).toLowerCase().includes(term)
      );

    const matchesAgent = agentFilter === 'ALL' || 
      p.agent.toLowerCase() === agentFilter.toLowerCase() ||
      rules.some(r => r.agent_name?.toLowerCase() === agentFilter.toLowerCase());

    const matchesDecision = decisionFilter === 'ALL' ||
      p.decision === decisionFilter ||
      rules.some(r => r.effect === decisionFilter);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesAgent && matchesDecision && matchesStatus;
  });

  // Métricas y conteos dinámicos
  let totalRulesCount = 0;
  let allowRulesCount = 0;
  let hitlRulesCount = 0;
  let denyRulesCount = 0;

  filteredPolicies.forEach(p => {
    const rules = p.rules && p.rules.length > 0 ? p.rules : [];
    if (rules.length === 0) {
      totalRulesCount += 1;
      if (p.decision === 'ALLOW') allowRulesCount += 1;
      else if (p.decision === 'REQUIRE_APPROVAL') hitlRulesCount += 1;
      else if (p.decision === 'DENY') denyRulesCount += 1;
    } else {
      rules.forEach(r => {
        totalRulesCount += 1;
        if (r.effect === 'ALLOW') allowRulesCount += 1;
        else if (r.effect === 'REQUIRE_APPROVAL') hitlRulesCount += 1;
        else if (r.effect === 'DENY') denyRulesCount += 1;
      });
    }
  });

  // Cálculo de Cobertura de Gobernanza
  const totalActions = toolActions.length || 5;
  const coveredActionsList = toolActions.filter(act => 
    policies.some(p => 
      (p.rules || []).some(r => r.action_name?.toLowerCase() === act.action_name.toLowerCase()) ||
      p.action.toLowerCase() === act.action_name.toLowerCase()
    )
  );
  const uncoveredActionsList = toolActions.filter(act => 
    !policies.some(p => 
      (p.rules || []).some(r => r.action_name?.toLowerCase() === act.action_name.toLowerCase()) ||
      p.action.toLowerCase() === act.action_name.toLowerCase()
    )
  );
  const coveragePercent = totalActions > 0 
    ? Math.round((coveredActionsList.length / totalActions) * 100) 
    : 90;

  // Paginación
  const totalPages = Math.ceil(filteredPolicies.length / pageSize) || 1;
  const paginatedPolicies = filteredPolicies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, agentFilter, decisionFilter, statusFilter]);

  // Badge de Decisión en Español
  const getDecisionBadge = (dec: PolicyDecision) => {
    const label = DECISION_LABELS[dec] || dec;
    switch (dec) {
      case 'DENY':
        return (
          <span className="badge badge-danger">
            <span className="badge-dot" />
            <span>{label} (DENY)</span>
          </span>
        );
      case 'REQUIRE_APPROVAL':
        return (
          <span className="badge badge-warning">
            <span className="badge-dot" />
            <span>{label} (HITL)</span>
          </span>
        );
      case 'ALLOW':
      default:
        return (
          <span className="badge badge-success">
            <span className="badge-dot" />
            <span>{label} (ALLOW)</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Notificación Toast */}
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

      {/* Modal: Desglose de Cobertura */}
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
                            if (policies.length > 0) {
                              setTargetPolicyForRule(policies[0]);
                              setNewRuleActionId(act.id);
                              setIsCoverageModalOpen(false);
                              setIsAddRuleModalOpen(true);
                            } else {
                              setSelectedActionId(act.id);
                              setName(`Regla para ${act.action_name}`);
                              setIsCoverageModalOpen(false);
                              setIsModalOpen(true);
                            }
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

      {/* Slide-over Drawer: Detalle e Inspección de Política y sus Reglas */}
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
              maxWidth: '520px',
              height: '100%',
              backgroundColor: '#0F172A',
              borderLeft: '1px solid #334155',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              gap: '18px',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Drawer */}
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
                  color: '#38BDF8',
                }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>
                    {selectedPolicy.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
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
                    <span className={selectedPolicy.status === 'Active' ? 'badge badge-success' : 'badge badge-warning'}>
                      <span className="badge-dot" />
                      <span>{selectedPolicy.status === 'Active' ? 'Activa' : 'Inactiva'}</span>
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

            {/* Identificador UUID de Política */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Identificador de Política (UUID)
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

            {/* Estado de Gobernanza con Switch */}
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
                    <span>{selectedPolicy.status === 'Active' ? 'Activa' : 'Inactiva'}</span>
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

            {/* Descripción / Alcance */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Alcance y Justificación
              </label>
              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5', backgroundColor: '#1E293B', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
                {selectedPolicy.description || 'Política de autorización determinista perimetral.'}
              </div>
            </div>

            {/* Reglas Deterministas Asociadas (Jerárquicas) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Reglas Asociadas ({selectedPolicy.rules?.length || 0})
                </label>
                <button
                  onClick={() => handleOpenAddRuleModal(selectedPolicy)}
                  className="btn btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '11px', gap: '4px', color: '#38BDF8' }}
                >
                  <Plus size={11} />
                  <span>+ Añadir regla</span>
                </button>
              </div>

              {(!selectedPolicy.rules || selectedPolicy.rules.length === 0) ? (
                <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#1E293B', borderRadius: '8px', border: '1px dashed #334155', color: '#94A3B8', fontSize: '12px' }}>
                  No hay reglas hijas configuradas en esta política.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedPolicy.rules.map(rule => (
                    <div 
                      key={rule.id}
                      style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Zap size={14} color="#38BDF8" />
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#F8FAFC' }}>
                            {rule.action_name || '*'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getDecisionBadge(rule.effect)}
                          <button
                            onClick={() => handleDeleteRule(rule, selectedPolicy.name)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#F87171',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                            title="Eliminar regla individual"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Bot size={12} />
                          {rule.agent_name || 'Global / Multi-agente'}
                        </span>
                        <span>Prioridad: {rule.priority}</span>
                      </div>

                      {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                        <pre style={{
                          backgroundColor: '#020617',
                          border: '1px solid #334155',
                          borderRadius: '4px',
                          padding: '6px 8px',
                          color: '#38BDF8',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          margin: 0,
                          overflowX: 'auto',
                        }}>
                          {JSON.stringify(rule.conditions, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de Acción Final del Drawer */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleTestPolicyInPlayground(selectedPolicy)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              >
                <Play size={15} fill="#FFFFFF" />
                <span>Probar esta política en Playground</span>
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
                }}
              >
                <Trash2 size={15} />
                <span>Eliminar Política Completa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Nueva Política */}
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
                    Nueva Política de Gobernanza
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Contenedor maestro evaluado en tiempo de ejecución por el Motor PDP.
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
                  Descripción / Propósito
                </label>
                <input
                  type="text"
                  placeholder="ej. Políticas para límites transaccionales de agentes de finanzas"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Acción Atómica Inicial (ToolAction)
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
                  <option value="">Sin regla inicial (solo política)</option>
                  {toolActions.map(act => (
                    <option key={act.id} value={act.id}>
                      {act.action_name} ({act.risk_level})
                    </option>
                  ))}
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
                    <option value="ALLOW">Permitir (ALLOW)</option>
                    <option value="REQUIRE_APPROVAL">Requiere Aprobación (HITL)</option>
                    <option value="DENY">Denegar (DENY)</option>
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

      {/* Modal: Añadir Regla a Política Específica */}
      {isAddRuleModalOpen && targetPolicyForRule && (
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
            maxWidth: '520px',
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
                  <Zap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
                    Añadir Regla a "{targetPolicyForRule.name}"
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Regla atómica determinista evaluada bajo este contenedor de políticas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddRuleModalOpen(false);
                  setTargetPolicyForRule(null);
                }}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRuleSubmit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Acción Atómica a Gobernar (ToolAction) *
                </label>
                <select
                  required
                  value={newRuleActionId}
                  onChange={(e) => setNewRuleActionId(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Agente Destino (Opcional)
                </label>
                <select
                  value={newRuleAgentId}
                  onChange={(e) => setNewRuleAgentId(e.target.value)}
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
                  <option value="">Global / Todos los agentes (Cualquiera)</option>
                  {agents.map(ag => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.identifier})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                    Decisión del PDP (Effect) *
                  </label>
                  <select
                    value={newRuleDecision}
                    onChange={(e) => setNewRuleDecision(e.target.value as PolicyDecision)}
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
                    <option value="ALLOW">Permitido (ALLOW)</option>
                    <option value="REQUIRE_APPROVAL">Requiere Aprobación (HITL)</option>
                    <option value="DENY">Denegado (DENY)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                    Prioridad (1 - 1000) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={newRulePriority}
                    onChange={(e) => setNewRulePriority(Number(e.target.value))}
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
                  rows={3}
                  value={newRuleConditions}
                  onChange={(e) => setNewRuleConditions(e.target.value)}
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
                  onClick={() => {
                    setIsAddRuleModalOpen(false);
                    setTargetPolicyForRule(null);
                  }}
                  className="btn btn-secondary"
                  disabled={isSubmittingRule}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingRule}
                >
                  {isSubmittingRule ? 'Guardando...' : 'Añadir Regla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cabecera Principal */}
      <Header 
        title="Políticas de Gobernanza" 
        subtitle="Define y aplica políticas jerárquicas y reglas deterministas de autorización evaluadas por el Motor PDP."
        actionButton={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Nueva Política</span>
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Banner de Cobertura de Gobernanza */}
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
                Cobertura de Gobernanza: {coveragePercent}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--brand-primary)' }}>
                {uncoveredActionsList.length === 0 
                  ? 'Todas las acciones atómicas del tenant cuentan con reglas de gobernanza.'
                  : `${uncoveredActionsList.length} de ${totalActions} acciones registradas no tienen regla explícita y aplicarán denegación por defecto (Fail-Closed DENY).`}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsCoverageModalOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Revisar cobertura
          </button>
        </div>

        {/* Barra de Filtros y Herramientas */}
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
          {/* Buscador */}
          <div className="input-search" style={{ flex: 1, minWidth: '220px', maxWidth: '340px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por política, acción, agente o condición..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Controles Expandir / Colapsar Todo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={expandAll}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                title="Expandir todas las políticas"
              >
                Expandir todas
              </button>
              <button
                onClick={collapseAll}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                title="Colapsar todas las políticas"
              >
                Colapsar todas
              </button>
            </div>

            {/* Filtro: Agente */}
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
              <option value="ALL">Todos los agentes</option>
              {uniqueAgents.map(ag => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>

            {/* Filtro: Decisión */}
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
              <option value="ALL">Todas las decisiones</option>
              <option value="ALLOW">Permitido (ALLOW)</option>
              <option value="REQUIRE_APPROVAL">Requiere Aprobación (HITL)</option>
              <option value="DENY">Denegado (DENY)</option>
            </select>

            {/* Filtro: Estado */}
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
              <option value="ALL">Todos los estados</option>
              <option value="Active">Activa</option>
              <option value="Inactive">Inactiva</option>
            </select>
          </div>
        </div>

        {/* Lista Jerárquica de Políticas y Reglas */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
        }}>
          {paginatedPolicies.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron políticas que coincidan con los filtros seleccionados.
            </div>
          ) : (
            paginatedPolicies.map((policy) => {
              const isExpanded = expandedPolicies.has(policy.id);
              const policyRules: PolicyRuleItem[] = policy.rules || [];

              return (
                <div 
                  key={policy.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Fila Contenedora Maestra de Política */}
                  <div 
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'rgba(56, 189, 248, 0.03)' : 'transparent',
                    }}
                    onClick={() => toggleExpand(policy.id)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(56, 189, 248, 0.03)' : 'transparent'}
                  >
                    {/* Izquierda: Chevron + Icono + Nombre + Tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <button 
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(policy.id);
                        }}
                        title={isExpanded ? "Colapsar reglas" : "Expandir reglas"}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>

                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: policy.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.15)',
                        border: `1px solid ${policy.status === 'Active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(100, 116, 139, 0.25)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: policy.status === 'Active' ? '#34D399' : '#94A3B8',
                        flexShrink: 0,
                      }}>
                        <Shield size={18} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                            {policy.name}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            color: '#38BDF8',
                            fontWeight: 600,
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                          }}>
                            Prioridad {policy.priority || 100}
                          </span>
                          <span className={policy.status === 'Active' ? 'badge badge-success' : 'badge badge-warning'}>
                            <span className="badge-dot" />
                            <span>{policy.status === 'Active' ? 'Activa' : 'Inactiva'}</span>
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(148, 163, 184, 0.12)',
                            color: '#CBD5E1',
                            fontWeight: 600,
                          }}>
                            {policyRules.length} {policyRules.length === 1 ? 'regla' : 'reglas'}
                          </span>
                        </div>
                        {policy.description && (
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {policy.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Derecha: Botones de Acción Maestro */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenAddRuleModal(policy)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px', gap: '5px', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                        title="Añadir regla determinista a esta política"
                      >
                        <Plus size={13} />
                        <span>+ Añadir Regla</span>
                      </button>

                      <button
                        onClick={() => setSelectedPolicy(policy)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px', gap: '5px' }}
                        title="Inspeccionar política en detalle"
                      >
                        <Layers size={13} />
                        <span>Inspeccionar</span>
                      </button>

                      <button
                        onClick={() => handleTogglePolicyStatus(policy)}
                        disabled={isTogglingStatus}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px', gap: '5px' }}
                        title={policy.status === 'Active' ? 'Desactivar política' : 'Activar política'}
                      >
                        <Power size={13} color={policy.status === 'Active' ? '#F59E0B' : '#10B981'} />
                        <span>{policy.status === 'Active' ? 'Desactivar' : 'Activar'}</span>
                      </button>

                      <button
                        onClick={() => handleDeletePolicy(policy)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#F87171',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        title="Eliminar política completa y todas sus reglas asociadas"
                      >
                        <Trash2 size={13} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-tabla / Sección Jerárquica de Reglas Hijas */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 20px 16px 54px',
                      backgroundColor: 'rgba(15, 23, 42, 0.4)',
                      borderTop: '1px dashed var(--border-subtle)',
                    }}>
                      {policyRules.length === 0 ? (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center',
                          backgroundColor: 'rgba(30, 41, 59, 0.5)',
                          borderRadius: '8px',
                          marginTop: '12px',
                          border: '1px dashed rgba(100, 116, 139, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Esta política no tiene reglas deterministas asignadas. Todas las solicitudes evaluadas caerán en Fail-Closed (DENY).
                          </span>
                          <button
                            onClick={() => handleOpenAddRuleModal(policy)}
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '5px 12px', gap: '6px' }}
                          >
                            <Plus size={13} />
                            <span>+ Añadir primera regla</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          marginTop: '12px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(51, 65, 85, 0.6)',
                          backgroundColor: '#0F172A',
                        }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#1E293B', borderBottom: '1px solid #334155' }}>
                                <th style={{ padding: '9px 14px', color: '#94A3B8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>ACCIÓN ATÓMICA</th>
                                <th style={{ padding: '9px 14px', color: '#94A3B8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>AGENTE</th>
                                <th style={{ padding: '9px 14px', color: '#94A3B8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>CONDICIÓN (JSONB)</th>
                                <th style={{ padding: '9px 14px', color: '#94A3B8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>DECISIÓN</th>
                                <th style={{ padding: '9px 14px', color: '#94A3B8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>PRIORIDAD</th>
                                <th style={{ padding: '9px 14px', textAlign: 'right', color: '#94A3B8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>ACCIONES DE REGLA</th>
                              </tr>
                            </thead>
                            <tbody>
                              {policyRules.map((rule) => (
                                <tr
                                  key={rule.id}
                                  style={{
                                    borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                                    transition: 'background-color 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.7)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  {/* Acción */}
                                  <td style={{ padding: '10px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Zap size={14} color="#38BDF8" />
                                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#F8FAFC' }}>
                                        {rule.action_name || '*'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Agente */}
                                  <td style={{ padding: '10px 14px', color: '#CBD5E1' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Bot size={13} color="#94A3B8" />
                                      <span>{rule.agent_name || 'Global / Multi-agente'}</span>
                                    </div>
                                  </td>

                                  {/* Condición */}
                                  <td style={{ padding: '10px 14px' }}>
                                    <span className="code-pill" style={{ fontSize: '11px' }}>
                                      {rule.conditions && Object.keys(rule.conditions).length > 0
                                        ? JSON.stringify(rule.conditions)
                                        : 'Sin restricciones'}
                                    </span>
                                  </td>

                                  {/* Decisión */}
                                  <td style={{ padding: '10px 14px' }}>
                                    {getDecisionBadge(rule.effect)}
                                  </td>

                                  {/* Prioridad de regla */}
                                  <td style={{ padding: '10px 14px', color: '#94A3B8' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#38BDF8' }}>
                                      {rule.priority}
                                    </span>
                                  </td>

                                  {/* Acciones por regla: Playground + Eliminar Regla Desacoplada */}
                                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                      <button
                                        onClick={() => handleTestRuleInPlayground(rule)}
                                        className="btn btn-secondary"
                                        style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
                                        title="Probar esta regla en Playground"
                                      >
                                        <Play size={12} fill="#38BDF8" color="#38BDF8" />
                                        <span>Probar</span>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteRule(rule, policy.name)}
                                        style={{
                                          padding: '4px 8px',
                                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          color: '#F87171',
                                          borderRadius: '6px',
                                          fontSize: '11px',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                        }}
                                        title="Eliminar únicamente esta regla determinista"
                                      >
                                        <Trash2 size={12} />
                                        <span>Eliminar regla</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Pie de Tabla: Contadores y Paginación */}
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
              </strong> de <strong style={{ color: 'var(--text-primary)' }}>{policies.length}</strong> políticas mostradas ({totalRulesCount} reglas en total) · <span style={{ color: '#10B981', fontWeight: 600 }}>{allowRulesCount} ALLOW</span> · <span style={{ color: '#F59E0B', fontWeight: 600 }}>{hitlRulesCount} HITL</span> · <span style={{ color: '#EF4444', fontWeight: 600 }}>{denyRulesCount} DENY</span>
            </div>

            {/* Controles de Paginación */}
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
