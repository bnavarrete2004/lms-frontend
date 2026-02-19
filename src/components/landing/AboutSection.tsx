// src/components/landing/AboutSection.tsx
import { Zap, Eye, Award } from 'lucide-react';
import type { NosotrosContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';

interface AboutSectionProps {
  content?: NosotrosContent;
}

export function AboutSection({ content = LANDING_DEFAULTS.nosotros }: AboutSectionProps) {
  const cards = [
    { icon: Zap,   title: content.mision_titulo,  description: content.mision_texto,  color: 'text-jc-calipso', bgColor: 'bg-jc-calipso/10' },
    { icon: Eye,   title: content.vision_titulo,  description: content.vision_texto,  color: 'text-jc-blue',    bgColor: 'bg-jc-blue/10' },
    { icon: Award, title: content.valores_titulo, description: content.valores_texto, color: 'text-jc-cyan',    bgColor: 'bg-jc-cyan/10' },
  ];

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            {content.titulo}
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">{content.descripcion}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div key={index} className="text-center p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className={`${card.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
              <p className="text-gray-600">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}