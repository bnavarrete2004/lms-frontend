// src/pages/admin/wizard/WizardStep4_Actividades.tsx
// Paso 4: Asignar materiales aprobados a lecciones del curso.
// Las asignaciones se guardan en memoria y se envían al backend al publicar (paso 5).

import { useEffect, useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, BookOpen, Search, X,
  Video, FileText, ClipboardList, CheckCircle2, PlayCircle,
  Plus, Trash2, FolderOpen, Filter
} from 'lucide-react';
import type { ModuloLocal, LeccionLocal } from '@/hooks/useCursoWizard';
import { materialService, type Material } from '@/api/services/materialService';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface AsignacionLocal {
  _asignId: string;        // ID temporal
  leccionLocalId: string;  // referencia a LeccionLocal._localId
  material: Material;      // material completo
  orden: number;
}

interface Props {
  modulos: ModuloLocal[];
  lecciones: LeccionLocal[];
  leccionesPorModulo: (moduloLocalId: string) => LeccionLocal[];
  asignaciones: AsignacionLocal[];
  onAsignacionesChange: (asignaciones: AsignacionLocal[]) => void;
  onSiguiente: () => void;
  onAnterior: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  teorica: 'Teórica', practica: 'Práctica',
  evaluacion: 'Evaluación', mixta: 'Mixta',
};

const TIPO_COLORES: Record<string, string> = {
  teorica: 'bg-blue-100 text-blue-700',
  practica: 'bg-green-100 text-green-700',
  evaluacion: 'bg-purple-100 text-purple-700',
  mixta: 'bg-amber-100 text-amber-700',
};

function getMaterialIcon(tipo: string, size = 20) {
  switch (tipo) {
    case 'video':        return <PlayCircle size={size} className="text-red-500" />;
    case 'documento':    return <FileText size={size} className="text-blue-500" />;
    case 'presentacion': return <ClipboardList size={size} className="text-amber-500" />;
    default:             return <BookOpen size={size} className="text-slate-400" />;
  }
}

function getMaterialBg(tipo: string) {
  switch (tipo) {
    case 'video':        return 'bg-red-50';
    case 'documento':    return 'bg-blue-50';
    case 'presentacion': return 'bg-amber-50';
    default:             return 'bg-slate-50';
  }
}

