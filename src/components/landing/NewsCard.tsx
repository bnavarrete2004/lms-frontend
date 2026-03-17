// src/components/landing/NewsCard.tsx
import { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { NewsModal } from './NewsModal';
import type { NoticiaContent } from '@/hooks/useLandingContent';

interface NewsCardProps {
  noticia: NoticiaContent;
  gradient: string;
}

export function NewsCard({ noticia, gradient }: NewsCardProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      <article className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        {/* Imagen o gradiente */}
        <div className={`h-48 ${!noticia.imageUrl ? gradient : ''} overflow-hidden`}>
          {noticia.imageUrl && (
            <img src={noticia.imageUrl} alt={noticia.titulo} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
            <Calendar size={14} />
            <span>{noticia.fecha}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{noticia.titulo}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{noticia.resumen}</p>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center space-x-2 text-jc-blue font-semibold hover:text-jc-calipso transition-colors group"
          >
            <span>Leer más</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </article>

      {modalAbierto && (
        <NewsModal
          noticia={noticia}
          gradient={gradient}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}