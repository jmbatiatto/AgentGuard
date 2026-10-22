import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Policy } from '../types/domain';
import { Plus, Search, ChevronDown, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { mockPolicies } from '../data/mockData';

export const PoliciesView: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getPolicies().then(data => {
      if (isMounted && data && data.length > 0) setPolicies(data);
    });
    return () => { isMounted = false; };
  }, []);

  const filteredPolicies = policies.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Policies" 
        subtitle="Define and enforce authorization rules across your workspace."
        actionButton={
          <button className="btn btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            <span>Create policy</span>
          </button>
        }
      />

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Policy Coverage Alert Banner */}
        <div style={{
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Policy coverage: 92%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--brand-primary)' }}>
                2 of 24 registered actions do not have an explicit authorization policy.
              </div>
            </div>
          </div>
          <button className="btn btn-secondary">
            Review coverage
          </button>
        </div>

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
              placeholder="Search policies..."
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
              <span>All decisions</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            <button className="btn btn-secondary">
              <span>All statuses</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        {/* Policies Table */}
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
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>POLICY</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>AGENT</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>ACTION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>CONDITION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>DECISION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => {
                let decisionBadge = 'badge badge-success';
                if (policy.decision === 'DENY') decisionBadge = 'badge badge-danger';
                if (policy.decision === 'REQUIRE_APPROVAL') decisionBadge = 'badge badge-warning';

                return (
                  <tr 
                    key={policy.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Policy Name */}
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {policy.name}
                    </td>

                    {/* Agent */}
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {policy.agent}
                    </td>

                    {/* Action in Monospace */}
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {policy.action}
                    </td>

                    {/* Condition Box */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className="code-pill">
                        {policy.condition}
                      </span>
                    </td>

                    {/* Decision Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className={decisionBadge}>
                        <span className="badge-dot" />
                        <span>{policy.decision}</span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-success">
                        <span className="badge-dot" />
                        <span>{policy.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
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
                );
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            <span>Showing 5 of 18 policies</span>
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
