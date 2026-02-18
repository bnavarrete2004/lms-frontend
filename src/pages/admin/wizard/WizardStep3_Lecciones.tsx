// src/pages/admin/wizard/WizardStep3_Lecciones.tsx
// Paso 3: Crear lecciones para cada módulo.
// Navegación por tabs — un tab por módulo.
// El admin puede agregar lecciones al módulo activo.

import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ModuloLocal, LeccionLocal } from '@/hooks/useCursoWizard';
import type { TipoLeccion } from '@/api/services/leccionService';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  modulos: ModuloLocal[];
  lecciones: LeccionLocal[];
  onAgregarLeccion: (moduloLocalId: string) => void;
  onActualizarLeccion: (localId: string, campos: Partial<Omit<LeccionLocal, '_localId' | 'moduloLocalId'>>) => void;
  onEliminarLeccion: (localId: string) => void;
  onSiguiente: () => void;
  onAnterior: () => void;
  leccionesPorModulo: (moduloLocalId: string) => LeccionLocal[];
}

interface ErroresLeccion {
  nombre?: string;
  duracion_minutos?: string;
  tipo?: string;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function inputCls(error?: string) {
  return `w-full px-4 py-3 border rounded-lg outline-none transition focus:ring-2
    ${error
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-slate-300 focus:ring-jc-calipso/30 focus:border-jc-calipso'
    }`;
}

// ── Card de lección ───────────────────────────────────────────────────────────

function LeccionCard({
  leccion,
  index,
  error,
  onActualizar,
  onEliminar,
}: {
  leccion: LeccionLocal;
  index: number;
  error?: ErroresLeccion;
  onActualizar: (campos: Partial<Omit<LeccionLocal, '_localId' | 'moduloLocalId'>>) => void;
  onEliminar: () => void;
}) {
  const confirmarEliminar = () => {
    if (window.confirm('¿Estás seguro de eliminar esta lección?')) {
      onEliminar();
    }
  };

  return (
    <div className="lesson-card bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-4">

        {/* Badge lección */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-jc-calipso text-white font-bold text-sm">
            L{index + 1}
          </span>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">

          {/* Cabecera */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Lección {index + 1}</h3>
            <button
              onClick={confirmarEliminar}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Eliminar lección"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre de la Lección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={leccion.nombre}
                onChange={e => onActualizar({ nombre: e.target.value })}
                className={inputCls(error?.nombre)}
                placeholder="Ej: ¿Qué es el sistema HACCP?"
              />
              {error?.nombre && (
                <p className="text-xs text-red-500 mt-1">{error.nombre}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción Breve
              </label>
              <textarea
                rows={2}
                value={leccion.descripcion}
                onChange={e => onActualizar({ descripcion: e.target.value })}
                className={inputCls() + ' resize-none'}
                placeholder="Describe brevemente el contenido de esta lección..."
              />
            </div>

            {/* Duración + Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Duración Estimada (min) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={leccion.duracion_minutos}
                  onChange={e => onActualizar({
                    duracion_minutos: e.target.value === '' ? '' : Number(e.target.value)
                  })}
                  className={inputCls(error?.duracion_minutos)}
                  placeholder="Ej: 30"
                />
                {error?.duracion_minutos && (
                  <p className="text-xs text-red-500 mt-1">{error.duracion_minutos}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tipo de Lección <span className="text-red-500">*</span>
                </label>
                <select
                  value={leccion.tipo}
                  onChange={e => onActualizar({ tipo: e.target.value as TipoLeccion | '' })}
                  className={inputCls(error?.tipo)}
                >
                  <option value="">Selecciona tipo</option>
                  <option value="teorica">Teórica</option>
                  <option value="practica">Práctica</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="mixta">Mixta</option>
                </select>
                {error?.tipo && (
                  <p className="text-xs text-red-500 mt-1">{error.tipo}</p>
                )}
              </div>
            </div>

            {/* Obligatoria */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`obligatoria-${leccion._localId}`}
                checked={leccion.obligatoria}
                onChange={e => onActualizar({ obligatoria: e.target.checked })}
                className="w-4 h-4 accent-jc-blue"
              />
              <label
                htmlFor={`obligatoria-${leccion._localId}`}
                className="text-sm text-slate-700 cursor-pointer"
              >
                Lección obligatoria
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function WizardStep3_Lecciones({
  modulos,
  lecciones,
  onAgregarLeccion,
  onActualizarLeccion,
  onEliminarLeccion,
  onSiguiente,
  onAnterior,
  leccionesPorModulo,
}: Props) {
  const [moduloActivoId, setModuloActivoId] = useState<string>(
    modulos[0]?._localId ?? ''
  );
  const [errores, setErrores] = useState<Record<string, ErroresLeccion>>({});

  const leccionesActivas = leccionesPorModulo(moduloActivoId);

  // ── Validación ──────────────────────────────────────────────────────────────

  function validar(): boolean {
    const totalLecciones = lecciones.length;
    if (totalLecciones === 0) {
      alert('Debes crear al menos una lección antes de continuar.');
      return false;
    }

    const nuevosErrores: Record<string, ErroresLeccion> = {};
    let hayErrores = false;

    lecciones.forEach(l => {
      const e: ErroresLeccion = {};
      if (!l.nombre.trim()) {
        e.nombre = 'El nombre de la lección es obligatorio.';
        hayErrores = true;
      }
      if (l.duracion_minutos === '' || Number(l.duracion_minutos) < 5) {
        e.duracion_minutos = 'La duración debe ser al menos 5 minutos.';
        hayErrores = true;
      }
      if (!l.tipo) {
        e.tipo = 'Selecciona un tipo de lección.';
        hayErrores = true;
      }
      if (Object.keys(e).length > 0) nuevosErrores[l._localId] = e;
    });

    setErrores(nuevosErrores);

    // Si hay errores en otro módulo, cambiar al primero que tenga errores
    if (hayErrores) {
      const primeraConError = lecciones.find(l => nuevosErrores[l._localId]);
      if (primeraConError && primeraConError.moduloLocalId !== moduloActivoId) {
        setModuloActivoId(primeraConError.moduloLocalId);
      }
    }

    return !hayErrores;
  }

  function handleSiguiente() {
    if (validar()) onSiguiente();
  }

  // ── Estado del botón siguiente ───────────────────────────────────────────────

  const puedeAvanzar = lecciones.length > 0 &&
    lecciones.every(l =>
      l.nombre.trim() &&
      l.duracion_minutos !== '' &&
      Number(l.duracion_minutos) >= 5 &&
      l.tipo !== ''
    );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">

      {/* Tabs de módulos */}
      <div className="flex gap-2 flex-wrap mb-6">
        {modulos.map(modulo => {
          const count = leccionesPorModulo(modulo._localId).length;
          const activo = modulo._localId === moduloActivoId;
          return (
            <button
              key={modulo._localId}
              onClick={() => setModuloActivoId(modulo._localId)}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition
                ${activo
                  ? 'bg-jc-blue text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
            >
              {modulo.nombre || `Módulo ${modulos.indexOf(modulo) + 1}`}
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full
                ${activo ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Botón agregar lección */}
      <div className="mb-6">
        <button
          onClick={() => onAgregarLeccion(moduloActivoId)}
          className="w-full py-4 border-2 border-dashed border-jc-blue rounded-xl text-jc-blue font-semibold hover:bg-jc-blue hover:text-white transition flex items-center justify-center"
        >
          <Plus size={22} className="mr-2" />
          Agregar Nueva Lección al Módulo Seleccionado
        </button>
      </div>

      {/* Estado vacío del módulo activo */}
      {leccionesActivas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center mb-8">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay lecciones en este módulo</h3>
          <p className="text-slate-500 text-sm mb-6">Comienza agregando la primera lección</p>
          <button
            onClick={() => onAgregarLeccion(moduloActivoId)}
            className="px-6 py-2 bg-jc-blue text-white rounded-lg font-semibold hover:bg-jc-blue-dark transition"
          >
            Crear Primera Lección
          </button>
        </div>
      )}

      {/* Lista de lecciones del módulo activo */}
      {leccionesActivas.length > 0 && (
        <div className="mb-8">
          {leccionesActivas.map((leccion, index) => (
            <LeccionCard
              key={leccion._localId}
              leccion={leccion}
              index={index}
              error={errores[leccion._localId]}
              onActualizar={campos => onActualizarLeccion(leccion._localId, campos)}
              onEliminar={() => onEliminarLeccion(leccion._localId)}
            />
          ))}
        </div>
      )}

      {/* Resumen total */}
      {lecciones.length > 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-6 py-4 mb-8 flex items-center justify-between">
          <span className="text-sm text-slate-600">Total lecciones en el curso:</span>
          <span className="text-sm font-bold text-slate-800">{lecciones.length}</span>
        </div>
      )}

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
          onClick={handleSiguiente}
          disabled={!puedeAvanzar}
          className={`inline-flex items-center px-8 py-3 rounded-lg font-semibold transition
            ${puedeAvanzar
              ? 'bg-jc-blue text-white hover:bg-jc-blue-dark shadow-sm'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
        >
          Siguiente: Asignar Actividades
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>

    </div>
  );
}