// src/components/landing/TestimonialCard.tsx
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  testimonial: string;
  rating: number;
}

export function TestimonialCard({
  name,
  role,
  company,
  testimonial,
  rating,
}: TestimonialCardProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-jc-calipso hover:shadow-lg transition-shadow">
      {/* Header with Avatar */}
      <div className="flex items-center mb-4">
        <Avatar name={name} size="md" />
        <div className="ml-4">
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">
            {role} - {company}
          </p>
        </div>
      </div>

      {/* Testimonial Text */}
      <p className="text-gray-600 italic mb-4">"{testimonial}"</p>

      {/* Rating */}
      <div className="flex space-x-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={16} fill="#FCD34D" className="text-yellow-400" />
        ))}
      </div>
    </div>
  );
}