// src/pages/StudentNotificacionesPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Award,
  FileText,
  Trash2,
  X,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import api from '@/api/axios';

// ── Tipos ──
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

export function StudentNotificacionesPage() {
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

  // ── Lógica de Filtrado ──
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
      title: 'Menú Principal',
      items: [
        {
          href: '/student/dashboard',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          label: 'Mi Panel',
        },
        {
          href: '/student/courses',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: 'Mis Cursos',
        },
        {
          href: '/student/diplomas',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Mis Diplomas',
        },
        {
          href: '/student/progress',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          label: 'Mi Progreso',
        },
        {
          href: '/student/notifications',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          label: 'Notificaciones',
          isActive: true,
          badge: unreadCount || undefined,
          badgeVariant: 'danger' as const,
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          href: '/student/profile',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          label: 'Mi Perfil',
        },
      ],
    },
  ];

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Notificaciones"
      headerSubtitle="Centro de actualizaciones y alertas"
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
  if (tipo.includes('error') || tipo.includes('rechazado')) return <XCircle className="text-red-600" />;
  if (tipo.includes('proximo')) return <Clock className="text-amber-600" />;
  return <Bell className="text-jc-blue" />;
}

function getIconBg(tipo: string) {
  if (tipo.includes('evaluacion')) return 'bg-blue-100';
  if (tipo.includes('diploma')) return 'bg-green-100';
  if (tipo.includes('error')) return 'bg-red-100';
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