// src/pages/RelatorNotificationsPage.tsx
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
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  User,
  Check
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
  prioridad: string;
}

type TipoFiltro = 'todas' | 'no_leidas' | 'aprobados' | 'rechazados';

export function RelatorNotificationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<TipoFiltro>('todas');

  // ── Carga de Datos ──
  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notificaciones/');
      setNotificaciones(res.data?.results || res.data || []);
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
      alert('✓ Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error("Error al marcar todas", error);
    }
  };

  // ── Lógica de Filtrado ──
  const filtradas = useMemo(() => {
    if (filtro === 'no_leidas') return notificaciones.filter(n => !n.leida);
    if (filtro === 'aprobados') return notificaciones.filter(n => n.tipo === 'material_aprobado');
    if (filtro === 'rechazados') return notificaciones.filter(n => n.tipo === 'material_rechazado');
    return notificaciones;
  }, [notificaciones, filtro]);

  const counts = {
    total: notificaciones.length,
    unread: notificaciones.filter(n => !n.leida).length,
    approved: notificaciones.filter(n => n.tipo === 'material_aprobado').length,
    rejected: notificaciones.filter(n => n.tipo === 'material_rechazado').length,
  };

  // ── Configuración Sidebar ──
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
        { icon: <Users size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes' },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas', href: '/relator/stats' },
      ],
    },
    {
        title: 'Cuenta',
        items: [
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones', isActive: true, badge: counts.unread || undefined, badgeVariant: 'danger' as const },
          { icon: <User size={20} />, label: 'Mi Perfil', href: '/relator/perfil' },
        ],
    },
  ];

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Centro de Notificaciones"
      headerSubtitle="Mantente al día con las actualizaciones de tu contenido"
      headerActions={
        <button 
            onClick={handleMarkAllRead}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs uppercase flex items-center hover:bg-slate-200 transition"
        >
            <Check size={16} className="mr-2" /> Marcar todas como leídas
        </button>
      }
    >
      <div className="space-y-8">
        
        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SummaryStat label="Total" value={counts.total} />
            <SummaryStat label="No Leídas" value={counts.unread} color="text-blue-600" />
            <SummaryStat label="Aprobaciones" value={counts.approved} color="text-green-600" />
            <SummaryStat label="Rechazos" value={counts.rejected} color="text-red-600" />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
            <TabBtn active={filtro === 'todas'} label={`Todas (${counts.total})`} onClick={() => setFiltro('todas')} />
            <TabBtn active={filtro === 'no_leidas'} label={`No leídas (${counts.unread})`} onClick={() => setFiltro('no_leidas')} />
            <TabBtn active={filtro === 'aprobados'} label={`Aprobaciones (${counts.approved})`} onClick={() => setFiltro('aprobados')} />
            <TabBtn active={filtro === 'rechazados'} label={`Rechazos (${counts.rejected})`} onClick={() => setFiltro('rechazados')} />
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
                <div className="p-20 text-center text-slate-400">Cargando notificaciones...</div>
            ) : filtradas.length === 0 ? (
                <div className="p-20 text-center text-slate-400">No tienes notificaciones en esta categoría.</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {filtradas.map((n) => (
                        <div 
                            key={n.id} 
                            onClick={() => !n.leida && handleMarkAsRead(n.id)}
                            className={`p-6 transition-all cursor-pointer hover:bg-slate-50 flex items-start gap-4 ${!n.leida ? 'bg-blue-50/50 border-l-4 border-l-jc-blue' : 'opacity-70'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(n.tipo)}`}>
                                {getIcon(n.tipo)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-bold text-slate-800">{n.titulo}</h3>
                                    {!n.leida && <Badge variant="info">Nueva</Badge>}
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{n.mensaje}</p>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(n.created_at).toLocaleDateString()}</span>
                                    <span>Prioridad: {n.prioridad}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Paginación */}
            <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-500">
                <p>Mostrando {filtradas.length} notificaciones</p>
                <div className="flex gap-2">
                    <button className="p-1 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
                    <button className="p-1 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>

      </div>
    </MainLayout>
  );
}

// ── Helpers Visuales ──

function getIcon(tipo: string) {
    if (tipo === 'material_aprobado') return <CheckCircle2 className="text-green-600" />;
    if (tipo === 'material_rechazado') return <XCircle className="text-red-600" />;
    return <Bell className="text-blue-600" />;
}

function getIconBg(tipo: string) {
    if (tipo === 'material_aprobado') return 'bg-green-100';
    if (tipo === 'material_rechazado') return 'bg-red-100';
    return 'bg-blue-100';
}

function SummaryStat({ label, value, color = "text-slate-800" }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
        </div>
    );
}

function TabBtn({ active, label, onClick }: any) {
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