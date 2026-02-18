// src/pages/admin/wizard/WizardStep2_Modulos.tsx
import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  GripVertical, 
  Clock // Añadido Clock que faltaba
} from 'lucide-react';
import type { ModuloLocal } from '@/hooks/useCursoWizard';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  modulos: ModuloLocal[];
  horasMeta: number; // Nueva prop necesaria
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
    if (window.confirm('¿Estás seguro de eliminar este módulo?')) {
      onEliminar();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
          <GripVertical size={20} className="text-slate-300" />
          <button
            onClick={onSubir}
            disabled={index === 0}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 transition"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onBajar}
            disabled={index === total - 1}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-20 transition"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-jc-blue text-white font-bold text-sm">
                M{index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {modulo.nombre || <span className="text-slate-400 italic">Sin nombre</span>}
                </h3>
                <p className="text-xs text-slate-500">
                  {modulo.horas_estimadas ? `${modulo.horas_estimadas}h estimadas` : 'Sin duración'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setExpandido(!expandido)} className="p-2 text-slate-400 text-xs font-medium">
                {expandido ? 'Contraer' : 'Expandir'}
              </button>
              <button onClick={confirmarEliminar} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {expandido && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Módulo *</label>
                <input
                  type="text"
                  value={modulo.nombre}
                  onChange={e => onActualizar({ nombre: e.target.value })}
                  className={inputCls(error?.nombre)}
                  placeholder="Ej: Introducción"
                />
                {error?.nombre && <p className="text-xs text-red-500 mt-1">{error.nombre}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Horas *</label>
                  <input
                    type="number"
                    value={modulo.horas_estimadas}
                    onChange={e => onActualizar({ horas_estimadas: e.target.value === '' ? '' : Number(e.target.value) })}
                    className={inputCls(error?.horas_estimadas)}
                  />
                  {error?.horas_estimadas && <p className="text-xs text-red-500 mt-1">{error.horas_estimadas}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Código</label>
                  <input
                    type="text"
                    value={modulo.codigo_modulo}
                    onChange={e => onActualizar({ codigo_modulo: e.target.value })}
                    className={inputCls()}
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

// ── Componente Principal ──────────────────────────────────────────────────────

export function WizardStep2_Modulos({
  modulos,
  horasMeta,
  onAgregar,
  onActualizar,
  onEliminar,
  onReordenar,
  onSiguiente,
  onAnterior,
}: Props) {
  const [errores, setErrores] = useState<Record<string, ErroresModulo>>({});

  // 1. Cálculos de validación
  const totalHorasActuales = modulos.reduce((acc: number, m: ModuloLocal) => acc + (Number(m.horas_estimadas) || 0), 0);
  const esExacto = totalHorasActuales === horasMeta;
  const sePaso = totalHorasActuales > horasMeta;
  const faltanOsobran = horasMeta - totalHorasActuales;

  // 2. Lógica de botones
  const mover = (index: number, direccion: 'arriba' | 'abajo') => {
    const copia = [...modulos];
    const destino = direccion === 'arriba' ? index - 1 : index + 1;
    if (destino < 0 || destino >= copia.length) return;
    [copia[index], copia[destino]] = [copia[destino], copia[index]];
    onReordenar(copia);
  };

  const handleSiguiente = () => {
    const nuevosErrores: Record<string, ErroresModulo> = {};
    let hayErrores = false;

    modulos.forEach(m => {
      const e: ErroresModulo = {};
      if (!m.nombre.trim()) { e.nombre = 'Obligatorio'; hayErrores = true; }
      if (m.horas_estimadas === '' || Number(m.horas_estimadas) < 1) { e.horas_estimadas = 'Min 1h'; hayErrores = true; }
      if (Object.keys(e).length > 0) nuevosErrores[m._localId] = e;
    });

    if (hayErrores) {
      setErrores(nuevosErrores);
      return;
    }

    if (!esExacto) {
      alert(`La suma de horas (${totalHorasActuales}h) no coincide con la meta del curso (${horasMeta}h).`);
      return;
    }

    onSiguiente();
  };

  const puedeAvanzar = modulos.length > 0 && esExacto && 
    modulos.every(m => m.nombre.trim() && Number(m.horas_estimadas) >= 1);

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Indicador de horas */}
      <div className={`p-4 rounded-xl border mb-6 ${
        esExacto ? 'bg-green-50 border-green-200' : sePaso ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Clock size={18} className={esExacto ? 'text-green-600' : sePaso ? 'text-red-600' : 'text-amber-600'} />
            <span className="text-sm font-bold">Validación de Horas</span>
          </div>
          <span className="text-sm font-bold">{totalHorasActuales} / {horasMeta} horas</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${esExacto ? 'bg-green-500' : sePaso ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min((totalHorasActuales / horasMeta) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs mt-2 font-medium">
          {esExacto ? '✓ Horas configuradas correctamente.' : 
           sePaso ? `⚠ Te has excedido por ${Math.abs(faltanOsobran)}h.` : 
           `Faltan ${faltanOsobran}h para cumplir la meta.`}
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={onAgregar}
          className="w-full py-4 border-2 border-dashed border-jc-blue rounded-xl text-jc-blue font-semibold hover:bg-jc-blue hover:text-white transition flex items-center justify-center"
        >
          <Plus size={22} className="mr-2" /> Agregar Módulo
        </button>
      </div>

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

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <button onClick={onAnterior} className="inline-flex items-center px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold">
          <ChevronLeft size={20} className="mr-2" /> Anterior
        </button>

        <div className="flex flex-col items-end">
          <button
            onClick={handleSiguiente}
            disabled={!puedeAvanzar}
            className={`inline-flex items-center px-8 py-3 rounded-lg font-semibold transition
              ${puedeAvanzar ? 'bg-jc-blue text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            Siguiente <ChevronRight size={20} className="ml-2" />
          </button>
          {!esExacto && <span className="text-[10px] text-amber-600 mt-1 font-bold italic">Suma debe dar {horasMeta}h</span>}
        </div>
      </div>
    </div>
  );
}