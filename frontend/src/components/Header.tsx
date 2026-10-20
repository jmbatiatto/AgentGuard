import React from 'react';
import { ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/useTheme';

interface HeaderProps {
  title: string;
  subtitle: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actionButton }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      height: 'var(--header-height)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-app)',
      flexShrink: 0,
    }}>
      {/* View Title & Subtitle */}
      <div>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.015em',
          lineHeight: '1.2',
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '2px',
        }}>
          {subtitle}
        </p>
      </div>

      {/* Right Controls: Action + Theme Toggle + Operational Status + User profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {actionButton}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Intercambiar tema claro/oscuro"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: theme === 'dark' ? '#FBBF24' : '#0284C7',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
          }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Operational Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '9999px',
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 6px #10B981',
          }} />
          <span>All systems operational</span>
        </div>

        {/* User Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '4px 8px 4px 4px',
          borderRadius: '8px',
          cursor: 'pointer',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'var(--avatar-bg)',
            border: '1px solid var(--avatar-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--avatar-text)',
          }}>
            MC
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.2' }}>
              Maya Chen
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Administrator
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: '2px' }} />
        </div>
      </div>
    </header>
  );
};