function localAsignId() {
  return `asign_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function WizardStep4_Actividades({
  modulos,
  lecciones,
  leccionesPorModulo,
  asignaciones,
  onAsignacionesChange,
  onSiguiente,
  onAnterior,
}: Props) {

  // ── Estado del paso ──
  const [moduloActivoId, setModuloActivoId] = useState<string>(modulos[0]?._localId ?? '');
  const [leccionActivaId, setLeccionActivaId] = useState<string | null>(null);

  // ── Estado de la biblioteca ──
  const [modalAbierto, setModalAbierto] = useState(false);
  const [materialesDB, setMaterialesDB] = useState<Material[]>([]);
  const [loadingMateriales, setLoadingMateriales] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Inicializar módulo activo
  useEffect(() => {
    if (!moduloActivoId && modulos.length > 0) {
      setModuloActivoId(modulos[0]._localId);
    }
  }, [modulos]);

  // Reset lección al cambiar módulo
  const seleccionarModulo = (id: string) => {
    setModuloActivoId(id);
    setLeccionActivaId(null);
  };

  // ── Cargar materiales aprobados ──
  useEffect(() => {
    if (!modalAbierto) return;
    const fetchMateriales = async () => {
      try {
        setLoadingMateriales(true);
        const data = await materialService.getAprobados();
        setMaterialesDB(data);
      } catch (err) {
        console.error('Error cargando materiales:', err);
      } finally {
        setLoadingMateriales(false);
      }
    };
    fetchMateriales();
  }, [modalAbierto]);

  // ── Filtrado de biblioteca ──
  const materialesFiltrados = useMemo(() => {
    return materialesDB.filter(m => {
      const coincideBusqueda =
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (m.relator_autor_nombre ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (m.categoria ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
      return coincideBusqueda && coincideTipo;
    });
  }, [materialesDB, busqueda, filtroTipo]);

  // ── Asignaciones de la lección activa ──
  const asignacionesLeccionActiva = useMemo(() => {
    if (!leccionActivaId) return [];
    return asignaciones
      .filter(a => a.leccionLocalId === leccionActivaId)
      .sort((a, b) => a.orden - b.orden);
  }, [asignaciones, leccionActivaId]);

  const contarAsignaciones = (leccionLocalId: string) =>
    asignaciones.filter(a => a.leccionLocalId === leccionLocalId).length;

  // ── Handlers de asignación ──
  const asignarMaterial = (material: Material) => {
    if (!leccionActivaId) return;

    // Evitar duplicados
    const yaAsignado = asignaciones.some(
      a => a.leccionLocalId === leccionActivaId && a.material.id === material.id
    );
    if (yaAsignado) {
      alert('Este material ya está asignado a esta lección.');
      return;
    }

    const nuevaAsignacion: AsignacionLocal = {
      _asignId: localAsignId(),
      leccionLocalId: leccionActivaId,
      material,
      orden: asignacionesLeccionActiva.length + 1,
    };

    onAsignacionesChange([...asignaciones, nuevaAsignacion]);
    setModalAbierto(false);
    setBusqueda('');
    setFiltroTipo('todos');
  };

  const quitarAsignacion = (asignId: string) => {
    onAsignacionesChange(asignaciones.filter(a => a._asignId !== asignId));
  };

  // ── Datos del módulo/lección activos ──
  const moduloActivo = modulos.find(m => m._localId === moduloActivoId);
  const leccionesModuloActivo = moduloActivoId ? leccionesPorModulo(moduloActivoId) : [];
  const leccionActiva = lecciones.find(l => l._localId === leccionActivaId);

  // ── Progreso general ──
  const totalLecciones = lecciones.length;
  const leccionesConMaterial = new Set(asignaciones.map(a => a.leccionLocalId)).size;

  // ── Conteos biblioteca ──
  const conteosTipo = useMemo(() => ({
    todos: materialesDB.length,
    video: materialesDB.filter(m => m.tipo === 'video').length,
    documento: materialesDB.filter(m => m.tipo === 'documento').length,
    presentacion: materialesDB.filter(m => m.tipo === 'presentacion').length,
  }), [materialesDB]);

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── Tabs de Módulos ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {modulos.map((modulo) => (
          <button
            key={modulo._localId}
            onClick={() => seleccionarModulo(modulo._localId)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              moduloActivoId === modulo._localId
                ? 'bg-[#064D91] text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {modulo.nombre || `Módulo ${modulo.orden}`}
          </button>
        ))}
      </div>

      {/* ── Grid Principal ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Columna Izquierda: Lecciones ── */}
        <div className="col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-jc-blue" />
              Lecciones
              {moduloActivo && (
                <span className="text-xs text-slate-400 font-normal ml-1">
                  — {moduloActivo.nombre}
                </span>
              )}
            </h3>

            {leccionesModuloActivo.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">
                Sin lecciones en este módulo
              </p>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {leccionesModuloActivo.map((leccion, idx) => {
                  const count = contarAsignaciones(leccion._localId);
                  const activa = leccionActivaId === leccion._localId;
                  return (
                    <button
                      key={leccion._localId}
                      onClick={() => setLeccionActivaId(leccion._localId)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        activa
                          ? 'bg-[#52A9B7] border-[#52A9B7] text-white shadow-md'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                              activa ? 'bg-white/20 text-white' : 'bg-jc-calipso/20 text-jc-calipso'
                            }`}>
                              {idx + 1}
                            </span>
                            <p className={`text-sm font-semibold truncate ${activa ? 'text-white' : 'text-slate-700'}`}>
                              {leccion.nombre || `Lección ${idx + 1}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-7">
                            {leccion.tipo && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                activa ? 'bg-white/20 text-white' : TIPO_COLORES[leccion.tipo]
                              }`}>
                                {TIPO_LABELS[leccion.tipo]}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold ${
                          activa ? 'text-white/80' : count > 0 ? 'text-green-600' : 'text-slate-400'
                        }`}>
                          <FolderOpen size={13} />
                          <span>{count}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Progreso del módulo */}
            {moduloActivo && leccionesModuloActivo.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progreso de asignación</span>
                  <span className="font-bold text-jc-blue">
                    {leccionesModuloActivo.filter(l => contarAsignaciones(l._localId) > 0).length}
                    /{leccionesModuloActivo.length}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-jc-blue h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(leccionesModuloActivo.filter(l => contarAsignaciones(l._localId) > 0).length / leccionesModuloActivo.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna Derecha: Asignación ── */}
        <div className="col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">

            {!leccionActivaId ? (
              // Estado vacío — sin lección seleccionada
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FolderOpen size={36} className="text-slate-300" />
                </div>
                <p className="font-semibold text-slate-500">Selecciona una lección</p>
                <p className="text-sm text-slate-400 mt-1">
                  Elige una lección de la lista para asignar materiales
                </p>
              </div>
            ) : (
              <>
                {/* Header de la lección activa */}
                <div className="flex items-start justify-between mb-6 pb-5 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {leccionActiva?.nombre || 'Lección'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {moduloActivo?.nombre}
                      {leccionActiva?.duracion_minutos ? ` · ${leccionActiva.duracion_minutos} min` : ''}
                    </p>
                  </div>
                  {leccionActiva?.tipo && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${TIPO_COLORES[leccionActiva.tipo]}`}>
                      {TIPO_LABELS[leccionActiva.tipo]}
                    </span>
                  )}
                </div>

                {/* Materiales asignados */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-700 text-sm mb-3">
                    Materiales asignados ({asignacionesLeccionActiva.length})
                  </h4>

                  {asignacionesLeccionActiva.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center">
                      <p className="text-sm text-slate-400 italic">
                        Aún no hay materiales asignados a esta lección
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {asignacionesLeccionActiva.map((asign) => (
                        <div
                          key={asign._asignId}
                          className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition group"
                        >
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${getMaterialBg(asign.material.tipo)}`}>
                            {getMaterialIcon(asign.material.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">
                              {asign.material.nombre}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {asign.material.relator_autor_nombre ?? 'Sin relator'}
                              {asign.material.categoria ? ` · ${asign.material.categoria}` : ''}
                            </p>
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                              <CheckCircle2 size={10} /> Producción completa
                            </span>
                          </div>
                          <button
                            onClick={() => quitarAsignacion(asign._asignId)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                            title="Quitar material"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón abrir biblioteca */}
                <div className="border-t border-slate-100 pt-5">
                  <button
                    onClick={() => setModalAbierto(true)}
                    className="w-full py-4 border-2 border-dashed border-[#064D91] rounded-xl text-[#064D91] font-semibold hover:bg-[#064D91] hover:text-white transition flex items-center justify-center gap-2 group"
                  >
                    <Plus size={20} />
                    Agregar Material desde Biblioteca
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    💡 Solo materiales con post-producción completa
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Resumen global ── */}
      {totalLecciones > 0 && (
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-jc-blue/10 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-jc-blue" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Progreso total de asignación</p>
                <p className="text-xs text-slate-500">
                  {leccionesConMaterial} de {totalLecciones} lecciones con material asignado
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-jc-blue rounded-full transition-all"
                  style={{ width: `${totalLecciones > 0 ? (leccionesConMaterial / totalLecciones) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-bold text-jc-blue w-10 text-right">
                {totalLecciones > 0 ? Math.round((leccionesConMaterial / totalLecciones) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navegación ── */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
        <button
          onClick={onAnterior}
          className="inline-flex items-center px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
        >
          <ChevronLeft size={20} className="mr-2" />
          Anterior
        </button>
        <button
          onClick={onSiguiente}
          className="inline-flex items-center px-8 py-3 bg-jc-blue text-white rounded-lg font-semibold hover:opacity-90 transition shadow-sm"
        >
          Siguiente: Revisar y Publicar
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL: BIBLIOTECA DE MATERIALES
      ══════════════════════════════════════════════════════ */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

            {/* Header del modal */}
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Biblioteca de Materiales Aprobados
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Asignando a: <span className="font-semibold text-jc-blue">
                      {leccionActiva?.nombre ?? 'lección'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => { setModalAbierto(false); setBusqueda(''); setFiltroTipo('todos'); }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Búsqueda y filtros */}
            <div className="px-8 py-5 border-b border-slate-200 space-y-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por título, relator o categoría..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-jc-calipso/30 outline-none text-sm"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              {/* Filtros por tipo */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Filter size={12} /> Tipo:
                </span>
                {[
                  { key: 'todos', label: `Todos (${conteosTipo.todos})` },
                  { key: 'video', label: `Videos (${conteosTipo.video})`, icon: <Video size={13} /> },
                  { key: 'documento', label: `PDFs (${conteosTipo.documento})`, icon: <FileText size={13} /> },
                  { key: 'presentacion', label: `Presentaciones (${conteosTipo.presentacion})`, icon: <ClipboardList size={13} /> },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setFiltroTipo(key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      filtroTipo === key
                        ? 'bg-[#064D91] text-white border-[#064D91] shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de materiales */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loadingMateriales ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-2 border-jc-blue border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Cargando materiales aprobados...</p>
                </div>
              ) : materialesFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Search size={48} className="text-slate-200" />
                  <p className="text-slate-500 font-medium">No se encontraron materiales</p>
                  <p className="text-sm text-slate-400">Intenta con otros filtros o términos de búsqueda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materialesFiltrados.map((material) => {
                    const yaAsignado = asignaciones.some(
                      a => a.leccionLocalId === leccionActivaId && a.material.id === material.id
                    );
                    return (
                      <div
                        key={material.id}
                        className={`flex items-start gap-4 p-5 border rounded-xl transition-all ${
                          yaAsignado
                            ? 'border-green-200 bg-green-50/50 opacity-60'
                            : 'border-slate-200 hover:border-[#064D91] hover:shadow-md cursor-pointer bg-white'
                        }`}
                        onClick={() => !yaAsignado && asignarMaterial(material)}
                      >
                        {/* Icono tipo */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getMaterialBg(material.tipo)}`}>
                          {getMaterialIcon(material.tipo, 24)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 mb-1">{material.nombre}</h4>
                          {material.descripcion && (
                            <p className="text-sm text-slate-500 mb-2 line-clamp-1">{material.descripcion}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            {material.relator_autor_nombre && (
                              <span className="flex items-center gap-1">
                                👤 {material.relator_autor_nombre}
                              </span>
                            )}
                            {material.duracion_segundos && (
                              <span>⏱ {Math.round(material.duracion_segundos / 60)} min</span>
                            )}
                            {material.total_paginas && (
                              <span>📄 {material.total_paginas} páginas</span>
                            )}
                            {material.categoria && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded-full">{material.categoria}</span>
                            )}
                            {material.total_usos !== undefined && material.total_usos > 0 && (
                              <span>📊 Usado en {material.total_usos} cursos</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                              <CheckCircle2 size={10} /> Producción completa
                            </span>
                            {yaAsignado && (
                              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-jc-blue/10 text-jc-blue text-[10px] font-bold rounded-full">
                                ✓ Ya asignado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botón asignar */}
                        <button
                          onClick={(e) => { e.stopPropagation(); if (!yaAsignado) asignarMaterial(material); }}
                          disabled={yaAsignado}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                            yaAsignado
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-[#52A9B7] hover:bg-[#3d8a96] text-white shadow-sm'
                          }`}
                        >
                          {yaAsignado ? 'Asignado' : 'Asignar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Mostrando <span className="font-semibold">{materialesFiltrados.length}</span> de{' '}
                <span className="font-semibold">{materialesDB.length}</span> materiales aprobados
              </p>
              <button
                onClick={() => { setModalAbierto(false); setBusqueda(''); setFiltroTipo('todos'); }}
                className="px-5 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exportar tipo AsignacionLocal para el wizard ──────────────────────────────
export type { AsignacionLocal };