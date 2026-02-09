import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface SidebarNavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'calipso';
  badgeAnimated?: boolean;
}

export function SidebarNavItem({
  href,
  icon,
  label,
  isActive = false,
  badge,
  badgeVariant = 'calipso',
  badgeAnimated = false,
}: SidebarNavItemProps) {
  const baseStyles = 'flex items-center px-4 py-3 rounded-lg transition-all group';
  
  const activeStyles = isActive
  ? 'bg-white/10 border-l-4 border-jc-calipso rounded-r-lg font-medium text-white'
  : 'text-white/90 hover:bg-white/5 hover:text-white';

  return (
    <Link to={href} className={cn(baseStyles, activeStyles)}>
      <div className={cn(
        'flex items-center flex-1',
        badge ? 'justify-between' : ''
      )}>
        <div className="flex items-center">
          <div className={cn(
            'w-5 h-5 mr-3',
            isActive ? 'text-jc-calipso' : 'group-hover:text-jc-calipso'
          )}>
            {icon}
          </div>
          <span className={isActive ? 'font-medium' : ''}>{label}</span>
        </div>
        
        {badge && (
          <Badge 
            variant={badgeVariant} 
            size="sm" 
            animated={badgeAnimated}
          >
            {badge}
          </Badge>
        )}
      </div>
    </Link>
  );
}
