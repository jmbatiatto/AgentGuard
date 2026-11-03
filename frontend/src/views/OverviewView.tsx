import React, { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Lock,
  Clock,
  ShieldAlert as AlertIcon
} from 'lucide-react';
import { Header } from '../components/Header';
import { api, DEMO_IDS } from '../services/api';
import { useAgentGuardWebSocket } from '../services/useAgentGuardWebSocket';
import type {
  NavView,
  SecurityAlert,
  ExecutionTrace,
  AlertSeverity,
  AnalyticsTimeseries,
} from '../types/domain';
import { DECISION_LABELS } from '../constants/labels';

/**
 * Convierte un arreglo de puntos (x, y) en una curva Bezier cúbica suave (Catmull-Rom spline)
 * acotada entre límites verticales para graficar sin oscilaciones anómalas.
 */
function generateSplinePath(
  pts: { x: number; y: number }[],
  minY: number = 20,
  maxY: number = 190
): string {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  if (pts.length === 2) {
    return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
  }

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = Math.min(maxY, Math.max(minY, p1.y + (p2.y - p0.y) / 6));
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = Math.min(maxY, Math.max(minY, p2.y - (p3.y - p1.y) / 6));

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Formatea valores numéricos para las marcas del eje Y (ej. 1500 -> '1.5k')
 */
function formatTick(val: number): string {
  if (val >= 1000) {
    const k = val / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${val}`;
}

/**
 * Extrae y formatea la hora en formato HH:00 en zona horaria local
 */
function formatHourLabel(isoStr?: string): string {
  if (!isoStr) return '00:00';
  try {
    const d = new Date(isoStr);
    return `${String(d.getHours()).padStart(2, '0')}:00`;
  } catch {
    return '00:00';
  }
}

export interface OverviewStats {
  activeAgents: number;
  totalTools: number;
  activePolicies: number;
  totalExecutions: number;
  blockedActions: number;
  allowedActions: number;
  avgLatencyMs: number;
}

export interface BackendHealthState {
  isOnline: boolean;
  status: string;
}

interface OverviewViewProps {
  onNavigate: (view: NavView) => void;
  pendingApprovalsCount: number;
}

/**
 * Traduce comandos técnicos de herramientas a lenguaje conversacional y humano
 */
function formatActionHuman(actionName: string): string {
  const normalized = (actionName || '').toLowerCase().trim();

  const translations: Record<string, string> = {
    export_customers: 'Intentó descargar la base de clientes',
    update_price: 'Intentó modificar precios de catálogo',
    create_quote: 'Creó una cotización para cliente',
    refund: 'Solicitó procesar un reembolso',
    process_refund: 'Solicitó procesar un reembolso',
    query_clients: 'Consultó datos de clientes',
    read_customer: 'Consultó ficha de cliente',
    send_email: 'Envió un correo a cliente',
    query_database: 'Consultó registros internos',
    execute_payment: 'Solicitó procesar un pago',
  };

  if (translations[normalized]) {
    return translations[normalized];
  }

  // Fallback amigable si la acción viene en snake_case
  const readable = normalized.replace(/_/g, ' ');
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

/**
 * Skeleton Loader que replica con precisión la estructura del Dashboard
 * para erradicar el Flash of Initial State (FOUC) y Cumulative Layout Shift (CLS).
 */
const OverviewSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header
        title="¿Qué están haciendo tus agentes?"
        subtitle="Un vistazo a las tareas de tus asistentes y los bloqueos de seguridad del día."
        actionButton={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}>
            <RefreshCw size={14} className="spin" />
            <span>Actualizando...</span>
          </div>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Banner de Estado Skeleton */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '120px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
          </div>
          <div style={{ width: '140px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* Grid de 4 Cards KPI Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '108px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '110px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
                <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: 'var(--border-subtle)' }} />
              </div>
              <div style={{ width: '54px', height: '26px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
              <div style={{ width: '130px', height: '10px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
            </div>
          ))}
        </div>

        {/* Sección Central Skeleton (Gráfico + Alertas) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '20px',
        }}>
          <div className="card" style={{ height: '330px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '230px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
            <div style={{ width: '160px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
            <div style={{
              flex: 1,
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}>
              Cargando actividad...
            </div>
          </div>

          <div className="card" style={{ height: '330px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '130px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
              <div style={{ width: '50px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '64px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Tabla Inferior Skeleton */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{ width: '200px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
          <div style={{ width: '240px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {[1, 2, 3, 4].map(row => (
              <div key={row} style={{ height: '34px', borderRadius: '4px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate, pendingApprovalsCount }) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ExecutionTrace[]>([]);
  const [backendHealth, setBackendHealth] = useState<BackendHealthState | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeseries | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isBackendReady, setIsBackendReady] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOverviewData = async () => {
    setIsRefreshing(true);
    try {
      const [
        health,
        alertsData,
        executionsData,
        agentsData,
        toolsData,
        policiesData,
        analyticsOverview,
        timeseriesData,
      ] = await Promise.all([
        api.checkHealth(),
        api.getAlerts(),
        api.getExecutions(),
        api.getAgents(),
        api.getTools(),
        api.getPolicies(),
        api.getAnalyticsOverview(),
        api.getAnalyticsTimeseries(),
      ]);

      setBackendHealth(health ?? { isOnline: false, status: 'offline' });
      setAlerts(alertsData ?? []);
      setRecentExecutions(executionsData ? executionsData.slice(0, 5) : []);
      setTimeseries(timeseriesData ?? null);

      const realExecCount = analyticsOverview ? analyticsOverview.total_executions : (executionsData ? executionsData.length : 0);
      const realBlockedCount = analyticsOverview ? analyticsOverview.deny_count : (executionsData ? executionsData.filter(e => e.decision === 'DENY').length : 0);
      const realAllowedCount = analyticsOverview ? analyticsOverview.allow_count : (executionsData ? executionsData.filter(e => e.decision === 'ALLOW').length : 0);
      const realActiveAgents = agentsData ? agentsData.filter(a => a.status === 'ACTIVE').length : 0;
      const realTotalTools = toolsData ? toolsData.length : 0;
      const realActivePolicies = policiesData ? policiesData.filter(p => p.status === 'Active').length : 0;
      const realAvgLatency = analyticsOverview && typeof analyticsOverview.avg_latency_ms === 'number'
        ? Number(analyticsOverview.avg_latency_ms.toFixed(1))
        : (executionsData && executionsData.length > 0
          ? Number((executionsData.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / executionsData.length).toFixed(1))
          : 0);

      setStats({
        activeAgents: realActiveAgents,
        totalTools: realTotalTools,
        activePolicies: realActivePolicies,
        totalExecutions: realExecCount,
        blockedActions: realBlockedCount,
        allowedActions: realAllowedCount,
        avgLatencyMs: realAvgLatency,
      });
    } catch (err) {
      console.warn('[OverviewView] Error sincronizando métricas del backend:', err);
      setBackendHealth({ isOnline: false, status: 'error' });
      setStats({
        activeAgents: 0,
        totalTools: 0,
        activePolicies: 0,
        totalExecutions: 0,
        blockedActions: 0,
        allowedActions: 0,
        avgLatencyMs: 0,
      });
    } finally {
      setIsBackendReady(true);
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
        description: alertData.description || 'Intento de violación de política detectado automáticamente',
        timeAgo: 'Recién ⚡',
        severity: ((alertData.severity || 'CRITICAL').toUpperCase() as AlertSeverity),
        status: (alertData.status || 'OPEN') as 'OPEN' | 'RESOLVED',
      };

      setAlerts(prev => [newAlert, ...prev]);
      setStats(prev => prev ? {
        ...prev,
        blockedActions: prev.blockedActions + 1,
      } : null);
    },
    onNewExecution: (execData) => {
      const newExec: ExecutionTrace = {
        id: execData.execution_id || `exec_${Date.now()}`,
        organizationId: execData.organization_id || DEMO_IDS.ORG_ACME_ID,
        agentId: execData.agent_id,
        agentName: execData.agent_id?.includes('sales') ? 'Agente de Ventas' : 'Agente IA',
        toolId: execData.tool_id,
        toolName: 'Integración de Herramienta',
        actionName: execData.action_name,
        resource: 'runtime/execution',
        requestContext: {},
        decision: execData.decision,
        status: execData.status || 'EXECUTED',
        timestamp: new Date().toISOString(),
        latencyMs: execData.evaluation_latency_ms || 14.5,
      };

      setRecentExecutions(prev => [newExec, ...prev.slice(0, 4)]);
      setStats(prev => prev ? {
        ...prev,
        totalExecutions: prev.totalExecutions + 1,
        allowedActions: execData.decision === 'ALLOW' ? prev.allowedActions + 1 : prev.allowedActions,
        blockedActions: execData.decision === 'DENY' ? prev.blockedActions + 1 : prev.blockedActions,
      } : null);

      setTimeseries(prev => {
        if (!prev || !prev.points || prev.points.length === 0) return prev;
        const newPoints = [...prev.points];
        const lastIdx = newPoints.length - 1;
        const lastPoint = { ...newPoints[lastIdx] };
        lastPoint.executions += 1;
        if (execData.decision === 'ALLOW') lastPoint.allowed += 1;
        if (execData.decision === 'DENY') lastPoint.denied += 1;
        if (execData.decision === 'REQUIRE_APPROVAL') lastPoint.require_approval += 1;
        newPoints[lastIdx] = lastPoint;
        return { ...prev, points: newPoints };
      });
    },
  });

  const handleResolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
    await api.updateAlertStatus(alertId, 'RESOLVED');
  };

  // Validación global de carga: backend + ciclo i18n
  const isI18nReady = typeof window !== 'undefined'
    ? Boolean((window as unknown as { i18n?: { isInitialized?: boolean } }).i18n ? (window as unknown as { i18n?: { isInitialized?: boolean } }).i18n?.isInitialized : true)
    : true;

  const isLoading = !isBackendReady || stats === null || backendHealth === null || !isI18nReady;

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 1. Header con Copywriting Humano y Cercano */}
      <Header
        title="Vista general"
        subtitle="Un vistazo a las tareas de tus asistentes y los bloqueos de seguridad del día."
        actionButton={
          <button
            onClick={loadOverviewData}
            title="Actualizar datos en tiempo real"
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
            <span>Actualizar</span>
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* 2. Banner de Estado Natural (Zero jerga técnica) */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#10B981" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {backendHealth.isOnline ? ' Todo en orden' : ' Modo seguro local'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Lock size={14} color="#10B981" />
            <span style={{ color: '#10B981', fontWeight: 600 }}> Entorno protegido</span>
          </div>
        </div>

        {/* 3. Métricas y KPIs en Lenguaje Cotidiano */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Card 1: Asistentes Activos */}
          <div
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('agents')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Asistentes activos</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px', color: '#38BDF8' }}>
                <Bot size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.activeAgents}</div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} />
              Supervisión continua activa
            </div>
          </div>

          {/* Card 2: Acciones Revisadas Hoy */}
          <div
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('traces')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Acciones revisadas hoy</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', color: '#818CF8' }}>
                <Activity size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalExecutions.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#818CF8', fontWeight: 500 }}>
              {stats.allowedActions.toLocaleString()} permitidas ({stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms prom.` : 'tiempo real'})
            </div>
          </div>

          {/* Card 3: Intentos Detenidos */}
          <div
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('traces')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Intentos detenidos</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: '#EF4444' }}>
                <AlertIcon size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#EF4444' }}>{stats.blockedActions}</div>
            <div style={{ fontSize: '11px', color: 'var(--danger-text)', fontWeight: 500 }}>
              Peligros o abusos prevenidos
            </div>
          </div>

          {/* Card 4: Esperando tu Permiso */}
          <div
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => onNavigate('approvals')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Esperando tu permiso</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', color: '#F59E0B' }}>
                <Clock size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: pendingApprovalsCount > 0 ? '#F59E0B' : 'var(--text-primary)' }}>
              {pendingApprovalsCount}
            </div>
            <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>
              {pendingApprovalsCount > 0 ? 'Solicitudes pendientes de revisión' : 'Bandeja al día'}
            </div>
          </div>
        </div>

        {/* Sección Central: Gráfico + Alertas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          marginBottom: '20px',
        }}>
          {/* Gráfico: Actividad en las últimas 24 horas */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Actividad en las últimas 24 horas
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Acciones cotidianas comparadas con intentos bloqueados
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38BDF8' }} />
                  <span>Permitidas ({stats.allowedActions.toLocaleString()})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <span>Detenidas ({stats.blockedActions})</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Spline Graph */}
            {(() => {
              const points = timeseries?.points && timeseries.points.length > 0 ? timeseries.points : [];
              const numPoints = points.length;

              const X_MIN = 40;
              const X_MAX = 680;
              const Y_TOP = 25;
              const Y_BASELINE = 190;
              const PLOT_HEIGHT = Y_BASELINE - Y_TOP; // 165px

              const maxAllowed = points.length > 0 ? Math.max(...points.map(p => p.allowed), 0) : 0;
              const maxDenied = points.length > 0 ? Math.max(...points.map(p => p.denied), 0) : 0;
              const maxObserved = Math.max(maxAllowed, maxDenied);

              let yScaleMax = 10;
              if (maxObserved > 1000) {
                yScaleMax = Math.ceil(maxObserved / 500) * 500;
              } else if (maxObserved > 500) {
                yScaleMax = 1000;
              } else if (maxObserved > 200) {
                yScaleMax = 500;
              } else if (maxObserved > 100) {
                yScaleMax = 200;
              } else if (maxObserved > 50) {
                yScaleMax = 100;
              } else if (maxObserved > 20) {
                yScaleMax = 50;
              } else if (maxObserved > 10) {
                yScaleMax = 20;
              } else if (maxObserved > 0) {
                yScaleMax = Math.max(maxObserved + 2, 5);
              }

              const allowedPts = points.map((p, i) => {
                const x = numPoints > 1 ? X_MIN + (i / (numPoints - 1)) * (X_MAX - X_MIN) : (X_MIN + X_MAX) / 2;
                const ratio = yScaleMax > 0 ? Math.min(1, Math.max(0, p.allowed / yScaleMax)) : 0;
                const y = Y_BASELINE - ratio * PLOT_HEIGHT;
                return { x, y };
              });

              const deniedPts = points.map((p, i) => {
                const x = numPoints > 1 ? X_MIN + (i / (numPoints - 1)) * (X_MAX - X_MIN) : (X_MIN + X_MAX) / 2;
                const ratio = yScaleMax > 0 ? Math.min(1, Math.max(0, p.denied / yScaleMax)) : 0;
                const y = Y_BASELINE - ratio * PLOT_HEIGHT;
                return { x, y };
              });

              const allowedPath = generateSplinePath(allowedPts, Y_TOP, Y_BASELINE);
              const deniedPath = generateSplinePath(deniedPts, Y_TOP, Y_BASELINE);

              const allowedAreaPath = allowedPts.length > 1
                ? `${allowedPath} L ${allowedPts[allowedPts.length - 1].x.toFixed(1)} ${Y_BASELINE} L ${allowedPts[0].x.toFixed(1)} ${Y_BASELINE} Z`
                : '';

              const xLabelIndices = [0, 4, 8, 12, 16, 20, numPoints > 0 ? numPoints - 1 : 23];

              return (
                <div style={{ flex: 1, height: '220px', position: 'relative', marginTop: '10px' }}>
                  <svg
                    viewBox="0 0 700 220"
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <defs>
                      <linearGradient id="allowedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Líneas Guía Horizontales */}
                    <line x1="40" y1="25" x2="680" y2="25" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <line x1="40" y1="80" x2="680" y2="80" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <line x1="40" y1="135" x2="680" y2="135" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <line x1="40" y1="190" x2="680" y2="190" stroke="var(--border-subtle)" />

                    {/* Etiquetas Eje Y */}
                    <text x="10" y="29" fill="#64748B" fontSize="10">{formatTick(yScaleMax)}</text>
                    <text x="10" y="84" fill="#64748B" fontSize="10">{formatTick(Math.round((yScaleMax * 2) / 3))}</text>
                    <text x="10" y="139" fill="#64748B" fontSize="10">{formatTick(Math.round(yScaleMax / 3))}</text>
                    <text x="25" y="194" fill="#64748B" fontSize="10">0</text>

                    {/* Área con gradiente bajo curva de acciones permitidas */}
                    {allowedAreaPath && (
                      <path d={allowedAreaPath} fill="url(#allowedGradient)" />
                    )}

                    {/* Curva de acciones permitidas (Cyan / Azul) */}
                    {allowedPath && (
                      <path
                        d={allowedPath}
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Curva de acciones bloqueadas / detenidas (Rojo) */}
                    {deniedPath && (
                      <path
                        d={deniedPath}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Línea vertical y puntos en estado hover */}
                    {hoveredIndex !== null && points[hoveredIndex] && (
                      <>
                        <line
                          x1={allowedPts[hoveredIndex].x}
                          y1="25"
                          x2={allowedPts[hoveredIndex].x}
                          y2="190"
                          stroke="rgba(255, 255, 255, 0.25)"
                          strokeDasharray="2 2"
                        />
                        <circle
                          cx={allowedPts[hoveredIndex].x}
                          cy={allowedPts[hoveredIndex].y}
                          r="4"
                          fill="#38BDF8"
                          stroke="#0F172A"
                          strokeWidth="2"
                        />
                        <circle
                          cx={deniedPts[hoveredIndex].x}
                          cy={deniedPts[hoveredIndex].y}
                          r="4"
                          fill="#EF4444"
                          stroke="#0F172A"
                          strokeWidth="2"
                        />

                        {/* Tooltip flotante con métricas del bucket */}
                        <g transform={`translate(${Math.min(540, Math.max(60, allowedPts[hoveredIndex].x - 70))}, 6)`}>
                          <rect width="140" height="24" rx="6" fill="#1E293B" stroke="var(--border-subtle)" />
                          <text x="70" y="16" fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontWeight="600">
                            {formatHourLabel(points[hoveredIndex].timestamp)}: {points[hoveredIndex].allowed} aut. / {points[hoveredIndex].denied} bloq.
                          </text>
                        </g>
                      </>
                    )}

                    {/* Zonas interactivas transparentes para cada bucket horario */}
                    {points.map((_, idx) => {
                      const x = numPoints > 1 ? X_MIN + (idx / (numPoints - 1)) * (X_MAX - X_MIN) : 360;
                      const colWidth = numPoints > 1 ? (X_MAX - X_MIN) / (numPoints - 1) : 24;
                      return (
                        <rect
                          key={idx}
                          x={x - colWidth / 2}
                          y="20"
                          width={colWidth}
                          height="175"
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredIndex(idx)}
                        />
                      );
                    })}

                    {/* Etiquetas Eje X */}
                    {xLabelIndices.map(idx => {
                      if (idx >= numPoints) return null;
                      const xPos = numPoints > 1 ? X_MIN + (idx / (numPoints - 1)) * (X_MAX - X_MIN) : 360;
                      const isLast = idx === numPoints - 1;
                      const label = isLast ? 'Ahora ⚡' : formatHourLabel(points[idx]?.timestamp);
                      const anchor = idx === 0 ? 'start' : isLast ? 'end' : 'middle';

                      return (
                        <text
                          key={idx}
                          x={xPos}
                          y="210"
                          fill="#64748B"
                          fontSize="11"
                          textAnchor={anchor}
                        >
                          {label}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* Panel Derecho: Alertas de Seguridad */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Alertas de seguridad</h3>
              <button
                onClick={() => onNavigate('traces')}
                style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                Ver todas
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, maxHeight: '380px', overflowY: 'auto' }}>
              {/* 5. Estado Vacío Amigable para Alertas */}
              {alerts.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <ShieldCheck size={32} color="#10B981" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Todo tranquilo por ahora. No hay alertas recientes.
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Tus asistentes están trabajando dentro de las reglas establecidas.
                  </div>
                </div>
              ) : (
                alerts.slice(0, 5).map(alert => {
                  const isResolved = alert.status === 'RESOLVED';
                  let iconColor = '#F59E0B';
                  let Icon = AlertTriangle;
                  const sev = (alert.severity || '').toUpperCase();
                  if (sev === 'CRITICAL' || sev === 'HIGH') {
                    iconColor = '#EF4444';
                    Icon = ShieldAlert;
                  } else if (sev === 'LOW') {
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
                            {isResolved ? 'Resuelto' : 'Abierto'}
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
                              <span>Marcar resuelto</span>
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

        {/* 4. Tabla de Actividad Reciente (Microcopy humano sin latencia técnica) */}
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
                Actividad reciente
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Últimos movimientos registrados de tus asistentes
              </div>
            </div>

            <button
              onClick={() => onNavigate('traces')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <span>Ver historial completo</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentExecutions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>ASISTENTE</th>
                    <th style={{ padding: '8px 12px' }}>ACCIÓN REALIZADA</th>
                    <th style={{ padding: '8px 12px' }}>DECISIÓN</th>
                    <th style={{ padding: '8px 12px' }}>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExecutions.map(exec => {
                    const isAllow = exec.decision === 'ALLOW';
                    const isDeny = exec.decision === 'DENY';

                    // Microcopy humano para decisiones
                    const decisionLabel = DECISION_LABELS[exec.decision] || (isAllow
                      ? 'Permitido'
                      : isDeny
                        ? 'Denegado'
                        : 'Requiere tu permiso');

                    // Microcopy humano para el estado de ejecución
                    const statusLabel = exec.status === 'EXECUTED'
                      ? 'Completado'
                      : exec.status === 'PENDING_APPROVAL' || exec.status === 'PENDING'
                        ? 'En espera'
                        : 'Bloqueado';

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
                          <span>{formatActionHuman(exec.actionName)}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '11px',
                            backgroundColor: isAllow ? 'rgba(16, 185, 129, 0.15)' : isDeny ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isAllow ? '#34D399' : isDeny ? '#F87171' : '#FBBF24',
                            border: `1px solid ${isAllow ? 'rgba(16, 185, 129, 0.3)' : isDeny ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          }}>
                            {decisionLabel}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {statusLabel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* 5. Estado Vacío Amigable para Tabla */
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <CheckCircle2 size={30} color="#10B981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Todo tranquilo por ahora. Aún no hay actividad reciente registrada.
              </div>
              <div style={{ fontSize: '12px' }}>
                En cuanto tus asistentes comiencen a realizar tareas, verás cada paso aquí en tiempo real.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
