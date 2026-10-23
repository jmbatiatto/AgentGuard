import React, { useState, useEffect } from 'react';
import { api, DEMO_IDS } from '../services/api';
import type { UserMember, UserRole, GatewayApiKey } from '../types/domain';
import {
  Shield,
  Key,
  Users,
  Building,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  Send,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Code2,
  Sliders,
  Database,
  Radio
} from 'lucide-react';
import { Header } from '../components/Header';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'apikeys' | 'team' | 'security' | 'siem'>('general');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // TAB 1: General & Tenant Profile
  // -------------------------------------------------------------
  const [orgName, setOrgName] = useState('Acme Corp Global');
  const [retentionDays, setRetentionDays] = useState(90);
  const [copiedTenantId, setCopiedTenantId] = useState(false);

  const copyTenantId = () => {
    navigator.clipboard.writeText(DEMO_IDS.ORG_ACME_ID);
    setCopiedTenantId(true);
    showToast('Tenant UUID copiado al portapapeles');
    setTimeout(() => setCopiedTenantId(false), 2000);
  };

  // -------------------------------------------------------------
  // TAB 2: Gateway API Keys (PEP)
  // -------------------------------------------------------------
  const [apiKeys, setApiKeys] = useState<GatewayApiKey[]>([
    {
      id: 'key_prod_01',
      name: 'PEP-Production-Agent-Interceptor',
      prefix: 'ag_live_7a3d9b01',
      secretMasked: 'ag_live_7a3d9b01••••••••••••••••••••••••e4c1',
      role: 'gateway_client',
      createdAt: '2026-03-01T12:00:00Z',
      lastUsedAt: 'Hace 2 minutos',
    },
    {
      id: 'key_sandbox_02',
      name: 'CI/CD-Integration-Test-Key',
      prefix: 'ag_test_88f2a014',
      secretMasked: 'ag_test_88f2a014••••••••••••••••••••••••9b27',
      role: 'gateway_client',
      createdAt: '2026-03-10T09:30:00Z',
      lastUsedAt: 'Hace 4 horas',
    },
  ]);

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState('gateway_client');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [codeSnippetLang, setCodeSnippetLang] = useState<'python' | 'langchain' | 'curl'>('python');

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const rawHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `ag_live_${rawHex}`;
    const newEntry: GatewayApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix: fullKey.slice(0, 16),
      secretMasked: `${fullKey.slice(0, 16)}••••••••••••••••••••••••${fullKey.slice(-4)}`,
      rawKey: fullKey,
      role: newKeyRole,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Nunca',
    };

    setApiKeys([newEntry, ...apiKeys]);
    setGeneratedKey(fullKey);
    setNewKeyName('');
    showToast('Nueva API Key de Gateway generada exitosamente');
  };

  // -------------------------------------------------------------
  // TAB 3: Team & RBAC Management (Live /api/v1/users)
  // -------------------------------------------------------------
  const [users, setUsers] = useState<UserMember[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('OPERATOR');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.getUsers(DEMO_IDS.ORG_ACME_ID);
      setUsers(data);
    } catch {
      showToast('Error al sincronizar usuarios del backend', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    setIsSubmittingUser(true);
    try {
      const created = await api.createUser({
        email: newUserEmail.trim(),
        role: newUserRole,
        organization_id: DEMO_IDS.ORG_ACME_ID,
      });

      if (created) {
        setUsers(prev => [created, ...prev]);
        showToast(`Usuario ${created.email} invitado exitosamente`);
        setIsUserModalOpen(false);
        setNewUserEmail('');
      } else {
        showToast('Error al crear usuario en la organización', 'error');
      }
    } catch {
      showToast('Fallo al invocar el endpoint de usuarios', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await api.updateUserRole(userId, newRole);
      if (updated) {
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
        showToast(`Rol actualizado a ${newRole} para ${updated.email}`);
      } else {
        showToast('No se pudo actualizar el rol en el backend', 'error');
      }
    } catch {
      showToast('Error de red al actualizar rol', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (users.length <= 1) {
      showToast('No puedes eliminar al único administrador del tenant', 'error');
      return;
    }
    if (!window.confirm(`¿Estás seguro de revocar el acceso a ${email}?`)) return;

    try {
      const success = await api.deleteUser(userId);
      if (success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast(`Usuario ${email} revocado de la organización`);
      } else {
        showToast('Error al eliminar usuario en el servidor', 'error');
      }
    } catch {
      showToast('Fallo al intentar eliminar usuario', 'error');
    }
  };

  // -------------------------------------------------------------
  // TAB 4: Security Stance & Policies
  // -------------------------------------------------------------
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [maxAutonomousAmount, setMaxAutonomousAmount] = useState(5000);

  // -------------------------------------------------------------
  // TAB 5: SIEM & Webhooks Egress
  // -------------------------------------------------------------
  const [webhookUrl, setWebhookUrl] = useState('https://siem-collector.acmecorp.internal/v1/security-events');
  const [siemFormat, setSiemFormat] = useState<'splunk' | 'datadog' | 'elastic' | 'slack'>('splunk');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setWebhookTestStatus(null);
    setTimeout(() => {
      setIsTestingWebhook(false);
      setWebhookTestStatus('HTTP 200 OK — Payload de incidente SIEM aceptado correctamente');
      showToast('Alerta de prueba despachada exitosamente al SIEM');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-app)' }}>
      {/* View Header */}
      <Header
        title="Configuración del Espacio de Trabajo & Gobernanza"
        subtitle="Gestión de Tenant Multi-tenant, Llaves de Acceso Gateway PEP, Miembros RBAC y Salida SIEM"
        actionButton={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--success-text)',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            Zero-Trust Enforced
          </div>
        }
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Toast Feedback */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '28px',
            backgroundColor: toastMessage.type === 'error' ? 'var(--danger-bg)' : 'var(--bg-card)',
            border: `1px solid ${toastMessage.type === 'error' ? 'var(--danger-border)' : 'var(--brand-primary)'}`,
            color: toastMessage.type === 'error' ? 'var(--danger-text)' : 'var(--text-primary)',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
            backdropFilter: 'blur(8px)',
          }}>
            {toastMessage.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} color="var(--success-text)" />}
            {toastMessage.text}
          </div>
        )}

        {/* Tenant Summary Banner */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
            }}>
              <Building size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {orgName}
                </h2>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818CF8',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}>
                  Enterprise Tier
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tenant ID:</span>
                <code style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--bg-app)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {DEMO_IDS.ORG_ACME_ID}
                </code>
                <button
                  onClick={copyTenantId}
                  title="Copiar Tenant UUID"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedTenantId ? 'var(--success-text)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  {copiedTenantId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Aislamiento</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Multi-Tenant Estricto (RLS)
              </span>
            </div>
            <div style={{ height: '32px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Motor PDP</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand-primary)' }}>
                PostgreSQL 16 + Redis 7
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          gap: '8px',
        }}>
          {[
            { id: 'general', label: 'General & Workspace', icon: Building },
            { id: 'apikeys', label: 'API Keys Gateway (PEP)', icon: Key },
            { id: 'team', label: `Equipo & Roles RBAC (${users.length})`, icon: Users },
            { id: 'security', label: 'Postura Fail-Closed', icon: Shield },
            { id: 'siem', label: 'Webhooks & SIEM', icon: Radio },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--brand-primary)' : 'currentColor'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------- */}
        {/* TAB 1: General & Workspace Profile                      */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Datos de la Organización
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nombre del Workspace Corporativo
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Región y Persistencia Primaria
                </label>
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Database size={15} color="var(--brand-primary)" />
                  US-East (Virginia) • PostgreSQL 16 Multi-Tenant RLS
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={() => showToast('Cambios del workspace guardados correctamente')}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Retención y Trazabilidad Forense
              </h3>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Período de Retención de Trazas de Ejecución
                </label>
                <select
                  value={retentionDays}
                  onChange={e => setRetentionDays(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value={30}>30 días (Tier Estándar)</option>
                  <option value={90}>90 días (Cumplimiento SOC2)</option>
                  <option value={180}>180 días (Cumplimiento ISO 27001)</option>
                  <option value={365}>365 días (Auditoría Financiera Extensa)</option>
                </select>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Las decisiones de autorización y payloads sanitizados se depuran automáticamente tras expirar.
                </p>
              </div>

              <div style={{
                padding: '14px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={16} color="var(--brand-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Inmutabilidad de Eventos de Auditoría
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                  Los registros de la tabla <code>audit_events</code> están sellados criptográficamente y no admiten operaciones de edición ni borrado (Append-Only WORM).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 2: Gateway API Keys (PEP Interception)              */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'apikeys' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Credenciales de Acceso Gateway (PEP)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Utilizadas por los agentes autónomos de IA y librerías cliente (Python SDK / LangChain / CrewAI) para autenticar interceptaciones en el Gateway.
                </p>
              </div>
              <button
                onClick={() => {
                  setGeneratedKey(null);
                  setIsKeyModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                Generar Nueva API Key
              </button>
            </div>

            {/* List of Active Keys */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '28px',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-app)' }}>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>NOMBRE / IDENTIFICADOR</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>SECRETO DE ACCESO</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PERMISO</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CREADO</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>ÚLTIMO USO</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map(k => (
                    <tr key={k.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{k.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{k.id}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <code style={{
                          fontSize: '12px',
                          backgroundColor: 'var(--bg-app)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}>
                          {k.secretMasked}
                        </code>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          color: 'var(--brand-primary)',
                          borderRadius: '12px',
                        }}>
                          {k.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(k.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {k.lastUsedAt}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Revocar la API Key "${k.name}"? Los agentes que la usen perderán acceso al Gateway.`)) {
                              setApiKeys(apiKeys.filter(item => item.id !== k.id));
                              showToast(`API Key "${k.name}" revocada`);
                            }
                          }}
                          title="Revocar credencial"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive Code Generator for AI Agents */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Code2 size={18} color="var(--brand-primary)" />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Integración Rápida con Frameworks de IA
                  </h4>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['python', 'langchain', 'curl'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeSnippetLang(lang)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: codeSnippetLang === lang ? 'var(--brand-primary)' : 'var(--bg-app)',
                        color: codeSnippetLang === lang ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <pre style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                fontFamily: 'Consolas, Monaco, monospace',
                overflowX: 'auto',
                lineHeight: 1.5,
              }}>
                {codeSnippetLang === 'python' && `import requests

# Inicializar interceptor de AgentGuard PEP
AGENTGUARD_GATEWAY = "http://localhost:8000/api/v1/gateway/execute"
HEADERS = {
    "X-AgentGuard-Key": "${apiKeys[0]?.prefix || 'ag_live_7a3d9b01'}...",
    "Content-Type": "application/json"
}

payload = {
    "organization_id": "${DEMO_IDS.ORG_ACME_ID}",
    "agent_id": "${DEMO_IDS.AGENT_SALES_ID}",
    "tool_id": "${DEMO_IDS.TOOL_CRM_ID}",
    "action_name": "create_quote",
    "parameters": {"amount": 2500, "customer_id": "cust_441"}
}

response = requests.post(AGENTGUARD_GATEWAY, json=payload, headers=HEADERS)
decision = response.json().get("decision")  # 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL'
print(f"Decisión del Gateway PEP: {decision}")`}

                {codeSnippetLang === 'langchain' && `from langchain.tools import tool
import requests

@tool
def execute_guarded_tool(action_name: str, **kwargs):
    """Ejecuta una herramienta empresarial protegida por la gobernanza de AgentGuard."""
    res = requests.post(
        "http://localhost:8000/api/v1/gateway/execute",
        headers={"X-AgentGuard-Key": "${apiKeys[0]?.prefix || 'ag_live_...'}..."},
        json={
            "organization_id": "${DEMO_IDS.ORG_ACME_ID}",
            "agent_id": "${DEMO_IDS.AGENT_SALES_ID}",
            "tool_id": "${DEMO_IDS.TOOL_STRIPE_ID}",
            "action_name": action_name,
            "parameters": kwargs
        }
    )
    data = res.json()
    if data["decision"] != "ALLOW":
        raise PermissionError(f"Bloqueado por AgentGuard: {data.get('error_message')}")
    return data.get("result")`}

                {codeSnippetLang === 'curl' && `curl -X POST "http://localhost:8000/api/v1/gateway/execute" \\
  -H "Content-Type: application/json" \\
  -H "X-AgentGuard-Key: ${apiKeys[0]?.prefix || 'ag_live_...'}..." \\
  -d '{
    "organization_id": "${DEMO_IDS.ORG_ACME_ID}",
    "agent_id": "${DEMO_IDS.AGENT_SALES_ID}",
    "tool_id": "${DEMO_IDS.TOOL_CRM_ID}",
    "action_name": "create_quote",
    "parameters": {"amount": 1200}
  }'`}
              </pre>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 3: Team & RBAC Management (Live Backend)            */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'team' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Miembros y Roles de Autorización RBAC
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Control de privilegios sobre la bandeja de aprobaciones HITL, edición de políticas e inspección forense.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={fetchUsers}
                  title="Refrescar lista desde PostgreSQL"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} className={isLoadingUsers ? 'spin' : ''} />
                  Sincronizar
                </button>
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} />
                  Invitar Miembro
                </button>
              </div>
            </div>

            {/* Live Users Table */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-app)' }}>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>USUARIO</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>ROL ASIGNADO</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PRIVILEGIOS CLAVE</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>FECHA DE INGRESO</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const initials = u.email.substring(0, 2).toUpperCase();
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: 'var(--brand-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {u.email}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                ID: {u.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          {/* Live Role Switcher dropdown */}
                          <select
                            value={u.role}
                            onChange={e => handleUpdateRole(u.id, e.target.value as UserRole)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: 'var(--bg-app)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: u.role === 'ADMIN' ? '#818CF8' : u.role === 'APPROVER' ? '#FBBF24' : '#34D399',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="APPROVER">APPROVER (HITL)</option>
                            <option value="OPERATOR">OPERATOR</option>
                            <option value="AUDITOR">AUDITOR</option>
                          </select>
                        </td>

                        <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {u.role === 'ADMIN' && 'Control total, edición de políticas, revocación de API keys'}
                          {u.role === 'APPROVER' && 'Aprobar/rechazar solicitudes HITL y transacciones sensibles'}
                          {u.role === 'OPERATOR' && 'Monitoreo de agentes y disparo de simulaciones'}
                          {u.role === 'AUDITOR' && 'Solo lectura para trazas de auditoría e incidentes SIEM'}
                        </td>

                        <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            title="Eliminar usuario"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              padding: '4px',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 4: Fail-Closed Security Stance                      */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'security' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Shield size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Postura Innegociable: Fail-Closed
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                En AgentGuard, la autorización opera bajo el principio estricto de denegación por defecto (Default DENY).
                Si una llamada no coincide con una política explícita, si el PDP no responde o ante cualquier ambigüedad, el resultado es siempre <code>DENY</code>.
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Denegación por Defecto (Fail-Closed)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Bloqueo garantizado de accesos no especificados
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--danger-text)',
                  borderRadius: '12px',
                }}>
                  BLOQUEADO POR REGLA
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Lock size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Sanitización Contextual (OWASP LLM06)
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Enmascaramiento preventivo de credenciales, tokens Bearer, secretos y tarjetas de crédito en el <code>request_context</code> antes de persistir en trazas forenses.
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Auto-Sanitizer de Payloads
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Protección activa contra fuga de datos confidenciales
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={maskSensitive}
                  onChange={e => {
                    setMaskSensitive(e.target.checked);
                    showToast(`Sanitización contextual ${e.target.checked ? 'activada' : 'desactivada'}`);
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Sliders size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Umbral de Impacto Financiero Autónomo
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Cualquier solicitud de herramienta que involucre un monto superior a este valor escalará obligatoriamente a estado <code>REQUIRE_APPROVAL</code> (HITL).
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  value={maxAutonomousAmount}
                  onChange={e => setMaxAutonomousAmount(Number(e.target.value))}
                  style={{
                    width: '140px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>USD</span>
                <button
                  onClick={() => showToast(`Umbral autónomo actualizado a $${maxAutonomousAmount.toLocaleString()} USD`)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 5: Webhooks & SIEM Egress                           */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'siem' && (
          <div style={{ maxWidth: '800px' }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Transmisión de Incidentes y Trazas a SIEM / SOC
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Exporta instantáneamente alertas críticas (Prompt Injection, Intentos de Exfiltración y Abuso de Privilegios) hacia tu centro de operaciones de seguridad.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Plataforma SIEM Destino
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'splunk', label: 'Splunk HEC' },
                    { id: 'datadog', label: 'Datadog Events' },
                    { id: 'elastic', label: 'Elastic SIEM' },
                    { id: 'slack', label: 'Slack Security' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSiemFormat(p.id as any)}
                      style={{
                        padding: '10px',
                        backgroundColor: siemFormat === p.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-app)',
                        border: siemFormat === p.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        color: siemFormat === p.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Webhook Endpoint URL
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isTestingWebhook ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send size={15} />
                  {isTestingWebhook ? 'Enviando Alerta de Prueba...' : 'Probar Envío de Alerta SIEM'}
                </button>

                <button
                  onClick={() => showToast('Configuración del SIEM guardada con éxito')}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Guardar Conector
                </button>
              </div>

              {webhookTestStatus && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '8px',
                  color: 'var(--success-text)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <CheckCircle size={15} />
                  {webhookTestStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Generar Nueva API Key                                  */}
      {/* ------------------------------------------------------------- */}
      {isKeyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Generar API Key para Gateway PEP
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Asigna un nombre descriptivo para identificar qué servicio o agente consumirá esta credencial.
            </p>

            {generatedKey ? (
              <div>
                <div style={{
                  padding: '14px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} />
                    Copia esta clave ahora
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Por motivos de seguridad, esta clave no volverá a mostrarse completa.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    style={{
                      padding: '0 14px',
                      backgroundColor: copiedKey ? 'var(--success-bg)' : 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      color: copiedKey ? 'var(--success-text)' : 'var(--text-secondary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey ? 'Copiada' : 'Copiar'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setIsKeyModalOpen(false);
                      setGeneratedKey(null);
                    }}
                    style={{
                      padding: '9px 18px',
                      backgroundColor: 'var(--brand-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Entendido, Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Nombre del Servicio o Agente
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sales-Agent-LangChain-Production"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Rol Asignado
                  </label>
                  <select
                    value={newKeyRole}
                    onChange={e => setNewKeyRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="gateway_client">Gateway Client (Ejecución de Acciones)</option>
                    <option value="auditor_reader">Auditor Reader (Solo Trazas)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    style={{
                      padding: '9px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 18px',
                      backgroundColor: 'var(--brand-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Generar Credencial
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Invitar Miembro / Crear Usuario                        */}
      {/* ------------------------------------------------------------- */}
      {isUserModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Invitar Miembro a la Organización
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Crea un nuevo usuario en PostgreSQL bajo el tenant <code>Acme Corp</code>.
            </p>

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Correo Electrónico Corporativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@acmecorp.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Rol RBAC de Autorización
                </label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="ADMIN">ADMIN — Acceso administrativo integral</option>
                  <option value="APPROVER">APPROVER — Aprobador en bucle humano (HITL)</option>
                  <option value="OPERATOR">OPERATOR — Operador de agentes y simulaciones</option>
                  <option value="AUDITOR">AUDITOR — Auditor de seguridad (Solo lectura)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: 'var(--brand-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: isSubmittingUser ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmittingUser ? 'Registrando...' : 'Dar de Alta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
