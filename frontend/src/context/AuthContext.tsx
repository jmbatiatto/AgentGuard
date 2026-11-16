import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ROLE_DESCRIPTIONS, ROLE_STYLES } from '../constants/labels';
import type {
  User,
  UserRole,
  AuthCredentials,
  RegisterData,
  RegisterOrgData,
  RegisterOrgResponse,
  Organization,
} from '../types/domain';

export interface AuthUser extends User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  avatarBg: string;
  badgeColor: string;
  description: string;
  canApproveHITL: boolean;
  canConfigurePolicies: boolean;
  canManageTeam: boolean;
  canManageAlerts: boolean;
  canRunPlayground: boolean;
  canViewAudit: boolean;
  canResetDemo: boolean;
}

const VALID_ROLES: UserRole[] = ['ADMIN', 'APPROVER', 'OPERATOR', 'AUDITOR', 'VIEWER'];

function normalizeRole(role?: string): UserRole {
  const upper = (role || 'VIEWER').toUpperCase() as UserRole;
  return VALID_ROLES.includes(upper) ? upper : 'VIEWER';
}

export function formatAuthUser(
  user: Partial<User> | Partial<AuthUser> & { organization_name?: string },
  orgName?: string
): AuthUser {
  const email = user.email || '';
  const name = user.name || (email ? email.split('@')[0] : 'Usuario');
  const role: UserRole = normalizeRole(user.role);
  const orgId = user.organization_id || user.organizationId || '';
  const resolvedOrgName = orgName || (user as any).organization_name || (user as any).organization?.name || '';
  const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.VIEWER;

  const initials =
    user.avatarInitials ||
    (name
      ? name
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'AG');

  return {
    id: user.id || '',
    name,
    email,
    role,
    organization_id: orgId,
    organizationId: orgId,
    avatarInitials: initials,
    avatarBg: roleStyle.bg,
    badgeColor: roleStyle.color,
    description: ROLE_DESCRIPTIONS[role] || `Usuario autenticado con rol ${role}`,
    canApproveHITL: role === 'ADMIN' || role === 'APPROVER',
    canConfigurePolicies: role === 'ADMIN',
    canManageTeam: role === 'ADMIN',
    canManageAlerts: role === 'ADMIN' || role === 'APPROVER' || role === 'OPERATOR',
    canRunPlayground: role === 'ADMIN' || role === 'OPERATOR',
    canViewAudit: role === 'ADMIN' || role === 'AUDITOR',
    canResetDemo: role === 'ADMIN' && (email.toLowerCase().endsWith('@acmecorp.com') || resolvedOrgName === 'Acme Corp'),
    created_at: user.created_at,
  };
}

const UNAUTHENTICATED_USER: AuthUser = {
  id: '',
  name: 'Sesión no iniciada',
  email: '',
  role: 'VIEWER',
  organization_id: '',
  organizationId: '',
  avatarInitials: '--',
  avatarBg: ROLE_STYLES.VIEWER.bg,
  badgeColor: ROLE_STYLES.VIEWER.color,
  description: 'Inicia sesión para operar dentro de tu organización',
  canApproveHITL: false,
  canConfigurePolicies: false,
  canManageTeam: false,
  canManageAlerts: false,
  canRunPlayground: false,
  canViewAudit: false,
  canResetDemo: false,
};

