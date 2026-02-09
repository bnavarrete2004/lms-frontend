// src/components/landing/NewsSection.tsx
import { NewsCard } from './NewsCard';

export function NewsSection() {
  const news = [
    {
      title: 'Nuevos cursos de Transformación Digital',
      excerpt: 'Lanzamos una nueva línea de cursos enfocados en la transformación digital de las empresas y la adopción de nuevas tecnologías.',
      date: '05 Febrero 2026',
      gradient: 'bg-gradient-to-br from-jc-blue-dark to-jc-calipso',
    },
    {
      title: 'Certificación SENCE renovada para 2026',
      excerpt: 'Hemos renovado nuestra certificación SENCE, garantizando la calidad de nuestros programas y el cumplimiento de todos los estándares.',
      date: '28 Enero 2026',
      gradient: 'bg-gradient-to-br from-jc-blue to-jc-blue-dark',
    },
    {
      title: 'Tips para Capacitación Online Efectiva',
      excerpt: 'Descubre cómo sacar el máximo provecho a nuestra plataforma asincrónica con estos consejos prácticos para estudiantes y empresas.',
      date: '15 Enero 2026',
      gradient: 'bg-gradient-to-br from-jc-calipso to-white',
    },
  ];

  return (
    <section id="noticias" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Últimas Noticias
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
            Mantente informado sobre novedades, nuevos cursos y actualizaciones.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <NewsCard key={index} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}