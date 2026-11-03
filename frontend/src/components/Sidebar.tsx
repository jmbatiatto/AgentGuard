import React from 'react';
import type { NavView } from '../types/domain';
import { SidebarNav } from './ui/dashboard-sidebar';
import { useAuth } from '../context/AuthContext';

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
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    logout();
    window.location.hash = '#auth';
  };

  return (
    <SidebarNav
      currentView={currentView}
      onNavigate={onNavigate}
      pendingApprovalsCount={pendingApprovalsCount}
      onLogout={handleLogout}
      currentUser={currentUser}
    />
  );
};

export default Sidebar;
