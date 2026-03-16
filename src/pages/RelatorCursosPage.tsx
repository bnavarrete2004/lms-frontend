// src/pages/RelatorCursosPage.tsx
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
  Clock,
  Calendar,
  Tag,
  Star,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CursoExtendido {
  id: number;
  nombre: string;
  descripcion: string;
  horas_totales: number;
  fecha_inicio: string;
  fecha_fin: string;
  codigo_sence_curso: string;
  estado: 'activo' | 'borrador' | 'inactivo' | 'archivado';
  total_inscritos: number;
  total_materiales?: number;
  progreso_promedio?: number | null;
  nota_promedio?: number | null;
}

interface EstudianteInscripcion {
  id: number;
  estudiante_nombre?: string;
  estado: string;
  porcentaje_avance: number;
  nota_final?: number | null;
  nota_final_calculada?: number | null;
  fecha_inscripcion: string;
}

type TabFiltro = 'todos' | 'activo' | 'proximamente' | 'completado';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Dado un array de inscripciones, calcula el promedio de progreso y nota.
 * Retorna null cuando no hay datos suficientes.
 */
function calcularPromedios(inscripciones: EstudianteInscripcion[]) {
  if (inscripciones.length === 0) return { progreso_promedio: null, nota_promedio: null };

  const totalProgreso = inscripciones.reduce((acc, i) => acc + (i.porcentaje_avance || 0), 0);
  const progreso_promedio = Math.round(totalProgreso / inscripciones.length);

  const conNota = inscripciones.filter(i => {
    const nota = i.nota_final ?? i.nota_final_calculada;
    return nota != null;
  });

  const nota_promedio =
    conNota.length > 0
      ? parseFloat(
          (
            conNota.reduce((acc, i) => {
              const nota = Number(i.nota_final ?? i.nota_final_calculada);
              return acc + nota;
            }, 0) / conNota.length
          ).toFixed(1)
        )
      : null;

  return { progreso_promedio, nota_promedio };
}

// ── Modal Estudiantes ─────────────────────────────────────────────────────────

