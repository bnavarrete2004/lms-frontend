// src/pages/AdminNotificationsPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  BookOpen,
  Users,
  BarChart3,
  FolderTree,
  FileText,
  Globe,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  X,
  Award,
  User,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Notificacion {
  id: number;
  tipo: string;
  tipo_display: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  prioridad: string;
  url_accion?: string;
}

type TipoFiltro = 'todas' | 'no_leidas' | 'evaluaciones' | 'sistema';

export function AdminNotificationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<TipoFiltro>('todas');

  // ── Paginación ──
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const POR_PAGINA = 20;

  // ── Carga de Datos ──
  const cargarNotificaciones = async (url?: string) => {
    try {
      setLoading(true);
      const res = await api.get(url || '/notificaciones/');
      setNotificaciones(res.data?.results || res.data || []);
      setTotalCount(res.data?.count || 0);
      setNextUrl(res.data?.next ? new URL(res.data.next).pathname + new URL(res.data.next).search : null);
      setPrevUrl(res.data?.previous ? new URL(res.data.previous).pathname + new URL(res.data.previous).search : null);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  // ── Handlers ──
  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(`/notificaciones/${id}/marcar_leida/`);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (error) {
      console.error("Error al marcar como leída", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notificaciones/marcar_todas_leidas/');
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error("Error al marcar todas", error);
    }
  };

  const handleEliminar = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notificaciones/${id}/`);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error("Error al eliminar notificación", error);
    }
  };

  const handleVaciarBandeja = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) return;
    try {
      await api.delete('/notificaciones/vaciar_bandeja/');
      setNotificaciones([]);
      setTotalCount(0);
      setNextUrl(null);
      setPrevUrl(null);
      setPaginaActual(1);
    } catch (error) {
      console.error("Error al vaciar bandeja", error);
    }
  };

  const handlePaginaSiguiente = () => {
    if (!nextUrl) return;
    setPaginaActual(p => p + 1);
    cargarNotificaciones(nextUrl);
    window.scrollTo(0, 0);
  };

  const handlePaginaAnterior = () => {
    if (!prevUrl) return;
    setPaginaActual(p => p - 1);
    cargarNotificaciones(prevUrl);
    window.scrollTo(0, 0);
  };

  // ── Filtrado ──
  const filtradas = useMemo(() => {
    if (filtro === 'no_leidas') return notificaciones.filter(n => !n.leida);
    if (filtro === 'evaluaciones') return notificaciones.filter(n => n.tipo.includes('evaluacion'));
    if (filtro === 'sistema') return notificaciones.filter(n => n.tipo === 'general' || n.tipo.includes('sence'));
    return notificaciones;
  }, [notificaciones, filtro]);

  const unreadCount = notificaciones.filter(n => !n.leida).length;
  const totalPaginas = Math.ceil(totalCount / POR_PAGINA);

  // ── Sidebar ──
  const sidebarSections = [
  {
    title: 'Gestión Operativa',
    items: [
      { icon: <LayoutDashboard size={20} />, label: 'Panel General',     href: '/admin/dashboard' },
      { icon: <FileSearch      size={20} />, label: 'Revisión Material', href: '/admin/revision' },
      { icon: <BookOpen        size={20} />, label: 'Gestión Cursos',    href: '/admin/cursos' },
      { icon: <Users           size={20} />, label: 'Usuarios y Roles',  href: '/admin/usuarios' },
    ],
  },
  {
    title: 'Análisis y Datos',
    items: [
      { icon: <BarChart3  size={20} />, label: 'Estadísticas Globales', href: '/admin/stats' },
      { icon: <FolderTree size={20} />, label: 'Repositorio Central',   href: '/admin/repositorio' },
      { icon: <FileText   size={20} />, label: 'Reportes SENCE',        href: '/admin/reportes' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { icon: <Globe size={20} />, label: 'Contenido Público', href: '/admin/landing' },
      { icon: <User  size={20} />, label: 'Mi Perfil',         href: '/admin/config' },
    ],
  },
];

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || 'Administrador'}
      userSubtitle={user?.rut}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      onNotificationClick={() => navigate('/admin/notificaciones')}
      headerTitle="Notificaciones"
      headerSubtitle="Centro de actualizaciones y alertas del sistema"
      headerActions={
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs uppercase flex items-center hover:bg-slate-200 transition"
          >
            <Check size={14} className="mr-1.5" /> Marcar leídas
          </button>
          <button
            onClick={handleVaciarBandeja}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs uppercase flex items-center hover:bg-red-100 transition"
          >
            <Trash2 size={14} className="mr-1.5" /> Vaciar bandeja
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <TabBtn active={filtro === 'todas'} label="Todas" onClick={() => setFiltro('todas')} />
          <TabBtn active={filtro === 'no_leidas'} label={`No leídas (${unreadCount})`} onClick={() => setFiltro('no_leidas')} />
          <TabBtn active={filtro === 'evaluaciones'} label="Evaluaciones" onClick={() => setFiltro('evaluaciones')} />
          <TabBtn active={filtro === 'sistema'} label="Sistema" onClick={() => setFiltro('sistema')} />
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-slate-400 font-medium italic">Sincronizando notificaciones...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-20 text-center text-slate-400">No tienes notificaciones en esta categoría.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtradas.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.leida && handleMarkAsRead(n.id)}
                  className={`p-6 transition-all cursor-pointer hover:bg-slate-50 flex items-start gap-4 ${!n.leida ? 'bg-blue-50/40 border-l-4 border-l-jc-blue' : 'opacity-70'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(n.tipo)}`}>
                    {getIcon(n.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-slate-800">{n.titulo}</h3>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {!n.leida && <Badge variant="info">Nueva</Badge>}
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => handleEliminar(n.id, e)}
                          className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar notificación"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{n.mensaje}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(n.created_at).toLocaleDateString()}</span>
                      <span>{n.tipo_display}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer paginación */}
          <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-tighter">
            <p>
              {totalCount > 0
                ? `Página ${paginaActual} de ${totalPaginas} · ${totalCount} notificaciones`
                : 'Sin notificaciones'
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePaginaAnterior}
                disabled={!prevUrl}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handlePaginaSiguiente}
                disabled={!nextUrl}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

// ── Helpers Visuales ──
function getIcon(tipo: string) {
  if (tipo.includes('evaluacion')) return <FileText className="text-blue-600" />;
  if (tipo.includes('diploma')) return <Award className="text-green-600" />;
  if (tipo.includes('aprobado')) return <CheckCircle2 className="text-green-600" />;
  if (tipo.includes('rechazado') || tipo.includes('error')) return <XCircle className="text-red-600" />;
  if (tipo.includes('proximo')) return <Clock className="text-amber-600" />;
  return <Bell className="text-jc-blue" />;
}

function getIconBg(tipo: string) {
  if (tipo.includes('evaluacion')) return 'bg-blue-100';
  if (tipo.includes('diploma') || tipo.includes('aprobado')) return 'bg-green-100';
  if (tipo.includes('rechazado') || tipo.includes('error')) return 'bg-red-100';
  if (tipo.includes('proximo')) return 'bg-amber-100';
  return 'bg-blue-100';
}

function TabBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase transition-all
      ${active ? 'bg-[#064D91] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
    >
      {label}
    </button>
  );
}