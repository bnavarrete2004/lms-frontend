// src/components/landing/NewsSection.tsx
import { NewsCard } from './NewsCard';
import type { NoticiasContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';

interface NewsSectionProps {
  content?: NoticiasContent;
}

export function NewsSection({ content = LANDING_DEFAULTS.noticias }: NewsSectionProps) {
  const gradients = [
    'bg-gradient-to-br from-jc-blue-dark to-jc-calipso',
    'bg-gradient-to-br from-jc-blue to-jc-blue-dark',
    'bg-gradient-to-br from-jc-calipso to-white',
  ];

  const noticias = [content.noticia1, content.noticia2, content.noticia3];

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
          {noticias.map((noticia, index) => (
            <NewsCard
              key={index}
              noticia={noticia}
              gradient={gradients[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}