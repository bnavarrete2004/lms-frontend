import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseCard } from '@/components/common/CourseCard';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Configuración del menú del sidebar para estudiante
  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        {
          href: '/dashboard',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          label: 'Mi Panel',
          isActive: true,
        },
        {
          href: '/courses',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: 'Mis Cursos',
        },
        {
          href: '/diplomas',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Mis Diplomas',
        },
        {
          href: '/progress',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          label: 'Mi Progreso',
        },
        {
          href: '/notifications',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          label: 'Notificaciones',
          badge: 2,
          badgeVariant: 'danger' as const,
          badgeAnimated: true,
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          href: '/profile',
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.username || 'Usuario'}
      userSubtitle={user?.rut || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Dashboard General"
      headerSubtitle={`Bienvenido de vuelta, ${user?.nombre || user?.username}`}
      sessionTime="1h 23min"
      notificationCount={2}
    >
      {/* Banner "Continuar Viendo" */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 mb-10 h-64 flex items-center shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200" 
          className="absolute inset-0 w-full h-full object-cover opacity-40" 
          alt="Curso"
        />
        <div className="relative z-10 p-12 max-w-2xl">
          <Badge variant="calipso" className="mb-4">
            Siguiente Lección: Módulo 4.1
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Gestión de Sostenibilidad y Medio Ambiente en Centros de Cultivo
          </h2>
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase font-semibold tracking-widest">
                Avance Curricular
              </span>
              <span className="text-white font-bold text-lg">65% Completado</span>
            </div>
            <div className="flex-1 max-w-xs h-2 bg-white/20 rounded-full">
              <div className="w-[65%] h-full bg-jc-calipso rounded-full shadow-lg" />
            </div>
          </div>
          <button className="px-8 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-jc-calipso hover:text-white transition-all transform hover:scale-105 shadow-lg">
            Retomar Lección
          </button>
        </div>
      </div>

      {/* Grid de Cursos y Actividad */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Columna Izquierda: Cursos */}
        <div className="xl:col-span-8">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-slate-800">Capacitaciones Activas</h3>
            <a href="#" className="text-jc-blue text-sm font-semibold hover:underline">
              Catálogo completo →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CourseCard
              title="Bioseguridad y Manejo de Patógenos en Especies Salmonídeas"
              image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500"
              senceId="1238912"
              duration="24 Horas lectivas"
              progress={45}
            />
            <CourseCard
              title="Normativa Sanitaria y Calidad Alimentaria (HACCP) en Peces"
              image="https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=500"
              senceId="9918231"
              duration="12 Horas lectivas"
              progress={10}
            />
          </div>
        </div>

        {/* Columna Derecha: Alertas y Actividad */}
        <div className="xl:col-span-4 space-y-6">
          {/* Hitos de Evaluación */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Hitos de Evaluación</h3>
            
            <Alert variant="warning" title="Examen Crítico" className="mb-4">
              Evaluación de Protocolos de Emergencia Acuícola<br />
              <span className="font-semibold">Cierra en 3 días (17 Enero)</span>
            </Alert>

            <Alert variant="info" title="Carga de Documentación">
              Diploma de Manipulación de Alimentos<br />
              <span className="font-semibold">Plazo: 20 Enero</span>
            </Alert>
          </div>

          {/* Bitácora de Aprendizaje */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Bitácora de Aprendizaje</h3>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Test Aprobado</p>
                    <p className="text-xs text-slate-500">Módulo 2 - Control de Oxigenación</p>
                    <p className="text-xs text-jc-calipso mt-1 font-medium">Hace 2 horas</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Contenido Visto</p>
                    <p className="text-xs text-slate-500">Introducción a la Sostenibilidad Oceánica</p>
                    <p className="text-xs text-jc-calipso mt-1 font-medium">Ayer</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Recurso Descargado</p>
                    <p className="text-xs text-slate-500">Manual de Prevención en Balsas Jaula</p>
                    <p className="text-xs text-jc-calipso mt-1 font-medium">Hace 3 días</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Diploma Obtenido */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Diplomas</h3>
            <div className="bg-gradient-to-br from-jc-calipso to-jc-blue rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🏆</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Diploma disponible</span>
                </div>
                <p className="font-bold text-lg mb-1 leading-tight">
                  Fundamentos de Acuicultura y Ciclo del Salmón
                </p>
                <p className="text-xs text-blue-100 mb-5">Validado por J&C Digital Training y SENCE</p>
                <button className="w-full py-2.5 bg-white text-jc-calipso rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-md">
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}