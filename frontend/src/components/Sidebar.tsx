import React from 'react';
import type { NavView } from '../types/domain';
import { SidebarNav } from './ui/dashboard-sidebar';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  pendingApprovalsCount: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onNavigate, 
  pendingApprovalsCount,
  onLogout,
}) => {
  return (
    <SidebarNav
      currentView={currentView}
      onNavigate={onNavigate}
      pendingApprovalsCount={pendingApprovalsCount}
      onLogout={onLogout}
    />
  );
};
