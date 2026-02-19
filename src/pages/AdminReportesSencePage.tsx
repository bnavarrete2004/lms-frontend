// src/pages/AdminReportesSencePage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Settings, Filter, X,
  Download, CheckCircle, XCircle, Clock, TrendingUp,
  ChevronLeft, ChevronRight, Search, RefreshCw,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

// ── Sidebar ───────────────────────────────────────────────────────────────────
function useSidebarSections() {
  return [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',     href: '/admin/dashboard' },
        { icon: <FileSearch      size={20} />, label: 'Revisión Material', href: '/admin/revision', badge: '5', badgeVariant: 'danger' as const, badgeAnimated: true },
        { icon: <BookOpen        size={20} />, label: 'Gestión Cursos',    href: '/admin/cursos' },
        { icon: <Users           size={20} />, label: 'Usuarios y Roles',  href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3  size={20} />, label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Central',   href: '/admin/repositorio' },
        { icon: <FileText   size={20} />, label: 'Reportes SENCE',        href: '/admin/reportes', isActive: true },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { icon: <Globe    size={20} />, label: 'Contenido Público',   href: '/admin/landing' },
        { icon: <Settings size={20} />, label: 'Ajustes del Sistema', href: '/admin/config' },
      ],
    },
  ];
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Inscripcion {
  id: number;
  estudiante: number;
  estudiante_data?: {
    nombre_completo?: string;
    rut_completo?: string;
    email?: string;
    username?: string;
  };
  curso: number;
  curso_data?: { nombre: string; duracion_horas?: number };
  fecha_inscripcion: string;
  estado: 'inscrito' | 'en_curso' | 'completado' | 'aprobado' | 'reprobado';
  porcentaje_avance: number;
  nota_final?: number;
}

interface Curso { id: number; nombre: string; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTADO_LABEL: Record<string, string> = {
  inscrito:   'Inscrito',
  en_curso:   'En Curso',
  completado: 'Completado',
  aprobado:   'Aprobado',
  reprobado:  'Reprobado',
};

const ESTADO_COLOR: Record<string, string> = {
  aprobado:   'bg-green-100 text-green-700',
  completado: 'bg-emerald-100 text-emerald-700',
  reprobado:  'bg-red-100 text-red-700',
  en_curso:   'bg-amber-100 text-amber-700',
  inscrito:   'bg-slate-100 text-slate-600',
};

function formatFecha(iso: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('es-CL'); } catch { return iso; }
}

function estadoEsAprobado(e: string) { return e === 'aprobado' || e === 'completado'; }
function estadoEsReprobado(e: string) { return e === 'reprobado'; }
function estadoEsEnCurso(e: string)   { return e === 'en_curso' || e === 'inscrito'; }

// ── Exportar CSV ──────────────────────────────────────────────────────────────
function exportarCSV(filas: Inscripcion[]) {
  const headers = ['Nombre Completo', 'RUT', 'Email', 'Curso', 'Fecha Inscripción', '% Avance', 'Nota Final', 'Estado'];
  const rows = filas.map(i => [
    i.estudiante_data?.nombre_completo ?? `Usuario ${i.estudiante}`,
    i.estudiante_data?.rut_completo ?? '—',
    i.estudiante_data?.email ?? '—',
    i.curso_data?.nombre ?? `Curso ${i.curso}`,
    formatFecha(i.fecha_inscripcion),
    `${i.porcentaje_avance ?? 0}%`,
    i.nota_final ?? '—',
    ESTADO_LABEL[i.estado] ?? i.estado,
  ]);

  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `reporte_sence_${Date.now()}.csv`;
  a.click();
}

// ── Paginación ────────────────────────────────────────────────────────────────
const POR_PAGINA = 10;

