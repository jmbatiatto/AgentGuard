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
    <div className="relative mb-4">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/5 cursor-pointer transition-colors select-none group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[6px] bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[13px] shadow-xs shrink-0">
            {current.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-[13px] font-semibold leading-none mb-1 text-slate-900 dark:text-white truncate max-w-[120px]">
              {current}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 leading-none">
              Plan Pro
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[48px] left-0 w-full bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            {workspaces.map(ws => (
              <div 
                key={ws}
                onClick={() => { handleSelect(ws); setIsOpen(false); }}
                className={`px-3 py-2 mx-1 text-[13px] rounded-md cursor-pointer transition-colors ${
                  current === ws 
                    ? 'bg-black/[0.06] dark:bg-white/10 text-slate-900 dark:text-white font-medium' 
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/5'
                }`}
              >
                {ws}
              </div>
            ))}
            <div className="h-px bg-slate-100 dark:bg-white/10 my-1 mx-2" />
            <div 
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 mx-1 text-[13px] text-slate-500 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/5 rounded-md cursor-pointer flex items-center gap-2 transition-colors"
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
        className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-150 select-none
          ${isActive 
            ? 'bg-black/[0.06] dark:bg-white/10 text-slate-900 dark:text-white font-medium' 
            : 'text-slate-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <item.icon 
            className={`w-[16px] h-[16px] transition-colors
              ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white'}
            `} 
            strokeWidth={1.5} 
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-slate-400 dark:text-zinc-400 bg-black/[0.04] dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-[4px] shadow-2xs">
               {item.shortcut}
             </kbd>
          )}
          {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
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
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div 
              className="absolute top-0 bottom-0 border-l border-slate-200/80 dark:border-white/5"
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
    <aside className={`flex flex-col w-[240px] h-screen bg-[#F8F9FA] dark:bg-[#111113] border-r border-slate-200/80 dark:border-white/[0.08] px-3.5 pt-7 pb-4 font-sans select-none shrink-0 ${className}`}>
      {/* Workspace Switcher idéntico al modelo con suficiente separación superior */}
      <WorkspaceSwitcher selected={activeWorkspace} onSelect={onWorkspaceSelect} />

      {/* Lista de Navegación limpia y minimalista sin Search */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-1">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
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

      {/* Botones inferiores: Settings y Log out */}
      <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-0.5">
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
