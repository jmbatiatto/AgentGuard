import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type ToastType, type Toast } from '../../context/ToastContext';

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    title: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    bgColor: '#0F1D1A',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    iconColor: '#10B981',
    title: 'Éxito',
  },
  error: {
    icon: AlertCircle,
    bgColor: '#1E1218',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    iconColor: '#EF4444',
    title: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: '#1F1910',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    iconColor: '#F59E0B',
    title: 'Advertencia',
  },
  info: {
    icon: Info,
    bgColor: '#0E1726',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    iconColor: '#3B82F6',
    title: 'Información',
  },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      }}
      className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg max-w-sm w-full transition-all duration-200"
    >
      <div className="flex-shrink-0 mt-0.5" style={{ color: config.iconColor }}>
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: config.iconColor }}>
          {config.title}
        </div>
        <div className="text-xs text-slate-200 leading-relaxed break-words">{toast.message}</div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="flex-shrink-0 text-slate-400 hover:text-slate-100 hover:bg-white/10 p-1 rounded transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