// ── Página principal ──────────────────────────────────────────────────────────
export function AdminReportesSencePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarSections = useSidebarSections();

  // Filtros
  const [filtroCurso,  setFiltroCurso]  = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFecha,  setFiltroFecha]  = useState('');
  const [fechaDesde,   setFechaDesde]   = useState('');
  const [fechaHasta,   setFechaHasta]   = useState('');
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const [pagina, setPagina] = useState(1);

  // Datos
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cursos,         setCursos]         = useState<Curso[]>([]);
  const [loading,        setLoading]         = useState(false);
  const [generado,       setGenerado]         = useState(false);
  const [fechaGeneracion, setFechaGeneracion] = useState('');
  const [error,          setError]            = useState<string | null>(null);

  // Cargar cursos para el selector al montar
  useState(() => {
    api.get('/cursos/').then(r => {
      const data = r.data?.results ?? r.data ?? [];
      setCursos(data);
    }).catch(() => {});
  });

  const handleGenerar = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filtroCurso)  params.curso  = filtroCurso;
      if (filtroEstado) params.estado = filtroEstado;

      // Fecha
      const hoy = new Date();
      if (filtroFecha === 'este_mes') {
        params.fecha_inscripcion__gte = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      } else if (filtroFecha === 'mes_anterior') {
        const ini = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        params.fecha_inscripcion__gte = ini.toISOString().split('T')[0];
        params.fecha_inscripcion__lte = fin.toISOString().split('T')[0];
      } else if (filtroFecha === 'ultimos_3_meses') {
        const ini = new Date(hoy); ini.setMonth(hoy.getMonth() - 3);
        params.fecha_inscripcion__gte = ini.toISOString().split('T')[0];
      } else if (filtroFecha === 'este_año') {
        params.fecha_inscripcion__gte = `${hoy.getFullYear()}-01-01`;
      } else if (filtroFecha === 'personalizado') {
        if (fechaDesde) params.fecha_inscripcion__gte = fechaDesde;
        if (fechaHasta) params.fecha_inscripcion__lte = fechaHasta;
      }

      const res = await api.get('/inscripciones/', { params: { ...params, page_size: 500 } });
      const data: Inscripcion[] = res.data?.results ?? res.data ?? [];
      setInscripciones(data);
      setGenerado(true);
      setPagina(1);
      setBusquedaTabla('');
      setFechaGeneracion(new Date().toLocaleString('es-CL'));
    } catch {
      setError('No se pudieron cargar los datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiltroCurso('');
    setFiltroEstado('');
    setFiltroFecha('');
    setFechaDesde('');
    setFechaHasta('');
  };

  // Filtro de búsqueda en tabla
  const filasFiltradas = useMemo(() => {
    if (!busquedaTabla) return inscripciones;
    const q = busquedaTabla.toLowerCase();
    return inscripciones.filter(i =>
      (i.estudiante_data?.nombre_completo ?? '').toLowerCase().includes(q) ||
      (i.estudiante_data?.rut_completo ?? '').toLowerCase().includes(q) ||
      (i.curso_data?.nombre ?? '').toLowerCase().includes(q)
    );
  }, [inscripciones, busquedaTabla]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / POR_PAGINA));
  const filasPagina  = filasFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // Estadísticas
  const aprobados  = inscripciones.filter(i => estadoEsAprobado(i.estado)).length;
  const reprobados = inscripciones.filter(i => estadoEsReprobado(i.estado)).length;
  const enCurso    = inscripciones.filter(i => estadoEsEnCurso(i.estado)).length;
  const notas      = inscripciones.filter(i => i.nota_final != null).map(i => i.nota_final!);
  const promedio   = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '—';

  const total = inscripciones.length;

  const inputCls = "w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-calipso/30 bg-white";

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || user?.username || 'Admin'}
      userSubtitle={user?.rol || 'Administrador'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Reportes SENCE"
      headerSubtitle="Genera reportes de rendimiento y certificación"
      headerActions={
        generado ? (
          <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
            <p className="text-xs text-slate-600">
              Total Registros: <span className="font-bold text-jc-blue">{total}</span>
            </p>
          </div>
        ) : null
      }
    >
      {/* ── FILTROS ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Filter size={18} className="text-jc-blue" /> Filtros de Búsqueda
          </h2>
          <button onClick={handleReset} className="text-sm text-slate-500 hover:text-slate-700 underline flex items-center gap-1">
            <X size={14} /> Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Curso */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Curso</label>
            <select value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)} className={inputCls}>
              <option value="">Todos los cursos</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Estado de Aprobación</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={inputCls}>
              <option value="">Todos</option>
              <option value="aprobado">Aprobado</option>
              <option value="reprobado">Reprobado</option>
              <option value="en_curso">En Curso</option>
              <option value="completado">Completado</option>
              <option value="inscrito">Inscrito</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Inscripción</label>
            <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className={inputCls}>
              <option value="">Todas las fechas</option>
              <option value="este_mes">Este mes</option>
              <option value="mes_anterior">Mes anterior</option>
              <option value="ultimos_3_meses">Últimos 3 meses</option>
              <option value="este_año">Este año</option>
              <option value="personalizado">Rango personalizado...</option>
            </select>
          </div>

          {/* Rango personalizado */}
          {filtroFecha === 'personalizado' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Desde</label>
                <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hasta</label>
                <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className={inputCls} />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handleGenerar}
            disabled={loading}
            className="px-8 py-3 bg-jc-blue text-white rounded-lg font-semibold hover:bg-jc-blue-dark transition flex items-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <><RefreshCw size={18} className="animate-spin" /> Cargando...</>
              : <><FileText size={18} /> Generar Reporte</>
            }
          </button>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      </div>

      {/* ── ESTADO VACÍO ── */}
      {!generado && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <FileText size={72} className="text-slate-200 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No hay reporte generado</h3>
          <p className="text-slate-500 mb-8">Selecciona los filtros y genera un reporte para ver los datos</p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            {[
              'Exportación a CSV compatible con Excel',
              'Filtros avanzados de búsqueda',
              'Datos listos para SENCE',
            ].map(t => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle size={16} className="text-jc-blue flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTADOS ── */}
      {generado && (
        <>
          {/* Banner resumen */}
          <div className="bg-gradient-to-r from-jc-blue to-jc-blue-dark rounded-xl p-6 mb-6 text-white flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Reporte Generado</h3>
              <p className="text-blue-100 text-sm">Fecha de generación: {fechaGeneracion}</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">{total}</p>
              <p className="text-blue-100 text-sm">Registros encontrados</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {[
              { label: 'Aprobados',       value: aprobados,  pct: total ? ((aprobados  / total) * 100).toFixed(1) : 0, color: 'text-green-600',  icon: CheckCircle },
              { label: 'Reprobados',      value: reprobados, pct: total ? ((reprobados / total) * 100).toFixed(1) : 0, color: 'text-red-600',    icon: XCircle },
              { label: 'En Curso',        value: enCurso,    pct: total ? ((enCurso    / total) * 100).toFixed(1) : 0, color: 'text-amber-600',  icon: Clock },
              { label: 'Promedio Nota',   value: promedio,   pct: 'De 100 puntos',                                      color: 'text-jc-blue',    icon: TrendingUp },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-600">{s.label}</p>
                  <s.icon size={18} className={s.color} />
                </div>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.pct}{typeof s.pct === 'number' ? '% del total' : ''}</p>
              </div>
            ))}
          </div>

          {/* Exportar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Exportar Reporte</h3>
            <div className="flex gap-3">
              <button
                onClick={() => exportarCSV(filasFiltradas)}
                className="flex-1 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <Download size={20} />
                <div className="text-left">
                  <p className="font-bold">Exportar CSV</p>
                  <p className="text-xs opacity-90">Compatible con Excel</p>
                </div>
              </button>
              <button
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition hover:-translate-y-0.5 flex items-center justify-center gap-3 opacity-60 cursor-not-allowed"
                title="Disponible próximamente"
              >
                <FileText size={20} />
                <div className="text-left">
                  <p className="font-bold">Exportar Excel</p>
                  <p className="text-xs opacity-90">Próximamente</p>
                </div>
              </button>
              <button
                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition hover:-translate-y-0.5 flex items-center justify-center gap-3 opacity-60 cursor-not-allowed"
                title="Disponible próximamente"
              >
                <FileText size={20} />
                <div className="text-left">
                  <p className="font-bold">Exportar PDF</p>
                  <p className="text-xs opacity-90">Próximamente</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Vista Previa de Datos</h3>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en resultados..."
                  value={busquedaTabla}
                  onChange={e => { setBusquedaTabla(e.target.value); setPagina(1); }}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-calipso/30"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Nombre Completo', 'RUT', 'Curso', 'Fecha Inscripción', '% Avance', 'Nota Final', 'Estado'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filasPagina.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No hay registros que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  ) : filasPagina.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {i.estudiante_data?.nombre_completo ?? `Usuario ${i.estudiante}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {i.estudiante_data?.rut_completo ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                        {i.curso_data?.nombre ?? `Curso ${i.curso}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatFecha(i.fecha_inscripcion)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-jc-calipso rounded-full"
                              style={{ width: `${i.porcentaje_avance ?? 0}%` }}
                            />
                          </div>
                          {i.porcentaje_avance ?? 0}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        {i.nota_final != null ? i.nota_final : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ESTADO_COLOR[i.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                          {ESTADO_LABEL[i.estado] ?? i.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Mostrando{' '}
                <span className="font-semibold">{Math.min((pagina - 1) * POR_PAGINA + 1, filasFiltradas.length)}–{Math.min(pagina * POR_PAGINA, filasFiltradas.length)}</span>
                {' '}de{' '}
                <span className="font-semibold">{filasFiltradas.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-600 px-2">{pagina} / {totalPaginas}</span>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}