// src/components/landing/ClientsSection.tsx
import { TestimonialCard } from './TestimonialCard';

export function ClientsSection() {
  const testimonials = [
    {
      name: 'María González',
      role: 'Gerente de RRHH',
      company: 'Empresa ABC',
      testimonial: 'La plataforma es muy intuitiva y nuestros colaboradores han podido capacitarse sin problemas. El seguimiento en tiempo real nos permite ver el progreso de cada uno.',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Director General',
      company: 'Empresa XYZ',
      testimonial: 'Los cursos están muy bien estructurados y el material es de excelente calidad. La certificación SENCE fue un plus importante para nuestra empresa.',
      rating: 5,
    },
  ];

  return (
    <section id="clientes" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Nuestros Clientes
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
            Empresas que confían en nuestra plataforma para la capacitación de sus equipos.
          </p>
        </div>

        {/* Client Logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-md flex items-center justify-center h-32 hover:shadow-lg transition-shadow"
            >
              <span className="text-2xl font-bold text-gray-300">LOGO {i}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}