// src/pages/admin/wizard/WizardStep1_InfoBasica.tsx
// Paso 1: Información básica del curso con validación de carga horaria.

import { useState, useRef, useEffect } from 'react';
import { X, ImageIcon, ChevronRight } from 'lucide-react';
import type { DatosCurso } from '@/hooks/useCursoWizard';

// ── Tipos locales ─────────────────────────────────────────────────────────────

interface Props {
  datos: DatosCurso;
  onChange: (campos: Partial<DatosCurso>) => void;
  onSiguiente: () => void;
  onCancelar: () => void;
}

interface ErroresForm {
  nombre?: string;
  descripcion?: string;
  horas_totales?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  relatores?: string;
  ciudad?: string;
}

interface PerfilRelator {
  id: number;
  usuario_data: {
    id: number;
    nombre_completo: string;
    email: string;
  };
  especialidad: string;
}

interface CodigoSence {
  id: number;
  codigo: string;
  nombre_curso: string;
  horas_totales: number;
  estado: string;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function inputCls(error?: string) {
  return `w-full px-4 py-3 border rounded-lg outline-none transition focus:ring-2
    ${error
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-slate-300 focus:ring-jc-calipso/30 focus:border-jc-calipso'
    }`;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function WizardStep1_InfoBasica({ datos, onChange, onSiguiente, onCancelar }: Props) {
  const [errores, setErrores]           = useState<ErroresForm>({});
  const [relatores, setRelatores]       = useState<PerfilRelator[]>([]);
  const [codigosSence, setCodigosSence] = useState<CodigoSence[]>([]);
  const [loadingRelatores, setLoadingRelatores] = useState(false);
  const [loadingSence, setLoadingSence]         = useState(false);
  const imageInputRef   = useRef<HTMLInputElement>(null);

  // ── Cargar relatores y códigos SENCE al montar ─────────────────────────────

  useEffect(() => {
    async function cargarDatos() {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        setLoadingRelatores(true);
        const res = await fetch('/api/perfiles-relator/', { headers });
        const data = await res.json();
        if (res.ok) {
          setRelatores(Array.isArray(data) ? data : (data.results ?? []));
        }
      } catch (err) {
        console.error('❌ Error relatores:', err);
      } finally {
        setLoadingRelatores(false);
      }

      try {
        setLoadingSence(true);
        const res = await fetch('/api/codigos-sence/', { headers });
        if (res.ok) {
          const data = await res.json();
          setCodigosSence(Array.isArray(data) ? data : (data.results ?? []));
        }
      } catch (err) {
        console.error('❌ Error SENCE:', err);
      } finally {
        setLoadingSence(false);
      }
    }
    cargarDatos();
  }, []);

  // ── Validación ──────────────────────────────────────────────────────────────

  function validar(): boolean {
    const e: ErroresForm = {};

    // Validaciones de texto
    if (!datos.nombre.trim())
      e.nombre = 'El nombre del curso es obligatorio.';
    else if (datos.nombre.trim().length < 5)
      e.nombre = 'El nombre debe tener al menos 5 caracteres.';

    if (!datos.descripcion.trim())
      e.descripcion = 'La descripción es obligatoria.';

    // Validaciones numéricas
    if (datos.horas_totales === '' || Number(datos.horas_totales) < 1) {
      e.horas_totales = 'Las horas totales deben ser al menos 1.';
    }

    // Validaciones de fechas
    if (!datos.fecha_inicio)
      e.fecha_inicio = 'La fecha de inicio es obligatoria.';

    if (!datos.fecha_fin) {
      e.fecha_fin = 'La fecha de fin es obligatoria.';
    } else if (datos.fecha_inicio && datos.fecha_fin <= datos.fecha_inicio) {
      e.fecha_fin = 'La fecha de fin debe ser posterior a la de inicio.';
    }

    // ── Lógica de Factibilidad Temporal (Horas vs Días) ──
    if (datos.fecha_inicio && datos.fecha_fin && datos.horas_totales !== '') {
      const inicio = new Date(datos.fecha_inicio);
      const fin = new Date(datos.fecha_fin);
      
      // Calcular diferencia en días (incluyendo el día de inicio)
      const diffTime = fin.getTime() - inicio.getTime();
      const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (dias > 0) {
        const horasPorDia = Number(datos.horas_totales) / dias;
        // Si el curso exige más de 12 horas diarias, es pedagógicamente imposible
        if (horasPorDia > 12) {
          e.fecha_fin = `Carga horaria imposible: ${horasPorDia.toFixed(1)}h/día. El máximo permitido son 12h diarias.`;
        }
      }
    }

    if (datos.relatores.length === 0)
      e.relatores = 'Debes asignar al menos un relator.';

    if (!datos.ciudad.trim())
      e.ciudad = 'La ciudad es obligatoria (aparece en el diploma).';

    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function handleSiguiente() {
    if (validar()) onSiguiente();
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleRelatores(e: React.ChangeEvent<HTMLSelectElement>) {
    const seleccionados = Array.from(e.target.selectedOptions).map(o => Number(o.value));
    onChange({ relatores: seleccionados });
  }

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ imagen_portada: file, imagen_url: url });
  }

