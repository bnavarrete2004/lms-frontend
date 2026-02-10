// src/pages/RelatorDashboardPage.tsx
import { 
  Upload, 
  BarChart3, 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Home,
  FolderOpen,
  Bell,
  TrendingUp,
  Users,
  Settings,
  ChevronRight,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/relator/StatCard';
import { ActivityItem } from '@/components/relator/ActivityItem';
import { CourseAssignmentCard } from '@/components/relator/CourseAssignmentCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';

export function RelatorDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sidebar unificado con la estética de la plataforma
  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { 
          icon: <Home size={20} />, 
          label: 'Dashboard', 
          href: '/relator/dashboard',
          isActive: true 
        },
        { 
          icon: <BookOpen size={20} />, 
          label: 'Mis Cursos', 
          href: '/relator/cursos' 
        },
        { 
          icon: <FolderOpen size={20} />, 
          label: 'Repositorio', 
          href: '/relator/materiales',
          badge: '32'
        },
        { 
          icon: <Users size={20} />, 
          label: 'Estudiantes', 
          href: '/relator/estudiantes' 
        },
      ],
    },
    {
      title: 'Herramientas',
      items: [
        { 
          icon: <Upload size={20} />, 
          label: 'Subir Material', 
          href: '/relator/subir-material' 
        },
        { 
          icon: <TrendingUp size={20} />, 
          label: 'Estadísticas', 
          href: '/relator/estadisticas' 
        },
        { 
          icon: <Bell size={20} />, 
          label: 'Notificaciones', 
          href: '/relator/notificaciones',
          badge: '3',
          badgeVariant: 'danger' as const,
          badgeAnimated: true
        },
      ],
    },
  ];

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Panel de Control Docente"
      notificationCount={3}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* 1. Hero Section para Relator */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-jc-blue-dark to-slate-900 h-64 flex items-center shadow-xl group">
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 group-hover:scale-110 transition-transform duration-700">
               <TrendingUp className="w-full h-full text-white p-8" />
            </div>
            <div className="relative z-10 p-8 md:p-12">
              <Badge variant="calipso" className="mb-4">
                Estado del Periodo: Activo
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                ¡Hola, {user?.nombre}!
              </h2>
              <p className="text-slate-300 max-w-md mb-6">
                Tienes 8 materiales pendientes de revisión y 3 cursos activos esta semana.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/relator/subir-material')}
                  className="px-6 py-2.5 bg-jc-calipso text-white rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition-all shadow-lg flex items-center gap-2"
                >
                  <Upload size={18} />
                  Nuevo Material
                </button>
              </div>
            </div>
          </section>

          {/* 2. Métricas Rápidas */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <span className="w-2 h-8 bg-jc-calipso rounded-full mr-3"></span>
                Estado de Materiales
              </h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={FileText}
                title="Total"
                value="32"
                iconColor="text-jc-blue"
                iconBgColor="bg-blue-50"
              />
              <StatCard
                icon={Clock}
                title="Pendientes"
                value="8"
                iconColor="text-amber-600"
                iconBgColor="bg-amber-50"
                trend={{ value: 'Urgente', isPositive: false }}
              />
              <StatCard
                icon={CheckCircle}
                title="Aprobados"
                value="21"
                iconColor="text-emerald-600"
                iconBgColor="bg-emerald-50"
              />
              <StatCard
                icon={XCircle}
                title="Rechazados"
                value="3"
                iconColor="text-rose-600"
                iconBgColor="bg-rose-50"
              />
            </div>
          </section>

          {/* 3. Cursos Asignados */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <span className="w-2 h-8 bg-jc-blue rounded-full mr-3"></span>
                Cursos bajo tu Relatoría
              </h3>
              <button className="text-sm text-jc-blue font-bold hover:underline flex items-center gap-1">
                Ver todos <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CourseAssignmentCard
                title="Normativa HACCP"
                duration="24 horas"
                studentCount={45}
                status="active"
                gradient="bg-gradient-to-br from-jc-blue to-jc-blue-dark"
                onClick={() => console.log('Ver curso HACCP')}
              />
              <CourseAssignmentCard
                title="Buenas Prácticas"
                duration="16 horas"
                studentCount={32}
                status="active"
                gradient="bg-gradient-to-br from-jc-calipso to-jc-cyan"
                onClick={() => console.log('Ver curso Buenas Prácticas')}
              />
              <CourseAssignmentCard
                title="ISO 22000"
                duration="32 horas"
                studentCount={28}
                status="upcoming"
                gradient="bg-gradient-to-br from-slate-700 to-slate-900"
                onClick={() => console.log('Ver curso ISO')}
              />
            </div>
          </section>
        </div>

        {/* COLUMNA LATERAL */}
        <aside className="xl:col-span-4 space-y-8">
          
          {/* Acciones Rápidas */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Acciones de Gestión</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => console.log('Reporte de notas')}
                className="flex items-center p-3 bg-white border border-slate-200 rounded-xl hover:border-jc-calipso hover:shadow-md transition-all group"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-jc-calipso group-hover:text-white transition-colors mr-3">
                  <BarChart3 size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700">Reporte de Notas</p>
                  <p className="text-xs text-slate-500">Descargar Excel de alumnos</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/relator/subir-material')}
                className="flex items-center p-3 bg-white border border-slate-200 rounded-xl hover:border-jc-calipso hover:shadow-md transition-all group"
              >
                <div className="p-2 bg-teal-50 rounded-lg group-hover:bg-jc-calipso group-hover:text-white transition-colors mr-3">
                  <Upload size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700">Subir Material</p>
                  <p className="text-xs text-slate-500">Videos, PDFs y recursos</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/relator/estadisticas')}
                className="flex items-center p-3 bg-white border border-slate-200 rounded-xl hover:border-jc-calipso hover:shadow-md transition-all group"
              >
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-jc-calipso group-hover:text-white transition-colors mr-3">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700">Generar Reporte SENCE</p>
                  <p className="text-xs text-slate-500">Asistencia y certificados</p>
                </div>
              </button>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad del Repositorio</h3>
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
              <ActivityItem
                icon={CheckCircle}
                title="Material aprobado"
                description='Video "Control de Calidad"'
                time="30 min"
                iconBgColor="bg-green-50"
                iconColor="text-green-600"
              />
              <ActivityItem
                icon={XCircle}
                title="Material rechazado"
                description='PDF "Normativas" con error'
                time="2 horas"
                iconBgColor="bg-red-50"
                iconColor="text-red-600"
              />
              <ActivityItem
                icon={AlertCircle}
                title="En post-producción"
                description='Video "Análisis de Peligros"'
                time="Ayer"
                iconBgColor="bg-purple-50"
                iconColor="text-purple-600"
              />
              <ActivityItem
                icon={Info}
                title="Recordatorio"
                description="5 materiales pendientes"
                time="2 días"
                iconBgColor="bg-blue-50"
                iconColor="text-blue-600"
              />
            </div>
            <button className="w-full mt-4 py-2 text-sm text-slate-500 font-medium hover:text-jc-blue transition-colors">
              Ver historial completo
            </button>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}