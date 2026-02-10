// src/pages/AdminDashboardPage.tsx
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
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/relator/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { 
          icon: <LayoutDashboard size={20} />, 
          label: 'Panel General', 
          href: '/admin/dashboard', 
          isActive: true 
        },
        { 
          icon: <FileSearch size={20} />, 
          label: 'Revisión Material', 
          href: '/admin/revision',
          badge: '5',
          badgeVariant: 'danger' as const,
          badgeAnimated: true
        },
        { 
          icon: <BookOpen size={20} />, 
          label: 'Gestión Cursos', 
          href: '/admin/cursos' 
        },
        { 
          icon: <Users size={20} />, 
          label: 'Usuarios y Roles', 
          href: '/admin/usuarios' 
        },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { 
          icon: <BarChart3 size={20} />, 
          label: 'Estadísticas Globales', 
          href: '/admin/stats' 
        },
        { 
          icon: <FolderTree size={20} />, 
          label: 'Repositorio Central', 
          href: '/admin/repositorio' 
        },
        { 
          icon: <FileText size={20} />, 
          label: 'Reportes SENCE', 
          href: '/admin/reportes' 
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { 
          icon: <Globe size={20} />, 
          label: 'Contenido Público', 
          href: '/admin/landing' 
        },
        { 
          icon: <Settings size={20} />, 
          label: 'Ajustes del Sistema', 
          href: '/admin/config' 
        },
      ],
    },
  ];

  // Datos mock para la tabla (después los reemplazaremos con API)
  const pendingMaterials = [
    {
      id: 1,
      title: 'Video: Control de HACCP',
      module: 'Módulo 3',
      duration: '12:40 min',
      relator: 'Carlos Rojas',
      status: 'warning' as const,
    },
    {
      id: 2,
      title: 'PDF: Normativas ISO 22000',
      module: 'Módulo 1',
      duration: '24 páginas',
      relator: 'Juan Pérez',
      status: 'warning' as const,
    },
    {
      id: 3,
      title: 'Quiz: Evaluación BPM',
      module: 'Módulo 5',
      duration: '15 preguntas',
      relator: 'María González',
      status: 'warning' as const,
    },
  ];

  const recentActivity = [
    {
      icon: <CheckCircle2 className="text-emerald-500" size={20} />,
      title: 'Reporte Mensual',
      description: 'SENCE generado con éxito',
      time: '14 min',
    },
    {
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      title: 'Exámenes Venciendo',
      description: '23 alumnos en riesgo',
      time: '1 hora',
    },
    {
      icon: <UserPlus className="text-blue-500" size={20} />,
      title: 'Nueva Empresa',
      description: 'Salmones del Sur registrada',
      time: '3 horas',
    },
  ];

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre || 'Admin Sistema'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Centro de Administración"
      notificationCount={5}
    >
      <div className="space-y-8">
        
        {/* 1. HERO: SYSTEM HEALTH (Torre de Control) */}
        <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-jc-blue/20 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sistema Online</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Estado del Ecosistema</h2>
              <p className="text-slate-400 max-w-md">
                Hay <span className="text-white font-bold">127 alumnos</span> activos ahora. 
                Se requiere atención en <span className="text-rose-400 font-bold">5 solicitudes</span> de material.
              </p>
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

        {/* 2. STATS GRID (Diseño Minimalista) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Usuarios Activos"
            value="127"
            iconColor="text-jc-blue"
            iconBgColor="bg-blue-50"
            trend={{ value: '+8% vs ayer', isPositive: true }}
          />
          <StatCard
            icon={BookOpen}
            title="Cursos en Curso"
            value="08"
            iconColor="text-jc-calipso"
            iconBgColor="bg-cyan-50"
          />
          <StatCard
            icon={ShieldCheck}
            title="Certificados Emitidos"
            value="1,240"
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            icon={AlertTriangle}
            title="Pendientes Revisión"
            value="05"
            iconColor="text-rose-600"
            iconBgColor="bg-rose-50"
            trend={{ value: 'Acción requerida', isPositive: false }}
          />
        </div>

        {/* 3. MAIN CONTENT: TABLE + ACTIVITY */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* TABLA DE REVISIÓN */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Materiales por Aprobar</h3>
                <button 
                  onClick={() => navigate('/admin/repositorio')}
                  className="text-jc-blue text-sm font-bold hover:underline"
                >
                  Ver repositorio completo
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Contenido</th>
                      <th className="px-6 py-4">Relator</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingMaterials.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                              <FileSearch size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{item.title}</p>
                              <p className="text-xs text-slate-500">{item.module} • {item.duration}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {item.relator.charAt(0)}
                            </div>
                            {item.relator}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={item.status}>Pendiente</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/admin/revision/${item.id}`)}
                            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-jc-blue transition-all"
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SIDEBAR DERECHO: ALERTAS */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="text-jc-calipso" size={20} />
                Actividad Crítica
              </h3>
              <div className="space-y-6">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-4 relative group">
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-[-24px] w-[1px] bg-slate-100" />
                    )}
                    <div className="relative z-10 w-6 h-6 bg-white flex items-center justify-center">
                      {act.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{act.title}</p>
                      <p className="text-xs text-slate-500">{act.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                        {act.time} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/admin/bitacora')}
                className="w-full mt-8 py-3 text-sm font-bold text-slate-400 hover:text-jc-blue border-t border-slate-50 transition-colors"
              >
                Ver bitácora completa
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}