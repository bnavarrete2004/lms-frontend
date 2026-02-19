// src/components/landing/MethodologySection.tsx
import type { MetodologiaContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';

interface MethodologySectionProps {
  content?: MetodologiaContent;
}

export function MethodologySection({ content = LANDING_DEFAULTS.metodologia }: MethodologySectionProps) {
  const steps = [
    { number: '1', title: content.paso1_titulo, description: content.paso1_texto },
    { number: '2', title: content.paso2_titulo, description: content.paso2_texto },
    { number: '3', title: content.paso3_titulo, description: content.paso3_texto },
    { number: '4', title: content.paso4_titulo, description: content.paso4_texto },
  ];

  return (
    <section id="metodologia" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            {content.titulo}
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
            {content.descripcion}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-br from-jc-calipso to-jc-cyan w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">{step.number}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}