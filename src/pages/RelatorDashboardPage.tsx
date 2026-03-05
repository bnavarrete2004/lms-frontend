// src/pages/RelatorDashboardPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Upload, Bell, BookOpen,
  TrendingUp, Users, CheckCircle2, Clock, FileText,
  AlertCircle, ChevronRight, PlayCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/relator/StatCard';
import { Badge } from '@/components/ui/Badge';
import api from '@/api/axios';

interface Material {
  id: number;
  nombre: string;
  tipo: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  created_at: string;
}
interface CursoAsignado {
  id: number;
  nombre: string;
  horas_totales: number;
  total_inscritos: number;
  estado: string;
}

export function RelatorDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [cursos, setCursos] = useState<CursoAsignado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatorData = async () => {
      try {
        setLoading(true);
        const [mRes, cRes] = await Promise.all([
          api.get('/materiales/'),
          api.get('/cursos/'),
        ]);
        setMateriales(mRes.data?.results || mRes.data || []);
        setCursos(cRes.data?.results || cRes.data || []);
      } catch (error) {
        console.error('Error cargando datos de relator:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRelatorData();
  }, []);

  const stats = {
    total: materiales.length,
    pendientes: materiales.filter(m => m.estado === 'pendiente').length,
    aprobados: materiales.filter(m => m.estado === 'aprobado').length,
    cursosActivos: cursos.filter(c => c.estado === 'activo').length,
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/relator/dashboard', isActive: true },
        { icon: <FolderOpen size={20} />, label: 'Mis Materiales', href: '/relator/materiales', badge: stats.total || undefined },
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
        {
          icon: <Bell size={20} />,
          label: 'Notificaciones',
          href: '/relator/notificaciones',
        },
        { icon: <Users size={20} />, label: 'Mi Perfil', href: '/relator/perfil' },
      ],
    },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Cargando tu panel docente...</div>;

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      userSubtitle="Instructor Certificado"
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Panel de Control Relator"
      headerSubtitle="Gestiona tu contenido y haz seguimiento a tus alumnos"
      headerActions={
        <button
          onClick={() => navigate('/relator/subir')}
          className="px-6 py-2.5 bg-[#064D91] text-white rounded-lg font-semibold hover:bg-[#265379] transition flex items-center shadow-md"
        >
          <Upload size={18} className="mr-2" /> Subir Material
        </button>
      }
    >
      <div className="space-y-8">

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={FileText}     title="Total Material" value={stats.total}     iconColor="text-blue-600"  iconBgColor="bg-blue-50"  />
          <StatCard icon={Clock}        title="Pendientes"     value={stats.pendientes} iconColor="text-amber-600" iconBgColor="bg-amber-50" />
          <StatCard icon={CheckCircle2} title="Publicados"     value={stats.aprobados}  iconColor="text-green-600" iconBgColor="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Materiales Recientes */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <PlayCircle size={20} className="text-jc-blue" /> Materiales Recientes
              </h3>
              <button onClick={() => navigate('/relator/materiales')} className="text-sm font-bold text-jc-calipso hover:underline">
                Ver todos
              </button>
            </div>
            <div className="space-y-4">
              {materiales.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.tipo === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {m.tipo === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{m.nombre}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">{new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={m.estado === 'aprobado' ? 'success' : m.estado === 'rechazado' ? 'danger' : 'warning'}>
                    {m.estado}
                  </Badge>
                </div>
              ))}
              {materiales.length === 0 && <p className="text-center py-10 text-slate-400 italic">No has subido materiales aún.</p>}
            </div>
          </div>

          {/* Widget derecho: Notificaciones */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Bell size={13} className="text-jc-blue" /> Notificaciones
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <NotificationItem icon={<CheckCircle2 className="text-green-500" />} title="Material Aprobado" desc="Tu video 'Puntos Críticos' ya está en línea." time="30 min" />
                <NotificationItem icon={<AlertCircle className="text-red-500" />} title="Ajustes requeridos" desc="Revisa los comentarios en el PDF de Normativa." time="2 horas" />
                <NotificationItem icon={<Clock className="text-purple-500" />} title="Recordatorio" desc="Tienes una evaluación pendiente de corregir." time="Ayer" />
              </div>
            </div>
          </div>
        </div>

        {/* Mis Cursos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
              <BookOpen size={24} className="text-jc-blue" /> Cursos bajo tu Relatoría
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cursos.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-jc-blue transition-colors">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">{c.nombre}</h4>
                <p className="text-sm text-slate-500 mb-4">{c.horas_totales} Horas • {c.total_inscritos} Alumnos</p>
                <div className="flex items-center justify-between">
                  <Badge variant="success">Activo</Badge>
                  <span className="text-jc-blue font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver curso <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
            {cursos.length === 0 && <p className="text-slate-400 italic col-span-3 text-center py-8">No tienes cursos asignados.</p>}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

// ── Subcomponente ─────────────────────────────────────────────────────────────

function NotificationItem({ icon, title, desc, time }: { icon: React.ReactNode; title: string; desc: string; time: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
        <p className="text-[10px] text-jc-calipso font-bold mt-1 uppercase">{time}</p>
      </div>
    </div>
  );
}