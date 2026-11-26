import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Agent, AgentStatus, Tool } from '../types/domain';
import { AGENT_STATUS_LABELS, ROLE_LABELS } from '../constants/labels';
import { 
  Plus, 
  Search, 
  Lock,
  ChevronRight, 
  X, 
  Bot, 
  Copy, 
  Check, 
  Power, 
  Trash2, 
  Clock 
} from 'lucide-react';
import { Header } from '../components/Header';
import { QuickSetupWizard } from '../components/QuickSetupWizard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonRow } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const AgentsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [toolFilter, setToolFilter] = useState('All');

  // Modal State (Register Agent & Quick Setup Wizard)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [statusVal, setStatusVal] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer Lateral State (Agent Details)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAgents();
      setAgents(data || []);
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Error al cargar agentes desde el servidor');
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
    api.getTools()
      .then(tools => setAvailableTools(tools || []))
      .catch((err: any) => {
        toast.error(err?.detail || err?.message || 'Error al cargar herramientas disponibles');
      });
  }, []);

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.canConfigurePolicies) {
      toast.error('Requiere rol ADMIN para registrar agentes.');
      return;
    }
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createAgent({
        name: name.trim(),
        purpose: purpose.trim() || undefined,
        status: statusVal,
        tool_ids: selectedTools,
      });

      toast.success(`Agente "${name}" registrado exitosamente en PostgreSQL`);

      // Reset form & close modal
      setName('');
      setPurpose('');
      setSelectedTools([]);
      setIsModalOpen(false);

      // Refresh list
      await loadAgents();
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Error al registrar el agente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  // Acciones en Drawer de Detalle
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleToggleAgentStatus = async (agent: Agent) => {
    if (!currentUser.canConfigurePolicies) {
      toast.error('Requiere rol ADMIN para modificar el estado del agente.');
      return;
    }
    setIsUpdatingStatus(true);
    const newStatus: AgentStatus = agent.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateAgentStatus(agent.id, newStatus);
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: newStatus } : a));
      setSelectedAgent(prev => prev && prev.id === agent.id ? { ...prev, status: newStatus } : prev);
      toast.success(`Estado de "${agent.name}" actualizado a ${AGENT_STATUS_LABELS[newStatus]}`);
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Error al actualizar el estado del agente');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!currentUser.canConfigurePolicies) {
      toast.error('Requiere rol ADMIN para eliminar agentes.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al agente "${agent.name}"?`)) return;
    try {
      await api.deleteAgent(agent.id);
      setAgents(prev => prev.filter(a => a.id !== agent.id));
      setSelectedAgent(null);
      toast.success(`Agente "${agent.name}" eliminado correctamente`);
    } catch (err: any) {
      toast.error(err?.detail || err?.message || 'Error al eliminar el agente');
    }
  };

  // Extraer valores únicos para los dropdowns
  const uniqueOwners = ['All', ...Array.from(new Set(agents.map(a => a.owner)))];
  const uniqueTools = ['All', ...Array.from(new Set(agents.flatMap(a => a.assignedTools)))];

  // Filtrado reactivo multicriterio
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.identifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;
    const matchesOwner = ownerFilter === 'All' || agent.owner === ownerFilter;
    const matchesTool = toolFilter === 'All' || agent.assignedTools.includes(toolFilter);
    return matchesSearch && matchesStatus && matchesOwner && matchesTool;
  });

  // Paginación reactiva
  const totalPages = Math.ceil(filteredAgents.length / pageSize) || 1;
  const paginatedAgents = filteredAgents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ownerFilter, toolFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Drawer Lateral: Detalle del Agente */}
      {selectedAgent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          display: 'flex',
          justifyContent: 'flex-end',
        }} onClick={() => setSelectedAgent(null)}>
          <div 
            style={{
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              backgroundColor: 'var(--bg-card)',
              borderLeft: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              gap: '20px',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--avatar-bg)',
                  border: '1px solid var(--avatar-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--avatar-text)',
                }}>
                  {selectedAgent.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedAgent.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {selectedAgent.type}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Identificador UUID */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Identificador Oficial (UUID)
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-app)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--brand-primary)',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedAgent.id}</span>
                <button
                  onClick={() => handleCopyId(selectedAgent.id)}
                  title="Copiar ID"
                  style={{ background: 'none', border: 'none', color: copiedId ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Estado Operativo */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Estado de Gobernanza
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span className={selectedAgent.status === 'ACTIVE' ? 'badge badge-success' : selectedAgent.status === 'SUSPENDED' ? 'badge badge-danger' : 'badge badge-secondary'}>
                  <span className="badge-dot" />
                  <span>{AGENT_STATUS_LABELS[selectedAgent.status] || selectedAgent.status}</span>
                </span>
                {currentUser.canConfigurePolicies && (
                  <button
                    onClick={() => handleToggleAgentStatus(selectedAgent)}
                    disabled={isUpdatingStatus}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Power size={12} color={selectedAgent.status === 'ACTIVE' ? '#EF4444' : '#10B981'} />
                    <span>{selectedAgent.status === 'ACTIVE' ? 'Suspender Agente' : 'Activar Agente'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sponsor y Equipo */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Sponsor Responsable
              </label>
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px', color: 'var(--text-primary)' }}>
                {selectedAgent.owner}
              </div>
            </div>

            {/* Herramientas Asignadas */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Herramientas Autorizadas (AgentTool N:N)
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                {selectedAgent.assignedTools.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sin herramientas asignadas</span>
                ) : (
                  selectedAgent.assignedTools.map(t => (
                    <span key={t} className="code-pill">
                      {t}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Acciones de Footer del Drawer */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => {
                  window.location.hash = '#traces';
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
              >
                <Clock size={15} />
                <span>Ver Trazas de este Agente</span>
              </button>
              {currentUser.canConfigurePolicies && (
                <button
                  onClick={() => handleDeleteAgent(selectedAgent)}
                  style={{
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={15} />
                  <span>Eliminar Agente</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register Agent */}
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
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '540px',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--brand-primary)',
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Registrar Nuevo Agente de IA
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Identidad gobernada por AgentGuard con aislamiento multi-tenant.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterAgent} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nombre del Agente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Billing Auditor Copilot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Propósito de Negocio
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Revisión autónoma de facturas y reconciliación contable."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Estado Inicial
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="status" 
                      checked={statusVal === 'ACTIVE'} 
                      onChange={() => setStatusVal('ACTIVE')} 
                    />
                    <span>Activo</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="status" 
                      checked={statusVal === 'SUSPENDED'} 
                      onChange={() => setStatusVal('SUSPENDED')} 
                    />
                    <span>Suspendido</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Herramientas Autorizadas (AgentTool N:N)
                </label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                }}>
                  {availableTools.map(tool => (
                    <label 
                      key={tool.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '12px', 
                        color: 'var(--text-primary)', 
                        cursor: 'pointer' 
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTools.includes(tool.id)}
                        onChange={() => toggleTool(tool.id)}
                      />
                      <span style={{ fontWeight: 600 }}>{tool.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({tool.availableActions?.join(', ') || 'REST'})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
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
                  {isSubmitting ? 'Registrando...' : 'Registrar Agente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Header 
        title="Agentes" 
        actionButton={
          currentUser.canConfigurePolicies ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsWizardOpen(true)}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Conectar agente</span>
              </button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} strokeWidth={2.5} />
                <span>Registrar agente</span>
              </button>
            </div>
          ) : (
            <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}>
              <Lock size={13} />
              <span>Solo lectura ({ROLE_LABELS[currentUser.role] || currentUser.role})</span>
            </span>
          )
        }
      />
      {currentUser.canConfigurePolicies && (
        <QuickSetupWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={() => {
            loadAgents();
            api
              .getTools()
              .then((tools) => setAvailableTools(tools || []))
              .catch(() => {});
          }}
        />
      )}

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Table Filters & Search Bar */}
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
          <div className="input-search" style={{ flex: 1, minWidth: '260px', maxWidth: '380px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Real Interactive Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter by Owner */}
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="btn btn-secondary"
              style={{ cursor: 'pointer', outline: 'none', padding: '7px 12px', fontSize: '12px' }}
            >
              {uniqueOwners.map(owner => (
                <option key={owner} value={owner} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {owner === 'All' ? 'Todos los owners' : owner}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="btn btn-secondary"
              style={{ cursor: 'pointer', outline: 'none', padding: '7px 12px', fontSize: '12px' }}
            >
              <option value="ALL" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>Todos los estados</option>
              <option value="ACTIVE" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>{AGENT_STATUS_LABELS.ACTIVE}s</option>
              <option value="SUSPENDED" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>{AGENT_STATUS_LABELS.SUSPENDED}s</option>
              <option value="REVOKED" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>{AGENT_STATUS_LABELS.REVOKED}s</option>
            </select>

            {/* Filter by Tool */}
            <select
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value)}
              className="btn btn-secondary"
              style={{ cursor: 'pointer', outline: 'none', padding: '7px 12px', fontSize: '12px' }}
            >
              {uniqueTools.map(tool => (
                <option key={tool} value={tool} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {tool === 'All' ? 'Todas las herramientas' : tool}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Agents Table */}
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
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>AGENTE</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>IDENTIFICADOR</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>PROPIETARIO</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>HERRAMIENTAS ASIGNADAS</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>ESTADO</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>ÚLTIMA ACTIVIDAD</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={7} />
                ))
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px' }}>
                    <EmptyState
                      icon={<Bot size={32} />}
                      title="No hay agentes registrados"
                      description="Aún no se han configurado identidades de agentes de IA en esta organización."
                      action={currentUser.canConfigurePolicies ? {
                        label: 'Registrar nuevo agente',
                        icon: <Plus size={15} />,
                        onClick: () => setIsModalOpen(true),
                      } : undefined}
                    />
                  </td>
                </tr>
              ) : paginatedAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px' }}>
                    <EmptyState
                      icon={<Search size={28} />}
                      title="Sin coincidencias"
                      description="No se encontraron agentes que coincidan con los filtros seleccionados."
                    />
                  </td>
                </tr>
              ) : (
                paginatedAgents.map((agent) => (
                  <tr 
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Agent Name + Avatar */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--avatar-bg)',
                          border: '1px solid var(--avatar-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--avatar-text)',
                          flexShrink: 0,
                        }}>
                          {agent.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {agent.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {agent.type}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Identifier (Monospace) */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {agent.identifier}
                      </span>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {agent.owner}
                    </td>

                    {/* Assigned Tools Tags */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {agent.assignedTools.map(tool => (
                          <span key={tool} className="code-pill">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className={agent.status === 'ACTIVE' ? 'badge badge-success' : agent.status === 'SUSPENDED' ? 'badge badge-danger' : 'badge badge-secondary'}>
                        <span className="badge-dot" />
                        <span>{AGENT_STATUS_LABELS[agent.status] || agent.status}</span>
                      </span>
                    </td>

                    {/* Last Activity */}
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {agent.lastActivity}
                    </td>

                    {/* View Details Link */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgent(agent);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#38BDF8',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>Detalles</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Table Footer with Reactive Pagination */}
          <div style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <span>
              Mostrando {filteredAgents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredAgents.length)} de {filteredAgents.length} agentes
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '5px 12px', fontSize: '12px' }}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 4px' }}>
                Página {currentPage} de {totalPages}
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '5px 12px', fontSize: '12px' }}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
