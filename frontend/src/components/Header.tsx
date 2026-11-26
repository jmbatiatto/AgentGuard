import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Sun,
  Moon,
  Shield,
  Lock,
  RotateCcw,
  LogOut,
  Building2,
  ArrowLeftRight,
  Users,
} from 'lucide-react';
import { useTheme } from '../context/useTheme';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/labels';
import { ResetDemoModal } from './ResetDemoModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actionButton }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout, currentOrganization } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar popover al hacer clic fuera o pulsar Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSwitchAccount = () => {
    setIsDropdownOpen(false);
    logout();
    window.location.hash = '#auth';
  };

  const handleManageTeam = () => {
    setIsDropdownOpen(false);
    sessionStorage.setItem('agentguard_settings_tab', 'team');
    window.dispatchEvent(new CustomEvent('agentguard:settings-tab', { detail: 'team' }));
    window.location.hash = '#settings';
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '12px 28px 8px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-app)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* View Title */}
      <div style={{ flexShrink: 0, minWidth: 0 }}>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.015em',
            lineHeight: '1.2',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '2px',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls: Action + Theme + Operational Status + Locked Tenant + Real JWT Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap', flexShrink: 0 }}>
        {actionButton}

        {currentUser.canResetDemo && (
          <button
            id="btn-header-reset-demo"
            onClick={() => setIsResetModalOpen(true)}
            title="Restablecer base de datos PostgreSQL y políticas al estado inicial de la demo (Factory Reset)"
            aria-label="Restablecer entorno demo"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: '#F59E0B',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#F59E0B';
              e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            }}
          >
            <RotateCcw size={15} />
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Intercambiar tema claro/oscuro"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: theme === 'dark' ? '#FBBF24' : '#0284C7',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
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

        {/* Single-Tenant Locked Badge */}
        <div
          id="org-tenant-badge"
          title="Organización bloqueada por sesión JWT (aislamiento estricto multi-tenant)"
          aria-label="Organización activa de la sesión"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '36px',
            padding: '0 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Building2 size={15} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
          <span
            style={{
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentOrganization?.name || 'Organización'}
          </span>
          <Lock size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>

        {/* Real JWT User Profile Popover */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            id="user-profile-selector"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Ver sesión activa y opciones de cuenta"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              height: '36px',
              padding: '0 12px 0 6px',
              borderRadius: '8px',
              backgroundColor: isDropdownOpen ? 'var(--bg-card-hover)' : 'var(--bg-card)',
              border: `1px solid ${isDropdownOpen ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {/* User Initials Avatar */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: currentUser.avatarBg,
                border: `1px solid ${currentUser.badgeColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: currentUser.badgeColor,
              }}
            >
              {currentUser.avatarInitials}
            </div>

            {/* User Info */}
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: '1.2',
                }}
              >
                {currentUser.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: currentUser.badgeColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>
                {currentUser.canApproveHITL && (
                  <span
                    style={{
                      fontSize: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      color: '#FBBF24',
                      padding: '0 4px',
                      borderRadius: '4px',
                    }}
                  >
                    HITL
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{
                marginLeft: '4px',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* Session Info & Real Re-Auth Popover */}
          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.55), 0 0 1px rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                zIndex: 9999,
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Header del popover */}
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-app)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Shield size={14} color="var(--brand-primary)" />
                  Sesión Autenticada (JWT)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Privilegios verificados criptográficamente por el servidor
                </div>
              </div>

              {/* Tarjeta del usuario autenticado */}
              <div style={{ padding: '12px 14px' }}>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--nav-active-bg)',
                    border: '1px solid var(--nav-active-border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: currentUser.avatarBg,
                      border: `1px solid ${currentUser.badgeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: currentUser.badgeColor,
                      flexShrink: 0,
                    }}
                  >
                    {currentUser.avatarInitials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {currentUser.name}
                      </span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: currentUser.avatarBg,
                          color: currentUser.badgeColor,
                          border: `1px solid ${currentUser.badgeColor}`,
                          flexShrink: 0,
                        }}
                      >
                        {ROLE_LABELS[currentUser.role] || currentUser.role}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {currentUser.email}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        marginTop: '6px',
                        lineHeight: 1.35,
                      }}
                    >
                      {currentUser.description}
                    </div>
                    {currentOrganization && (
                      <div
                        style={{
                          marginTop: '8px',
                          paddingTop: '6px',
                          borderTop: '1px solid rgba(148, 163, 184, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Building2 size={11} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Tenant: {currentOrganization.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones de cuenta: Gestionar equipo (ADMIN) + Cambiar de cuenta + Reset Demo (solo ADMIN Acme) + Cerrar sesión */}
              <div
                style={{
                  padding: '8px 12px 10px 12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                {currentUser.canManageTeam && (
                  <button
                    id="btn-dropdown-manage-team"
                    type="button"
                    onClick={handleManageTeam}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--success-border)',
                      backgroundColor: 'var(--success-bg)',
                      color: 'var(--success-text)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(1.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'none';
                    }}
                  >
                    <Users size={13} />
                    <span>Gestionar equipo y usuarios</span>
                  </button>
                )}

                <button
                  id="btn-dropdown-switch-account"
                  type="button"
                  onClick={handleSwitchAccount}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    color: '#38BDF8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.16)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
                  }}
                >
                  <ArrowLeftRight size={13} />
                  <span>Cambiar de cuenta</span>
                </button>

                {currentUser.canResetDemo && (
                  <button
                    id="btn-dropdown-reset-demo"
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsResetModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      color: '#F59E0B',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.16)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Reiniciar Estado Demo (Factory Reset)</span>
                  </button>
                )}

                <button
                  id="btn-dropdown-logout"
                  type="button"
                  onClick={handleSwitchAccount}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#F87171',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.16)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                  }}
                >
                  <LogOut size={13} />
                  <span>Cerrar sesión</span>
                </button>
              </div>

              <div
                style={{
                  padding: '8px 14px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-app)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Lock size={12} color="var(--brand-primary)" />
                Las acciones y decisiones HITL quedan selladas con tu ID del JWT.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* In-App Confirmation & Reset Modal (ADMIN Acme only) */}
      {currentUser.canResetDemo && (
        <ResetDemoModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
