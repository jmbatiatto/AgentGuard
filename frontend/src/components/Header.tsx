import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sun, Moon, Check, Shield, Lock, RotateCcw, LogOut, Building2 } from 'lucide-react';
import { useTheme } from '../context/useTheme';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/labels';
import { ResetDemoModal } from './ResetDemoModal';

interface HeaderProps {
  title: string;
  subtitle: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actionButton }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    currentUser,
    switchUser,
    availableUsers,
    logout,
    currentOrganization,
    availableOrganizations,
    switchOrganization,
  } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setIsOrgDropdownOpen(false);
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

  return (
    <header style={{
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

      {/* Right Controls: Action + Reset Demo + Theme Toggle + Operational Status + User RBAC Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {actionButton}

        {/* Reset Demo Button */}
        <button
          id="btn-header-reset-demo"
          onClick={() => setIsResetModalOpen(true)}
          title="Restablecer base de datos PostgreSQL y políticas al estado inicial de la demo (Factory Reset)"
          aria-label="Restablecer entorno demo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '34px',
            padding: '0 11px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F59E0B';
            e.currentTarget.style.color = '#F59E0B';
            e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
          }}
        >
          <RotateCcw size={14} style={{ color: '#F59E0B' }} />
          <span>Reset Demo</span>
        </button>

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
          <span>Todos los sistemas operativos</span>
        </div>

        {/* Organization / Tenant Selector Dropdown (INC-17) */}
        <div ref={orgDropdownRef} style={{ position: 'relative' }}>
          <button
            id="org-selector-button"
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            title="Cambiar organización o tenant de trabajo"
            aria-label="Selector de organización activa"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              height: '34px',
              padding: '0 10px',
              borderRadius: '8px',
              backgroundColor: isOrgDropdownOpen ? 'var(--bg-card-hover)' : 'var(--bg-card)',
              border: `1px solid ${isOrgDropdownOpen ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={15} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentOrganization?.name || 'Acme Corp'}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>

          {isOrgDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '240px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              padding: '6px',
              zIndex: 1000,
            }}>
              <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                ORGANIZACIONES DISPONIBLES
              </div>
              {availableOrganizations.map((org) => {
                const isSelected = org.id === currentOrganization?.id;
                return (
                  <div
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <Building2 size={14} style={{ color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {org.name}
                      </span>
                    </div>
                    {isSelected && <Check size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Profile Pill with RBAC Selector Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            id="user-profile-selector"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Cambiar perfil de usuario y contexto de autorización RBAC"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '4px 10px 4px 6px',
              borderRadius: '8px',
              backgroundColor: isDropdownOpen ? 'var(--bg-card-hover)' : 'var(--bg-card)',
              border: `1px solid ${isDropdownOpen ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {/* User Initials Avatar */}
            <div style={{
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
            }}>
              {currentUser.avatarInitials}
            </div>

            {/* User Info */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.2' }}>
                {currentUser.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: currentUser.badgeColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}>
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>
                {currentUser.canApproveHITL && (
                  <span style={{ fontSize: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', padding: '0 4px', borderRadius: '4px' }}>
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
          </div>

          {/* Interactive RBAC Switcher Dropdown Menu */}
          {isDropdownOpen && (
            <div style={{
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
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-app)',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="var(--brand-primary)" />
                  Contexto RBAC de Usuario
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Alterna el perfil para simular diferentes privilegios en la demo
                </div>
              </div>

              <div style={{ padding: '6px' }}>
                {availableUsers.map((profile) => {
                  const isSelected = profile.id === currentUser.id;
                  return (
                    <div
                      key={profile.id}
                      onClick={() => {
                        switchUser(profile.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--nav-active-bg)' : 'transparent',
                        border: isSelected ? '1px solid var(--nav-active-border)' : '1px solid transparent',
                        marginBottom: '4px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        backgroundColor: profile.avatarBg,
                        border: `1px solid ${profile.badgeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: profile.badgeColor,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}>
                        {profile.avatarInitials}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {profile.name}
                          </span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: profile.avatarBg,
                            color: profile.badgeColor,
                            border: `1px solid ${profile.badgeColor}`,
                          }}>
                            {ROLE_LABELS[profile.role] || profile.role}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          {profile.email}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.3 }}>
                          {profile.description}
                        </div>
                      </div>

                      {/* Selected Checkmark */}
                      {isSelected && (
                        <div style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '4px' }}>
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reset Demo Action within Popover */}
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)',
              }}>
                <button
                  id="btn-dropdown-reset-demo"
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
              </div>

              {/* Botón de Cerrar Sesión */}
              <div style={{
                padding: '8px 12px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)',
              }}>
                <button
                  id="btn-dropdown-logout"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                    window.location.hash = '#auth';
                  }}
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

              <div style={{
                padding: '8px 14px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Lock size={12} color="var(--brand-primary)" />
                Las decisiones HITL quedan selladas con el ID del usuario activo.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* In-App Confirmation & Reset Modal */}
      <ResetDemoModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </header>
  );
};

export default Header;
