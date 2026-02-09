// src/components/landing/CoursesSection.tsx
import { CoursePreviewCard } from './CoursePreviewCard';
import { Button } from '@/components/ui/Button';

export function CoursesSection() {
  const courses = [
    {
      title: 'Liderazgo y Gestión de Equipos',
      description: 'Desarrolla habilidades de liderazgo efectivo para gestionar equipos de alto rendimiento en entornos dinámicos.',
      duration: '40 horas',
      rating: 4.8,
      gradient: 'bg-gradient-to-br from-jc-blue-dark to-jc-blue',
    },
    {
      title: 'Excel Avanzado para Negocios',
      description: 'Domina herramientas avanzadas de Excel para análisis de datos, automatización y toma de decisiones estratégicas.',
      duration: '30 horas',
      rating: 4.9,
      gradient: 'bg-gradient-to-br from-jc-calipso to-jc-blue',
    },
    {
      title: 'Marketing Digital Estratégico',
      description: 'Aprende estrategias de marketing digital para impulsar tu negocio en el entorno online y redes sociales.',
      duration: '50 horas',
      rating: 4.7,
      gradient: 'bg-gradient-to-br from-jc-blue-dark to-jc-calipso',
    },
  ];

  return (
    <section id="cursos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Nuestros Cursos
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
            Explora nuestra amplia variedad de cursos diseñados para potenciar las habilidades de tu equipo.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {courses.map((course, index) => (
            <CoursePreviewCard key={index} {...course} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-jc-blue text-jc-blue hover:bg-jc-blue hover:text-white"
          >
            Ver Todos los Cursos
          </Button>
        </div>
      </div>
    </section>
  );
}