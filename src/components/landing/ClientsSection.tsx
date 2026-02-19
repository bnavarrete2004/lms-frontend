// src/components/landing/ClientsSection.tsx
import { TestimonialCard } from './TestimonialCard';
import type { ClientesContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';

interface ClientsSectionProps {
  content?: ClientesContent;
}

export function ClientsSection({ content = LANDING_DEFAULTS.clientes }: ClientsSectionProps) {
  const testimonials = [
    {
      name: content.testimonio1.nombre,
      role: content.testimonio1.cargo.split(' - ')[0] ?? content.testimonio1.cargo,
      company: content.testimonio1.cargo.split(' - ')[1] ?? '',
      testimonial: content.testimonio1.texto,
      rating: 5,
    },
    {
      name: content.testimonio2.nombre,
      role: content.testimonio2.cargo.split(' - ')[0] ?? content.testimonio2.cargo,
      company: content.testimonio2.cargo.split(' - ')[1] ?? '',
      testimonial: content.testimonio2.texto,
      rating: 5,
    },
  ];

  return (
    <section id="clientes" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            {content.titulo}
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2" />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">{content.descripcion}</p>
        </div>

        {/* Logos de clientes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {content.logos.map((logo, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-md flex items-center justify-center h-32 hover:shadow-lg transition-shadow"
            >
              {logo.imageUrl ? (
                <img
                  src={logo.imageUrl}
                  alt={logo.nombre || `Logo ${i + 1}`}
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-300">
                  {logo.nombre || `LOGO ${i + 1}`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Testimonios */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}