// src/components/landing/CoursesSection.tsx
import { useState, useEffect } from 'react';
import { X, Clock, Star } from 'lucide-react';
import { CoursePreviewCard } from './CoursePreviewCard';
import { Button } from '@/components/ui/Button';
import type { CursosContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';

interface CoursesSectionProps {
  content?: CursosContent;
}

// ── Modal "Ver todos los cursos" desde API ────────────────────────────────────
interface CursoAPI {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion_horas?: number;
  imagen_url?: string;
}

function ModalTodosCursos({ onClose }: { onClose: () => void }) {
  const [cursos, setCursos] = useState<CursoAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Importamos api dinámicamente para evitar dependencia circular
    import('@/api/axios').then(({ default: api }) => {
      api.get('/cursos/')
        .then(res => setCursos(res.data?.results ?? res.data ?? []))
        .catch(() => setCursos([]))
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Todos los Cursos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : cursos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No hay cursos disponibles.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {cursos.map(curso => (
                <div key={curso.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-jc-blue to-jc-calipso overflow-hidden">
                    {curso.imagen_url && <img src={curso.imagen_url} alt={curso.nombre} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    {curso.duracion_horas && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Clock size={12} /> {curso.duracion_horas} horas
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{curso.nombre}</h3>
                    {curso.descripcion && <p className="text-gray-500 text-sm line-clamp-2">{curso.descripcion}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sección principal ─────────────────────────────────────────────────────────

export function CoursesSection({ content = LANDING_DEFAULTS.cursos }: CoursesSectionProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <section id="cursos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            {content.titulo}
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2" />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">{content.descripcion}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {content.destacados.map((curso, i) => (
            <CoursePreviewCard
              key={i}
              title={curso.titulo}
              description={curso.descripcion}
              duration={curso.duracion}
              rating={curso.rating}
              gradient={curso.gradient}
              imageUrl={curso.imageUrl || undefined}
            />
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-jc-blue text-jc-blue hover:bg-jc-blue hover:text-white"
            onClick={() => setModalAbierto(true)}
          >
            Ver Todos los Cursos
          </Button>
        </div>
      </div>

      {modalAbierto && <ModalTodosCursos onClose={() => setModalAbierto(false)} />}
    </section>
  );
}