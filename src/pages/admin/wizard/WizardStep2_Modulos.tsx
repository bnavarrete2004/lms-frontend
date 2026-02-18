// src/pages/admin/wizard/WizardStep2_Modulos.tsx
// Paso 2: Crear y organizar los módulos del curso.
// Estado manejado completamente por useCursoWizard (no hay estado local de datos).
// Solo hay estado local de UI: qué módulo está expandido y errores de validación.

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import type { ModuloLocal } from '@/hooks/useCursoWizard';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  modulos: ModuloLocal[];
  onAgregar: () => void;
  onActualizar: (localId: string, campos: Partial<Omit<ModuloLocal, '_localId'>>) => void;
  onEliminar: (localId: string) => void;
  onReordenar: (modulos: ModuloLocal[]) => void;
  onSiguiente: () => void;
  onAnterior: () => void;
}

interface ErroresModulo {
  nombre?: string;
  horas_estimadas?: string;
}

// ── Helper: clase de input ────────────────────────────────────────────────────

function inputCls(error?: string) {
  return `w-full px-4 py-3 border rounded-lg outline-none transition focus:ring-2
    ${error
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-slate-300 focus:ring-jc-calipso/30 focus:border-jc-calipso'
    }`;
}

// ── Card individual de módulo ─────────────────────────────────────────────────

