import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';

export const TracesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockTraces = [
    {
      id: 'exec_991',
      timestamp: 'Just now',
      agent: 'Finance Copilot',
      action: 'create_quote',
      resource: 'crm/quotes',
      amount: '$2,500',
      decision: 'ALLOW',
      latency: '24ms',
      status: '200 OK',
    },
    {
      id: 'exec_990',
      timestamp: '2 min ago',
      agent: 'Catalog Agent',
      action: 'update_price',
      resource: 'catalog/pricing',
      amount: '$10',
      decision: 'DENY',
      latency: '18ms',
      status: '403 Forbidden',
    },
    {
      id: 'exec_989',
      timestamp: '12 min ago',
      agent: 'Finance Copilot',
      action: 'refund.create',
      resource: 'payment/pay_0031',
      amount: '$1,240',
      decision: 'REQUIRE_APPROVAL',
      latency: '31ms',
      status: '202 Pending HITL',
    },
    {
      id: 'exec_988',
      timestamp: '25 min ago',
      agent: 'Data Analyst',
      action: 'export_customers',
      resource: 'db/users',
      amount: '2,841 rows',
      decision: 'DENY',
      latency: '12ms',
      status: '403 Forbidden + Alert',
    },
    {
      id: 'exec_987',
      timestamp: '42 min ago',
      agent: 'Support Assistant',
      action: 'customer.read',
      resource: 'customer/cus_1042',
      amount: '-',
      decision: 'ALLOW',
      latency: '15ms',
      status: '200 OK',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header 
        title="Execution Traces" 
        subtitle="Immutable forensic audit log of all agent tool calls and authorization decisions."
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
          <div className="input-search" style={{ flex: 1, maxWidth: '380px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search traces by agent, action or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary">
              <span>All decisions</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>
            <button className="btn btn-secondary">
              <span>Last 24 hours</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        {/* Traces Table */}
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
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>TRACE ID</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>TIMESTAMP</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>AGENT</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>ACTION & RESOURCE</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>DECISION</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>LATENCY</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockTraces.map((trace) => {
                let badgeClass = 'badge badge-success';
                let Icon = CheckCircle;
                if (trace.decision === 'DENY') {
                  badgeClass = 'badge badge-danger';
                  Icon = XCircle;
                } else if (trace.decision === 'REQUIRE_APPROVAL') {
                  badgeClass = 'badge badge-warning';
                  Icon = AlertCircle;
                }

                return (
                  <tr 
                    key={trace.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#38BDF8' }}>
                      {trace.id}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {trace.timestamp}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {trace.agent}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
                        {trace.action}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {trace.resource}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={badgeClass}>
                        <Icon size={12} />
                        <span>{trace.decision}</span>
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {trace.latency}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {trace.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
