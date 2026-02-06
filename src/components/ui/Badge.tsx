import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'calipso';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
  animated?: boolean;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
  animated = false,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full';
  
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    calipso: 'bg-jc-calipso text-white',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };
  
  const animationClass = animated ? 'animate-bounce' : '';
  
  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], animationClass, className)}>
      {children}
    </span>
  );
}
