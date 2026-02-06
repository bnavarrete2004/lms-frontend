import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  
  // Si no hay src, generar avatar con iniciales o UI Avatars
  const avatarSrc = src || (name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=064D91&color=fff` : '');
  
  return (
    <img
      src={avatarSrc}
      alt={alt || name || 'Avatar'}
      className={cn('rounded-full object-cover', sizes[size], className)}
    />
  );
}
