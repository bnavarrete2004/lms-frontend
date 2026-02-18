// src/pages/admin/wizard/WizardStep4_Actividades.tsx
// Paso 4: Asignar materiales/actividades a lecciones.
// Placeholder informativo — la asignación de materiales se hace post-creación
// desde el repositorio central, una vez que el curso exista en el backend.

import { ChevronLeft, ChevronRight, BookOpen, FolderOpen, Info } from 'lucide-react';
import type { ModuloLocal, LeccionLocal } from '@/hooks/useCursoWizard';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  modulos: ModuloLocal[];
  lecciones: LeccionLocal[];
  leccionesPorModulo: (moduloLocalId: string) => LeccionLocal[];
  onSiguiente: () => void;
  onAnterior: () => void;
}

// ── Helper: label de tipo de lección ─────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  teorica:    'Teórica',
  practica:   'Práctica',
  evaluacion: 'Evaluación',
  mixta:      'Mixta',
};

// ── Componente ────────────────────────────────────────────────────────────────

export function WizardStep4_Actividades({
  modulos,
  lecciones,
  leccionesPorModulo,
  onSiguiente,
  onAnterior,
}: Props) {
  const totalLecciones = lecciones.length;
  const totalHoras = modulos.reduce((acc, m) => acc + (Number(m.horas_estimadas) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">

      {/* Banner informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex gap-4">
        <Info size={22} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-1">
            Los materiales se asignan después de crear el curso
          </p>
          <p className="text-sm text-blue-700">
            Una vez publicado el curso, podrás asignar videos, PDFs, quizzes y evaluaciones
            a cada lección desde el <strong>Repositorio Central</strong>. Solo los materiales
            con post-producción completa estarán disponibles para asignar.
          </p>
        </div>
      </div>

      {/* Resumen del curso hasta ahora */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-jc-blue" />
          Resumen de lo creado hasta ahora
        </h3>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
            <p className="text-3xl font-bold text-jc-blue">{modulos.length}</p>
            <p className="text-xs text-slate-500 mt-1">Módulos</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
            <p className="text-3xl font-bold text-jc-calipso">{totalLecciones}</p>
            <p className="text-xs text-slate-500 mt-1">Lecciones</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
            <p className="text-3xl font-bold text-slate-700">{totalHoras}h</p>
            <p className="text-xs text-slate-500 mt-1">Horas totales</p>
          </div>
        </div>

        {/* Estructura detallada */}
        <div className="space-y-3">
          {modulos.map((modulo, idx) => {
            const leccionesModulo = leccionesPorModulo(modulo._localId);
            return (
              <div key={modulo._localId} className="border border-slate-200 rounded-xl overflow-hidden">
                {/* Cabecera del módulo */}
                <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-jc-blue text-white text-xs font-bold flex items-center justify-center">
                      M{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">{modulo.nombre}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{leccionesModulo.length} lecciones</span>
                    <span>·</span>
                    <span>{modulo.horas_estimadas}h</span>
                  </div>
                </div>

                {/* Lecciones del módulo */}
                {leccionesModulo.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {leccionesModulo.map((leccion, lidx) => (
                      <div key={leccion._localId} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-jc-calipso/20 text-jc-calipso text-[10px] font-bold flex items-center justify-center">
                            L{lidx + 1}
                          </span>
                          <span className="text-sm text-slate-700">{leccion.nombre}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {leccion.tipo && (
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                              {TIPO_LABELS[leccion.tipo] ?? leccion.tipo}
                            </span>
                          )}
                          {leccion.duracion_minutos !== '' && (
                            <span>{leccion.duracion_minutos} min</span>
                          )}
                          <div className="flex items-center gap-1 text-amber-500">
                            <FolderOpen size={13} />
                            <span>Sin materiales</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-5 py-3 text-sm text-slate-400 italic">Sin lecciones</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <button
          onClick={onAnterior}
          className="inline-flex items-center px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
        >
          <ChevronLeft size={20} className="mr-2" />
          Anterior
        </button>

        <button
          onClick={onSiguiente}
          className="inline-flex items-center px-8 py-3 bg-jc-blue text-white rounded-lg font-semibold hover:bg-jc-blue-dark transition shadow-sm"
        >
          Siguiente: Revisar y Publicar
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>

    </div>
  );
}