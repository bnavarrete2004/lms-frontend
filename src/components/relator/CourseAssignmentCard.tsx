// src/components/relator/CourseAssignmentCard.tsx
import { Badge } from '@/components/ui/Badge';
import type { LucideIcon } from 'lucide-react';

interface CourseAssignmentCardProps {
  title: string;
  duration: string;
  studentCount: number;
  status: 'active' | 'upcoming' | 'completed';
  icon?: LucideIcon;
  gradient: string;
  onClick?: () => void;
}

const statusConfig = {
  active: {
    label: 'Activo',
    variant: 'success' as const,
  },
  upcoming: {
    label: 'Próximamente',
    variant: 'info' as const,
  },
  completed: {
    label: 'Completado',
    variant: 'default' as const,
  },
};

export function CourseAssignmentCard({
  title,
  duration,
  studentCount,
  status,
  gradient,
  onClick,
}: CourseAssignmentCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <div 
      onClick={onClick}
      className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Icon */}
      <div className={`w-12 h-12 ${gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Title */}
      <h4 className="font-bold text-slate-800 mb-2 group-hover:text-jc-blue transition-colors">
        {title}
      </h4>

      {/* Meta info */}
      <p className="text-sm text-slate-600 mb-4">
        {duration} • {studentCount} estudiantes
      </p>

      {/* Status Badge */}
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    </div>
  );
}