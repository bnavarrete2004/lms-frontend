import { cn } from '@/lib/utils';

// Importar todas las imágenes
import logoWhite from '@/assets/images/logo_jc_white_transparent_md.png';
import logoColor from '@/assets/images/logo_jc_color_transparent.png';
import logoBlue  from '@/assets/images/logo_jc_blue_sm.png';
import logoBlack from '@/assets/images/logo_jc_black_md.png';

interface LogoProps {
  variant?: 'white' | 'color' | 'blue' | 'black';
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

export function Logo({ variant = 'white', size = 'md', withText = false, className }: LogoProps) {
  const logoFiles = {
    white: logoWhite,
    color: logoColor,
    blue:  logoBlue,
    black: logoBlack,
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