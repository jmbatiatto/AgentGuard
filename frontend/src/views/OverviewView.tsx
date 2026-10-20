import React from 'react';
import { Bot, Activity, Ban, Clock, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { mockAlerts } from '../data/mockData';
import type { NavView } from '../types/domain';

interface OverviewViewProps {
  onNavigate: (view: NavView) => void;
  pendingApprovalsCount: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate, pendingApprovalsCount }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Overview" 
        subtitle="Monitor agent activity, decisions, and security posture."
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* KPI Top Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {/* Card 1: Active Agents */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Agents</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px', color: '#38BDF8' }}>
                <Bot size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>12</div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>+2 this month</div>
          </div>

          {/* Card 2: Total Executions */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Executions</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', color: '#818CF8' }}>
                <Activity size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>8,429</div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>+8.2% vs. last week</div>
          </div>

          {/* Card 3: Blocked Actions */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Blocked Actions</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: '#EF4444' }}>
                <Ban size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>147</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1.7% of executions</div>
          </div>

          {/* Card 4: Pending Approvals */}
          <div 
            className="card" 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}
            onClick={() => onNavigate('approvals')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Approvals</span>
              <div style={{ padding: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', color: '#F59E0B' }}>
                <Clock size={16} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingApprovalsCount}</div>
            <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>Oldest waiting 12 min</div>
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
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Execution activity</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Policy decisions over the last 7 days</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38BDF8' }} />
                  <span>Allowed 7,864</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <span>Blocked 147</span>
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
                <text x="45" y="208" fill="#64748B" fontSize="11">May 12</text>
                <text x="145" y="208" fill="#64748B" fontSize="11">May 13</text>
                <text x="245" y="208" fill="#64748B" fontSize="11">May 14</text>
                <text x="345" y="208" fill="#64748B" fontSize="11">May 15</text>
                <text x="445" y="208" fill="#64748B" fontSize="11">May 16</text>
                <text x="545" y="208" fill="#64748B" fontSize="11">May 17</text>
                <text x="635" y="208" fill="#64748B" fontSize="11">May 18</text>
              </svg>
            </div>
          </div>

          {/* Right Panel: Recent Alerts */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent alerts</h3>
              <button 
                onClick={() => onNavigate('traces')}
                style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                View all
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {mockAlerts.map(alert => {
                let iconColor = '#F59E0B';
                let Icon = AlertTriangle;
                if (alert.severity === 'critical') {
                  iconColor = '#EF4444';
                } else if (alert.severity === 'info') {
                  iconColor = '#38BDF8';
                  Icon = ShieldCheck;
                }

                return (
                  <div 
                    key={alert.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#0F1522',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ padding: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', flexShrink: 0 }}>
                      <Icon size={16} color={iconColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {alert.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                        {alert.description}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {alert.timeAgo}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Banner: Recent Activity Link */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent activity
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Latest authorization decisions across your workspace
            </div>
          </div>

          <button 
            onClick={() => onNavigate('traces')}
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>View execution traces</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
