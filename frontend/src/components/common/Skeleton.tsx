import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Bloque base pulsante para simulación de estados de carga en AgentGuard.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  className = '',
  style,
}) => {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'rgba(148, 163, 184, 0.12)',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export interface SkeletonRowProps {
  cols?: number;
  height?: string;
  widths?: (string | number)[];
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_WIDTHS = ['65%', '45%', '75%', '50%', '35%', '60%', '40%', '30%'];

/**
 * Fila de tabla animada con efecto pulse que renderiza celdas <td> con barras de ancho variable.
 */
export const SkeletonRow: React.FC<SkeletonRowProps> = ({
  cols = 5,
  height = '14px',
  widths,
  className = '',
  style,
}) => {
  return (
    <tr
      className={`skeleton-pulse ${className}`}
      style={{
        borderBottom: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.14))',
        ...style,
      }}
    >
      {Array.from({ length: cols }).map((_, idx) => {
        const barWidth = widths?.[idx] ?? DEFAULT_WIDTHS[idx % DEFAULT_WIDTHS.length];
        return (
          <td
            key={idx}
            style={{
              padding: '14px 18px',
              verticalAlign: 'middle',
            }}
          >
            <div
              style={{
                width: barWidth,
                height,
                borderRadius: '4px',
                backgroundColor: 'rgba(148, 163, 184, 0.12)',
              }}
            />
          </td>
        );
      })}
    </tr>
  );
};

export interface SkeletonCardProps {
  height?: string;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Tarjeta rectangular animada oscura con barras de texto pulsantes para listas y bandejas.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height,
  lines = 3,
  className = '',
  style,
}) => {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        backgroundColor: 'var(--bg-card, #131C28)',
        border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.14))',
        borderRadius: '10px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height,
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Cabecera de la tarjeta: Título y badge simulado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              flexShrink: 0,
            }}
          />
          <div style={{ width: '50%', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(148, 163, 184, 0.15)' }} />
        </div>
        <div style={{ width: '60px', height: '20px', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.12)' }} />
      </div>

      {/* Líneas de contenido secundario */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === lines - 1 ? '40%' : `${85 - i * 15}%`,
              height: '11px',
              borderRadius: '3px',
              backgroundColor: 'rgba(148, 163, 184, 0.10)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  height?: string;
  headers?: string[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Tabla completa con encabezados y N filas de skeletons para vistas principales.
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  cols = 5,
  height = '14px',
  headers,
  className = '',
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-card, #131C28)',
        border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.14))',
        borderRadius: '10px',
        overflow: 'hidden',
        width: '100%',
        ...style,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        {headers && headers.length > 0 ? (
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.14))',
                backgroundColor: 'var(--table-header-bg, rgba(15, 24, 36, 0.65))',
              }}
            >
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '12px 18px',
                    color: 'var(--text-muted, #7A8BA0)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <SkeletonRow key={idx} cols={cols} height={height} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Skeleton;
