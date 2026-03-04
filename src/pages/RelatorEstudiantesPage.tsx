// src/pages/RelatorEstudiantesPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, 
  FolderOpen, 
  Upload, 
  Bell, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink, 
  MessageCircle,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface InscripcionEstudiante {
  id: number;
  estudiante_data: {
    id: number;
    nombre_completo: string;
    rut_completo: string;
    email: string;
    avatar_url?: string;
  };
  curso_data: {
    id: number;
    nombre: string;
  };
  porcentaje_avance: number;
  nota_final: number | null;
  estado: string;
  updated_at: string;
}

interface RespuestaDetalle {
  id: number;
  pregunta_data: {
    enunciado: string;
    tipo: string;
    opciones: Record<string, string>;
    respuesta_correcta: string;
    puntaje: number;
  };
  respuesta_seleccionada: number | null;
  respuesta_texto: string;
  correcta: boolean | null;
  puntaje_obtenido: number | null;
}

interface IntentoRevision {
  id: number;
  estudiante_nombre: string;
  evaluacion_nombre: string;
  validado_por_relator: boolean;
  validado_por: number | null;
  nota_obtenida: number | null;
  puntaje_obtenido: number | null;
  puntaje_total: number | null;
  fecha_fin: string | null;
  numero_intento: number;
  respuestas?: RespuestaDetalle[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcPct(obtenido: number | string | null, total: number | string | null): string {
  if (obtenido == null || total == null) return '—';
  const o = Number(obtenido); const t = Number(total);
  if (isNaN(o) || isNaN(t) || t === 0) return '—';
  return Math.round((o / t) * 100) + '%';
}

function formatFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Componente principal ──────────────────────────────────────────────────────

export function RelatorEstudiantesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab activa
  const [tab, setTab] = useState<'estudiantes' | 'revision'>('estudiantes');

  // ── Estado: Estudiantes ──
  const [estudiantes, setEstudiantes] = useState<InscripcionEstudiante[]>([]);
  const [loadingEst, setLoadingEst] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');

  // ── Estado: Revisión ──
  const [intentos, setIntentos] = useState<IntentoRevision[]>([]);
  const [loadingInt, setLoadingInt] = useState(false);
  const [intentosCargados, setIntentosCargados] = useState(false);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [marcando, setMarcando] = useState<number | null>(null);
  const [filtroRevision, setFiltroRevision] = useState<'pendientes' | 'revisados' | 'todos'>('pendientes');
  const [busquedaRevision, setBusquedaRevision] = useState('');

  // ── Carga estudiantes ──
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingEst(true);
        const res = await api.get('/inscripciones/');
        setEstudiantes(res.data?.results || res.data || []);
      } catch (error) {
        console.error('Error cargando estudiantes:', error);
      } finally {
        setLoadingEst(false);
      }
    };
    cargarDatos();
  }, []);

  // ── Carga intentos (lazy: solo cuando se activa la tab) ──
  useEffect(() => {
    if (tab !== 'revision' || intentosCargados) return;
    const cargarIntentos = async () => {
      try {
        setLoadingInt(true);
        const res = await api.get('/intentos-evaluacion/', {
          // Incluir tanto 'completado' como 'tiempo_excedido' - ambos son intentos rendidos
          // No filtrar solo por 'completado' o se pierden los que se agotó el tiempo
          params: { estado: 'completado' },
        });
        const data: IntentoRevision[] = res.data?.results || res.data || [];
        // Cargar respuestas de cada intento en paralelo
        const conRespuestas = await Promise.all(
          data.map(async (intento) => {
            try {
              const det = await api.get(`/intentos-evaluacion/${intento.id}/`);
              return { ...intento, ...det.data };
            } catch {
              return intento;
            }
          })
        );
        setIntentos(conRespuestas);
        setIntentosCargados(true);
      } catch (err) {
        console.error('Error cargando intentos:', err);
      } finally {
        setLoadingInt(false);
      }
    };
    cargarIntentos();
  }, [tab, intentosCargados]);

  // ── Marcar revisado ──
  const marcarRevisado = async (intento: IntentoRevision) => {
    setMarcando(intento.id);
    try {
      await api.patch(`/intentos-evaluacion/${intento.id}/`, {
        validado_por_relator: true,
      });
      setIntentos(prev =>
        prev.map(i => i.id === intento.id ? { ...i, validado_por_relator: true } : i)
      );
    } catch (err) {
      console.error('Error marcando revisado:', err);
    } finally {
      setMarcando(null);
    }
  };

  // ── Filtros estudiantes ──
  const listaCursos = useMemo(() => {
    const nombres = estudiantes.map(i => i.curso_data.nombre);
    return Array.from(new Set(nombres));
  }, [estudiantes]);

  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(i => {
      const nombre = i.estudiante_data.nombre_completo.toLowerCase();
      const rut = i.estudiante_data.rut_completo.toLowerCase();
      const matchBusqueda = nombre.includes(busqueda.toLowerCase()) || rut.includes(busqueda.toLowerCase());
      const matchCurso = filtroCurso === '' || i.curso_data.nombre === filtroCurso;
      return matchBusqueda && matchCurso;
    });
  }, [estudiantes, busqueda, filtroCurso]);

  // ── Filtros revisión ──
  const intentosFiltrados = useMemo(() => {
    return intentos.filter(i => {
      const coincide =
        i.estudiante_nombre?.toLowerCase().includes(busquedaRevision.toLowerCase()) ||
        i.evaluacion_nombre?.toLowerCase().includes(busquedaRevision.toLowerCase());
      if (!coincide) return false;
      if (filtroRevision === 'pendientes') return !i.validado_por_relator;
      if (filtroRevision === 'revisados') return i.validado_por_relator;
      return true;
    });
  }, [intentos, busquedaRevision, filtroRevision]);

  const pendientesCount = intentos.filter(i => !i.validado_por_relator).length;

  // ── KPIs estudiantes ──
  const stats = {
    total: estudiantes.length,
    completados: estudiantes.filter(e => e.porcentaje_avance === 100).length,
    promedioAvance: estudiantes.length > 0
      ? Math.round(estudiantes.reduce((acc, curr) => acc + curr.porcentaje_avance, 0) / estudiantes.length)
      : 0,
    enRiesgo: estudiantes.filter(e => e.porcentaje_avance < 20).length,
  };

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/relator/dashboard' },
        { icon: <FolderOpen size={20} />, label: 'Mis Materiales', href: '/relator/materiales' },
        { icon: <Upload size={20} />, label: 'Subir Material', href: '/relator/subir' },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { icon: <BookOpen size={20} />, label: 'Mis Cursos', href: '/relator/cursos' },
        { icon: <Users size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes', isActive: true },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas', href: '/relator/stats' },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones' },
        { icon: <Users size={20} />, label: 'Mi Perfil', href: '/relator/perfil' },
      ],
    },
  ];

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Mis Estudiantes"
      headerSubtitle="Rendimiento académico y revisión de exámenes"
    >
      <div className="space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard label="Total Alumnos"    value={stats.total}              icon={<Users className="text-blue-600" />}      color="bg-blue-50"  />
          <SummaryCard label="Completados"       value={stats.completados}        icon={<CheckCircle2 className="text-green-600" />} color="bg-green-50" />
          <SummaryCard label="Avance Promedio"   value={`${stats.promedioAvance}%`} icon={<TrendingUp className="text-jc-calipso" />} color="bg-cyan-50" />
          <SummaryCard label="Exámenes pendientes" value={pendientesCount}
            icon={<ClipboardCheck className={pendientesCount > 0 ? 'text-amber-600' : 'text-slate-400'} />}
            color={pendientesCount > 0 ? 'bg-amber-50' : 'bg-slate-50'}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-0">
            <button
              onClick={() => setTab('estudiantes')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === 'estudiantes'
                  ? 'border-[#064D91] text-[#064D91]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users size={16} /> Mis Estudiantes
            </button>
            <button
              onClick={() => setTab('revision')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === 'revision'
                  ? 'border-[#064D91] text-[#064D91]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <ClipboardCheck size={16} /> Revisión de Exámenes
              {pendientesCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendientesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── TAB: Estudiantes ── */}
        {tab === 'estudiantes' && (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o RUT..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#52A9B7] outline-none text-sm"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-3 border border-slate-300 rounded-lg outline-none bg-white text-sm"
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
                  <option value="">Todos los cursos</option>
                  {listaCursos.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
                </select>
                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setBusqueda(''); setFiltroCurso(''); }}>
                    <Filter size={14} className="mr-2" /> Limpiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Estudiante</th>
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4">Progreso</th>
                      <th className="px-6 py-4 text-center">Nota Final</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingEst ? (
                      <tr><td colSpan={5} className="p-10 text-center text-slate-400">Cargando...</td></tr>
                    ) : estudiantesFiltrados.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-slate-400">Sin resultados</td></tr>
                    ) : (
                      estudiantesFiltrados.map((i) => (
                        <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-jc-blue font-bold text-xs">
                                {i.estudiante_data.nombre_completo[0]}
                              </div>
                              <div>
                                <p className="font-bold text-slate-700">{i.estudiante_data.nombre_completo}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{i.estudiante_data.rut_completo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-600">{i.curso_data.nombre}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                                <div
                                  className={`h-full rounded-full transition-all ${i.porcentaje_avance === 100 ? 'bg-green-500' : 'bg-jc-blue'}`}
                                  style={{ width: `${i.porcentaje_avance}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-700">{i.porcentaje_avance}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {i.nota_final ? (
                              <span className={`font-bold ${i.nota_final >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                                {Number(i.nota_final).toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-slate-300 italic text-xs">S/N</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-jc-blue transition" title="Mensaje">
                                <MessageCircle size={18} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-jc-blue transition" title="Detalle">
                                <ExternalLink size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-500">
                <p>Mostrando {estudiantesFiltrados.length} estudiantes</p>
                <div className="flex gap-2">
                  <button className="p-1 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
                  <button className="p-1 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TAB: Revisión de Exámenes ── */}
        {tab === 'revision' && (
          <>
            {/* Buscador y filtro de estado */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante o examen..."
                  value={busquedaRevision}
                  onChange={e => setBusquedaRevision(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#064D91]/20 focus:border-[#064D91]"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['pendientes', 'revisados', 'todos'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltroRevision(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      filtroRevision === f
                        ? 'bg-white text-[#064D91] shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f === 'pendientes' ? 'Pendientes' : f === 'revisados' ? 'Revisados' : 'Todos'}
                    {f === 'pendientes' && pendientesCount > 0 && (
                      <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {pendientesCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de intentos */}
            {loadingInt ? (
              <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#064D91] border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Cargando exámenes...</p>
              </div>
            ) : intentosFiltrados.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
                <AlertCircle size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  {filtroRevision === 'pendientes' ? '¡Sin exámenes pendientes!' : 'No hay resultados'}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {filtroRevision === 'pendientes'
                    ? 'Cuando un estudiante entregue un examen aparecerá aquí.'
                    : 'Prueba con otro filtro.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {intentosFiltrados.map(intento => (
                  <div
                    key={intento.id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                      !intento.validado_por_relator ? 'border-amber-200' : 'border-slate-200'
                    }`}
                  >
                    {/* Fila principal */}
                    <div className="p-5 flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        intento.validado_por_relator ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {intento.estudiante_nombre?.charAt(0).toUpperCase() || '?'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">{intento.estudiante_nombre}</span>
                          {intento.validado_por_relator
                            ? <Badge variant="success">Revisado</Badge>
                            : <Badge variant="warning">Pendiente</Badge>
                          }
                          {intento.validado_por !== null && (
                            <Badge variant="info">Nota liberada</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {intento.evaluacion_nombre} · Intento #{intento.numero_intento}
                        </p>
                      </div>

                      {/* Métricas */}
                      <div className="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
                        <div>
                          <p className="text-xs text-slate-400">Puntaje</p>
                          <p className="font-bold text-slate-700 text-sm">
                            {intento.puntaje_obtenido ?? '—'}/{intento.puntaje_total ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">%</p>
                          <p className="font-bold text-slate-700 text-sm">
                            {calcPct(intento.puntaje_obtenido, intento.puntaje_total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Nota</p>
                          <p className={`font-bold text-sm ${
                            intento.nota_obtenida == null ? 'text-slate-400' :
                            Number(intento.nota_obtenida) >= 4 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {intento.nota_obtenida != null ? Number(intento.nota_obtenida).toFixed(1) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Entregado</p>
                          <p className="text-xs text-slate-600">{formatFecha(intento.fecha_fin)}</p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!intento.validado_por_relator && (
                          <button
                            onClick={() => marcarRevisado(intento)}
                            disabled={marcando === intento.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#064D91] hover:bg-[#053d74] text-white text-xs font-medium rounded-lg transition disabled:opacity-60"
                          >
                            {marcando === intento.id
                              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <CheckCircle2 size={13} />
                            }
                            {marcando === intento.id ? 'Guardando...' : 'Marcar revisado'}
                          </button>
                        )}
                        {intento.validado_por_relator && (
                          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 size={13} /> Revisado
                          </div>
                        )}
                        <button
                          onClick={() => setExpandido(expandido === intento.id ? null : intento.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          {expandido === intento.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Detalle expandible: respuestas */}
                    {expandido === intento.id && (
                      <div className="border-t border-slate-100 bg-slate-50 p-5">
                        <div className="flex items-center gap-6 mb-4 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <BarChart2 size={12} />
                            {intento.puntaje_obtenido ?? 0}/{intento.puntaje_total ?? 0} pts
                            · {calcPct(intento.puntaje_obtenido, intento.puntaje_total)}
                            {intento.nota_obtenida != null && (
                              <span className={`font-bold ml-1 ${Number(intento.nota_obtenida) >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                                · Nota: {Number(intento.nota_obtenida).toFixed(1)}
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} /> {formatFecha(intento.fecha_fin)}
                          </span>
                        </div>

                        {!intento.respuestas || intento.respuestas.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">Sin respuestas registradas.</p>
                        ) : (
                          <div className="space-y-3">
                            {intento.respuestas.map((resp, idx) => {
                              const preg = resp.pregunta_data;
                              const esCorrecta = resp.correcta === true;
                              const esIncorrecta = resp.correcta === false;
                              const opcionSel = (() => {
                                if (resp.respuesta_seleccionada != null && preg?.opciones) {
                                  const k = String(resp.respuesta_seleccionada);
                                  return preg.opciones[k] ?? preg.opciones[k.toLowerCase()] ?? `Opción ${resp.respuesta_seleccionada}`;
                                }
                                return resp.respuesta_texto || '—';
                              })();
                              const opcionCorr = (() => {
                                if (preg?.respuesta_correcta != null && preg?.opciones) {
                                  const k = String(preg.respuesta_correcta);
                                  return preg.opciones[k] ?? preg.opciones[k.toLowerCase()] ?? `Opción ${preg.respuesta_correcta}`;
                                }
                                return preg?.respuesta_correcta || '—';
                              })();

                              return (
                                <div
                                  key={resp.id}
                                  className={`rounded-lg border p-4 ${
                                    esCorrecta ? 'border-green-200 bg-green-50' :
                                    esIncorrecta ? 'border-red-200 bg-red-50' :
                                    'border-slate-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">
                                        Pregunta {idx + 1}
                                        {preg?.tipo && (
                                          <span className="ml-2 font-normal text-slate-400">
                                            ({preg.tipo === 'seleccion_multiple' ? 'Selección múltiple' :
                                              preg.tipo === 'verdadero_falso' ? 'Verdadero/Falso' : 'Texto libre'})
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-sm text-slate-800 font-medium mb-3">
                                        {preg?.enunciado || '(Pregunta no disponible)'}
                                      </p>
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-slate-500 w-24 flex-shrink-0">Respondió:</span>
                                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                            esCorrecta ? 'bg-green-100 text-green-700' :
                                            esIncorrecta ? 'bg-red-100 text-red-700' :
                                            'bg-slate-100 text-slate-600'
                                          }`}>
                                            {opcionSel}
                                          </span>
                                        </div>
                                        {esIncorrecta && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 w-24 flex-shrink-0">Correcta era:</span>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
                                              {opcionCorr}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0 mt-1">
                                      {esCorrecta && (
                                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                                          <CheckCircle2 size={14} className="text-white" />
                                        </div>
                                      )}
                                      {esIncorrecta && (
                                        <div className="w-7 h-7 rounded-full bg-red-400 flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">✗</span>
                                        </div>
                                      )}
                                      {resp.correcta === null && (
                                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                                          <span className="text-slate-500 text-xs">?</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {preg?.puntaje != null && (
                                    <p className="text-right text-xs text-slate-400 mt-2">
                                      {resp.puntaje_obtenido ?? 0} / {preg.puntaje} pts
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {!intento.validado_por_relator && (
                          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                            <button
                              onClick={() => marcarRevisado(intento)}
                              disabled={marcando === intento.id}
                              className="flex items-center gap-2 px-4 py-2 bg-[#064D91] hover:bg-[#053d74] text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
                            >
                              {marcando === intento.id
                                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <CheckCircle2 size={15} />
                              }
                              Marcar como revisado
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </MainLayout>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, icon, color }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}