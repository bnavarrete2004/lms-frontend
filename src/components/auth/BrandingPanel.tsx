import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';

interface Feature {
  icon: ReactNode;
  text: string;
}

interface BrandingPanelProps {
  title: string;
  subtitle: string;
  features?: Feature[];
  children?: ReactNode;
}

export function BrandingPanel({ title, subtitle, features, children }: BrandingPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-jc-calipso via-jc-cyan to-jc-blue text-white p-12 flex-col justify-between relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40 animate-pulse delay-700" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Logo */}
        <Logo variant="white" size="md" withText className="mb-8" />
        
        {/* Título y subtítulo */}
        <div className="mt-24">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {subtitle}
          </p>
        </div>
        
        {/* Features (opcional) */}
        {features && features.length > 0 && (
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 group">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                  {feature.icon}
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Contenido personalizado adicional */}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="relative z-10 text-sm text-white/70">
        © 2026 J&C Digital Training. Todos los derechos reservados.
      </div>
    </div>
  );
}
