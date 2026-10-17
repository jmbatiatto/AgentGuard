import React, { useState } from 'react';
import { Plus, Search, ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { mockAgents } from '../data/mockData';

export const AgentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.identifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Agents" 
        subtitle="Manage registered AI agents and their capabilities."
        actionButton={
          <button className="btn btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            <span>Register agent</span>
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Table Filters & Search Bar */}
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
              placeholder="Search agents by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary">
              <span>All owners</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => setStatusFilter(statusFilter === 'All' ? 'Active' : 'All')}
            >
              <span>{statusFilter === 'All' ? 'All statuses' : statusFilter}</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            <button className="btn btn-secondary">
              <SlidersHorizontal size={14} color="var(--text-muted)" />
              <span>More filters</span>
            </button>
          </div>
        </div>

        {/* Agents Table */}
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
                backgroundColor: 'rgba(11, 15, 23, 0.4)',
              }}>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>AGENT</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>IDENTIFIER</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>OWNER</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>ASSIGNED TOOLS</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>LAST ACTIVITY</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr 
                  key={agent.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Agent Name + Avatar */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#94A3B8',
                        flexShrink: 0,
                      }}>
                        {agent.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {agent.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {agent.type}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Identifier (Monospace) */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {agent.identifier}
                    </span>
                  </td>

                  {/* Owner */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                    {agent.owner}
                  </td>

                  {/* Assigned Tools Tags */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {agent.assignedTools.map(tool => (
                        <span key={tool} className="code-pill">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span className={agent.status === 'Active' ? 'badge badge-success' : 'badge badge-secondary'}>
                      <span className="badge-dot" />
                      <span>{agent.status}</span>
                    </span>
                  </td>

                  {/* Last Activity */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {agent.lastActivity}
                  </td>

                  {/* View Details Link */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <span>View details</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Footer with Pagination */}
          <div style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            <span>Showing {filteredAgents.length} of 12 agents</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>Previous</button>
              <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
