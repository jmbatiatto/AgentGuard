import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente EmptyState reutilizable y accesible para listas, tablas o bandejas vacías.
 * Estilo oscuro y sobrio en español alineado con el sistema de diseño de AgentGuard.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  style,
}) => {
  return (
    <div
      role="status"
      className={`empty-state-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        width: '100%',
        ...style,
      }}
    >
      {/* Icono envuelto en contenedor circular sobrio */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38BDF8',
          marginBottom: '16px',
        }}
      >
        {icon || <Inbox size={26} strokeWidth={1.8} />}
      </div>

      {/* Título en español */}
      <h3
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary, #E8EEF5)',
          marginBottom: '6px',
        }}
      >
        {title}
      </h3>

      {/* Descripción explicativa */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-muted, #7A8BA0)',
          maxWidth: '420px',
          lineHeight: '1.5',
          margin: 0,
        }}
      >
        {description}
      </p>

      {/* Botón de acción opcional */}
      {action && (
        <div style={{ marginTop: '20px' }}>
          <button
            type="button"
            onClick={action.onClick}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '13px',
            }}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
