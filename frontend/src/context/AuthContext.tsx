import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, DEMO_IDS } from '../services/api';
import type { User, UserRole, AuthCredentials, RegisterData } from '../types/domain';

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
}

export const DEMO_PROFILES: AuthUser[] = [
  {
    id: DEMO_IDS.USER_ADMIN_ID,
    name: 'Jonathan Araujo',
    email: 'admin@acmecorp.com',
    role: 'ADMIN',
    avatarInitials: 'JA',
    avatarBg: 'rgba(99, 102, 241, 0.2)',
    badgeColor: '#818CF8',
    description: 'Control total de plataforma, políticas PDP y credenciales del Gateway',
    canApproveHITL: true,
    canConfigurePolicies: true,
    canManageTeam: true,
  },
  {
    id: DEMO_IDS.USER_APPROVER_ID,
    name: 'Elena Rostova',
    email: 'compliance.lead@acmecorp.com',
    role: 'APPROVER',
    avatarInitials: 'ER',
    avatarBg: 'rgba(245, 158, 11, 0.2)',
    badgeColor: '#FBBF24',
    description: 'Oficial de Cumplimiento autorizado para resolver aprobaciones HITL',
    canApproveHITL: true,
    canConfigurePolicies: false,
    canManageTeam: false,
  },
  {
    id: DEMO_IDS.USER_OPERATOR_ID,
    name: 'Carlos Mendez',
    email: 'ops.engineer@acmecorp.com',
    role: 'OPERATOR',
    avatarInitials: 'CM',
    avatarBg: 'rgba(16, 185, 129, 0.2)',
    badgeColor: '#34D399',
    description: 'Ingeniero de Operaciones, simulación de agentes en el playground',
    canApproveHITL: false,
    canConfigurePolicies: false,
    canManageTeam: false,
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    name: 'Lucia Vance',
    email: 'sec.auditor@acmecorp.com',
    role: 'AUDITOR',
    avatarInitials: 'LV',
    avatarBg: 'rgba(56, 189, 248, 0.2)',
    badgeColor: '#38BDF8',
    description: 'Auditor de Seguridad con acceso de solo lectura a trazas e incidentes',
    canApproveHITL: false,
    canConfigurePolicies: false,
    canManageTeam: false,
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    name: 'Sofía Valenzuela',
    email: 'guest.viewer@acmecorp.com',
    role: 'VIEWER',
    avatarInitials: 'SV',
    avatarBg: 'rgba(148, 163, 184, 0.2)',
    badgeColor: '#94A3B8',
    description: 'Acceso de solo lectura al dashboard y métricas ejecutivas',
    canApproveHITL: false,
    canConfigurePolicies: false,
    canManageTeam: false,
  },
];

export function formatAuthUser(user: Partial<User> | Partial<AuthUser>): AuthUser {
  const email = user.email || 'usuario@acmecorp.com';
  const name = user.name || email.split('@')[0];
  const role: UserRole = user.role || 'ADMIN';
  const initials =
    user.avatarInitials ||
    (name
      ? name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'AG');

  // Coincidencia con perfiles demo
  const demoMatch = DEMO_PROFILES.find(
    (p) =>
      (user.id && p.id === user.id) ||
      (user.email && p.email.toLowerCase() === user.email.toLowerCase())
  );

  return {
    id: user.id || (demoMatch ? demoMatch.id : DEMO_IDS.USER_ADMIN_ID),
    name: user.name || (demoMatch ? demoMatch.name : name),
    email: email,
    role: role,
    organization_id: user.organization_id || user.organizationId || DEMO_IDS.ORG_ACME_ID,
    organizationId: user.organization_id || user.organizationId || DEMO_IDS.ORG_ACME_ID,
    avatarInitials: initials,
    avatarBg:
      demoMatch?.avatarBg ||
      (role === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
    badgeColor: demoMatch?.badgeColor || (role === 'ADMIN' ? '#818CF8' : '#34D399'),
    description: demoMatch?.description || `Usuario autenticado con rol ${role}`,
    canApproveHITL: ['ADMIN', 'APPROVER'].includes(role),
    canConfigurePolicies: ['ADMIN'].includes(role),
    canManageTeam: ['ADMIN'].includes(role),
    created_at: user.created_at,
  };
}

export interface AuthContextType {
  currentUser: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchUser: (userId: string) => void;
  availableUsers: AuthUser[];
  login: (emailOrCreds: string | AuthCredentials, password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_TOKEN_KEY = 'agentguard_token';
const STORAGE_USER_KEY = 'agentguard_user';
const STORAGE_ACTIVE_ID_KEY = 'agentguard_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(STORAGE_TOKEN_KEY));
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return formatAuthUser(parsed);
      } catch {
        // Fallback
      }
    }
    const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    if (savedId) {
      const found = DEMO_PROFILES.find((u) => u.id === savedId);
      if (found) return found;
    }
    return DEMO_PROFILES[0];
  });

  // Hidratación y validación de sesión al inicializar
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    api
      .getMe()
      .then((user) => {
        if (!isMounted) return;
        const formatted = formatAuthUser(user);
        setCurrentUser(formatted);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, user.id);
        setIsAuthenticated(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Token de autenticación expirado o inválido:', err);
        // Purgar sesión ante token inválido o expirado
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
        setIsAuthenticated(false);
        setCurrentUser(DEMO_PROFILES[0]);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (emailOrCreds: string | AuthCredentials, maybePassword?: string) => {
    const credentials: AuthCredentials =
      typeof emailOrCreds === 'string'
        ? { email: emailOrCreds, password: maybePassword || '' }
        : emailOrCreds;

    const response = await api.login(credentials);
    localStorage.setItem(STORAGE_TOKEN_KEY, response.access_token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, response.user.id);
    setCurrentUser(formatAuthUser(response.user));
    setIsAuthenticated(true);
  };

  const register = async (data: RegisterData) => {
    const response = await api.register(data);
    localStorage.setItem(STORAGE_TOKEN_KEY, response.access_token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, response.user.id);
    setCurrentUser(formatAuthUser(response.user));
    setIsAuthenticated(true);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
    setIsAuthenticated(false);
    setCurrentUser(DEMO_PROFILES[0]);
  }, []);

  const switchUser = (userId: string) => {
    const target = DEMO_PROFILES.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(target));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, target.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        switchUser,
        availableUsers: DEMO_PROFILES,
        login,
        register,
        logout,
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
