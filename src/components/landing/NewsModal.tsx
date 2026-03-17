// src/components/landing/NewsModal.tsx
import { X, Calendar, ArrowLeft } from 'lucide-react';
import type { NoticiaContent } from '@/hooks/useLandingContent';

interface NewsModalProps {
  noticia: NoticiaContent;
  gradient: string;
  onClose: () => void;
}

export function NewsModal({ noticia, gradient, onClose }: NewsModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Imagen o gradiente */}
        <div className={`relative h-56 flex-shrink-0 ${!noticia.imageUrl ? gradient : ''} overflow-hidden`}>
          {noticia.imageUrl && (
            <img src={noticia.imageUrl} alt={noticia.titulo} className="w-full h-full object-cover" />
          )}
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-all"
          >
            <X size={18} />
          </button>

          {/* Fecha sobre la imagen */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white/90 text-sm">
            <Calendar size={14} />
            <span>{noticia.fecha}</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {noticia.titulo}
          </h2>

          {/* Línea separadora con acento de color */}
          <div className="w-12 h-1 bg-jc-calipso rounded-full mb-5" />

          {/* Resumen en destacado */}
          <p className="text-base text-gray-600 font-medium mb-5 leading-relaxed border-l-4 border-jc-calipso/40 pl-4 italic">
            {noticia.resumen}
          </p>

          {/* Contenido completo */}
          {noticia.contenido_completo ? (
            <div
              className="prose prose-slate max-w-none text-gray-700 leading-relaxed text-sm"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {noticia.contenido_completo}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">
              No hay contenido adicional para esta noticia.
            </p>
          )}
        </div>

        {/* Footer del modal */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-start">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-jc-blue hover:text-jc-calipso transition-colors"
          >
            <ArrowLeft size={16} />
            Volver a noticias
          </button>
        </div>
      </div>
    </div>
  );
}