import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Agent, Tool } from '../types/domain';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  X, 
  Bot, 
  CheckCircle, 
  Copy, 
  Check, 
  Power, 
  Trash2, 
  Clock 
} from 'lucide-react';
import { Header } from '../components/Header';
import { mockAgents } from '../data/mockData';

export const AgentsView: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [toolFilter, setToolFilter] = useState('All');

  // Modal State (Register Agent)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [statusVal, setStatusVal] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer Lateral State (Agent Details)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadAgents = async () => {
    const data = await api.getAgents();
    if (data && data.length > 0) setAgents(data);
  };

  useEffect(() => {
    loadAgents();
    api.getTools().then(tools => setAvailableTools(tools));
  }, []);

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createAgent({
        name: name.trim(),
        purpose: purpose.trim() || undefined,
        status: statusVal,
        tool_ids: selectedTools,
      });

      setToastMessage(`Agente "${name}" registrado exitosamente en PostgreSQL`);
      setTimeout(() => setToastMessage(null), 4000);

      // Reset form & close modal
      setName('');
      setPurpose('');
      setSelectedTools([]);
      setIsModalOpen(false);

      // Refresh list
      await loadAgents();
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
    setIsUpdatingStatus(true);
    const newStatus = agent.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.updateAgentStatus(agent.id, newStatus);
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: newStatus } : a));
      setSelectedAgent(prev => prev && prev.id === agent.id ? { ...prev, status: newStatus } : prev);
      setToastMessage(`Estado de "${agent.name}" actualizado a ${newStatus}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al agente "${agent.name}"?`)) return;
    try {
      await api.deleteAgent(agent.id);
      setAgents(prev => prev.filter(a => a.id !== agent.id));
      setSelectedAgent(null);
      setToastMessage(`Agente "${agent.name}" eliminado correctamente`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      alert("Error al eliminar el agente");
    }
  };

  // Extraer valores únicos para los dropdowns
  const uniqueOwners = ['All', ...Array.from(new Set(agents.map(a => a.owner)))];
  const uniqueTools = ['All', ...Array.from(new Set(agents.flatMap(a => a.assignedTools)))];

  // Filtrado reactivo multicriterio
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.identifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || agent.status === statusFilter;
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
              backgroundColor: '#0F172A',
              borderLeft: '1px solid #334155',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.7)',
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
                  {selectedAgent.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>
                    {selectedAgent.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    {selectedAgent.type}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Identificador UUID */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Identificador Oficial (UUID)
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
                color: '#38BDF8',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedAgent.id}</span>
                <button
                  onClick={() => handleCopyId(selectedAgent.id)}
                  title="Copiar ID"
                  style={{ background: 'none', border: 'none', color: copiedId ? '#34D399' : '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Estado Operativo */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Estado de Gobernanza
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E293B', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span className={selectedAgent.status === 'Active' ? 'badge badge-success' : 'badge badge-secondary'}>
                  <span className="badge-dot" />
                  <span>{selectedAgent.status}</span>
                </span>
                <button
                  onClick={() => handleToggleAgentStatus(selectedAgent)}
                  disabled={isUpdatingStatus}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Power size={12} color={selectedAgent.status === 'Active' ? '#EF4444' : '#10B981'} />
                  <span>{selectedAgent.status === 'Active' ? 'Suspender Agente' : 'Activar Agente'}</span>
                </button>
              </div>
            </div>

            {/* Sponsor y Equipo */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Sponsor Responsable
              </label>
              <div style={{ backgroundColor: '#1E293B', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', color: '#E2E8F0' }}>
                {selectedAgent.owner}
              </div>
            </div>

            {/* Herramientas Asignadas */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Herramientas Autorizadas (AgentTool N:N)
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: '#1E293B', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                {selectedAgent.assignedTools.length === 0 ? (
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Sin herramientas asignadas</span>
                ) : (
                  selectedAgent.assignedTools.map(t => (
                    <span key={t} className="code-pill" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
                      {t}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Acciones de Footer del Drawer */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid #1E293B' }}>
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
              <button
                onClick={() => handleDeleteAgent(selectedAgent)}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
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
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(56, 189, 248, 0.1)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '540px',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  borderRadius: '8px',
                  color: '#38BDF8',
                }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
                    Registrar Nuevo Agente de IA
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Identidad gobernada por AgentGuard con aislamiento multi-tenant.
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

            {/* Modal Form */}
            <form onSubmit={handleRegisterAgent} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
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
                  Propósito de Negocio
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Revisión autónoma de facturas y reconciliación contable."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Estado Inicial
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#E2E8F0', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="status" 
                      checked={statusVal === 'ACTIVE'} 
                      onChange={() => setStatusVal('ACTIVE')} 
                    />
                    <span>Activo</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#E2E8F0', cursor: 'pointer' }}>
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Herramientas Autorizadas (AgentTool N:N)
                </label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
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
                        color: '#E2E8F0', 
                        cursor: 'pointer' 
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTools.includes(tool.id)}
                        onChange={() => toggleTool(tool.id)}
                      />
                      <span style={{ fontWeight: 600 }}>{tool.name}</span>
                      <span style={{ color: '#94A3B8', fontSize: '11px' }}>({tool.availableActions?.join(', ') || 'REST'})</span>
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
                  {isSubmitting ? 'Registrando...' : 'Registrar Agente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Header 
        title="Agents" 
        subtitle="Manage registered AI agents and their capabilities."
        actionButton={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Register agent</span>
          </button>
        }
      />

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
                <option key={owner} value={owner} style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>
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
              <option value="All" style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>Todos los estados</option>
              <option value="Active" style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>Activos</option>
              <option value="Suspended" style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>Suspendidos</option>
            </select>

            {/* Filter by Tool */}
            <select
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value)}
              className="btn btn-secondary"
              style={{ cursor: 'pointer', outline: 'none', padding: '7px 12px', fontSize: '12px' }}
            >
              {uniqueTools.map(tool => (
                <option key={tool} value={tool} style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>
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
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>AGENT</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>IDENTIFIER</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>OWNER</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>ASSIGNED TOOLS</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>LAST ACTIVITY</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron agentes que coincidan con los filtros seleccionados.
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
                      <span className={agent.status === 'Active' ? 'badge badge-success' : 'badge badge-secondary'}>
                        <span className="badge-dot" />
                        <span>{agent.status}</span>
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
