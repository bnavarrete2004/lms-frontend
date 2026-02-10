import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'white' | 'color' | 'blue' | 'black';
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

export function Logo({ variant = 'white', size = 'md', withText = false, className }: LogoProps) {
  const logoFiles = {
    white: '/src/assets/images/logo_jc_white_transparent_md.png',
    color: '/src/assets/images/logo_jc_color_transparent.png',
    blue: '/src/assets/images/logo_jc_blue_transparent_sm.png',
    black: '/src/assets/images/logo_jc_black_md.png',
  };
  
  const sizes = {
    sm: 'h-10',
    md: 'h-16',
    lg: 'h-24',
  };
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  
  if (withText) {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <img 
          src={logoFiles[variant]} 
          alt="J&C Digital Training" 
          className={cn(sizes[size], 'w-auto')}
        />
        <span className={cn('font-bold tracking-tight', textSizes[size])}>
          J&C Digital Training
        </span>
      </div>
    );
  }
  
  return (
    <img 
      src={logoFiles[variant]} 
      alt="J&C Digital Training" 
      className={cn(sizes[size], 'w-auto', className)}
    />
  );
}