  function quitarImagen() {
    if (datos.imagen_url) URL.revokeObjectURL(datos.imagen_url);
    onChange({ imagen_portada: null, imagen_url: undefined });
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

        {/* Nombre */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre del Curso <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={datos.nombre}
            onChange={e => onChange({ nombre: e.target.value })}
            className={inputCls(errores.nombre)}
            placeholder="Ej: Normativa Sanitaria y Calidad Alimentaria (HACCP)"
          />
          {errores.nombre ? (
            <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">Este nombre será visible para los estudiantes</p>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Descripción del Curso <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={datos.descripcion}
            onChange={e => onChange({ descripcion: e.target.value })}
            className={inputCls(errores.descripcion) + ' resize-none'}
            placeholder="Describe los objetivos y contenidos principales del curso..."
          />
          {errores.descripcion && (
            <p className="text-xs text-red-500 mt-1">{errores.descripcion}</p>
          )}
        </div>

        {/* Código SENCE + Horas */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Código SENCE <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <select
              value={datos.codigo_sence ?? ''}
              onChange={e => onChange({ codigo_sence: e.target.value ? Number(e.target.value) : null })}
              className={inputCls()}
              disabled={loadingSence}
            >
              <option value="">Sin código SENCE</option>
              {codigosSence.map(cs => (
                <option key={cs.id} value={cs.id}>
                  {cs.codigo} — {cs.nombre_curso} ({cs.horas_totales}h)
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {loadingSence ? 'Cargando códigos...' : 'Opcional - Solo si aplica'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Horas Totales <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={datos.horas_totales}
              onChange={e => onChange({ horas_totales: e.target.value === '' ? '' : Number(e.target.value) })}
              className={inputCls(errores.horas_totales)}
              placeholder="Ej: 24"
            />
            {errores.horas_totales ? (
              <p className="text-xs text-red-500 mt-1">{errores.horas_totales}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Horas lectivas totales</p>
            )}
          </div>
        </div>

        {/* Fecha Inicio + Fecha Fin */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha Inicio (Default) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={datos.fecha_inicio}
              onChange={e => onChange({ fecha_inicio: e.target.value })}
              className={inputCls(errores.fecha_inicio)}
            />
            {errores.fecha_inicio && (
              <p className="text-xs text-red-500 mt-1">{errores.fecha_inicio}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha Fin (Default) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={datos.fecha_fin}
              onChange={e => onChange({ fecha_fin: e.target.value })}
              className={inputCls(errores.fecha_fin)}
            />
            {errores.fecha_fin && (
              <p className="text-xs text-red-500 mt-1">{errores.fecha_fin}</p>
            )}
          </div>
        </div>

        {/* Relatores */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Relator(es) Asignados <span className="text-red-500">*</span>
          </label>
          <select
            multiple
            size={4}
            value={datos.relatores.map(String)}
            onChange={handleRelatores}
            className={inputCls(errores.relatores)}
            disabled={loadingRelatores}
          >
            {loadingRelatores ? (
              <option disabled>Cargando relatores...</option>
            ) : (
              relatores.map(r => (
                <option key={r.id} value={r.id}>
                  {r.usuario_data?.nombre_completo ?? `Relator #${r.id}`}
                  {r.especialidad ? ` — ${r.especialidad}` : ''}
                </option>
              ))
            )}
          </select>
          {errores.relatores ? (
            <p className="text-xs text-red-500 mt-1">{errores.relatores}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">Mantén Ctrl/Cmd para seleccionar múltiples</p>
          )}
        </div>

        {/* Ciudad */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={datos.ciudad}
            onChange={e => onChange({ ciudad: e.target.value })}
            className={inputCls(errores.ciudad)}
            placeholder="Ej: Santiago, Puerto Montt"
          />
          {errores.ciudad && (
            <p className="text-xs text-red-500 mt-1">{errores.ciudad}</p>
          )}
        </div>

        {/* Imagen Portada */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Imagen de Portada (opcional)
          </label>
          {datos.imagen_url ? (
            <div className="relative">
              <img
                src={datos.imagen_url}
                alt="Portada"
                className="w-full h-48 object-cover rounded-lg border border-slate-200"
              />
              <button
                onClick={quitarImagen}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-jc-calipso transition cursor-pointer group"
            >
              <ImageIcon size={40} className="text-slate-300 mx-auto mb-3 group-hover:text-jc-calipso transition" />
              <p className="text-sm font-medium text-slate-600">Click para subir imagen</p>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleImagen}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={onCancelar}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSiguiente}
            className="inline-flex items-center px-8 py-3 bg-jc-blue text-white rounded-lg font-semibold hover:bg-jc-blue-dark transition shadow-sm"
          >
            Siguiente: Crear Módulos
            <ChevronRight size={20} className="ml-2" />
          </button>
        </div>

      </div>
    </div>
  );
}