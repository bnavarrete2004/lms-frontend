import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({
  variant = 'info',
  icon,
  title,
  children,
  className,
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-100',
      icon: 'text-jc-blue',
      title: 'text-jc-blue',
      text: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-100',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-700',
    },
    warning: {
      container: 'bg-amber-50 border-amber-100',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      text: 'text-amber-700',
    },
    danger: {
      container: 'bg-red-50 border-red-100',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-700',
    },
  };

  const defaultIcons = {
    info: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const styles = variants[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className={cn('p-6 rounded-xl border', styles.container, className)}>
      <div className="flex">
        <div className={cn('flex-shrink-0 mr-3', styles.icon)}>
          {displayIcon}
        </div>
        <div>
          {title && (
            <p className={cn('text-sm font-medium mb-1', styles.title)}>
              {title}
            </p>
          )}
          <div className={cn('text-xs', styles.text)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
