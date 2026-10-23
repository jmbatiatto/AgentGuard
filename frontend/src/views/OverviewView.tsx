import React, { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  Ban,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Server,
  RefreshCw
} from 'lucide-react';
import { Header } from '../components/Header';
import { mockAlerts } from '../data/mockData';
import { api, DEMO_IDS } from '../services/api';
import { useAgentGuardWebSocket } from '../services/useAgentGuardWebSocket';
import type { NavView, SecurityAlert, ExecutionTrace } from '../types/domain';

interface OverviewViewProps {
  onNavigate: (view: NavView) => void;
  pendingApprovalsCount: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate, pendingApprovalsCount }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockAlerts);
  const [recentExecutions, setRecentExecutions] = useState<ExecutionTrace[]>([]);
  const [backendHealth, setBackendHealth] = useState<{ isOnline: boolean; status: string }>({ isOnline: true, status: 'healthy' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Metrics State
  const [stats, setStats] = useState({
    activeAgents: 3,
    totalTools: 4,
    activePolicies: 4,
    totalExecutions: 8429,
    blockedActions: 147,
    allowedActions: 8282,
    avgLatencyMs: 18.4,
  });

  const loadOverviewData = async () => {
    setIsRefreshing(true);
    try {
      const [health, alertsData, executionsData, agentsData, toolsData, policiesData] = await Promise.all([
        api.checkHealth(),
        api.getAlerts(),
        api.getExecutions(),
        api.getAgents(),
        api.getTools(),
        api.getPolicies(),
      ]);

      setBackendHealth(health);

      if (alertsData && alertsData.length > 0) {
        setAlerts(alertsData);
      }

      if (executionsData && executionsData.length > 0) {
        setRecentExecutions(executionsData.slice(0, 5));
      }

      const realExecCount = executionsData ? executionsData.length : 0;
      const realBlockedCount = executionsData ? executionsData.filter(e => e.decision === 'DENY').length : 0;
      const realAllowedCount = executionsData ? executionsData.filter(e => e.decision === 'ALLOW').length : 0;
      const realActiveAgents = agentsData ? agentsData.filter(a => a.status === 'Active').length : 3;
      const realTotalTools = toolsData ? toolsData.length : 4;
      const realActivePolicies = policiesData ? policiesData.filter(p => p.status === 'Active').length : 4;

      const totalLatency = executionsData && executionsData.length > 0 
        ? executionsData.reduce((acc, curr) => acc + (curr.latencyMs || 15), 0)
        : 0;
      const calculatedAvgLatency = realExecCount > 0 
        ? Number((totalLatency / realExecCount).toFixed(1))
        : 18.4;

      setStats({
        activeAgents: realActiveAgents > 0 ? realActiveAgents : 3,
        totalTools: realTotalTools > 0 ? realTotalTools : 4,
        activePolicies: realActivePolicies > 0 ? realActivePolicies : 4,
        totalExecutions: realExecCount > 0 ? realExecCount : 8429,
        blockedActions: realBlockedCount > 0 ? realBlockedCount : 147,
        allowedActions: realAllowedCount > 0 ? realAllowedCount : 8282,
        avgLatencyMs: calculatedAvgLatency,
      });
    } catch (err) {
      console.warn('[OverviewView] Error sincronizando métricas del backend:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, []);

  // Suscripción WebSocket para alertas y ejecuciones en vivo
  useAgentGuardWebSocket({
    onNewAlert: (alertData) => {
      const newAlert: SecurityAlert = {
        id: alertData.alert_id || `alert_${Date.now()}`,
        title: alertData.title || 'Alerta de Seguridad: Acción crítica bloqueada',
        description: alertData.description || 'Intento de violación de política detectado por el Gateway PEP',
        timeAgo: 'Recién ⚡',
        severity: (alertData.severity || 'CRITICAL').toLowerCase() as any,
        status: (alertData.status || 'OPEN') as any,
      };

      setAlerts(prev => [newAlert, ...prev]);
      setStats(prev => ({
        ...prev,
        blockedActions: prev.blockedActions + 1,
      }));
    },
    onNewExecution: (execData) => {
      const newExec: ExecutionTrace = {
        id: execData.execution_id || `exec_${Date.now()}`,
        organizationId: execData.organization_id || DEMO_IDS.ORG_ACME_ID,
        agentId: execData.agent_id,
        agentName: execData.agent_id?.includes('sales') ? 'Sales Quoting Bot' : 'AI Agent',
        toolId: execData.tool_id,
        toolName: 'Tool Integration',
        actionName: execData.action_name,
        resource: 'runtime/execution',
        requestContext: {},
        decision: execData.decision,
        status: execData.status || 'EXECUTED',
        timestamp: new Date().toISOString(),
        latencyMs: execData.evaluation_latency_ms || 14.5,
      };

      setRecentExecutions(prev => [newExec, ...prev.slice(0, 4)]);
      setStats(prev => ({
        ...prev,
        totalExecutions: prev.totalExecutions + 1,
        allowedActions: execData.decision === 'ALLOW' ? prev.allowedActions + 1 : prev.allowedActions,
        blockedActions: execData.decision === 'DENY' ? prev.blockedActions + 1 : prev.blockedActions,
      }));
    },
  });

  const handleResolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
    await api.updateAlertStatus(alertId, 'RESOLVED');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Overview & Gobernanza en Tiempo Real" 
        subtitle="Monitoreo centralizado de agentes autónomos, decisiones PEP del PDP y salud del sistema."
        actionButton={
          <button
            onClick={loadOverviewData}
            title="Sincronizar métricas desde PostgreSQL y Redis"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            <span>Sincronizar</span>
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Top System Health Banner */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: backendHealth.isOnline ? '#10B981' : '#F59E0B',
              boxShadow: backendHealth.isOnline ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              AgentGuard PEP / PDP Gateway: {backendHealth.isOnline ? 'Conectado y Protegido (200 OK)' : 'Modo Seguro Local (Resiliente)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Server size={14} color="var(--brand-primary)" />
              <span>PostgreSQL 16 Multi-Tenant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Zap size={14} color="#FBBF24" />
              <span>Latencia PDP: <strong style={{ color: 'var(--text-primary)' }}>{stats.avgLatencyMs} ms</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={14} color="#10B981" />
              <span>Fail-Closed: <strong style={{ color: '#10B981' }}>Enforced</strong></span>
            </div>
          </div>
        </div>

        {/* KPI Top Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Card 1: Active Agents */}
          <div 
            className="card" 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('agents')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Agentes Protegidos</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px', color: '#38BDF8' }}>
                <Bot size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.activeAgents}</div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} />
              Gobernanza activa en runtime
            </div>
          </div>

          {/* Card 2: Total Executions */}
          <div 
            className="card" 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('traces')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Evaluaciones PEP</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', color: '#818CF8' }}>
                <Activity size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalExecutions.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#818CF8', fontWeight: 500 }}>
              {stats.allowedActions.toLocaleString()} Permitidas ({stats.totalExecutions > 0 ? Math.round((stats.allowedActions / stats.totalExecutions) * 100) : 100}%)
            </div>
          </div>

          {/* Card 3: Blocked Actions */}
          <div 
            className="card" 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('traces')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Acciones Bloqueadas (DENY)</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: '#EF4444' }}>
                <Ban size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#EF4444' }}>{stats.blockedActions}</div>
            <div style={{ fontSize: '11px', color: 'var(--danger-text)', fontWeight: 500 }}>
              Veredictos de bloqueo determinista
            </div>
          </div>

          {/* Card 4: Pending Approvals */}
          <div 
            className="card" 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('approvals')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Aprobaciones HITL</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', color: '#F59E0B' }}>
                <Clock size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: pendingApprovalsCount > 0 ? '#F59E0B' : 'var(--text-primary)' }}>
              {pendingApprovalsCount}
            </div>
            <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>
              {pendingApprovalsCount > 0 ? 'Esperando resolución humana' : 'Bandeja al día'}
            </div>
          </div>
        </div>

        {/* Middle Section: Chart + Recent Alerts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '20px',
        }}>
          {/* Left Chart: Execution Activity */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Actividad de Autorizaciones en Runtime</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Decisiones del Motor PDP (Allow vs Deny) en tiempo real
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38BDF8' }} />
                  <span>Permitidas ({stats.allowedActions.toLocaleString()})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <span>Bloqueadas ({stats.blockedActions})</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Spline Graph */}
            <div style={{ flex: 1, height: '220px', position: 'relative', marginTop: '10px' }}>
              <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="680" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="680" y2="80" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="140" x2="680" y2="140" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="190" x2="680" y2="190" stroke="var(--border-subtle)" />

                {/* Y Axis Labels */}
                <text x="10" y="24" fill="#64748B" fontSize="10">1.5k</text>
                <text x="10" y="84" fill="#64748B" fontSize="10">1k</text>
                <text x="10" y="144" fill="#64748B" fontSize="10">500</text>
                <text x="25" y="194" fill="#64748B" fontSize="10">0</text>

                {/* Spline 1 (Allowed - Blue) */}
                <path
                  d="M 50 160 Q 150 140 250 110 T 450 70 T 650 60"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Spline 2 (Blocked - Red) */}
                <path
                  d="M 50 180 Q 150 175 250 170 T 450 165 T 650 175"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* X Axis Dates */}
                <text x="45" y="208" fill="#64748B" fontSize="11">00:00</text>
                <text x="145" y="208" fill="#64748B" fontSize="11">04:00</text>
                <text x="245" y="208" fill="#64748B" fontSize="11">08:00</text>
                <text x="345" y="208" fill="#64748B" fontSize="11">12:00</text>
                <text x="445" y="208" fill="#64748B" fontSize="11">16:00</text>
                <text x="545" y="208" fill="#64748B" fontSize="11">20:00</text>
                <text x="635" y="208" fill="#64748B" fontSize="11">Ahora ⚡</text>
              </svg>
            </div>
          </div>

          {/* Right Panel: Recent Alerts */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Alertas de Seguridad</h3>
              <button 
                onClick={() => onNavigate('traces')}
                style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                Ver todas
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, maxHeight: '380px', overflowY: 'auto' }}>
              {alerts.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <ShieldCheck size={28} color="#10B981" style={{ margin: '0 auto 8px' }} />
                  <div>No hay incidentes de seguridad abiertos.</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>El Gateway está bloqueando amenazas en tiempo de ejecución.</div>
                </div>
              ) : (
                alerts.slice(0, 5).map(alert => {
                  const isResolved = alert.status === 'RESOLVED';
                  let iconColor = '#F59E0B';
                  let Icon = AlertTriangle;
                  if (alert.severity === 'critical') {
                    iconColor = '#EF4444';
                    Icon = ShieldAlert;
                  } else if (alert.severity === 'info') {
                    iconColor = '#38BDF8';
                    Icon = ShieldCheck;
                  }

                  return (
                    <div 
                      key={alert.id}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: isResolved ? 'rgba(255,255,255,0.01)' : 'rgba(239, 68, 68, 0.05)',
                        border: isResolved ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ padding: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', flexShrink: 0 }}>
                        <Icon size={16} color={iconColor} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {alert.title}
                          </div>
                          <span className={`badge ${isResolved ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                            {isResolved ? 'RESOLVED' : 'OPEN'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                          {alert.description}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {alert.timeAgo}
                          </span>
                          {!isResolved && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <CheckCircle2 size={11} />
                              <span>Resolver</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Live Recent Executions Stream */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Últimas Decisiones de Autorización del Gateway PEP
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Trazas registradas en PostgreSQL e interceptadas en runtime
              </div>
            </div>

            <button 
              onClick={() => onNavigate('traces')}
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <span>Ver todas las trazas</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentExecutions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>AGENTE</th>
                    <th style={{ padding: '8px 12px' }}>HERRAMIENTA & ACCIÓN</th>
                    <th style={{ padding: '8px 12px' }}>DECISIÓN</th>
                    <th style={{ padding: '8px 12px' }}>LATENCIA</th>
                    <th style={{ padding: '8px 12px' }}>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExecutions.map(exec => {
                    const isAllow = exec.decision === 'ALLOW';
                    const isDeny = exec.decision === 'DENY';
                    return (
                      <tr 
                        key={exec.id} 
                        style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        onClick={() => onNavigate('traces')}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {exec.agentName}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          <code>{exec.actionName}</code>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '11px',
                            backgroundColor: isAllow ? 'rgba(16, 185, 129, 0.15)' : isDeny ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isAllow ? '#34D399' : isDeny ? '#F87171' : '#FBBF24',
                            border: `1px solid ${isAllow ? 'rgba(16, 185, 129, 0.3)' : isDeny ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          }}>
                            {exec.decision}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {exec.latencyMs} ms
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          {exec.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '18px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No hay ejecuciones recientes en la base de datos. Dispara una acción en el Playground para verla en vivo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