function ModalEstudiantes({
  curso,
  onClose,
}: {
  curso: CursoExtendido;
  onClose: () => void;
}) {
  const [estudiantes, setEstudiantes] = useState<EstudianteInscripcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        setLoading(true);
        const res = await api.get('/inscripciones/', {
          params: { curso: curso.id, page_size: 200 },
        });
        setEstudiantes(res.data?.results || res.data || []);
      } catch {
        setEstudiantes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEstudiantes();
  }, [curso.id]);

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      aprobado:   { cls: 'bg-green-100 text-green-700', label: 'Aprobado'   },
      completado: { cls: 'bg-blue-100 text-blue-700',   label: 'Completado' },
      en_curso:   { cls: 'bg-amber-100 text-amber-700', label: 'En Curso'   },
      inscrito:   { cls: 'bg-slate-100 text-slate-600', label: 'Inscrito'   },
      reprobado:  { cls: 'bg-red-100 text-red-700',     label: 'Reprobado'  },
    };
    const c = map[estado] || { cls: 'bg-slate-100 text-slate-500', label: estado };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${c.cls}`}>
        {c.label}
      </span>
    );
  };

  const getNota = (e: EstudianteInscripcion) => {
    const nota = e.nota_final ?? e.nota_final_calculada;
    if (nota == null) return <span className="text-slate-400">—</span>;
    const n = Number(nota);
    const cls = n >= 4.0 ? 'text-green-600' : 'text-red-500';
    return <span className={`font-black ${cls}`}>{n.toFixed(1)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[88vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">Estudiantes inscritos</h2>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{curso.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-medium">Cargando estudiantes...</span>
            </div>
          ) : estudiantes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-slate-400">
              <Users size={40} className="opacity-30" />
              <p className="text-sm">No hay estudiantes inscritos en este curso.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="px-6 py-3">Estudiante</th>
                  <th className="px-6 py-3 text-center">Progreso</th>
                  <th className="px-6 py-3 text-center">Nota</th>
                  <th className="px-6 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estudiantes.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#064D91] to-[#52A9B7] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">
                            {(e.estudiante_nombre || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700">
                          {e.estudiante_nombre || `Estudiante #${e.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-600">{e.porcentaje_avance}%</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#064D91] rounded-full transition-all"
                            style={{ width: `${e.porcentaje_avance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">{getNota(e)}</td>
                    <td className="px-6 py-4 text-center">{getEstadoBadge(e.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && estudiantes.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <p className="text-xs text-slate-400">
              {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''} en total
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export function RelatorCursosPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [cursos, setCursos] = useState<CursoExtendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFiltro>('todos');
  const [notifCount, setNotifCount] = useState<number>(0);
  const [cursoModal, setCursoModal] = useState<CursoExtendido | null>(null);

  // ── Carga de datos ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTodo = async () => {
      try {
        setLoading(true);

        // 1. Cursos del relator
        const resCursos = await api.get('/cursos/');
        const cursosRaw: any[] = resCursos.data?.results || resCursos.data || [];

        // 2. Para cada curso, traer inscripciones y calcular promedios reales
        const cursosEnriquecidos = await Promise.all(
          cursosRaw.map(async (c: any) => {
            try {
              const resInsc = await api.get('/inscripciones/', {
                params: { curso: c.id, page_size: 200 },
              });
              const inscripciones: EstudianteInscripcion[] =
                resInsc.data?.results || resInsc.data || [];

              const { progreso_promedio, nota_promedio } = calcularPromedios(inscripciones);

              return {
                ...c,
                progreso_promedio,
                nota_promedio,
                total_inscritos: inscripciones.length,
              } as CursoExtendido;
            } catch {
              // Si falla una inscripción, el curso igual aparece sin promedios
              return { ...c, progreso_promedio: null, nota_promedio: null } as CursoExtendido;
            }
          })
        );

        setCursos(cursosEnriquecidos);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotificaciones = async () => {
      try {
        const res = await api.get('/notificaciones/', { params: { page_size: 1000 } });
        const lista = res.data?.results || res.data || [];
        setNotifCount(lista.filter((n: { leida: boolean }) => !n.leida).length);
      } catch {
        // silencioso
      }
    };

    fetchTodo();
    fetchNotificaciones();
  }, []);

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const cursosFiltrados = useMemo(() => {
    if (activeTab === 'todos') return cursos;
    if (activeTab === 'proximamente') return cursos.filter(c => new Date(c.fecha_inicio) > new Date());
    if (activeTab === 'completado') return cursos.filter(c => c.estado === 'archivado');
    return cursos.filter(c => c.estado === 'activo');
  }, [cursos, activeTab]);

  const stats = {
    total: cursos.length,
    estudiantes: cursos.reduce((acc, c) => acc + (c.total_inscritos || 0), 0),
    // Nota general: promedio de los cursos que tienen nota
    notaGral: (() => {
      const conNota = cursos.filter(c => c.nota_promedio != null);
      if (conNota.length === 0) return '—';
      return (
        conNota.reduce((acc, c) => acc + Number(c.nota_promedio), 0) / conNota.length
      ).toFixed(1);
    })(),
  };

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard',      href: '/relator/dashboard' },
        { icon: <FolderOpen      size={20} />, label: 'Mis Materiales', href: '/relator/materiales' },
        { icon: <Upload          size={20} />, label: 'Subir Material', href: '/relator/subir' },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { icon: <BookOpen   size={20} />, label: 'Mis Cursos',      href: '/relator/cursos',      isActive: true },
        { icon: <Users      size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes' },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas',    href: '/relator/stats' },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { icon: <Bell  size={20} />, label: 'Notificaciones', href: '/relator/notificaciones', badge: notifCount > 0 ? String(notifCount) : undefined, badgeVariant: 'danger' as const },
        { icon: <Users size={20} />, label: 'Mi Perfil',      href: '/relator/perfil' },
      ],
    },
  ];

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Mis Cursos Asignados"
      headerSubtitle="Gestión de programas académicos"
    >
      <div className="space-y-8">

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseStat icon={<BookOpen className="text-blue-600" />}  value={stats.total}       label="Cursos"      color="bg-blue-50"  />
          <CourseStat icon={<Users    className="text-green-600" />} value={stats.estudiantes} label="Estudiantes" color="bg-green-50" />
          <CourseStat icon={<Star     className="text-amber-600" />} value={stats.notaGral}    label="Nota Prom."  color="bg-amber-50" />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <TabButton active={activeTab === 'todos'}        label={`Todos (${stats.total})`} onClick={() => setActiveTab('todos')}        />
          <TabButton active={activeTab === 'activo'}       label="Activos"                  onClick={() => setActiveTab('activo')}       />
          <TabButton active={activeTab === 'proximamente'} label="Próximamente"             onClick={() => setActiveTab('proximamente')} />
          <TabButton active={activeTab === 'completado'}   label="Completados"              onClick={() => setActiveTab('completado')}   />
        </div>

        {/* Listado */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-medium">Cargando cursos...</span>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="p-10 text-center text-slate-400 italic text-sm">Sin cursos en esta categoría.</div>
          ) : cursosFiltrados.map((curso) => (
            <div key={curso.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-[#064D91] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                      <Award className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{curso.nombre}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 max-w-2xl">{curso.descripcion}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        <span className="flex items-center gap-1.5"><Clock    size={14} /> {curso.horas_totales}h</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(curso.fecha_inicio).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Tag      size={14} /> {curso.codigo_sence_curso}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={curso.estado === 'activo' ? 'success' : 'info'}>
                    {curso.estado.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                  <CourseSubStat
                    value={curso.total_inscritos || 0}
                    label="Alumnos"
                  />
                  <CourseSubStat
                    value={curso.progreso_promedio != null ? `${curso.progreso_promedio}%` : '—'}
                    label="Progreso prom."
                  />
                  <CourseSubStat
                    value={curso.nota_promedio != null ? curso.nota_promedio : '—'}
                    label="Nota prom."
                    highlight={
                      curso.nota_promedio != null
                        ? curso.nota_promedio >= 4.0 ? 'green' : 'red'
                        : undefined
                    }
                  />
                </div>

                <div className="flex items-center gap-3 mt-8">
                  <button
                    onClick={() => setCursoModal(curso)}
                    className="px-6 py-3 bg-[#064D91] text-white rounded-xl font-bold text-sm hover:bg-blue-900 transition-colors shadow-md flex items-center gap-2"
                  >
                    <Users size={16} /> Estudiantes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Página 1 de 1</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled><ChevronLeft  size={16} /></Button>
            <Button variant="outline" size="sm" disabled><ChevronRight size={16} /></Button>
          </div>
        </div>
      </div>

      {/* Modal Estudiantes */}
      {cursoModal && (
        <ModalEstudiantes
          curso={cursoModal}
          onClose={() => setCursoModal(null)}
        />
      )}
    </MainLayout>
  );
}

function CourseStat({ icon, value, label, color }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function TabButton({ active, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all
      ${active ? 'bg-[#064D91] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
    >
      {label}
    </button>
  );
}

function CourseSubStat({ value, label, highlight }: { value: any; label: string; highlight?: 'green' | 'red' }) {
  const textColor =
    highlight === 'green' ? 'text-green-600' :
    highlight === 'red'   ? 'text-red-500'   :
    'text-slate-700';

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
      <p className={`text-xl font-black ${textColor}`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}