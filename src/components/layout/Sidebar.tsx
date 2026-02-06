import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarSection {
  title?: string;
  items: Array<{
    href: string;
    icon: ReactNode;
    label: string;
    isActive?: boolean;
    badge?: string | number;
    badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'calipso';
    badgeAnimated?: boolean;
  }>;
}

interface SidebarProps {
  role: 'administrador' | 'relator' | 'estudiante';
  userName: string;
  userSubtitle?: string;
  userAvatar?: string;
  sections: SidebarSection[];
  onLogout?: () => void;
}

const roleLabels = {
  administrador: 'Panel Admin',
  relator: 'Panel Relator',
  estudiante: 'Panel Estudiante',
};

export function Sidebar({
  role,
  userName,
  userSubtitle,
  userAvatar,
  sections,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-gradient-to-b from-jc-blue to-jc-blue-dark text-white flex flex-col z-20 shadow-2xl overflow-y-auto">
      {/* Header con Logo y Badge de Rol */}
      <div className="p-8">
        <Logo variant="white" size="sm" withText className="mb-2" />
        
        <div className="inline-flex items-center bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
          <span className="text-[10px] uppercase font-semibold tracking-widest text-blue-100">
            {roleLabels[role]}
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 space-y-1">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <p className="px-4 text-[10px] font-semibold text-blue-300/50 uppercase tracking-widest mb-2 mt-8 first:mt-0">
                {section.title}
              </p>
            )}
            
            {section.items.map((item, itemIndex) => (
              <SidebarNavItem
                key={itemIndex}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
                badge={item.badge}
                badgeVariant={item.badgeVariant}
                badgeAnimated={item.badgeAnimated}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer con Usuario */}
      <div className="p-6 bg-black/20 m-4 rounded-xl">
        <div className="flex items-center mb-3">
          <Avatar 
            src={userAvatar} 
            name={userName} 
            size="md" 
            className="mr-3" 
          />
          <div>
            <p className="text-sm font-semibold">{userName}</p>
            {userSubtitle && (
              <p className="text-xs text-blue-200">{userSubtitle}</p>
            )}
          </div>
        </div>
        
        {onLogout && (
          <button
            onClick={onLogout}
            className="block w-full py-2 bg-red-500/20 border border-red-400/30 text-red-100 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-colors text-center"
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </aside>
  );
}
