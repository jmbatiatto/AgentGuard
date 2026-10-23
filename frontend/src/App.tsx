import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeProvider';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './views/OverviewView';
import { AgentsView } from './views/AgentsView';
import { ToolsView } from './views/ToolsView';
import { PoliciesView } from './views/PoliciesView';
import { ApprovalsView } from './views/ApprovalsView';
import { TracesView } from './views/TracesView';
import { PlaygroundView } from './views/PlaygroundView';
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

  // Suscripción WebSocket global para mantener sincronizado el badge de la Sidebar
  useAgentGuardWebSocket({
    onNewApproval: () => {
      setPendingApprovalsCount(prev => prev + 1);
    },
    onResolvedApproval: () => {
      setPendingApprovalsCount(prev => Math.max(0, prev - 1));
    },
  });

  const handleTriggerApprovalFromPlayground = () => {
    setPendingApprovalsCount(prev => prev + 1);
  };

  return (
    <ThemeProvider>
      <div className="app-container">
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
              onNavigate={setCurrentView} 
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
              onNavigate={setCurrentView}
            />
          )}
          {currentView === 'settings' && (
            <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>
              <h2>Configuración del Espacio de Trabajo</h2>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
                Organización: Acme Networks (Tenant ID: org_acme_production)
              </p>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
