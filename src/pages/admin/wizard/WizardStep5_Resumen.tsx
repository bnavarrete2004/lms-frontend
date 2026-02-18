// src/pages/admin/wizard/WizardStep5_Resumen.tsx
// Paso 5: Revisar toda la información y publicar el curso.
// Es el único paso que hace llamadas al backend (a través de publicarCurso del hook).

import { useState } from 'react';
import { ChevronLeft, CheckCircle2, Pencil, BookOpen, Clock, MapPin, Layers } from 'lucide-react';
import type { DatosCurso, ModuloLocal, LeccionLocal } from '@/hooks/useCursoWizard';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type OpcionPublicacion = 'activo' | 'borrador';

interface Props {
  curso: DatosCurso;
  modulos: ModuloLocal[];
  lecciones: LeccionLocal[];
  guardando: boolean;
  leccionesPorModulo: (moduloLocalId: string) => LeccionLocal[];
  onPublicar: () => Promise<void>;
  onAnterior: () => void;
  onIrAPaso: (paso: 1 | 2 | 3 | 4 | 5) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  teorica:    'Teórica',
  practica:   'Práctica',
  evaluacion: 'Evaluación',
  mixta:      'Mixta',
};

const MODALIDAD_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online:     'Online',
  mixto:      'Mixto',
};

const NIVEL_LABELS: Record<string, string> = {
  basico:     'Básico',
  intermedio: 'Intermedio',
  avanzado:   'Avanzado',
};

function Campo({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-slate-800 font-medium">{valor || <span className="text-slate-400 italic">No especificado</span>}</p>
    </div>
  );
}

// ── Modal de éxito ────────────────────────────────────────────────────────────

