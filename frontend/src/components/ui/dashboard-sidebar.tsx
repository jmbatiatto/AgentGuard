import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Wrench, 
  ShieldCheck, 
  Inbox, 
  Activity, 
  PlayCircle, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import type { NavView } from '../../types/domain';

export type NavItemData = {
  id: string;
  viewId?: NavView;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

interface WorkspaceSwitcherProps {
  selected?: string;
  onSelect?: (ws: string) => void;
}

export function WorkspaceSwitcher({ selected, onSelect }: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState('Acme Corp');
  
  const current = selected || internalSelected;
  const handleSelect = onSelect || setInternalSelected;

  const workspaces = ['Acme Corp', 'Personal Workspace', 'Client Sandbox'];

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors duration-200 select-none group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[13px] shrink-0">
            {current.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-[13px] font-semibold leading-none mb-1 text-white truncate max-w-[120px]">
              {current}
            </span>
            <span className="text-[11px] text-slate-500 leading-none">
              Plan Pro
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors duration-200 shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[52px] left-0 w-full bg-[#111B2A] border border-slate-700/60 rounded-xl shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            {workspaces.map(ws => (
              <div 
                key={ws}
                onClick={() => { handleSelect(ws); setIsOpen(false); }}
                className={`px-3 py-2 mx-1 text-[13px] rounded-lg cursor-pointer transition-colors duration-200 ${
                  current === ws 
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {ws}
              </div>
            ))}
            <div className="h-px bg-slate-700/60 my-1 mx-2" />
            <div 
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 mx-1 text-[13px] text-slate-500 hover:bg-slate-800/60 hover:text-white rounded-lg cursor-pointer flex items-center gap-2 transition-colors duration-200"
            >
              <span className="text-[16px] leading-none mb-0.5">+</span> Crear Espacio
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({ 
  item, 
  activeId, 
  onSelect,
  level = 0
}: { 
  item: NavItemData; 
  activeId: string; 
  onSelect: (id: string, viewId?: NavView) => void;
  level?: number;
}) {
  const isActive = activeId === item.id || (item.viewId && activeId === item.viewId);
  const hasChildren = !!item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id, item.viewId);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`group flex items-center justify-between py-2 rounded-lg cursor-pointer transition-colors duration-200 select-none border-l-2
          ${isActive 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500' 
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border-transparent'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 9}px`, paddingRight: '10px' }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <item.icon 
            className={`w-[16px] h-[16px] transition-colors duration-200 shrink-0
              ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'}
            `} 
            strokeWidth={1.5} 
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-slate-500 bg-slate-800/80 border border-slate-700/60 rounded-[4px]">
               {item.shortcut}
             </kbd>
          )}
          {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/20 text-emerald-400">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div 
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-1 mt-0.5">
            <div 
              className="absolute top-0 bottom-0 border-l border-slate-700/50"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map(child => (
              <NavItem 
                key={child.id} 
                item={child} 
                activeId={activeId} 
                onSelect={onSelect} 
                level={level + 1} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface DashboardSidebarProps {
  className?: string;
  currentView?: NavView;
  onNavigate?: (view: NavView) => void;
  pendingApprovalsCount?: number;
  activeWorkspace?: string;
  onWorkspaceSelect?: (ws: string) => void;
  onLogout?: () => void;
}

export function SidebarNav({ 
  className = '',
  currentView = 'overview',
  onNavigate,
  pendingApprovalsCount = 0,
  activeWorkspace = 'Acme Corp',
  onWorkspaceSelect,
  onLogout,
}: DashboardSidebarProps) {
  const navGroups: NavGroupData[] = [
    {
      items: [
        { id: 'home', viewId: 'overview', title: 'Vista General', icon: LayoutDashboard },
        { 
          id: 'inbox', 
          viewId: 'approvals', 
          title: 'Aprobaciones', 
          icon: Inbox, 
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined 
        },
        { id: 'analytics', viewId: 'traces', title: 'Trazas de Ejecución', icon: Activity },
      ]
    },
    {
      heading: 'Espacio de Trabajo',
      items: [
        { 
          id: 'projects', 
          viewId: 'agents', 
          title: 'Agentes', 
          icon: Bot,
        },
        { 
          id: 'tools', 
          viewId: 'tools', 
          title: 'Herramientas', 
          icon: Wrench,
        },
        { 
          id: 'policies', 
          viewId: 'policies', 
          title: 'Políticas', 
          icon: ShieldCheck,
        },
      ]
    },
    {
      heading: 'Desarrolladores',
      items: [
        { id: 'playground', viewId: 'playground', title: 'Playground', icon: PlayCircle },
        { id: 'api', viewId: 'settings', title: 'Configuración & RBAC', icon: Terminal },
      ]
    }
  ];

  const bottomItems: NavItemData[] = [
    { id: 'settings', viewId: 'settings', title: 'Configuración', icon: Settings, shortcut: '⌘,' },
    { id: 'logout', title: 'Cerrar sesión', icon: LogOut },
  ];

  const handleItemSelect = (id: string, viewId?: NavView) => {
    if (id === 'logout') {
      if (onLogout) onLogout();
      return;
    }
    if (viewId && onNavigate) {
      onNavigate(viewId);
    }
  };

  return (
    <aside className={`flex flex-col w-[240px] h-screen bg-[#0D1520] border-r border-slate-800/80 px-3 pt-5 pb-4 font-sans select-none shrink-0 ${className}`}>
      {/* Workspace Switcher en tarjeta con borde sutil */}
      <div className="mb-5 px-1">
        <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-3">
          <WorkspaceSwitcher selected={activeWorkspace} onSelect={onWorkspaceSelect} />
        </div>
      </div>

      {/* Lista de Navegación */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                {group.heading}
              </span>
            )}
            {group.items.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                activeId={currentView} 
                onSelect={handleItemSelect} 
              />
            ))}
          </div>
        ))}
      </div>

      {/* Footer: Configuración y Cerrar sesión separados por divisor */}
      <div className="mt-auto border-t border-slate-800 pt-4 flex flex-col gap-1">
        {bottomItems.map(item => (
          <NavItem 
            key={item.id} 
            item={item} 
            activeId={currentView} 
            onSelect={handleItemSelect} 
          />
        ))}
      </div>
    </aside>
  );
}

export default SidebarNav;
