/**
 * Diccionarios Canónicos de Localización al Español y Estilos de Badges para AgentGuard.
 * 
 * Centraliza todas las etiquetas legibles para el usuario final, erradicando
 * cadenas en inglés o formatos técnicos crudos en la interfaz.
 */

import type {
  UserRole,
  AgentStatus,
  Decision,
  AlertSeverity,
  RiskLevel,
  ApprovalStatus,
} from '../types/domain';

// ============================================================================
// 1. ROLES DE USUARIO (RBAC)
// ============================================================================
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  APPROVER: 'Aprobador (HITL)',
  OPERATOR: 'Operador',
  AUDITOR: 'Auditor',
  VIEWER: 'Visualizador',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Control total de plataforma, políticas PDP, claves de API y usuarios.',
  APPROVER: 'Autorización y resolución de solicitudes sensibles en bucle humano (HITL).',
  OPERATOR: 'Monitoreo de agentes, pruebas en sandbox y ejecución de herramientas.',
  AUDITOR: 'Acceso de solo lectura a trazas forenses, registros de auditoría e incidentes.',
  VIEWER: 'Acceso de consulta básica al dashboard ejecutivo y métricas generales.',
};

export const ROLE_STYLES: Record<UserRole, { color: string; bg: string; border: string }> = {
  ADMIN: { color: '#818CF8', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)' },
  APPROVER: { color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  OPERATOR: { color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  AUDITOR: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
  VIEWER: { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)' },
};

// ============================================================================
// 2. ESTADOS OPERATIVOS DE AGENTES DE IA
// ============================================================================
export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
  REVOKED: 'Revocado',
};

export const AGENT_STATUS_STYLES: Record<AgentStatus, { color: string; badgeClass: string }> = {
  ACTIVE: { color: '#10B981', badgeClass: 'badge badge-success' },
  SUSPENDED: { color: '#EF4444', badgeClass: 'badge badge-danger' },
  REVOKED: { color: '#64748B', badgeClass: 'badge badge-secondary' },
};

// ============================================================================
// 3. DECISIONES DEL MOTOR DE POLÍTICAS (PDP)
// ============================================================================
export const DECISION_LABELS: Record<Decision, string> = {
  ALLOW: 'Permitido',
  DENY: 'Denegado',
  REQUIRE_APPROVAL: 'Requiere Aprobación',
};

export const DECISION_BADGE_CLASSES: Record<Decision, string> = {
  ALLOW: 'badge badge-success',
  DENY: 'badge badge-danger',
  REQUIRE_APPROVAL: 'badge badge-warning',
};

export const DECISION_STYLES: Record<Decision, { color: string; bg: string; border: string }> = {
  ALLOW: { color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  DENY: { color: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
  REQUIRE_APPROVAL: { color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
};

// ============================================================================
// 4. SEVERIDAD DE ALERTAS DE SEGURIDAD
// ============================================================================
export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const SEVERITY_STYLES: Record<AlertSeverity, { color: string; bg: string; border: string }> = {
  LOW: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
  MEDIUM: { color: '#FCD34D', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  HIGH: { color: '#FDBA74', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' },
  CRITICAL: { color: '#FDA4AF', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' },
};

// ============================================================================
// 5. NIVELES DE RIESGO DE ACCIONES ATÓMICAS (PEP)
// ============================================================================
export const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico',
};

export const RISK_STYLES: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  LOW: { color: '#86EFAC', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  MEDIUM: { color: '#FCD34D', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  HIGH: { color: '#FDBA74', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' },
  CRITICAL: { color: '#FDA4AF', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' },
};

// ============================================================================
// 6. ESTADOS DE APROBACIÓN HUMANA (HITL)
// ============================================================================
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Expirada',
};

// ============================================================================
// 7. FUNCIONES AUXILIARES DE RESOLUCIÓN SEGURA
// ============================================================================
export function getRoleLabel(role: string): string {
  return (ROLE_LABELS as Record<string, string>)[role] || role;
}

export function getAgentStatusLabel(status: string): string {
  return (AGENT_STATUS_LABELS as Record<string, string>)[status] || status;
}

export function getDecisionLabel(decision: string): string {
  return (DECISION_LABELS as Record<string, string>)[decision] || decision;
}

export function getSeverityLabel(severity: string): string {
  return (SEVERITY_LABELS as Record<string, string>)[severity.toUpperCase()] || severity;
}

export function getRiskLabel(risk: string): string {
  return (RISK_LABELS as Record<string, string>)[risk.toUpperCase()] || risk;
}

export function getApprovalStatusLabel(status: string): string {
  return (APPROVAL_STATUS_LABELS as Record<string, string>)[status] || status;
}
