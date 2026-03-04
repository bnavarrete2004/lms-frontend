// src/pages/AdminDashboardPage.tsx
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileSearch,
  BookOpen,
  Users,
  BarChart3,
  FolderTree,
  FileText,
  Globe,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserPlus,
  ArrowUpRight,
  ClipboardCheck,
  FileDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/relator/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

// ── Tipos locales ──────────────────────────────────────────────────────────────

interface DashboardStats {
  usuariosActivos: number;
  cursosActivos: number;
  certificadosEmitidos: number;
  materialesPendientes: number;
  examensPendientesValidar: number;
}

interface MaterialPendiente {
  id: number;
  nombre: string;
  tipo: string;
  categoria?: string;
  subido_por_nombre?: string;  // viene del serializer como campo extra
  created_at?: string;
}

// ── Skeleton para stats ────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-lg" />
        <div className="w-16 h-4 bg-slate-100 rounded" />
      </div>
      <div className="w-20 h-8 bg-slate-200 rounded mb-2" />
      <div className="w-32 h-3 bg-slate-100 rounded" />
    </div>
  );
}

// ── Skeleton para tabla ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3].map(i => (
        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-48 h-3 bg-slate-200 rounded" />
            <div className="w-32 h-2 bg-slate-100 rounded" />
          </div>
          <div className="w-24 h-3 bg-slate-100 rounded" />
          <div className="w-16 h-6 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado de carga
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMateriales, setLoadingMateriales] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorMateriales, setErrorMateriales] = useState<string | null>(null);

  // Datos reales
  const [stats, setStats] = useState<DashboardStats>({
    usuariosActivos: 0,
    cursosActivos: 0,
    certificadosEmitidos: 0,
    materialesPendientes: 0,
    examensPendientesValidar: 0,
  });
  const [materiales, setMateriales] = useState<MaterialPendiente[]>([]);
  const [dashTab, setDashTab] = useState<'materiales' | 'examenes'>('materiales');
  const [examenesPendientes, setExamenesPendientes] = useState<any[]>([]);
  const [validando, setValidando] = useState<number | null>(null);

  // Actividad crítica — mock hasta que exista endpoint de bitácora
  const recentActivity = [
    {
      icon: <CheckCircle2 className="text-emerald-500" size={20} />,
      title: 'Sistema funcionando',
      description: 'Todos los servicios activos',
      time: 'Ahora',
    },
    {
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      title: 'Bitácora',
      description: 'Disponible próximamente',
      time: '—',
    },
    {
      icon: <Clock className="text-blue-400" size={20} />,
      title: 'Actividad reciente',
      description: 'Se integrará con el backend',
      time: '—',
    },
  ];

  // ── Fetch stats en paralelo ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);

      try {
        const [cursosRes, inscripcionesRes, diplomasRes, materialesRes, intentosRes] = await Promise.all([
          api.get('/cursos/', { params: { estado: 'activo' } }).catch(() => ({ data: { count: 0 } })),
          api.get('/inscripciones/', { params: { estado: 'en_curso' } }).catch(() => ({ data: { count: 0 } })),
          api.get('/diplomas/').catch(() => ({ data: { count: 0 } })),   // ← 404 → devuelve 0
          api.get('/materiales/', { params: { estado: 'pendiente', page_size: 5 } }).catch(() => ({ data: { count: 0, results: [] } })),
          api.get('/intentos-evaluacion/', { params: { estado: 'completado' } }).catch(() => ({ data: [] })),
        ]);

        // Extraer conteos (soporta paginado o array directo)
        const cursosActivos =
          cursosRes.data?.count ?? cursosRes.data?.results?.length ?? cursosRes.data?.length ?? 0;

        const usuariosActivos =
          inscripcionesRes.data?.count ?? inscripcionesRes.data?.results?.length ?? inscripcionesRes.data?.length ?? 0;

        const certificadosEmitidos =
          diplomasRes.data?.count ?? diplomasRes.data?.results?.length ?? diplomasRes.data?.length ?? 0;

        const materialesPendientes =
          materialesRes.data?.count ??
          materialesRes.data?.results?.length ??
          materialesRes.data?.length ?? 0;

        const todosIntentos = intentosRes.data?.results ?? intentosRes.data ?? [];
        const pendientes = todosIntentos.filter((i: any) => i.validado_por_relator && !i.validado_por);
        setExamenesPendientes(pendientes);

        setStats({
          cursosActivos,
          usuariosActivos,
          certificadosEmitidos,
          materialesPendientes,
          examensPendientesValidar: pendientes.length,
        });
      } catch (err) {
        console.error('Error al cargar stats del dashboard:', err);
        setErrorStats('No se pudieron cargar las métricas. Verifica la conexión con el backend.');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // ── Fetch materiales pendientes para la tabla ────────────────────────────────
  useEffect(() => {
    const fetchMateriales = async () => {
      setLoadingMateriales(true);
      setErrorMateriales(null);

      try {
        const res = await api.get('/materiales/', {
          params: { estado: 'pendiente', page_size: 5 },
        });

        const data: MaterialPendiente[] =
          res.data?.results ?? res.data ?? [];

        setMateriales(data.slice(0, 5));
      } catch (err) {
        console.error('Error al cargar materiales pendientes:', err);
        setErrorMateriales('No se pudo cargar la tabla de materiales.');
      } finally {
        setLoadingMateriales(false);
      }
    };

    fetchMateriales();
  }, []);

  // ── Sidebar ──────────────────────────────────────────────────────────────────

  const downloadEncuestasCSV = async () => {
    try {
      const res = await api.get('/respuestas-encuesta/');
      const datos = res.data?.results ?? res.data ?? [];
      if (datos.length === 0) { alert('No hay encuestas registradas aún.'); return; }
      const headers = ['ID', 'Estudiante', 'Encuesta', 'Respuestas', 'Fecha'];
      const rows = datos.map((r: any) => [
        r.id,
        `"${(r.estudiante_nombre || '').replace(/"/g, "'")}"`,
        `"${(r.encuesta_nombre || '').replace(/"/g, "'")}"`,
        `"${JSON.stringify(r.respuestas || {}).replace(/"/g, "'")}"`,
        r.completada_at ? new Date(r.completada_at).toLocaleDateString('es-CL') : '',
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `encuestas_${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { alert('Error al descargar encuestas.'); }
  };

  const handleValidarIntento = async (intentoId: number) => {
    setValidando(intentoId);
    try {
      await api.post(`/intentos-evaluacion/${intentoId}/validar/`);
      setExamenesPendientes(prev => prev.filter(e => e.id !== intentoId));
      setStats(prev => ({ ...prev, examensPendientesValidar: Math.max(0, prev.examensPendientesValidar - 1) }));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Error al validar el intento.');
    } finally { setValidando(null); }
  };

  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',    href: '/admin/dashboard', isActive: true },
        { icon: <FileSearch size={20} />,      label: 'Revisión Material', href: '/admin/revision',  badge: stats.materialesPendientes > 0 ? String(stats.materialesPendientes) : undefined, badgeVariant: 'danger' as const, badgeAnimated: stats.materialesPendientes > 0 },
        { icon: <BookOpen size={20} />,        label: 'Gestión Cursos',   href: '/admin/cursos' },
        { icon: <Users size={20} />,           label: 'Usuarios y Roles', href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3 size={20} />,  label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Central',   href: '/admin/repositorio' },
        { icon: <FileText size={20} />,   label: 'Reportes SENCE',        href: '/admin/reportes' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { icon: <Globe size={20} />,    label: 'Contenido Público',   href: '/admin/landing' },
        { icon: <Settings size={20} />, label: 'Ajustes del Sistema', href: '/admin/config' },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  // ── Helpers de formato ───────────────────────────────────────────────────────

  const formatNumero = (n: number) =>
    n >= 1000 ? n.toLocaleString('es-CL') : String(n).padStart(2, '0');

  const getTipoIcon = (tipo: string) => {
    const iconos: Record<string, string> = {
      video: '🎬',
      documento: '📄',
      presentacion: '📊',
      imagen: '🖼️',
      audio: '🎵',
      codigo: '💻',
      enlace: '🔗',
      otro: '📁',
    };
    return iconos[tipo] ?? '📁';
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || user?.username || 'Admin'}
      userSubtitle={user?.rol}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Centro de Administración"
      notificationCount={stats.materialesPendientes}
    >
      <div className="space-y-8">

        {/* Error global de stats */}
        {errorStats && (
          <Alert variant="danger" title="Error de conexión">
            {errorStats}
          </Alert>
        )}

        {/* 1. HERO: SYSTEM HEALTH */}
        <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-jc-blue/20 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Sistema Online
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Estado del Ecosistema</h2>

              {loadingStats ? (
                <div className="space-y-2 animate-pulse">
                  <div className="w-72 h-4 bg-white/10 rounded" />
                  <div className="w-56 h-4 bg-white/10 rounded" />
                </div>
              ) : (
                <p className="text-slate-400 max-w-md">
                  Hay{' '}
                  <span className="text-white font-bold">{stats.usuariosActivos} alumnos</span> activos ahora.
                  {stats.materialesPendientes > 0 ? (
                    <>
                      {' '}Se requiere atención en{' '}
                      <span className="text-rose-400 font-bold">
                        {stats.materialesPendientes} solicitudes
                      </span>{' '}
                      de material.
                    </>
                  ) : (
                    <> No hay materiales pendientes de revisión.</>
                  )}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/usuarios/nuevo')}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <UserPlus size={18} />
                Crear Usuario
              </button>
              <button
                onClick={() => navigate('/admin/reportes')}
                className="px-5 py-3 bg-jc-calipso hover:bg-jc-calipso/90 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-jc-calipso/20"
              >
                <FileText size={18} />
                Generar Reporte
              </button>
            </div>
          </div>
        </section>

        {/* 2. STATS GRID */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Alumnos Activos"
              value={formatNumero(stats.usuariosActivos)}
              iconColor="text-jc-blue"
              iconBgColor="bg-blue-50"
            />
            <StatCard
              icon={BookOpen}
              title="Cursos Activos"
              value={formatNumero(stats.cursosActivos)}
              iconColor="text-jc-calipso"
              iconBgColor="bg-cyan-50"
            />
            <StatCard
              icon={ShieldCheck}
              title="Certificados Emitidos"
              value={formatNumero(stats.certificadosEmitidos)}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-50"
            />
            <StatCard
              icon={AlertTriangle}
              title="Pendientes Revisión"
              value={formatNumero(stats.materialesPendientes)}
              iconColor="text-rose-600"
              iconBgColor="bg-rose-50"
              trend={
                stats.materialesPendientes > 0
                  ? { value: 'Acción requerida', isPositive: false }
                  : { value: 'Todo al día', isPositive: true }
              }
            />
          </div>
        )}

        {/* 3. MAIN CONTENT: TABLE + ACTIVITY */}
        <div className="grid grid-cols-12 gap-8">

          {/* TABLA DE MATERIALES PENDIENTES */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">
                  Materiales por Aprobar
                  {!loadingMateriales && stats.materialesPendientes > 0 && (
                    <span className="ml-2 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                      {stats.materialesPendientes}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => navigate('/admin/repositorio')}
                  className="text-jc-blue text-sm font-bold hover:underline"
                >
                  Ver repositorio completo
                </button>
              </div>

              {/* Error materiales */}
              {errorMateriales && (
                <div className="px-6 py-4">
                  <Alert variant="danger" title="Error al cargar materiales">
                    {errorMateriales}
                  </Alert>
                </div>
              )}

              {/* Skeleton */}
              {loadingMateriales && !errorMateriales && <TableSkeleton />}

              {/* Tabla vacía */}
              {!loadingMateriales && !errorMateriales && materiales.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700">Sin materiales pendientes</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Todo el contenido ha sido revisado
                  </p>
                </div>
              )}

              {/* Tabla con datos */}
              {!loadingMateriales && !errorMateriales && materiales.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="px-6 py-4">Contenido</th>
                        <th className="px-6 py-4">Subido por</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {materiales.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-lg">
                                {getTipoIcon(item.tipo)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700 max-w-[220px] truncate">
                                  {item.nombre}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">
                                  {item.tipo}{item.categoria ? ` • ${item.categoria}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {(item.subido_por_nombre ?? '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="max-w-[120px] truncate">
                                {item.subido_por_nombre ?? 'Relator'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="warning">Pendiente</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate(`/admin/revision/${item.id}`)}
                              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-jc-blue transition-all"
                              title="Revisar material"
                            >
                              <ArrowUpRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR DERECHO: TABS — mismo diseño que RelatorDashboardPage */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button
                  onClick={() => setDashTab('materiales')}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${dashTab === 'materiales' ? 'text-jc-blue border-b-2 border-jc-blue bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <AlertTriangle size={13} className="inline mr-1" /> Actividad Crítica
                </button>
                <button
                  onClick={() => setDashTab('examenes')}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${dashTab === 'examenes' ? 'text-jc-blue border-b-2 border-jc-blue bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ClipboardCheck size={13} className="inline mr-1" />
                  Validar Exámenes
                  {stats.examensPendientesValidar > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold">
                      {stats.examensPendientesValidar}
                    </span>
                  )}
                </button>
              </div>

              <div className="p-6">
                {dashTab === 'materiales' && (
                  <div className="space-y-6">
                    {recentActivity.map((act, i) => (
                      <div key={i} className="flex gap-4 relative">
                        {i !== recentActivity.length - 1 && (
                          <div className="absolute left-3 top-8 bottom-[-24px] w-[1px] bg-slate-100" />
                        )}
                        <div className="relative z-10 w-6 h-6 bg-white flex items-center justify-center flex-shrink-0">
                          {act.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{act.title}</p>
                          <p className="text-xs text-slate-500">{act.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                            {act.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/admin/bitacora')}
                      className="w-full mt-2 py-3 text-sm font-bold text-slate-400 hover:text-jc-blue border-t border-slate-50 transition-colors"
                    >
                      Ver bitácora completa
                    </button>
                  </div>
                )}

                {dashTab === 'examenes' && (
                  <div className="space-y-3">
                    {loadingStats ? (
                      <p className="text-slate-400 text-sm text-center py-6">Cargando...</p>
                    ) : examenesPendientes.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 size={24} className="text-green-500" />
                        </div>
                        <p className="text-slate-400 text-sm italic">¡Todo al día!</p>
                        <p className="text-slate-300 text-xs mt-1">No hay exámenes por validar.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-slate-400 mb-4">El estudiante verá su nota tras tu validación.</p>
                        {examenesPendientes.slice(0, 5).map((intento: any) => (
                          <div key={intento.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50 transition-all">
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-sm font-bold text-slate-800 truncate">{intento.estudiante_nombre}</p>
                              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide truncate">{intento.evaluacion_nombre}</p>
                              <p className="text-[10px] text-slate-300 mt-0.5">
                                {intento.fecha_fin ? new Date(intento.fecha_fin).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleValidarIntento(intento.id)}
                              disabled={validando === intento.id}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${validando === intento.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
                            >
                              {validando === intento.id
                                ? <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Validando...</>
                                : <><ShieldCheck size={14} /> Validar</>
                              }
                            </button>
                          </div>
                        ))}
                        {examenesPendientes.length > 5 && (
                          <button onClick={() => navigate('/admin/usuarios')} className="w-full py-2.5 text-xs font-bold text-jc-blue hover:underline">
                            Ver {examenesPendientes.length - 5} más en Gestión de Usuarios →
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mini-acceso rápido a cursos */}
            <div className="bg-gradient-to-br from-jc-blue to-jc-blue-dark rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-1">Gestión de Cursos</h3>
              <p className="text-blue-200 text-xs mb-4">
                {loadingStats
                  ? 'Cargando...'
                  : `${stats.cursosActivos} curso${stats.cursosActivos !== 1 ? 's' : ''} activo${stats.cursosActivos !== 1 ? 's' : ''} en la plataforma`}
              </p>
              <button
                onClick={() => navigate('/admin/cursos')}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-all"
              >
                Ir a Gestión de Cursos
              </button>
            </div>

            {/* Encuestas de satisfacción */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileDown size={20} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Encuestas de Satisfacción</h3>
                  <p className="text-xs text-slate-400">Testimonios y feedback de alumnos</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Descarga las respuestas en CSV para publicarlas como testimonios o análisis interno.
              </p>
              <button
                onClick={downloadEncuestasCSV}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <FileDown size={16} /> Descargar CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}