export interface AuthContextType {
  currentUser: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentOrganizationId: string;
  currentOrganization: Organization | null;
  login: (emailOrCreds: string | AuthCredentials, password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  registerOrg: (data: RegisterOrgData) => Promise<RegisterOrgResponse>;
  logout: () => void;
  refreshOrganization: () => Promise<void>;
  applyAuthenticatedSession: (token: string, rawUser: User, explicitOrg?: Organization) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_TOKEN_KEY = 'agentguard_token';
const STORAGE_USER_KEY = 'agentguard_user';
const STORAGE_ACTIVE_ID_KEY = 'agentguard_active_user_id';
const STORAGE_ACTIVE_ORG_KEY = 'agentguard_active_org';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(STORAGE_TOKEN_KEY));
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return formatAuthUser(parsed);
      } catch {
        // Fallback fail-closed
      }
    }
    return UNAUTHENTICATED_USER;
  });

  const [currentOrganizationId, setCurrentOrganizationId] = useState<string>(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) return '';
    return (
      localStorage.getItem(STORAGE_ACTIVE_ORG_KEY) ||
      currentUser.organization_id ||
      ''
    );
  });

  const syncOrganization = useCallback(async (orgId: string) => {
    if (!orgId) {
      setCurrentOrganization(null);
      return;
    }
    try {
      const orgs = await api.listOrganizations();
      if (orgs && orgs.length > 0) {
        const matched = orgs.find((o) => o.id === orgId) || orgs[0];
        setCurrentOrganization(matched);
        setCurrentUser((prev) => ({
          ...prev,
          canResetDemo:
            prev.role === 'ADMIN' &&
            (prev.email.toLowerCase().endsWith('@acmecorp.com') || matched.name === 'Acme Corp'),
        }));
      }
    } catch {
      // Mantiene datos básicos de organización por ID si el detalle falla temporalmente
      setCurrentOrganization((prev) =>
        prev && prev.id === orgId
          ? prev
          : {
              id: orgId,
              name: 'Organización Activa',
              created_at: new Date().toISOString(),
            }
      );
    }
  }, []);

  const refreshOrganization = useCallback(async () => {
    if (currentOrganizationId) {
      await syncOrganization(currentOrganizationId);
    }
  }, [currentOrganizationId, syncOrganization]);

  // Hidratación y validación de sesión JWT al inicializar
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) {
      setIsAuthenticated(false);
      setCurrentUser(UNAUTHENTICATED_USER);
      setCurrentOrganization(null);
      setCurrentOrganizationId('');
      api.setActiveOrganizationId('');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    api
      .getMe()
      .then(async (user) => {
        if (!isMounted) return;
        const formatted = formatAuthUser(user);
        const orgId = formatted.organization_id || '';
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, formatted.id);
        if (orgId) {
          localStorage.setItem(STORAGE_ACTIVE_ORG_KEY, orgId);
          api.setActiveOrganizationId(orgId);
          setCurrentOrganizationId(orgId);
        }
        setCurrentUser(formatted);
        setIsAuthenticated(true);
        await syncOrganization(orgId);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Token de autenticación expirado o inválido:', err);
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
        localStorage.removeItem(STORAGE_ACTIVE_ORG_KEY);
        api.setActiveOrganizationId('');
        setIsAuthenticated(false);
        setCurrentUser(UNAUTHENTICATED_USER);
        setCurrentOrganization(null);
        setCurrentOrganizationId('');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [syncOrganization]);

  const applyAuthenticatedSession = useCallback(
    async (token: string, rawUser: User, explicitOrg?: Organization) => {
      const formatted = formatAuthUser(rawUser, explicitOrg?.name);
      const orgId = explicitOrg?.id || formatted.organization_id || '';

      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(rawUser));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, formatted.id);
      if (orgId) {
        localStorage.setItem(STORAGE_ACTIVE_ORG_KEY, orgId);
        api.setActiveOrganizationId(orgId);
      }

      setCurrentOrganizationId(orgId);
      setCurrentUser(formatted);
      if (explicitOrg) {
        setCurrentOrganization(explicitOrg);
      } else {
        await syncOrganization(orgId);
      }
      setIsAuthenticated(true);
    },
    [syncOrganization]
  );

  const login = async (emailOrCreds: string | AuthCredentials, maybePassword?: string) => {
    const credentials: AuthCredentials =
      typeof emailOrCreds === 'string'
        ? { email: emailOrCreds, password: maybePassword || '' }
        : emailOrCreds;

    const response = await api.login(credentials);
    await applyAuthenticatedSession(response.access_token, response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await api.register(data);
    await applyAuthenticatedSession(response.access_token, response.user);
  };

  const registerOrg = async (data: RegisterOrgData): Promise<RegisterOrgResponse> => {
    const response = await api.registerOrg(data);
    const userWithAdminName: User = {
      ...response.user,
      name: data.admin_name,
      organization_id: response.organization.id,
      organizationId: response.organization.id,
    };

    await applyAuthenticatedSession(
      response.access_token,
      userWithAdminName,
      response.organization
    );

    return {
      ...response,
      user: userWithAdminName,
    };
  };

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_ORG_KEY);
    api.setActiveOrganizationId('');
    setIsAuthenticated(false);
    setCurrentOrganizationId('');
    setCurrentOrganization(null);
    setCurrentUser(UNAUTHENTICATED_USER);
  }, []);

  const resolvedOrganization: Organization | null =
    currentOrganization ||
    (currentOrganizationId
      ? {
          id: currentOrganizationId,
          name: 'Organización Activa',
          created_at: new Date().toISOString(),
        }
      : null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        currentOrganizationId,
        currentOrganization: resolvedOrganization,
        login,
        register,
        registerOrg,
        logout,
        refreshOrganization,
        applyAuthenticatedSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
