// src/components/landing/HeroSection.tsx
import { CheckCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { HeroContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';

interface HeroSectionProps {
  content?: HeroContent;
}

export function HeroSection({ content = LANDING_DEFAULTS.hero }: HeroSectionProps) {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="pt-24 pb-20 bg-gradient-to-br from-jc-blue via-jc-blue-dark to-jc-calipso text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {content.titulo}
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              {content.subtitulo}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button onClick={() => scrollToSection('#cursos')} className="bg-white text-jc-blue hover:bg-gray-100" size="lg">
                Ver Cursos
              </Button>
              <Button onClick={() => scrollToSection('#contacto')} variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-jc-blue" size="lg">
                Contáctanos
              </Button>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg flex-shrink-0"><CheckCircle size={24} /></div>
                  <div>
                    <p className="font-semibold text-lg">{content.feature1_titulo}</p>
                    <p className="text-sm text-blue-200">{content.feature1_subtitulo}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg flex-shrink-0"><Clock size={24} /></div>
                  <div>
                    <p className="font-semibold text-lg">{content.feature2_titulo}</p>
                    <p className="text-sm text-blue-200">{content.feature2_subtitulo}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg flex-shrink-0"><Users size={24} /></div>
                  <div>
                    <p className="font-semibold text-lg">{content.feature3_titulo}</p>
                    <p className="text-sm text-blue-200">{content.feature3_subtitulo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}