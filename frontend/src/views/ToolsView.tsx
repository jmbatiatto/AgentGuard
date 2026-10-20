import React, { useState } from 'react';
import { Plus, Search, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Header } from '../components/Header';
import { mockTools } from '../data/mockData';

export const ToolsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = mockTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Tools" 
        subtitle="Control the tools and resources available to your agents."
        actionButton={
          <button className="btn btn-primary">
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
