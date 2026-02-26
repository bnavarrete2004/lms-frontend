// src/pages/admin/wizard/WizardStep1_InfoBasica.tsx
// Paso 1: Información básica del curso con validación de carga horaria.

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, ImageIcon, ChevronRight, Search, UserPlus } from 'lucide-react';
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

interface RelatorResultado {
  id: number;              // ID del Usuario (lo que necesita CursoRelator)
  nombre_completo: string;
  rut_completo?: string;
  email?: string;
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
  const [codigosSence, setCodigosSence] = useState<CodigoSence[]>([]);
  const [loadingSence, setLoadingSence] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Estado del buscador de relatores
  const [todosRelatores, setTodosRelatores]     = useState<RelatorResultado[]>([]);
  const [busquedaRelator, setBusquedaRelator]   = useState('');
  const [relatoresAsignados, setRelatoresAsignados] = useState<RelatorResultado[]>([]);

  // ── Cargar datos al montar ─────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    // Cargar usuarios con tipo relator
    fetch('/api/usuarios/?tipo_usuario=relator', { headers })
      .then(r => r.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : (data.results ?? []);
        setTodosRelatores(lista.map((u: any) => ({
          id: u.id,
          nombre_completo: u.nombre_completo || `${u.nombre} ${u.apellido}`,
          rut_completo: u.rut_completo || u.rut,
          email: u.email,
        })));
      })
      .catch(err => console.error('❌ Error relatores:', err));

    // Cargar códigos SENCE
    setLoadingSence(true);
    fetch('/api/codigos-sence/', { headers })
      .then(r => r.json())
      .then(data => setCodigosSence(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(err => console.error('❌ Error SENCE:', err))
      .finally(() => setLoadingSence(false));
  }, []);

  // ── Buscador de relatores ──────────────────────────────────────────────────

  const resultadosBusqueda = useMemo(() => {
    if (busquedaRelator.length < 2) return [];
    const q = busquedaRelator.toLowerCase();
    return todosRelatores
      .filter(r =>
        !relatoresAsignados.find(a => a.id === r.id) && // no mostrar ya asignados
        (r.nombre_completo.toLowerCase().includes(q) ||
         (r.rut_completo || '').includes(q) ||
         (r.email || '').toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [busquedaRelator, todosRelatores, relatoresAsignados]);

  const agregarRelator = (relator: RelatorResultado) => {
    const nuevos = [...relatoresAsignados, relator];
    setRelatoresAsignados(nuevos);
    onChange({ relatores: nuevos.map(r => r.id) });
    setBusquedaRelator('');
  };

  const quitarRelator = (id: number) => {
    const nuevos = relatoresAsignados.filter(r => r.id !== id);
    setRelatoresAsignados(nuevos);
    onChange({ relatores: nuevos.map(r => r.id) });
  };

  // ── Validación ─────────────────────────────────────────────────────────────

  function validar(): boolean {
    const e: ErroresForm = {};

    if (!datos.nombre.trim())
      e.nombre = 'El nombre del curso es obligatorio.';
    else if (datos.nombre.trim().length < 5)
      e.nombre = 'El nombre debe tener al menos 5 caracteres.';

    if (!datos.descripcion.trim())
      e.descripcion = 'La descripción es obligatoria.';

    if (datos.horas_totales === '' || Number(datos.horas_totales) < 1)
      e.horas_totales = 'Las horas totales deben ser al menos 1.';

    if (!datos.fecha_inicio)
      e.fecha_inicio = 'La fecha de inicio es obligatoria.';

    if (!datos.fecha_fin) {
      e.fecha_fin = 'La fecha de fin es obligatoria.';
    } else if (datos.fecha_inicio && datos.fecha_fin <= datos.fecha_inicio) {
      e.fecha_fin = 'La fecha de fin debe ser posterior a la de inicio.';
    }

    if (datos.fecha_inicio && datos.fecha_fin && datos.horas_totales !== '') {
      const inicio = new Date(datos.fecha_inicio);
      const fin    = new Date(datos.fecha_fin);
      const dias   = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const horasPorDia = Number(datos.horas_totales) / dias;
      if (horasPorDia > 12)
        e.fecha_fin = `Carga horaria imposible: ${horasPorDia.toFixed(1)}h/día. El máximo son 12h diarias.`;
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

  // ── Imagen ─────────────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

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
          {errores.nombre
            ? <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>
            : <p className="text-xs text-slate-500 mt-1">Este nombre será visible para los estudiantes</p>
          }
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
          {errores.descripcion && <p className="text-xs text-red-500 mt-1">{errores.descripcion}</p>}
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
              {loadingSence ? 'Cargando códigos...' : 'Opcional — Solo si aplica'}
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
            {errores.horas_totales
              ? <p className="text-xs text-red-500 mt-1">{errores.horas_totales}</p>
              : <p className="text-xs text-slate-500 mt-1">Horas lectivas totales</p>
            }
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={datos.fecha_inicio}
              onChange={e => onChange({ fecha_inicio: e.target.value })}
              className={inputCls(errores.fecha_inicio)}
            />
            {errores.fecha_inicio && <p className="text-xs text-red-500 mt-1">{errores.fecha_inicio}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={datos.fecha_fin}
              onChange={e => onChange({ fecha_fin: e.target.value })}
              className={inputCls(errores.fecha_fin)}
            />
            {errores.fecha_fin && <p className="text-xs text-red-500 mt-1">{errores.fecha_fin}</p>}
          </div>
        </div>

        {/* ── Buscador de Relatores ── */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Relator(es) Asignados <span className="text-red-500">*</span>
          </label>

          {/* Relatores ya asignados */}
          {relatoresAsignados.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {relatoresAsignados.map(r => (
                <div key={r.id} className="flex items-center gap-2 px-3 py-1.5 bg-jc-blue/10 border border-jc-blue/20 text-jc-blue rounded-lg text-sm font-semibold">
                  <UserPlus size={13} />
                  <span>{r.nombre_completo}</span>
                  <button
                    onClick={() => quitarRelator(r.id)}
                    className="ml-1 text-jc-blue/60 hover:text-red-500 transition"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input de búsqueda */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={busquedaRelator}
              onChange={e => setBusquedaRelator(e.target.value)}
              className={inputCls(errores.relatores) + ' pl-9'}
              placeholder="Buscar relator por nombre o RUT..."
            />

            {/* Dropdown de resultados */}
            {resultadosBusqueda.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                {resultadosBusqueda.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => agregarRelator(r)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm border-b last:border-0 flex flex-col transition"
                  >
                    <span className="font-bold text-slate-700">{r.nombre_completo}</span>
                    <span className="text-xs text-slate-400">{r.rut_completo || r.email || ''}</span>
                  </button>
                ))}
              </div>
            )}

            {busquedaRelator.length >= 2 && resultadosBusqueda.length === 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl px-4 py-3 text-sm text-slate-400 italic">
                No se encontraron relatores
              </div>
            )}
          </div>

          {errores.relatores
            ? <p className="text-xs text-red-500 mt-1">{errores.relatores}</p>
            : <p className="text-xs text-slate-500 mt-1">Escribe al menos 2 caracteres para buscar. Puedes agregar más de uno.</p>
          }
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
          {errores.ciudad && <p className="text-xs text-red-500 mt-1">{errores.ciudad}</p>}
        </div>

        {/* Imagen Portada */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Imagen de Portada <span className="text-slate-400 font-normal">(opcional)</span>
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
              <p className="text-xs text-slate-400 mt-1">PNG, JPG — máx 5MB</p>
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
            className="inline-flex items-center px-8 py-3 bg-jc-blue text-white rounded-lg font-semibold hover:opacity-90 transition shadow-sm"
          >
            Siguiente: Crear Módulos
            <ChevronRight size={20} className="ml-2" />
          </button>
        </div>

      </div>
    </div>
  );
}