// src/components/landing/NewsSection.tsx
import { NewsCard } from './NewsCard';
import type { NoticiasContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';

interface NewsSectionProps {
  content?: NoticiasContent;
}

export function NewsSection({ content = LANDING_DEFAULTS.noticias }: NewsSectionProps) {
  const news = [
    { title: content.noticia1.titulo, excerpt: content.noticia1.resumen, date: content.noticia1.fecha, gradient: 'bg-gradient-to-br from-jc-blue-dark to-jc-calipso', imageUrl: content.noticia1.imageUrl || undefined },
    { title: content.noticia2.titulo, excerpt: content.noticia2.resumen, date: content.noticia2.fecha, gradient: 'bg-gradient-to-br from-jc-blue to-jc-blue-dark',    imageUrl: content.noticia2.imageUrl || undefined },
    { title: content.noticia3.titulo, excerpt: content.noticia3.resumen, date: content.noticia3.fecha, gradient: 'bg-gradient-to-br from-jc-calipso to-white',         imageUrl: content.noticia3.imageUrl || undefined },
  ];

  return (
    <section id="noticias" className="py-20 bg-white">
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
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <NewsCard key={index} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}