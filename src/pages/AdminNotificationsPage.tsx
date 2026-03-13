// src/pages/AdminNotificationsPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Bell, CheckCircle2, XCircle,
  Clock, ChevronLeft, ChevronRight, Check, Trash2, X,
  Award, User, AlertTriangle, Plus,
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

type TipoFiltro = 'todas' | 'no_leidas' | 'intentos_agotados' | 'evaluaciones' | 'sistema';

// ── Helpers para parsear url_accion de intentos agotados ──────────────────────

function parseIntentosParams(url: string): { evaluacion_id: string; estudiante_id: string } | null {
  try {
    const params = new URLSearchParams(url.split('?')[1]);
    const evaluacion_id = params.get('evaluacion');
    const estudiante_id = params.get('estudiante');
    if (evaluacion_id && estudiante_id) return { evaluacion_id, estudiante_id };
  } catch { /* noop */ }
  return null;
}

// ── Componente Principal ──────────────────────────────────────────────────────

export function AdminNotificationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<TipoFiltro>('todas');
  const [otorgando, setOtorgando] = useState<number | null>(null); // notificacion.id en proceso

  // ── Paginación ──
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const POR_PAGINA = 20;

  // ── Carga ──
  const cargarNotificaciones = async (url?: string) => {
    try {
      setLoading(true);
      const res = await api.get(url || '/notificaciones/');
      setNotificaciones(res.data?.results || res.data || []);
      setTotalCount(res.data?.count || 0);
      setNextUrl(res.data?.next ? new URL(res.data.next).pathname + new URL(res.data.next).search : null);
      setPrevUrl(res.data?.previous ? new URL(res.data.previous).pathname + new URL(res.data.previous).search : null);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarNotificaciones(); }, []);

  // ── Handlers ──
  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(`/notificaciones/${id}/marcar_leida/`);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch (error) {
      console.error('Error al marcar como leída', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notificaciones/marcar_todas_leidas/');
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error al marcar todas', error);
    }
  };

  const handleEliminar = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notificaciones/${id}/`);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error al eliminar notificación', error);
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
      console.error('Error al vaciar bandeja', error);
    }
  };

  // ── Otorgar intento adicional ──
  const handleOtorgarIntento = async (notif: Notificacion) => {
    const params = parseIntentosParams(notif.url_accion || '');
    if (!params) return;

    if (!window.confirm(
      `¿Confirmas otorgar un intento adicional a este estudiante?\n\nEsta acción incrementará el límite de intentos en la evaluación.`
    )) return;

    setOtorgando(notif.id);
    try {
      await api.post('/solicitudes-tercer-intento/otorgar_intento/', {
        evaluacion_id: parseInt(params.evaluacion_id),
        estudiante_id: parseInt(params.estudiante_id),
      });

      // Marcar la notificación como leída y actualizar UI
      await api.post(`/notificaciones/${notif.id}/marcar_leida/`);
      setNotificaciones(prev => prev.map(n =>
        n.id === notif.id
          ? { ...n, leida: true, titulo: n.titulo + ' ✓ (intento otorgado)' }
          : n
      ));

      // Mostrar feedback
      alert('✅ Intento otorgado correctamente. El estudiante recibirá una notificación.');
    } catch (error: any) {
      console.error('Error al otorgar intento:', error);
      alert(error?.response?.data?.error || 'Error al otorgar el intento. Intenta nuevamente.');
    } finally {
      setOtorgando(null);
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
    if (filtro === 'intentos_agotados') return notificaciones.filter(n => n.tipo === 'intentos_agotados');
    if (filtro === 'evaluaciones') return notificaciones.filter(n => n.tipo.includes('evaluacion') || n.tipo === 'intento_otorgado');
    if (filtro === 'sistema') return notificaciones.filter(n => n.tipo === 'general' || n.tipo.includes('sence'));
    return notificaciones;
  }, [notificaciones, filtro]);

  const unreadCount = notificaciones.filter(n => !n.leida).length;
  const intentosAgotadosCount = notificaciones.filter(n => n.tipo === 'intentos_agotados' && !n.leida).length;
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

        {/* Banner de intentos agotados pendientes */}
        {intentosAgotadosCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800">
                {intentosAgotadosCount} estudiante{intentosAgotadosCount > 1 ? 's' : ''} agotó{intentosAgotadosCount > 1 ? 'aron' : ''} sus intentos sin aprobar
              </p>
              <p className="text-sm text-amber-600">Revisa las notificaciones marcadas en rojo y decide si otorgas intentos adicionales.</p>
            </div>
            <button
              onClick={() => setFiltro('intentos_agotados')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase hover:bg-amber-600 transition flex-shrink-0"
            >
              Ver solo éstas
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <TabBtn active={filtro === 'todas'}            label="Todas"                                           onClick={() => setFiltro('todas')} />
          <TabBtn active={filtro === 'no_leidas'}        label={`No leídas (${unreadCount})`}                    onClick={() => setFiltro('no_leidas')} />
          <TabBtn active={filtro === 'intentos_agotados'} label={`⚠ Intentos agotados (${intentosAgotadosCount})`} onClick={() => setFiltro('intentos_agotados')} danger />
          <TabBtn active={filtro === 'evaluaciones'}     label="Evaluaciones"                                    onClick={() => setFiltro('evaluaciones')} />
          <TabBtn active={filtro === 'sistema'}          label="Sistema"                                         onClick={() => setFiltro('sistema')} />
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-slate-400 font-medium italic">Sincronizando notificaciones...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-20 text-center text-slate-400">No tienes notificaciones en esta categoría.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtradas.map((n) => {
                const esIntentoAgotado = n.tipo === 'intentos_agotados';
                const params = esIntentoAgotado ? parseIntentosParams(n.url_accion || '') : null;
                const yaOtorgado = n.leida && n.titulo.includes('✓ (intento otorgado)');

                return (
                  <div
                    key={n.id}
                    onClick={() => !n.leida && handleMarkAsRead(n.id)}
                    className={`p-6 transition-all cursor-pointer hover:bg-slate-50 flex items-start gap-4 ${
                      esIntentoAgotado && !n.leida
                        ? 'bg-amber-50/60 border-l-4 border-l-amber-400'
                        : !n.leida
                        ? 'bg-blue-50/40 border-l-4 border-l-jc-blue'
                        : 'opacity-70'
                    }`}
                  >
                    {/* Ícono */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(n.tipo)}`}>
                      {getIcon(n.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <h3 className="font-bold text-slate-800 leading-tight">{n.titulo}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!n.leida && <Badge variant="info">Nueva</Badge>}
                          {esIntentoAgotado && !n.leida && <Badge variant="warning">Acción requerida</Badge>}
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

                      {/* Mensaje — pre-wrap para saltos de línea del backend */}
                      <p className="text-sm text-slate-600 mb-3 whitespace-pre-line leading-relaxed">
                        {n.mensaje}
                      </p>

                      {/* Footer: fecha + tipo + botón si aplica */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {new Date(n.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span>{n.tipo_display || n.tipo}</span>
                        </div>

                        {/* Botón Dar intento — solo para intentos_agotados con params válidos */}
                        {esIntentoAgotado && params && !yaOtorgado && (
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOtorgarIntento(n);
                            }}
                            disabled={otorgando === n.id}
                            className="flex items-center gap-2 px-4 py-2 bg-[#064D91] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#265379] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            {otorgando === n.id ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Otorgando...
                              </>
                            ) : (
                              <>
                                <Plus size={14} /> Dar intento adicional
                              </>
                            )}
                          </button>
                        )}

                        {/* Badge de confirmación si ya fue otorgado */}
                        {esIntentoAgotado && yaOtorgado && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                            <CheckCircle2 size={13} /> Intento otorgado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-tighter">
            <p>
              {totalCount > 0
                ? `Página ${paginaActual} de ${totalPaginas} · ${totalCount} notificaciones`
                : 'Sin notificaciones'
              }
            </p>
            <div className="flex gap-2">
              <button onClick={handlePaginaAnterior} disabled={!prevUrl}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handlePaginaSiguiente} disabled={!nextUrl}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// ── Helpers visuales ──────────────────────────────────────────────────────────

