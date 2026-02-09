// src/components/landing/CoursePreviewCard.tsx
import { Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CoursePreviewCardProps {
  title: string;
  description: string;
  duration: string;
  rating: number;
  gradient: string;
}

export function CoursePreviewCard({
  title,
  description,
  duration,
  rating,
  gradient,
}: CoursePreviewCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      {/* Gradient Header */}
      <div className={`h-48 ${gradient}`} />

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
            <Clock size={14} />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="text-sm font-semibold">{rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>

        {/* CTA */}
        <Button
          variant="outline"
          className="w-full border-jc-blue text-jc-blue hover:bg-jc-blue hover:text-white"
        >
          Ver Más
        </Button>
      </div>
    </div>
  );
}