function ModuloCard({
  modulo,
  index,
  total,
  error,
  onActualizar,
  onEliminar,
  onSubir,
  onBajar,
}: {
  modulo: ModuloLocal;
  index: number;
  total: number;
  error?: ErroresModulo;
  onActualizar: (campos: Partial<Omit<ModuloLocal, '_localId'>>) => void;
  onEliminar: () => void;
  onSubir: () => void;
  onBajar: () => void;
}) {
  const [expandido, setExpandido] = useState(true);

  const confirmarEliminar = () => {
    if (window.confirm('¿Estás seguro de eliminar este módulo? Esta acción no se puede deshacer.')) {
      onEliminar();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all">
      <div className="flex items-start gap-4">

        {/* Drag handle visual + botones reordenar */}
        <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
          <GripVertical size={20} className="text-slate-300" />
          <button
            onClick={onSubir}
            disabled={index === 0}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition"
            title="Subir módulo"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onBajar}
            disabled={index === total - 1}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition"
            title="Bajar módulo"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">

          {/* Cabecera de la card */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-jc-blue text-white font-bold text-sm flex-shrink-0">
                M{index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {modulo.nombre || <span className="text-slate-400 font-normal italic">Sin nombre</span>}
                </h3>
                <p className="text-xs text-slate-500">
                  {modulo.horas_estimadas ? `${modulo.horas_estimadas}h estimadas` : 'Sin duración definida'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle expandir/contraer */}
              <button
                onClick={() => setExpandido(e => !e)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition text-xs font-medium"
              >
                {expandido ? 'Contraer' : 'Expandir'}
              </button>
              {/* Eliminar */}
              <button
                onClick={confirmarEliminar}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Eliminar módulo"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Campos del formulario — colapsables */}
          {expandido && (
            <div className="space-y-4">

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre del Módulo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={modulo.nombre}
                  onChange={e => onActualizar({ nombre: e.target.value })}
                  className={inputCls(error?.nombre)}
                  placeholder="Ej: Introducción a HACCP"
                />
                {error?.nombre && (
                  <p className="text-xs text-red-500 mt-1">{error.nombre}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={modulo.descripcion}
                  onChange={e => onActualizar({ descripcion: e.target.value })}
                  className={inputCls() + ' resize-none'}
                  placeholder="Describe brevemente el contenido de este módulo..."
                />
              </div>

              {/* Horas + Código módulo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duración Estimada (horas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={modulo.horas_estimadas}
                    onChange={e => onActualizar({
                      horas_estimadas: e.target.value === '' ? '' : Number(e.target.value)
                    })}
                    className={inputCls(error?.horas_estimadas)}
                    placeholder="Ej: 4"
                  />
                  {error?.horas_estimadas && (
                    <p className="text-xs text-red-500 mt-1">{error.horas_estimadas}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Código del Módulo
                    <span className="text-slate-400 font-normal ml-1">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={modulo.codigo_modulo}
                    onChange={e => onActualizar({ codigo_modulo: e.target.value })}
                    className={inputCls()}
                    placeholder="Ej: MOD-01"
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function WizardStep2_Modulos({
  modulos,
  onAgregar,
  onActualizar,
  onEliminar,
  onReordenar,
  onSiguiente,
  onAnterior,
}: Props) {
  const [errores, setErrores] = useState<Record<string, ErroresModulo>>({});

  // ── Validación ──────────────────────────────────────────────────────────────

  function validar(): boolean {
    if (modulos.length === 0) {
      alert('Debes crear al menos un módulo antes de continuar.');
      return false;
    }

    const nuevosErrores: Record<string, ErroresModulo> = {};
    let hayErrores = false;

    modulos.forEach(m => {
      const e: ErroresModulo = {};
      if (!m.nombre.trim()) {
        e.nombre = 'El nombre del módulo es obligatorio.';
        hayErrores = true;
      }
      if (m.horas_estimadas === '' || Number(m.horas_estimadas) < 1) {
        e.horas_estimadas = 'Las horas deben ser al menos 1.';
        hayErrores = true;
      }
      if (Object.keys(e).length > 0) nuevosErrores[m._localId] = e;
    });

    setErrores(nuevosErrores);
    return !hayErrores;
  }

  function handleSiguiente() {
    if (validar()) onSiguiente();
  }

  // ── Reordenar con botones ↑ ↓ ───────────────────────────────────────────────

  function mover(index: number, direccion: 'arriba' | 'abajo') {
    const copia = [...modulos];
    const destino = direccion === 'arriba' ? index - 1 : index + 1;
    if (destino < 0 || destino >= copia.length) return;
    [copia[index], copia[destino]] = [copia[destino], copia[index]];
    onReordenar(copia);
  }

  // ── Botón siguiente: habilitado solo si hay ≥1 módulo con nombre y horas ───

  const puedeAvanzar = modulos.length > 0 &&
    modulos.every(m => m.nombre.trim() && m.horas_estimadas !== '' && Number(m.horas_estimadas) >= 1);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">

      {/* Botón agregar módulo */}
      <div className="mb-6">
        <button
          onClick={onAgregar}
          className="w-full py-4 border-2 border-dashed border-jc-blue rounded-xl text-jc-blue font-semibold hover:bg-jc-blue hover:text-white transition flex items-center justify-center group"
        >
          <Plus size={22} className="mr-2" />
          Agregar Nuevo Módulo
        </button>
      </div>

      {/* Estado vacío */}
      {modulos.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center mb-8">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay módulos creados</h3>
          <p className="text-slate-500 text-sm mb-6">Comienza agregando el primer módulo de tu curso</p>
          <button
            onClick={onAgregar}
            className="px-6 py-2 bg-jc-blue text-white rounded-lg font-semibold hover:bg-jc-blue-dark transition"
          >
            Crear Primer Módulo
          </button>
        </div>
      )}

      {/* Lista de módulos */}
      {modulos.length > 0 && (
        <div className="space-y-4 mb-8">
          {modulos.map((modulo, index) => (
            <ModuloCard
              key={modulo._localId}
              modulo={modulo}
              index={index}
              total={modulos.length}
              error={errores[modulo._localId]}
              onActualizar={campos => onActualizar(modulo._localId, campos)}
              onEliminar={() => onEliminar(modulo._localId)}
              onSubir={() => mover(index, 'arriba')}
              onBajar={() => mover(index, 'abajo')}
            />
          ))}
        </div>
      )}

      {/* Resumen de horas */}
      {modulos.length > 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-6 py-4 mb-8 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            Total horas módulos:
          </span>
          <span className="text-sm font-bold text-slate-800">
            {modulos.reduce((acc, m) => acc + (Number(m.horas_estimadas) || 0), 0)}h
          </span>
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
          Siguiente: Crear Lecciones
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>

    </div>
  );
}