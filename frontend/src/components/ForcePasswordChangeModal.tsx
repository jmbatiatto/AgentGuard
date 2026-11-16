import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { User } from '../types/domain';

export interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  userEmail?: string;
  onCompleted: (updatedUser: User) => void;
  onLogout: () => void;
}

export const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({
  isOpen,
  userEmail,
  onCompleted,
  onLogout,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState<{
    current?: boolean;
    new?: boolean;
    confirm?: boolean;
  }>({});

  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
    form?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apertura y control modal nativo con showModal()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Interceptar cancelación por teclado (Escape) para mantener el bloqueo de seguridad
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  // En caso de cierre imprevisto mientras isOpen sea true, reabrir inmediatamente
  const handleClose = () => {
    if (isOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  };

  const validateField = (
    field: 'current' | 'new' | 'confirm',
    values = { current: currentPassword, new: newPassword, confirm: confirmPassword }
  ): string | undefined => {
    if (field === 'current') {
      if (!values.current) {
        return 'Ingresa tu contraseña temporal actual.';
      }
    } else if (field === 'new') {
      if (!values.new) {
        return 'Ingresa la nueva contraseña.';
      }
      if (values.new.length < 8) {
        return 'La nueva contraseña debe tener al menos 8 caracteres.';
      }
      if (values.current && values.new === values.current) {
        return 'La nueva contraseña debe ser distinta a tu contraseña temporal.';
      }
    } else if (field === 'confirm') {
      if (!values.confirm) {
        return 'Confirma tu nueva contraseña.';
      }
      if (values.new && values.confirm !== values.new) {
        return 'Las contraseñas no coinciden.';
      }
    }
    return undefined;
  };

  const handleBlur = (field: 'current' | 'new' | 'confirm') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: 'current' | 'new' | 'confirm', value: string) => {
    if (field === 'current') setCurrentPassword(value);
    if (field === 'new') setNewPassword(value);
    if (field === 'confirm') setConfirmPassword(value);

    // Limpiar error al editar
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      form: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentErr = validateField('current');
    const newErr = validateField('new');
    const confirmErr = validateField('confirm');

    setTouched({ current: true, new: true, confirm: true });

    if (currentErr || newErr || confirmErr) {
      setErrors({
        current: currentErr,
        new: newErr,
        confirm: confirmErr,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updatedUser = await api.changePassword(currentPassword, newPassword);
      onCompleted(updatedUser);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.detail
          : (err as { message?: string })?.message || 'Error al actualizar la contraseña en el servidor.';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const activeErrorsList = [
    errors.current,
    errors.new,
    errors.confirm,
    errors.form,
  ].filter(Boolean) as string[];

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'none' } as Record<string, string>)}
      onCancel={handleCancel}
      onClose={handleClose}
      aria-labelledby="force-pwd-title"
      style={{
        margin: 'auto',
        padding: 0,
        border: '1px solid var(--border-strong, #24354A)',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card, #131C28)',
        color: 'var(--text-primary, #E8EEF5)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(14, 165, 233, 0.2)',
        maxWidth: '500px',
        width: 'calc(100% - 32px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px 28px' }}>
        {/* Cabecera del modal */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary, #0EA5E9)',
              flexShrink: 0,
            }}
          >
            <KeyRound size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#F59E0B',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                Primer Ingreso Requerido
              </span>
            </div>
            <h2
              id="force-pwd-title"
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary, #E8EEF5)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Actualización Obligatoria de Contraseña
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary, #B4C2D2)',
                marginTop: '6px',
                marginBottom: 0,
                lineHeight: 1.45,
              }}
            >
              Por políticas de seguridad y gobierno Zero-Trust, debes reemplazar tu contraseña temporal antes de acceder al panel de control de AgentGuard.
              {userEmail && (
                <span style={{ display: 'block', marginTop: '4px', color: 'var(--text-muted, #7A8BA0)', fontSize: '12px' }}>
                  Cuenta: <strong style={{ color: 'var(--text-primary, #E8EEF5)' }}>{userEmail}</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Resumen de errores accesible */}
        {activeErrorsList.length > 0 && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#FCA5A5',
              fontSize: '13px',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', color: '#FFFFFF', marginBottom: '2px' }}>
                Atención:
              </strong>
              {activeErrorsList.map((msg, idx) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Campo 1: Contraseña actual (temporal) */}
          <div>
            <label
              htmlFor="force-current-password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary, #B4C2D2)',
                marginBottom: '6px',
              }}
            >
              Contraseña actual (temporal) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="force-current-password"
                name="current-password"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                required
                autoFocus
                value={currentPassword}
                onChange={(e) => handleChange('current', e.target.value)}
                onBlur={() => handleBlur('current')}
                aria-invalid={Boolean(touched.current && errors.current)}
                placeholder="Ingresa la contraseña provista en tu invitación"
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 12px',
                  backgroundColor: 'var(--bg-app, #0B121A)',
                  border: `1px solid ${
                    touched.current && errors.current
                      ? '#EF4444'
                      : 'var(--border-subtle, rgba(148, 163, 184, 0.18))'
                  }`,
                  borderRadius: '8px',
                  color: 'var(--text-primary, #E8EEF5)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                aria-pressed={showCurrent}
                aria-label={showCurrent ? 'Ocultar contraseña temporal' : 'Mostrar contraseña temporal'}
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #7A8BA0)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.current && errors.current && (
              <span style={{ fontSize: '11px', color: '#F87171', marginTop: '4px', display: 'block' }}>
                {errors.current}
              </span>
            )}
          </div>

          {/* Campo 2: Nueva contraseña */}
          <div>
            <label
              htmlFor="force-new-password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary, #B4C2D2)',
                marginBottom: '6px',
              }}
            >
              Nueva contraseña <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="force-new-password"
                name="new-password"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                aria-describedby="force-pwd-constraints"
                aria-invalid={Boolean(touched.new && errors.new)}
                value={newPassword}
                onChange={(e) => handleChange('new', e.target.value)}
                onBlur={() => handleBlur('new')}
                placeholder="Crea una contraseña segura de 8+ caracteres"
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 12px',
                  backgroundColor: 'var(--bg-app, #0B121A)',
                  border: `1px solid ${
                    touched.new && errors.new
                      ? '#EF4444'
                      : 'var(--border-subtle, rgba(148, 163, 184, 0.18))'
                  }`,
                  borderRadius: '8px',
                  color: 'var(--text-primary, #E8EEF5)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                aria-pressed={showNew}
                aria-label={showNew ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #7A8BA0)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Requisitos obligatorios persistentes */}
            <p
              id="force-pwd-constraints"
              style={{
                fontSize: '11px',
                color: 'var(--text-muted, #7A8BA0)',
                marginTop: '5px',
                marginBottom: 0,
                lineHeight: 1.35,
              }}
            >
              Mínimo 8 caracteres y distinta a tu contraseña temporal.
            </p>
            {touched.new && errors.new && (
              <span style={{ fontSize: '11px', color: '#F87171', marginTop: '4px', display: 'block' }}>
                {errors.new}
              </span>
            )}
          </div>

          {/* Campo 3: Confirmar nueva contraseña */}
          <div>
            <label
              htmlFor="force-confirm-password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary, #B4C2D2)',
                marginBottom: '6px',
              }}
            >
              Confirmar nueva contraseña <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="force-confirm-password"
                name="confirm-new-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(touched.confirm && errors.confirm)}
                value={confirmPassword}
                onChange={(e) => handleChange('confirm', e.target.value)}
                onBlur={() => handleBlur('confirm')}
                placeholder="Repite exactamente tu nueva contraseña"
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 12px',
                  backgroundColor: 'var(--bg-app, #0B121A)',
                  border: `1px solid ${
                    touched.confirm && errors.confirm
                      ? '#EF4444'
                      : 'var(--border-subtle, rgba(148, 163, 184, 0.18))'
                  }`,
                  borderRadius: '8px',
                  color: 'var(--text-primary, #E8EEF5)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                aria-pressed={showConfirm}
                aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #7A8BA0)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.confirm && errors.confirm && (
              <span style={{ fontSize: '11px', color: '#F87171', marginTop: '4px', display: 'block' }}>
                {errors.confirm}
              </span>
            )}
          </div>

          {/* Acciones del formulario */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '11px 18px',
                backgroundColor: 'var(--primary, #0EA5E9)',
                color: 'var(--primary-foreground, #08111D)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(14, 165, 233, 0.25)',
                opacity: isSubmitting ? 0.75 : 1,
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Guardando contraseña...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Guardar nueva contraseña</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '9px 18px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary, #B4C2D2)',
                border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.18))',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <LogOut size={14} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
