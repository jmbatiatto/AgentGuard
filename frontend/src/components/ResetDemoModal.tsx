import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, X, Database, Shield, Bot, Wrench } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ResetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetDemoModal: React.FC<ResetDemoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { applyAuthenticatedSession } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setStatusMessage('Purgando 12 tablas en PostgreSQL 16 y re-sembrando políticas PDP...');
    setErrorMessage(null);

    try {
      const res = await api.resetDemoData();
      if (res.success) {
        if (res.access_token && res.user) {
          await applyAuthenticatedSession(res.access_token, res.user, res.organization);
        }
        setIsSuccess(true);
        setStatusMessage(res.message || '¡Entorno demo restablecido con éxito a su estado inicial!');
        if (onSuccess) {
          onSuccess();
        }
        // Recargar la aplicación para que todos los estados y vistas reflejen la nueva DB
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Error desconocido al invocar el endpoint de reset');
        setStatusMessage(null);
        setIsResetting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Fallo de conexión de red con el backend en http://localhost:8000');
      setStatusMessage(null);
      setIsResetting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        overflow: 'hidden',
        color: 'var(--text-primary)',
        animation: 'fadeIn 0.15s ease',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B',
            }}>
              <RotateCcw size={20} className={isResetting ? 'animate-spin' : ''} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Restablecer Entorno Demo
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', margin: 0 }}>
                Factory Reset de PostgreSQL 16 para el tenant Acme Corp
              </p>
            </div>
          </div>

          {!isResetting && !isSuccess && (
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {isSuccess ? (
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success-text)' }}>
                ¡Base de Datos Re-sembrada con Éxito!
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                {statusMessage}
              </p>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '12px' }}>
                Actualizando la interfaz de usuario en 1 segundo...
              </div>
            </div>
          ) : isResetting ? (
            <div style={{
              padding: '24px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <RotateCcw size={32} color="#F59E0B" className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FBBF24' }}>
                Restableciendo Persistencia y Políticas...
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {statusMessage}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 0 }}>
                Esta acción ejecutará el script determinista <code className="code-pill">seed_demo.py --reset</code> directamente contra <strong>PostgreSQL 16</strong>. Se purgarán las operaciones acumuladas y se restaurará el estado oficial para la evaluación académica.
              </p>

              <div style={{
                marginTop: '16px',
                padding: '14px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Bot size={15} color="#38BDF8" />
                  <span><strong>3 Agentes:</strong> Sales, Support, Finance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Wrench size={15} color="#A78BFA" />
                  <span><strong>4 Herramientas:</strong> CRM, Stripe, Catálogo, DB</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Shield size={15} color="#10B981" />
                  <span><strong>Políticas PDP:</strong> Umbrales & Fail-Closed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Database size={15} color="#F59E0B" />
                  <span><strong>Trazas:</strong> Trazas limpias y 1 alerta base</span>
                </div>
              </div>

              {errorMessage && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: '8px',
                  color: 'var(--danger-text)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertTriangle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        {!isSuccess && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            <button
              onClick={onClose}
              disabled={isResetting}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isResetting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              id="btn-confirm-modal-reset"
              onClick={handleConfirmReset}
              disabled={isResetting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: isResetting ? '#78350F' : '#D97706',
                border: '1px solid #F59E0B',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isResetting ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isResetting) e.currentTarget.style.backgroundColor = '#B45309';
              }}
              onMouseLeave={(e) => {
                if (!isResetting) e.currentTarget.style.backgroundColor = '#D97706';
              }}
            >
              <RotateCcw size={15} className={isResetting ? 'animate-spin' : ''} />
              <span>{isResetting ? 'Re-sembrando...' : 'Confirmar y Re-sembrar Demo'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetDemoModal;
