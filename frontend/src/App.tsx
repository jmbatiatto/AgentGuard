import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { ThemeProvider } from './context/ThemeProvider';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './views/OverviewView';
import { AgentsView } from './views/AgentsView';
import { ToolsView } from './views/ToolsView';
import { PoliciesView } from './views/PoliciesView';
import { ApprovalsView } from './views/ApprovalsView';
import { TracesView } from './views/TracesView';
import { PlaygroundView } from './views/PlaygroundView';
import { SettingsView } from './views/SettingsView';
import type { NavView } from './types/domain';
import { useAgentGuardWebSocket } from './services/useAgentGuardWebSocket';
import { api } from './services/api';

const getInitialView = (): NavView => {
  const hash = window.location.hash.replace('#', '').toLowerCase() as NavView;
  const validViews: NavView[] = ['overview', 'agents', 'tools', 'policies', 'approvals', 'traces', 'playground', 'settings'];
  return validViews.includes(hash) ? hash : 'overview';
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>(getInitialView);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(3);
  const [securityAlert, setSecurityAlert] = useState<{
    id?: string;
    title: string;
    description?: string;
    severity?: string;
  } | null>(null);

  const handleNavigate = (view: NavView) => {
    setCurrentView(view);
    window.location.hash = `#${view}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase() as NavView;
      const validViews: NavView[] = ['overview', 'agents', 'tools', 'policies', 'approvals', 'traces', 'playground', 'settings'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Inicializar contador real desde backend (con fallback automático)
  useEffect(() => {
    let isMounted = true;
    api.getApprovals('PENDING').then((list) => {
      if (isMounted && list) {
        setPendingApprovalsCount(list.length);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleTriggerAlert = (alert: { id?: string; title: string; description?: string; severity?: string }) => {
    setSecurityAlert({
      id: alert.id,
      title: alert.title || '🚨 SIEM: Bloqueo en acción crítica detectado',
      description: alert.description || 'Intento de violación de política o anomalía de seguridad interceptada en tiempo real.',
      severity: alert.severity || 'CRITICAL',
    });
    setTimeout(() => setSecurityAlert(null), 9000);
  };

  // Suscripción WebSocket global para mantener sincronizado el badge de la Sidebar y Alertas SIEM
  useAgentGuardWebSocket({
    onNewApproval: () => {
      setPendingApprovalsCount(prev => prev + 1);
    },
    onResolvedApproval: () => {
      setPendingApprovalsCount(prev => Math.max(0, prev - 1));
    },
    onNewAlert: (alertData) => {
      handleTriggerAlert({
        id: alertData.alert_id,
        title: alertData.title,
        description: alertData.description,
        severity: alertData.severity,
      });
    },
  });

  const handleTriggerApprovalFromPlayground = () => {
    setPendingApprovalsCount(prev => prev + 1);
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        {/* Global SIEM Incident Banner */}
        {securityAlert && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            backgroundColor: '#1E1218',
            border: '1px solid #EF4444',
            boxShadow: '0 12px 36px rgba(239, 68, 68, 0.45), 0 0 20px rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '640px',
            width: '90%',
          }}>
            <div style={{
              padding: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShieldAlert size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#F87171', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                <span>🚨 SIEM SECURITY INCIDENT</span>
                <span style={{ fontSize: '10px', backgroundColor: '#EF4444', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {securityAlert.severity || 'CRITICAL'}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {securityAlert.title}
              </div>
              {securityAlert.description && (
                <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '3px', lineHeight: 1.3 }}>
                  {securityAlert.description}
                </div>
              )}
            </div>
            <button
              onClick={() => setSecurityAlert(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Fixed Left Navigation Bar */}
        <Sidebar 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Main Content Area */}
        <main className="main-content">
          {currentView === 'overview' && (
            <OverviewView 
              onNavigate={handleNavigate} 
              pendingApprovalsCount={pendingApprovalsCount} 
            />
          )}
          {currentView === 'agents' && <AgentsView />}
          {currentView === 'tools' && <ToolsView />}
          {currentView === 'policies' && <PoliciesView />}
          {currentView === 'approvals' && (
            <ApprovalsView onUpdatePendingCount={setPendingApprovalsCount} />
          )}
          {currentView === 'traces' && <TracesView />}
          {currentView === 'playground' && (
            <PlaygroundView 
              onTriggerApproval={handleTriggerApprovalFromPlayground} 
              onTriggerAlert={handleTriggerAlert}
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;

