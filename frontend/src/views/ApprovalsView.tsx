import React, { useState, useEffect } from 'react';
import { Shield, Clock, Check, X, MoreHorizontal, Radio, Lock } from 'lucide-react';
import { Header } from '../components/Header';
import { mockApprovals } from '../data/mockData';
import type { ApprovalRequest } from '../types/domain';
import { api } from '../services/api';
import { useAgentGuardWebSocket } from '../services/useAgentGuardWebSocket';
import { useAuth } from '../context/AuthContext';

interface ApprovalsViewProps {
  onUpdatePendingCount?: (count: number) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ onUpdatePendingCount }) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>(mockApprovals);
  const [selectedId, setSelectedId] = useState<string>(mockApprovals[0]?.id || '');
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'PENDING' | 'ALL'>('PENDING');

  // Cargar aprobaciones iniciales desde el backend (con fallback a mockData)
  useEffect(() => {
    let isMounted = true;
    api.getApprovals().then((data) => {
      if (isMounted && data && data.length > 0) {
        setRequests(data);
        const firstPending = data.find(d => d.status === 'PENDING');
        if (firstPending) {
          setSelectedId(firstPending.id);
        } else {
          setSelectedId(data[0].id);
        }
        if (onUpdatePendingCount) {
          onUpdatePendingCount(data.filter(d => d.status === 'PENDING').length);
        }
      }
    });
    return () => { isMounted = false; };
  }, [onUpdatePendingCount]);

  // Suscripción WebSocket para actualizaciones y nuevos tickets en vivo
  const { isConnected } = useAgentGuardWebSocket({
    onNewApproval: (data) => {
      const amountVal = data.parameters?.amount != null 
        ? `$${Number(data.parameters.amount).toLocaleString('en-US')}.00` 
        : '$4,500.00';

      const newReq: ApprovalRequest = {
        id: data.approval_id || `appr_${Date.now()}`,
        agentName: data.agent_name || 'AI Agent',
        agentInitials: (data.agent_name || 'AI').substring(0, 2).toUpperCase(),
        action: data.action_name || 'refund.create',
        resource: data.parameters?.gateway || 'payment/stripe_live',
        amount: amountVal,
        requestedAt: 'Recién (En Vivo ⚡)',
        status: 'PENDING',
        delegatedBy: 'Automated Gateway Trigger',
        riskLevel: (data.risk_level === 'CRITICAL' ? 'Critical' : 'High') as any,
        justification: data.parameters?.reason || 'Operación sensible interceptada por AgentGuard PEP que superó el umbral autónomo.',
        appliedPolicy: {
          name: 'Real-time HITL Interception Policy',
          condition: 'amount >= $500',
        },
      };

      setRequests(prev => {
        const filtered = prev.filter(r => r.id !== newReq.id);
        const updated = [newReq, ...filtered];
        if (onUpdatePendingCount) {
          onUpdatePendingCount(updated.filter(r => r.status === 'PENDING').length);
        }
        return updated;
      });
      setSelectedId(newReq.id);
      setFilterTab('PENDING');
      setResolutionNotice(`⚡ Nueva solicitud en tiempo real: ${newReq.action} (${newReq.amount}) de ${newReq.agentName}`);
      setTimeout(() => setResolutionNotice(null), 5000);
    },
    onResolvedApproval: (data) => {
      setRequests(prev => {
        const updated = prev.map(r => {
          if (r.id === data.approval_id) {
            return { ...r, status: data.status as any };
          }
          return r;
        });
        if (onUpdatePendingCount) {
          onUpdatePendingCount(updated.filter(r => r.status === 'PENDING').length);
        }
        return updated;
      });
    },
  });

  const displayedRequests = filterTab === 'PENDING' 
    ? requests.filter(r => r.status === 'PENDING')
    : requests;

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const selectedRequest = requests.find(r => r.id === selectedId) || displayedRequests[0];

  const handleResolve = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    if (isResolving) return;

    const targetReq = requests.find(r => r.id === id);
    if (!targetReq || targetReq.status !== 'PENDING') {
      setResolutionNotice('Esta solicitud ya fue resuelta previamente.');
      setTimeout(() => setResolutionNotice(null), 3000);
      return;
    }

    if (!currentUser.canApproveHITL) {
      setResolutionNotice(`🔒 Permiso denegado: Tu perfil actual (${currentUser.role}) no tiene permisos para resolver solicitudes HITL. Cambia al rol APPROVER o ADMIN en el selector superior.`);
      setTimeout(() => setResolutionNotice(null), 4000);
      return;
    }

    setIsResolving(true);

    // 1. Actualización optimista de estado local
    const updated = requests.map(r => {
      if (r.id === id) {
        return { ...r, status: action };
      }
      return r;
    });
    setRequests(updated);

    const remainingCount = updated.filter(r => r.status === 'PENDING').length;
    if (onUpdatePendingCount) {
      onUpdatePendingCount(remainingCount);
    }

    setResolutionNotice(`Solicitud ${targetReq.action} (${targetReq.amount}) ha sido ${action === 'APPROVED' ? 'Aprobada ✅' : 'Rechazada ❌'} por ${currentUser.name}.`);
    setTimeout(() => setResolutionNotice(null), 4000);

    const nextPending = updated.find(r => r.status === 'PENDING');
    if (nextPending) {
      setSelectedId(nextPending.id);
    }

    // 2. Notificar al backend de forma persistente con el ID del usuario activo
    try {
      await api.resolveApproval(
        id,
        action,
        action === 'APPROVED' 
          ? `Aprobado formalmente por ${currentUser.name} (${currentUser.role}) en Dashboard HITL` 
          : `Rechazado por ${currentUser.name} (${currentUser.role}) en Dashboard HITL`,
        currentUser.id
      );
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Approvals" 
        subtitle="Review actions that require human authorization."
      />

      {/* Resolution Toast Notification */}
      {resolutionNotice && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '30px',
          zIndex: 1000,
          backgroundColor: '#1E293B',
          border: '1px solid #38BDF8',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          borderRadius: '8px',
          padding: '12px 20px',
          color: '#F8FAFC',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          {resolutionNotice}
        </div>
      )}

      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', gap: '20px', overflow: 'hidden' }}>
        {/* Left Column: Requests List */}
        <div style={{
          width: '380px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Bandeja de Aprobaciones
              </h2>
              {isConnected ? (
                <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  Live WS
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Radio size={12} />
                  Offline
                </span>
              )}
            </div>

            {/* Tabs Filter */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilterTab('PENDING')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filterTab === 'PENDING' ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  color: filterTab === 'PENDING' ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                Pendientes ({pendingRequestsCount})
              </button>
              <button
                onClick={() => setFilterTab('ALL')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filterTab === 'ALL' ? 'var(--brand-primary)' : 'var(--bg-surface)',
                  color: filterTab === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                Todas ({requests.length})
              </button>
            </div>
          </div>

          {/* List items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {displayedRequests.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Check size={28} color="#10B981" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                No hay solicitudes en esta sección.
              </div>
            ) : (
              displayedRequests.map((item) => {
                const isSelected = selectedRequest?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--nav-active-bg)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--brand-primary)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
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
                        {item.agentInitials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {item.agentName}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          {item.action}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.resource}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {item.amount}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {item.status === 'PENDING' ? (
                          <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 600 }}>PENDIENTE</span>
                        ) : item.status === 'APPROVED' ? (
                          <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>APROBADA</span>
                        ) : (
                          <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>RECHAZADA</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Request Details Pane */}
        {selectedRequest ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            overflowY: 'auto',
          }}>
            {/* Detail Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {selectedRequest.status === 'PENDING' ? (
                    <>
                      <Clock size={15} color="#F59E0B" />
                      <span className="badge badge-warning">
                        <span className="badge-dot" />
                        <span>PENDING REVIEW</span>
                      </span>
                    </>
                  ) : selectedRequest.status === 'APPROVED' ? (
                    <>
                      <Check size={15} color="#10B981" />
                      <span className="badge badge-success">
                        <span className="badge-dot" />
                        <span>APPROVED</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <X size={15} color="#EF4444" />
                      <span className="badge badge-danger">
                        <span className="badge-dot" />
                        <span>REJECTED</span>
                      </span>
                    </>
                  )}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedRequest.action}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Requested by {selectedRequest.agentName} · {selectedRequest.requestedAt}
                </p>
              </div>

              <button style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Requested Amount Hero Box */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                REQUESTED AMOUNT
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
                {selectedRequest.amount}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Full refund to original payment method
              </div>
            </div>

            {/* Request Details Grid */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                REQUEST DETAILS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Agent</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedRequest.agentName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Action</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedRequest.action}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Resource</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{selectedRequest.resource}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delegated by</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedRequest.delegatedBy}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Risk level</span>
                  <span style={{ color: selectedRequest.riskLevel === 'Critical' ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>
                    {selectedRequest.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Agent Justification Box */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                AGENT JUSTIFICATION
              </div>
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px 18px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                fontStyle: 'italic',
              }}>
                "{selectedRequest.justification}"
              </div>
            </div>

            {/* Applied Policy Box */}
            <div style={{ padding: '24px', flex: 1 }}>
              <div style={{
                backgroundColor: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Shield size={20} color="var(--brand-primary)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    APPLIED POLICY
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {selectedRequest.appliedPolicy.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {selectedRequest.appliedPolicy.condition}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons / Resolution Status */}
            <div style={{
              padding: '18px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '12px',
            }}>
              {selectedRequest.status === 'PENDING' ? (
                <>
                  {!currentUser.canApproveHITL ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: '12px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: 'var(--danger-text)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                      }}>
                        <Lock size={14} />
                        <span>Perfil en modo solo lectura (<strong>{currentUser.role}</strong>). Cambia a <strong>APPROVER</strong> o <strong>ADMIN</strong> en el menú superior para resolver.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          disabled
                          title="Requiere rol APPROVER o ADMIN"
                          className="btn btn-danger-outline"
                          style={{ padding: '9px 16px', opacity: 0.35, cursor: 'not-allowed' }}
                        >
                          <X size={15} />
                          <span>Reject</span>
                        </button>
                        <button 
                          disabled
                          title="Requiere rol APPROVER o ADMIN"
                          className="btn btn-success"
                          style={{ padding: '9px 18px', opacity: 0.35, cursor: 'not-allowed' }}
                        >
                          <Check size={16} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentUser.badgeColor }} />
                        <span>Autorizado como <strong>{currentUser.name}</strong> ({currentUser.role})</span>
                      </div>
                      <button 
                        id="btn-reject-request"
                        disabled={isResolving}
                        onClick={() => handleResolve(selectedRequest.id, 'REJECTED')}
                        className="btn btn-danger-outline"
                        style={{ padding: '9px 18px', opacity: isResolving ? 0.5 : 1, cursor: isResolving ? 'not-allowed' : 'pointer' }}
                      >
                        <X size={15} />
                        <span>Reject request</span>
                      </button>

                      <button 
                        id="btn-approve-request"
                        disabled={isResolving}
                        onClick={() => handleResolve(selectedRequest.id, 'APPROVED')}
                        className="btn btn-success"
                        style={{ padding: '9px 20px', fontWeight: 600, opacity: isResolving ? 0.5 : 1, cursor: isResolving ? 'not-allowed' : 'pointer' }}
                      >
                        <Check size={16} strokeWidth={2.5} />
                        <span>{isResolving ? 'Procesando...' : 'Approve request'}</span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: selectedRequest.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${selectedRequest.status === 'APPROVED' ? '#10B981' : '#EF4444'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: selectedRequest.status === 'APPROVED' ? '#10B981' : '#EF4444',
                }}>
                  {selectedRequest.status === 'APPROVED' ? <Check size={15} /> : <X size={15} />}
                  <span>Solicitud ya resuelta ({selectedRequest.status})</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Selecciona una solicitud para revisar los detalles
          </div>
        )}
      </div>
    </div>
  );
};
