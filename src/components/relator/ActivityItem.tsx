// src/components/relator/ActivityItem.tsx
import type { LucideIcon } from 'lucide-react';

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  iconBgColor: string;
  iconColor: string;
  onClick?: () => void;
}

export function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  iconBgColor,
  iconColor,
  onClick,
}: ActivityItemProps) {
  return (
    <div 
      onClick={onClick}
      className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0 cursor-pointer hover:bg-slate-50 -mx-4 px-4 py-3 rounded-lg transition-colors"
    >
      <div className={`${iconBgColor} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
        <Icon className={iconColor} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 truncate">{description}</p>
        <p className="text-xs text-jc-calipso mt-1">{time}</p>
      </div>
    </div>
  );
}