function getIcon(tipo: string) {
  if (tipo === 'intentos_agotados')  return <AlertTriangle className="text-amber-600" size={20} />;
  if (tipo === 'intento_otorgado')   return <Plus          className="text-green-600" size={20} />;
  if (tipo.includes('evaluacion'))   return <FileText      className="text-blue-600"  size={20} />;
  if (tipo.includes('diploma'))      return <Award         className="text-green-600" size={20} />;
  if (tipo.includes('aprobado'))     return <CheckCircle2  className="text-green-600" size={20} />;
  if (tipo.includes('rechazado') || tipo.includes('error')) return <XCircle className="text-red-600" size={20} />;
  if (tipo.includes('proximo'))      return <Clock         className="text-amber-600" size={20} />;
  return <Bell className="text-jc-blue" size={20} />;
}

function getIconBg(tipo: string) {
  if (tipo === 'intentos_agotados')  return 'bg-amber-100';
  if (tipo === 'intento_otorgado')   return 'bg-green-100';
  if (tipo.includes('evaluacion'))   return 'bg-blue-100';
  if (tipo.includes('diploma') || tipo.includes('aprobado')) return 'bg-green-100';
  if (tipo.includes('rechazado') || tipo.includes('error'))  return 'bg-red-100';
  if (tipo.includes('proximo'))      return 'bg-amber-100';
  return 'bg-blue-100';
}

function TabBtn({ active, label, onClick, danger }: {
  active: boolean; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all
      ${active
        ? danger ? 'bg-amber-500 text-white shadow-lg' : 'bg-[#064D91] text-white shadow-lg'
        : danger ? 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'
                 : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}