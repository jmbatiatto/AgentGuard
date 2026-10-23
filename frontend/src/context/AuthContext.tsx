import React, { createContext, useContext, useState } from 'react';
import { DEMO_IDS } from '../services/api';
import type { UserRole } from '../types/domain';

export interface AuthUser {
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
];

interface AuthContextType {
  currentUser: AuthUser;
  switchUser: (userId: string) => void;
  availableUsers: AuthUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'agentguard_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const found = DEMO_PROFILES.find(u => u.id === savedId);
      if (found) return found;
    }
    return DEMO_PROFILES[0]; // Default: Jonathan Araujo (ADMIN)
  });

  const switchUser = (userId: string) => {
    const target = DEMO_PROFILES.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(STORAGE_KEY, target.id);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, availableUsers: DEMO_PROFILES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
