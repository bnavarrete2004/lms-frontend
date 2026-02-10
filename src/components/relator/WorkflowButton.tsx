// src/components/relator/WorkflowButton.tsx
import type { LucideIcon } from 'lucide-react';

interface WorkflowButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  gradient: string;
}

export function WorkflowButton({
  icon: Icon,
  title,
  description,
  onClick,
  gradient,
}: WorkflowButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${gradient} p-6 rounded-xl text-white text-left transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
    >
      <div className="flex items-start space-x-4">
        <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm text-white/90">{description}</p>
        </div>
        <svg 
          className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}