function ModalExito({
  nombreCurso,
  onVerCursos,
}: {
  nombreCurso: string;
  onVerCursos: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-[scaleIn_0.3s_ease-out]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">¡Curso Publicado Exitosamente!</h2>
        <p className="text-slate-600 mb-8">
          El curso <strong>"{nombreCurso}"</strong> ha sido creado y ya está disponible en la plataforma.
        </p>
        <button
          onClick={onVerCursos}
          className="w-full py-3 bg-jc-blue text-white rounded-lg font-semibold hover:bg-jc-blue-dark transition"
        >
          Ir a Gestión de Cursos
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function WizardStep5_Resumen({
  curso,
  modulos,
  lecciones,
  guardando,
  leccionesPorModulo,
  onPublicar,
  onAnterior,
  onIrAPaso,
}: Props) {
  const [opcion, setOpcion] = useState<OpcionPublicacion>('activo');
  const [publicado, setPublicado] = useState(false);

  const totalHoras = modulos.reduce((acc, m) => acc + (Number(m.horas_estimadas) || 0), 0);

  async function handlePublicar() {
    const confirmMsg = opcion === 'activo'
      ? '¿Estás seguro de publicar este curso? Quedará disponible inmediatamente.'
      : '¿Deseas guardar este curso como borrador?';

    if (!window.confirm(confirmMsg)) return;

    await onPublicar();
    setPublicado(true);
  }

  if (publicado) {
    return (
      <ModalExito
        nombreCurso={curso.nombre}
        onVerCursos={() => window.location.href = '/admin/cursos'}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Información Básica ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Información Básica</h2>
          <button
            onClick={() => onIrAPaso(1)}
            className="inline-flex items-center text-jc-blue hover:text-jc-blue-dark font-semibold text-sm transition"
          >
            <Pencil size={14} className="mr-1" /> Editar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <Campo label="Nombre del Curso" valor={curso.nombre} />
          </div>
          <Campo
            label="Código SENCE"
            valor={curso.codigo_sence ? `#${curso.codigo_sence}` : 'Sin código SENCE'}
          />
          <Campo
            label="Horas Totales"
            valor={curso.horas_totales ? `${curso.horas_totales} horas` : undefined}
          />
          <Campo
            label="Modalidad"
            valor={curso.modalidad ? MODALIDAD_LABELS[curso.modalidad] : undefined}
          />
          <Campo
            label="Nivel"
            valor={curso.nivel ? NIVEL_LABELS[curso.nivel] : undefined}
          />
          <Campo label="Ciudad" valor={curso.ciudad} />
          <div className="col-span-2">
            <Campo label="Descripción" valor={
              <span className="text-sm text-slate-600 font-normal">{curso.descripcion}</span>
            } />
          </div>
        </div>
      </div>

      {/* ── Estructura del Curso ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-800">Estructura del Curso</h2>
          <button
            onClick={() => onIrAPaso(2)}
            className="inline-flex items-center text-jc-blue hover:text-jc-blue-dark font-semibold text-sm transition"
          >
            <Pencil size={14} className="mr-1" /> Editar
          </button>
        </div>
        <p className="text-slate-500 text-sm mb-6 flex items-center gap-4">
          <span className="flex items-center gap-1"><Layers size={14} /> {modulos.length} módulos</span>
          <span className="flex items-center gap-1"><BookOpen size={14} /> {lecciones.length} lecciones</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {totalHoras}h totales</span>
          {curso.ciudad && <span className="flex items-center gap-1"><MapPin size={14} /> {curso.ciudad}</span>}
        </p>

        <div className="space-y-4">
          {modulos.map((modulo, idx) => {
            const leccionesModulo = leccionesPorModulo(modulo._localId);
            return (
              <div key={modulo._localId} className="border border-slate-200 rounded-xl overflow-hidden hover:bg-slate-50 transition">
                {/* Cabecera módulo */}
                <div className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-lg bg-jc-blue text-white flex items-center justify-center font-bold flex-shrink-0">
                    M{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800">{modulo.nombre}</h3>
                    <p className="text-sm text-slate-500">
                      {modulo.horas_estimadas}h estimadas · {leccionesModulo.length} lecciones
                      {modulo.codigo_modulo && ` · ${modulo.codigo_modulo}`}
                    </p>
                  </div>
                </div>

                {/* Lecciones */}
                {leccionesModulo.length > 0 && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {leccionesModulo.map((leccion, lidx) => (
                      <div key={leccion._localId} className="flex items-center gap-3 px-5 py-3 pl-[76px]">
                        <span className="w-6 h-6 rounded-md bg-jc-calipso/20 text-jc-calipso text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          L{lidx + 1}
                        </span>
                        <span className="text-sm text-slate-700 flex-1">{leccion.nombre}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          {leccion.tipo && (
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                              {TIPO_LABELS[leccion.tipo] ?? leccion.tipo}
                            </span>
                          )}
                          {leccion.duracion_minutos !== '' && (
                            <span>{leccion.duracion_minutos} min</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Verificación final ─────────────────────────────────────────── */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex items-start gap-4">
        <CheckCircle2 size={22} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-800 mb-1">Todo listo para publicar</h3>
          <p className="text-sm text-green-700">
            El curso ha sido completamente configurado. Los estudiantes podrán inscribirse
            una vez que el curso esté activo.
          </p>
        </div>
      </div>

      {/* ── Opciones de publicación ────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
        <h3 className="font-semibold text-slate-800 mb-4">Opciones de Publicación</h3>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="publish-option"
              value="activo"
              checked={opcion === 'activo'}
              onChange={() => setOpcion('activo')}
              className="mt-1 accent-jc-blue"
            />
            <div>
              <p className="font-medium text-slate-800">Publicar ahora</p>
              <p className="text-sm text-slate-500">El curso estará disponible inmediatamente para inscripciones</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="publish-option"
              value="borrador"
              checked={opcion === 'borrador'}
              onChange={() => setOpcion('borrador')}
              className="mt-1 accent-jc-blue"
            />
            <div>
              <p className="font-medium text-slate-800">Guardar como borrador</p>
              <p className="text-sm text-slate-500">El curso se guardará pero no estará visible para estudiantes</p>
            </div>
          </label>
        </div>
      </div>

      {/* ── Navegación ────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <button
          onClick={onAnterior}
          disabled={guardando}
          className="inline-flex items-center px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition disabled:opacity-50"
        >
          <ChevronLeft size={20} className="mr-2" />
          Volver a Asignar Actividades
        </button>

        <button
          onClick={handlePublicar}
          disabled={guardando}
          className={`inline-flex items-center px-12 py-4 rounded-lg font-bold text-lg shadow-lg transition
            ${opcion === 'activo'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-slate-600 hover:bg-slate-700 text-white'
            }
            disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {guardando ? (
            <>
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Publicando...
            </>
          ) : (
            <>
              <CheckCircle2 size={22} className="mr-2" />
              {opcion === 'activo' ? 'Publicar Curso' : 'Guardar Borrador'}
            </>
          )}
        </button>
      </div>

    </div>
  );
}