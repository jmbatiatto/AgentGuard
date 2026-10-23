import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Tool } from '../types/domain';
import {
  Plus,
  Search,
  X,
  Wrench,
  CheckCircle,
  Copy,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  Radio,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { Header } from '../components/Header';
import { mockTools } from '../data/mockData';

export const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal Connect Tool State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState('REST');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [description, setDescription] = useState('');
  const [actionName, setActionName] = useState('');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer / Inspection State
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // New Action Form State inside Drawer
  const [newActionName, setNewActionName] = useState('');
  const [newActionRisk, setNewActionRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');
  const [newActionDesc, setNewActionDesc] = useState('');
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadTools = async () => {
    const data = await api.getTools();
    if (data && data.length > 0) {
      setTools(data);
      // Sync selected tool if open
      if (selectedTool) {
        const updated = data.find(t => t.id === selectedTool.id);
        if (updated) setSelectedTool(updated);
      }
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  // Connect new Tool
  const handleConnectTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !endpointUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createTool({
        name: name.trim(),
        protocol,
        endpoint_url: endpointUrl.trim(),
        description: description.trim() || undefined,
        actions: actionName.trim() ? [
          { action_name: actionName.trim(), risk_level: riskLevel }
        ] : undefined,
      });

      showToast(`Herramienta "${name}" conectada exitosamente a AgentGuard`);

      // Reset & close
      setName('');
      setEndpointUrl('');
      setDescription('');
      setActionName('');
      setRiskLevel('LOW');
      setIsModalOpen(false);

      await loadTools();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Action from Drawer
  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !newActionName.trim()) return;

    setIsAddingAction(true);
    setActionError(null);
    try {
      const res = await api.createToolAction({
        tool_id: selectedTool.id,
        action_name: newActionName.trim(),
        risk_level: newActionRisk,
        description: newActionDesc.trim() || undefined,
      });

      if (res.success) {
        showToast(`Acción "${newActionName.trim()}" agregada a ${selectedTool.name}`);
        setNewActionName('');
        setNewActionDesc('');
        setNewActionRisk('LOW');
        await loadTools();
      } else {
        setActionError(res.error || 'Error registrando acción');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error de comunicación');
    } finally {
      setIsAddingAction(false);
    }
  };

  // Delete Tool
  const handleDeleteTool = async (tool: Tool) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la herramienta "${tool.name}"?\nEsta acción es irreversible y removerá sus acciones atómicas asociadas.`
    );
    if (!confirmed) return;

    const res = await api.deleteTool(tool.id);
    if (res.success) {
      showToast(`Herramienta "${tool.name}" eliminada correctamente.`);
      setSelectedTool(null);
      await loadTools();
    } else {
      alert(`No se pudo eliminar: ${res.error}`);
    }
  };

  // Copy helpers
  const handleCopy = (text: string, type: 'id' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Unique agents list for filter dropdown
  const uniqueAgents = Array.from(
    new Set(
      tools
        .map(t => t.assignedAgent)
        .flatMap(a => a.split(',').map(s => s.trim()))
        .filter(Boolean)
    )
  );

  // Filtered tools
  const filteredTools = tools.filter(tool => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      tool.name.toLowerCase().includes(term) ||
      tool.description.toLowerCase().includes(term) ||
      tool.availableActions.some(act => act.toLowerCase().includes(term));

    const matchesStatus = 
      statusFilter === 'ALL' ||
      tool.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesAgent = 
      agentFilter === 'ALL' ||
      tool.assignedAgent.toLowerCase().includes(agentFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesAgent;
  });

  // Dynamic counts
  const totalActionsCount = tools.reduce((acc, t) => acc + (t.availableActions?.length || 0), 0);
  const filteredActionsCount = filteredTools.reduce((acc, t) => acc + (t.availableActions?.length || 0), 0);

  // Pagination
  const totalPages = Math.ceil(filteredTools.length / pageSize) || 1;
  const paginatedTools = filteredTools.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, agentFilter]);

  // Risk badge color helper
  const getRiskBadgeStyle = (risk?: string) => {
    const r = (risk || 'LOW').toUpperCase();
    switch (r) {
      case 'CRITICAL':
        return { color: '#FDA4AF', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'HIGH':
        return { color: '#FDBA74', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' };
      case 'MEDIUM':
        return { color: '#FCD34D', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'LOW':
      default:
        return { color: '#86EFAC', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
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

      {/* Drawer Lateral: Detalle e Inspección de Herramienta */}
      {selectedTool && (
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
          onClick={() => setSelectedTool(null)}
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
                  {selectedTool.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>
                    {selectedTool.name}
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
                      {selectedTool.protocol || 'REST'}
                    </span>
                    <span className={selectedTool.status === 'Active' ? 'badge badge-success' : 'badge badge-warning'} style={{ fontSize: '11px', padding: '2px 8px' }}>
                      <span className="badge-dot" />
                      <span>{selectedTool.status}</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTool(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                title="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Identificador UUID */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Tool UUID
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
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedTool.id}</span>
                <button
                  onClick={() => handleCopy(selectedTool.id, 'id')}
                  style={{ background: 'none', border: 'none', color: copiedId ? '#10B981' : '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                >
                  <Copy size={13} />
                  <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Endpoint Base URL */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Endpoint Base URL
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
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedTool.endpoint_url || 'https://api.empresa.internal/v1'}
                </span>
                <button
                  onClick={() => handleCopy(selectedTool.endpoint_url || 'https://api.empresa.internal/v1', 'url')}
                  style={{ background: 'none', border: 'none', color: copiedUrl ? '#10B981' : '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', flexShrink: 0 }}
                >
                  <Copy size={13} />
                  <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Descripción Funcional */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Descripción del Servicio
              </label>
              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.5', backgroundColor: '#1E293B', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
                {selectedTool.description}
              </div>
            </div>

            {/* Agentes Autorizados */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Agentes con Acceso Vinculado
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedTool.assignedAgent.split(',').map((ag, idx) => (
                  <span key={idx} style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Radio size={12} color="#38BDF8" />
                    <span>{ag.trim()}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Acciones Atómicas (ToolActions) */}
            <div style={{ borderTop: '1px solid #1E293B', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="#38BDF8" />
                  <span>Acciones Atómicas ({selectedTool.availableActions.length})</span>
                </label>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Granularidad PEP</span>
              </div>

              {/* Lista de Acciones con Badges de Riesgo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {selectedTool.actionsList && selectedTool.actionsList.length > 0 ? (
                  selectedTool.actionsList.map((act) => {
                    const badge = getRiskBadgeStyle(act.risk_level);
                    return (
                      <div 
                        key={act.id} 
                        style={{
                          backgroundColor: '#1E293B',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                            {act.action_name}
                          </div>
                          {act.description && (
                            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                              {act.description}
                            </div>
                          )}
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          textTransform: 'uppercase',
                          flexShrink: 0,
                        }}>
                          {act.risk_level}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  selectedTool.availableActions.map((actName, idx) => (
                    <div 
                      key={idx}
                      style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                        {actName}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        color: '#38BDF8',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                      }}>
                        STANDARD
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario Agregar Acción Atómica en Caliente */}
              <div style={{
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px dashed rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '12px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusCircle size={14} />
                  <span>Registrar Nueva Acción Atómica (Runtime)</span>
                </div>

                {actionError && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    fontSize: '11px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <AlertCircle size={14} />
                    <span>{actionError}</span>
                  </div>
                )}

                <form onSubmit={handleAddAction} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      placeholder="ej. batch_export"
                      value={newActionName}
                      onChange={(e) => setNewActionName(e.target.value)}
                      style={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <select
                      value={newActionRisk}
                      onChange={(e) => setNewActionRisk(e.target.value as any)}
                      style={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px 6px',
                        color: '#F8FAFC',
                        fontSize: '11px',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Descripción funcional de la acción (opcional)"
                    value={newActionDesc}
                    onChange={(e) => setNewActionDesc(e.target.value)}
                    style={{
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#CBD5E1',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={isAddingAction || !newActionName.trim()}
                    style={{
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background-color 0.15s ease',
                      opacity: isAddingAction ? 0.7 : 1,
                    }}
                  >
                    <Plus size={14} />
                    <span>{isAddingAction ? 'Guardando...' : 'Agregar Acción Atómica'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Botones de Acción Final */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  window.location.hash = '#traces';
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              >
                <ExternalLink size={15} />
                <span>Ver Trazas de esta Herramienta</span>
              </button>

              <button
                onClick={() => handleDeleteTool(selectedTool)}
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
                <span>Eliminar Herramienta del Catálogo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Connect Tool */}
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
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
                    Conectar Herramienta Externa
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    Registra una API perimetral protegida e interceptada por el PEP Gateway.
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
            <form onSubmit={handleConnectTool} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                    Nombre de la Herramienta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. SAP ERP Service"
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
                    Protocolo
                  </label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
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
                    <option value="REST">REST API</option>
                    <option value="gRPC">gRPC</option>
                    <option value="MCP">Model Context Protocol</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
                  Endpoint Base URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.empresa.internal/v1"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
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
                  Descripción Funcional
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Gestión de órdenes de compra, catálogo de repuestos y depósitos."
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
                    resize: 'none',
                  }}
                />
              </div>

              {/* Acción Atómica Inicial */}
              <div style={{
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                padding: '12px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', marginBottom: '8px' }}>
                  Acción Atómica Inicial (ToolAction)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="ej. query_orders"
                    value={actionName}
                    onChange={(e) => setActionName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
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
                  {isSubmitting ? 'Conectando...' : 'Conectar Herramienta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Header 
        title="Tools" 
        subtitle="Control the tools and resources available to your agents."
        actionButton={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Connect tool</span>
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
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
          <div className="input-search" style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search tools and actions..."
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
              {uniqueAgents.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
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
              <option value="Paused">Paused</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Tools Table */}
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
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>TOOL</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>DESCRIPTION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>AVAILABLE ACTIONS</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>ASSIGNED AGENT</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTools.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron herramientas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedTools.map((tool) => (
                  <tr 
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Tool Name + Avatar */}
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
                          {tool.initials}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                            {tool.name}
                          </span>
                          <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 500 }}>
                            {tool.protocol || 'REST'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {tool.description}
                      </div>
                    </td>

                    {/* Available Actions (Monospace Dot-Separated) */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>
                        {tool.availableActions.slice(0, 4).join(' · ')}
                        {tool.availableActions.length > 4 && ` (+${tool.availableActions.length - 4})`}
                      </span>
                    </td>

                    {/* Assigned Agent */}
                    <td style={{ padding: '14px 18px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tool.assignedAgent}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className={tool.status === 'Active' ? 'badge badge-success' : 'badge badge-warning'}>
                        <span className="badge-dot" />
                        <span>{tool.status}</span>
                      </span>
                    </td>

                    {/* More Menu */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setSelectedTool(tool)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px', gap: '4px' }}
                        title="Ver acciones y detalles"
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

          {/* Table Footer: Dynamic Counters & Pagination */}
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
                {filteredTools.length}
              </strong> de <strong style={{ color: 'var(--text-primary)' }}>{tools.length}</strong> herramientas conectadas · <strong style={{ color: 'var(--text-primary)' }}>{filteredActionsCount}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalActionsCount}</strong> acciones disponibles
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
