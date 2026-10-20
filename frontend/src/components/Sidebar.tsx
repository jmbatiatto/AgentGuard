import React from 'react';
import { 
  Shield, 
  LayoutGrid, 
  Bot, 
  Wrench, 
  ShieldCheck, 
  CheckCircle2, 
  GitBranch, 
  PlayCircle, 
  Settings, 
  ChevronDown 
} from 'lucide-react';
import type { NavView } from '../types/domain';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate, 
  pendingApprovalsCount 
}) => {
  const navItems = [
    { id: 'overview' as NavView, label: 'Overview', icon: LayoutGrid },
    { id: 'agents' as NavView, label: 'Agents', icon: Bot },
    { id: 'tools' as NavView, label: 'Tools', icon: Wrench },
    { id: 'policies' as NavView, label: 'Policies', icon: ShieldCheck },
    { 
      id: 'approvals' as NavView, 
      label: 'Approvals', 
      icon: CheckCircle2, 
      badge: pendingApprovalsCount 
    },
    { id: 'traces' as NavView, label: 'Execution Traces', icon: GitBranch },
    { id: 'playground' as NavView, label: 'Playground', icon: PlayCircle },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px 16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-primary)',
        }}>
          <Shield size={18} strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: '17px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}>
          AgentGuard
        </span>
      </div>

      {/* Workspace Selector */}
      <div style={{ padding: '0 16px 20px 16px' }}>
        <div style={{
          backgroundColor: 'var(--workspace-box-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: 'var(--avatar-bg)',
              border: '1px solid var(--avatar-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--avatar-text)',
            }}>
              AN
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Workspace
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Acme Networks
              </div>
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>

      {/* Navigation Section */}
      <div style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '4px 12px 10px 12px',
        }}>
          Workspace
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '7px',
                  backgroundColor: isActive ? 'var(--nav-active-bg)' : 'transparent',
                  color: isActive ? 'var(--nav-active-text)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--nav-active-border)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.12s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)';
                    e.currentTarget.style.color = 'var(--nav-hover-text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon 
                    size={17} 
                    strokeWidth={isActive ? 2.2 : 1.8} 
                    color={isActive ? 'var(--brand-primary)' : 'var(--text-muted)'} 
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#F59E0B',
                    color: '#000000',
                    fontSize: '11px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Security Posture Widget */}
      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Security posture
            </span>
            <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 700 }}>
              94%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '5px',
            backgroundColor: 'var(--border-subtle)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '10px',
          }}>
            <div style={{
              width: '94%',
              height: '100%',
              backgroundColor: '#10B981',
              borderRadius: '9999px',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
            }} />
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            2 recommendations available
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => onNavigate('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 12px',
            marginTop: '12px',
            borderRadius: '7px',
            backgroundColor: currentView === 'settings' ? 'var(--nav-active-bg)' : 'transparent',
            color: currentView === 'settings' ? 'var(--nav-active-text)' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.12s ease',
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'settings') {
              e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)';
              e.currentTarget.style.color = 'var(--nav-hover-text)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'settings') {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <Settings size={17} color="var(--text-muted)" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
