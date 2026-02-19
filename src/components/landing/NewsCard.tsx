// src/components/landing/NewsCard.tsx
import { Calendar, ArrowRight } from 'lucide-react';

interface NewsCardProps {
  title: string;
  excerpt: string;
  date: string;
  gradient: string;
  imageUrl?: string;
}

export function NewsCard({ title, excerpt, date, gradient, imageUrl }: NewsCardProps) {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      {/* Imagen o gradiente */}
      <div className={`h-48 ${!imageUrl ? gradient : ''} overflow-hidden`}>
        {imageUrl && <img src={imageUrl} alt={title} className="w-full h-full object-cover" />}
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
          <Calendar size={14} />
          <span>{date}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
        <button className="flex items-center space-x-2 text-jc-blue font-semibold hover:text-jc-calipso transition-colors group">
          <span>Leer más</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
}