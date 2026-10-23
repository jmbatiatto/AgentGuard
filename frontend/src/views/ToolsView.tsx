import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Tool } from '../types/domain';
import { Plus, Search, ChevronDown, MoreHorizontal, X, Wrench, CheckCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { mockTools } from '../data/mockData';

export const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState('REST');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [description, setDescription] = useState('');
  const [actionName, setActionName] = useState('');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadTools = async () => {
    const data = await api.getTools();
    if (data && data.length > 0) setTools(data);
  };

  useEffect(() => {
    loadTools();
  }, []);

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

      setToastMessage(`Herramienta "${name}" conectada exitosamente a AgentGuard`);
      setTimeout(() => setToastMessage(null), 4000);

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

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
        }}>
          {/* Search Input */}
          <div className="input-search" style={{ flex: 1, maxWidth: '380px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search tools and actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary">
              <span>All agents</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            <button className="btn btn-secondary">
              <span>All statuses</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>
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
                <th style={{ padding: '12px 18px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.map((tool) => (
                <tr 
                  key={tool.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.1s ease',
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
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {tool.name}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                    {tool.description}
                  </td>

                  {/* Available Actions (Monospace Dot-Separated) */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}>
                      {tool.availableActions.join(' · ')}
                    </span>
                  </td>

                  {/* Assigned Agent */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {tool.assignedAgent}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span className={tool.status === 'Active' ? 'badge badge-success' : 'badge badge-warning'}>
                      <span className="badge-dot" />
                      <span>{tool.status}</span>
                    </span>
                  </td>

                  {/* More Menu */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Footer */}
          <div style={{
            padding: '12px 18px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            5 connected tools · 11 available actions
          </div>
        </div>
      </div>
    </div>
  );
};
