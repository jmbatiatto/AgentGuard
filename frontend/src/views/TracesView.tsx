import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Eye, X, Terminal, RefreshCw, Clock, UserCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { useAgentGuardWebSocket } from '../services/useAgentGuardWebSocket';
import type { ExecutionTrace, PolicyDecision } from '../types/domain';

export const TracesView: React.FC = () => {
  const [traces, setTraces] = useState<ExecutionTrace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [selectedTrace, setSelectedTrace] = useState<ExecutionTrace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTraces = async () => {
    setIsLoading(true);
    try {
      const data = await api.getExecutions();
      setTraces(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, []);

  // Suscripción WebSocket a nuevas ejecuciones en vivo
  useAgentGuardWebSocket({
    onNewExecution: (newTraceData) => {
      const formattedTrace: ExecutionTrace = {
        id: newTraceData.id,
        organizationId: newTraceData.organization_id,
        agentId: newTraceData.agent_id,
        agentName: newTraceData.agent_name || 'AI Agent',
        toolId: newTraceData.tool_id,
        toolName: newTraceData.tool_name || 'External Tool',
        actionName: newTraceData.action_name || 'execute',
        resource: newTraceData.resource || 'global/resource',
        requestContext: newTraceData.request_context || {},
        decision: newTraceData.decision as PolicyDecision,
        status: newTraceData.status || 'EXECUTED',
        evaluatedPolicyRuleId: newTraceData.evaluated_policy_rule_id,
        timestamp: newTraceData.timestamp,
        latencyMs: newTraceData.latency_ms || 22.0,
        approvalStatus: newTraceData.status === 'PENDING_APPROVAL' ? 'PENDING' : null,
      };

      setTraces(prev => [formattedTrace, ...prev]);
    },
    onResolvedApproval: (data) => {
      setTraces(prev => prev.map(t => {
        if (t.id === data.execution_id) {
          const isApproved = data.status === 'APPROVED';
          return {
            ...t,
            status: isApproved ? 'EXECUTED' : 'REJECTED',
            approvalStatus: data.status,
            resolutionReason: data.resolution_reason,
            approvalResolvedAt: data.resolved_at,
          };
        }
        return t;
      }));
      // Si el modal está abierto con la traza que acaba de resolverse, actualizarla también
      setSelectedTrace(prev => {
        if (prev && prev.id === data.execution_id) {
          const isApproved = data.status === 'APPROVED';
          return {
            ...prev,
            status: isApproved ? 'EXECUTED' : 'REJECTED',
            approvalStatus: data.status,
            resolutionReason: data.resolution_reason,
            approvalResolvedAt: data.resolved_at,
          };
        }
        return prev;
      });
    },
  });

  const filteredTraces = traces.filter(trace => {
    const matchesSearch = 
      trace.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trace.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trace.actionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trace.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDecision = 
      decisionFilter === 'ALL' || trace.decision === decisionFilter;

    return matchesSearch && matchesDecision;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Execution Traces" 
        subtitle="Immutable forensic audit log of all agent tool calls and authorization decisions."
        actionButton={
          <button 
            className="btn btn-secondary" 
            onClick={fetchTraces}
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
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
          <div className="input-search" style={{ flex: 1, maxWidth: '380px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search traces by agent, action or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', cursor: 'pointer', outline: 'none' }}
            >
              <option value="ALL">All decisions</option>
              <option value="ALLOW">ALLOW (Authorized)</option>
              <option value="DENY">DENY (Blocked)</option>
              <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL (HITL)</option>
            </select>
            
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {filteredTraces.length} {filteredTraces.length === 1 ? 'trace' : 'traces'}
            </div>
          </div>
        </div>

        {/* Traces Table */}
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
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>TRACE ID</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>TIMESTAMP</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>AGENT</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>ACTION & RESOURCE</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>DECISION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>LATENCY</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>INSPECT</th>
              </tr>
            </thead>
            <tbody>
              {filteredTraces.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {isLoading ? 'Loading execution traces from PostgreSQL...' : 'No execution traces found. Execute actions from the Playground to see them recorded in real time.'}
                  </td>
                </tr>
              ) : (
                filteredTraces.map((trace) => {
                  let badgeClass = 'badge badge-success';
                  let Icon = CheckCircle;
                  if (trace.decision === 'DENY') {
                    badgeClass = 'badge badge-danger';
                    Icon = XCircle;
                  } else if (trace.decision === 'REQUIRE_APPROVAL') {
                    badgeClass = 'badge badge-warning';
                    Icon = AlertCircle;
                  }

                  const formattedTime = new Date(trace.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr 
                      key={trace.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#38BDF8' }}>
                        {trace.id.substring(0, 8)}...
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {formattedTime}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {trace.agentName}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
                          {trace.actionName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {trace.resource}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className={badgeClass}>
                            <Icon size={12} />
                            <span>{trace.decision}</span>
                          </span>
                          {trace.decision === 'REQUIRE_APPROVAL' && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 500,
                              color: trace.status === 'EXECUTED' || trace.approvalStatus === 'APPROVED' ? '#34D399' : trace.status === 'PENDING_APPROVAL' || trace.approvalStatus === 'PENDING' ? '#FBBF24' : '#F87171',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}>
                              {trace.status === 'EXECUTED' || trace.approvalStatus === 'APPROVED'
                                ? '✓ Autorizada por humano'
                                : trace.status === 'PENDING_APPROVAL' || trace.approvalStatus === 'PENDING'
                                ? '⏳ Esperando aprobación'
                                : '✕ Rechazada por humano'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {trace.latencyMs.toFixed(1)}ms
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {(() => {
                          if (trace.decision === 'REQUIRE_APPROVAL') {
                            if (trace.status === 'EXECUTED' || trace.approvalStatus === 'APPROVED') {
                              return (
                                <span className="badge" style={{
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#34D399',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600,
                                }}>
                                  <CheckCircle size={12} />
                                  <span>APPROVED</span>
                                </span>
                              );
                            }
                            if (trace.status === 'PENDING_APPROVAL' || trace.approvalStatus === 'PENDING') {
                              return (
                                <span className="badge" style={{
                                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                  color: '#FBBF24',
                                  border: '1px solid rgba(245, 158, 11, 0.35)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600,
                                }}>
                                  <Clock size={12} />
                                  <span>PENDING</span>
                                </span>
                              );
                            }
                            return (
                              <span className="badge" style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#F87171',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600,
                              }}>
                                <XCircle size={12} />
                                <span>REJECTED</span>
                              </span>
                            );
                          }

                          if (trace.status === 'EXECUTED') {
                            return (
                              <span className="badge" style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10B981',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}>
                                <CheckCircle size={11} />
                                <span>EXECUTED</span>
                              </span>
                            );
                          }

                          return (
                            <span className="badge" style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#EF4444',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              <XCircle size={11} />
                              <span>BLOCKED</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedTrace(trace)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspector Modal */}
      {selectedTrace && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#0F1522',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={18} color="#38BDF8" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Forensic Trace Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trace ID</div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>{selectedTrace.id}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Timestamp</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>{new Date(selectedTrace.timestamp).toISOString()}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agent</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedTrace.agentName}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Decision & Latency</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: selectedTrace.decision === 'ALLOW' ? '#10B981' : selectedTrace.decision === 'DENY' ? '#EF4444' : '#F59E0B', marginTop: '2px' }}>
                    {selectedTrace.decision} ({selectedTrace.latencyMs.toFixed(1)}ms)
                  </div>
                </div>
              </div>

              {/* Human-in-the-Loop Governance Card */}
              {selectedTrace.decision === 'REQUIRE_APPROVAL' && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: selectedTrace.status === 'EXECUTED' ? 'rgba(16, 185, 129, 0.08)' : selectedTrace.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '8px',
                  border: selectedTrace.status === 'EXECUTED' ? '1px solid rgba(16, 185, 129, 0.25)' : selectedTrace.status === 'PENDING_APPROVAL' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: selectedTrace.status === 'EXECUTED' ? '#34D399' : selectedTrace.status === 'PENDING_APPROVAL' ? '#FBBF24' : '#F87171' }}>
                      <UserCheck size={15} />
                      <span>Gobernanza Human-in-the-Loop (HITL)</span>
                    </div>
                    <span className={`badge ${selectedTrace.status === 'EXECUTED' ? 'badge-success' : selectedTrace.status === 'PENDING_APPROVAL' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                      {selectedTrace.status === 'EXECUTED' ? 'AUTORIZADO POR HUMANO' : selectedTrace.status === 'PENDING_APPROVAL' ? 'ESPERANDO APPROVER' : 'DENEGADO POR HUMANO'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {selectedTrace.status === 'EXECUTED'
                      ? 'La acción autónoma fue suspendida por el Gateway PEP al exceder el umbral de política. Un operador con rol APPROVER autorizó la solicitud desde la bandeja HITL, desbloqueando el despacho hacia la herramienta.'
                      : selectedTrace.status === 'PENDING_APPROVAL'
                      ? 'La acción sensible está suspendida en la Bandeja de Aprobaciones a la espera de confirmación por un operador autorizado.'
                      : 'La acción sensible fue evaluada y rechazada explícitamente por el operador humano.'}
                  </p>
                  {selectedTrace.resolutionReason && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '2px' }}>
                      <strong>Motivo de resolución:</strong> {selectedTrace.resolutionReason}
                    </div>
                  )}
                  {selectedTrace.approvalResolvedAt && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      <strong>Fecha de resolución:</strong> {new Date(selectedTrace.approvalResolvedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Action & Targeted Resource
                </div>
                <div style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#38BDF8' }}>
                  {selectedTrace.actionName} &rarr; {selectedTrace.resource}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Sanitized Request Context (OWASP LLM06 Masked)
                  </span>
                </div>
                <pre style={{
                  padding: '14px',
                  backgroundColor: '#070A0F',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: '#A5B4FC',
                  overflowX: 'auto',
                  maxHeight: '200px',
                }}>
                  {JSON.stringify(selectedTrace.requestContext, null, 2)}
                </pre>
              </div>

              {selectedTrace.evaluatedPolicyRuleId && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(2, 132, 199, 0.08)', borderRadius: '6px', border: '1px solid rgba(2, 132, 199, 0.2)', fontSize: '12px', color: '#38BDF8' }}>
                  Evaluated Policy Rule ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedTrace.evaluatedPolicyRuleId}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button className="btn btn-secondary" onClick={() => setSelectedTrace(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
