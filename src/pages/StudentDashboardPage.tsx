import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseCard } from '@/components/common/CourseCard';
import { AvailableCourseCard } from '@/components/common/AvailableCourseCard';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { useApi } from '@/hooks/useApi';
import { inscripcionService } from '@/api/services/inscripcionService';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleCourseClick = (cursoId: number) => {
  navigate(`/student/courses/${cursoId}`);
};

  // ============================================
  // CONEXIÓN CON BACKEND - DATOS REALES
  // ============================================
  
  const { 
    data: inscripciones, 
    loading: loadingInscripciones, 
    error: errorInscripciones,
    execute: cargarInscripciones 
  } = useApi(() => inscripcionService.getMisInscripciones());

  useEffect(() => {
    cargarInscripciones();
  }, []);

  // ============================================
  // CÁLCULOS BASADOS EN DATOS REALES
  // ============================================
  
  // Filtrar inscripciones activas (en_curso)
  const inscripcionesActivas = inscripciones?.filter(i => i.estado === 'en_curso') || [];
  
  // Calcular progreso general
  const progresoGeneral = inscripciones && inscripciones.length > 0
    ? Math.round(inscripciones.reduce((sum, i) => sum + (i.porcentaje_avance || 0), 0) / inscripciones.length)
    : 0;

  // Curso con más progreso (para hero section)
  const cursoEnProgreso = inscripciones && inscripciones.length > 0
    ? inscripciones.reduce((max, i) => (i.porcentaje_avance || 0) > (max.porcentaje_avance || 0) ? i : max)
    : null;

  // ============================================
  // CONFIGURACIÓN DEL SIDEBAR
  // ============================================

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
          href: '/student/courses',
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

  // ============================================
  // RENDER
  // ============================================

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Usuario'}
      userSubtitle={user?.rut || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Dashboard General"
      headerSubtitle={`Bienvenido de vuelta,${user?.nombre_completo || user?.username || 'Usuario'}`}
      sessionTime="1h 23min"
      notificationCount={2}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* COLUMNA PRINCIPAL (Acción) - 8 de 12 columnas */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* 1. Hero / Continuar Viendo - CON DATOS REALES */}
          {loadingInscripciones ? (
            <div className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
          ) : cursoEnProgreso ? (
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 h-72 flex items-center shadow-xl group">
                  {cursoEnProgreso.curso_data?.imagen_portada && (
                    <img
                      src={cursoEnProgreso.curso_data.imagen_portada}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                      alt="Curso"
                    />
                  )}
                  <div className="relative z-10 p-8 md:p-12 max-w-2xl">
                <Badge variant="calipso" className="mb-4 animate-pulse">
                  En Progreso
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {cursoEnProgreso.curso_data?.nombre}
                </h2>
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex-1 max-w-xs h-2.5 bg-white/20 rounded-full">
                    <div 
                      className="h-full bg-jc-calipso rounded-full shadow-[0_0_10px_rgba(82,169,183,0.5)]"
                      style={{ width: `${cursoEnProgreso.porcentaje_avance}%` }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm">{cursoEnProgreso.porcentaje_avance}% completado</span>
                </div>
                <button className="px-8 py-3 bg-jc-calipso text-white rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition-all transform hover:shadow-lg">
                  Retomar Lección
                </button>
              </div>
            </section>
          ) : (
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 h-72 flex items-center shadow-xl">
              <div className="relative z-10 p-8 md:p-12 text-center w-full">
                <h2 className="text-2xl font-bold text-white mb-4">
                  No tienes cursos en progreso
                </h2>
                <p className="text-white/70 mb-6">
                  Explora el catálogo y comienza tu primera capacitación
                </p>
                <button className="px-8 py-3 bg-jc-calipso text-white rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition-all">
                  Ver Catálogo
                </button>
              </div>
            </section>
          )}

          {/* 2. Cursos Activos - CON DATOS REALES */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <span className="w-2 h-8 bg-jc-blue rounded-full mr-3"></span>
                Capacitaciones Activas
              </h3>
              <Badge variant="info" className="text-slate-600 bg-slate-100">
                {inscripcionesActivas.length} En curso
              </Badge>
            </div>

            {loadingInscripciones ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
                <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
              </div>
            ) : errorInscripciones ? (
              <Alert variant="danger" title="Error al cargar cursos">
                <p className="text-sm">{errorInscripciones.message}</p>
              </Alert>
            ) : inscripcionesActivas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inscripcionesActivas.map((inscripcion) => (
                  <CourseCard
                    key={inscripcion.id}
                    title={inscripcion.curso_data?.nombre || 'Sin título'}
                    image={inscripcion.curso_data?.imagen_portada || ''}
                    senceId={inscripcion.curso_data?.codigo_sence_data?.codigo}
                    duration={`${inscripcion.curso_data?.horas_totales || 0} Horas lectivas`}
                    progress={inscripcion.porcentaje_avance || 0}
                    onClick={() => handleCourseClick(inscripcion.curso)}
                  />
                ))}
              </div>
            ) : (
              <Alert variant="info" title="No tienes cursos activos">
                <p className="text-sm">Explora el catálogo para inscribirte en nuevos cursos</p>
              </Alert>
            )}
          </section>
        </div>

        {/* COLUMNA LATERAL (Información y Status) - 4 de 12 columnas */}
        <aside className="xl:col-span-4 space-y-8">
          
          {/* 3. Hitos y Urgencias */}
          <div className="bg-slate-50 p-4 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Hitos Próximos</h3>
            <div className="space-y-3">
              <Alert variant="warning" title="Examen Crítico" className="border-l-4 shadow-sm">
                <p className="text-xs">Evaluación de Protocolos de Emergencia</p>
                <p className="text-xs font-bold mt-1">Cierra en 3 días</p>
              </Alert>
              <Alert variant="info" title="Documentación" className="border-l-4 shadow-sm">
                <p className="text-xs">Carga Diploma de Manipulación</p>
              </Alert>
            </div>
          </div>

          {/* 4. Logros (Gamificación) */}
          <div className="bg-gradient-to-br from-jc-calipso to-jc-blue rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">
                Progreso General
              </span>
              <p className="font-bold text-3xl mt-3 mb-4">{progresoGeneral}%</p>
              <p className="text-sm text-white/80">
                {inscripciones?.length || 0} cursos en total
              </p>
            </div>
          </div>

          {/* 5. Actividad Reciente */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Bitácora</h3>
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 shadow-sm">
              <div className="p-4 flex items-center hover:bg-slate-50 transition-colors">
                <div className="w-2 h-2 rounded-full mr-4 bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">Test Aprobado</p>
                  <p className="text-[11px] text-slate-500">Módulo 2 - Control de Oxigenación</p>
                </div>
                <span className="text-[10px] text-slate-400">2h</span>
              </div>
              <div className="p-4 flex items-center hover:bg-slate-50 transition-colors">
                <div className="w-2 h-2 rounded-full mr-4 bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">Video Visto</p>
                  <p className="text-[11px] text-slate-500">Introducción a la Sostenibilidad</p>
                </div>
                <span className="text-[10px] text-slate-400">Ayer</span>
              </div>
              <div className="p-4 flex items-center hover:bg-slate-50 transition-colors">
                <div className="w-2 h-2 rounded-full mr-4 bg-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">Recurso Descargado</p>
                  <p className="text-[11px] text-slate-500">Manual de Prevención</p>
                </div>
                <span className="text-[10px] text-slate-400">3d</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 6. SECCIÓN INFERIOR (Exploración) - 12 de 12 columnas */}
        <footer className="xl:col-span-12 pt-8 border-t border-slate-200">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Explora Más Cursos</h3>
              <p className="text-slate-500 mt-1">Potencia tu carrera profesional con estas nuevas capacitaciones</p>
            </div>
            <button className="group flex items-center text-jc-blue font-bold hover:text-jc-calipso transition-colors">
              Ver catálogo completo
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AvailableCourseCard
              title="Gestión de Residuos y Economía Circular en Acuicultura"
              image="https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=500"
              senceId="2847561"
              duration="16 Horas lectivas"
              category="Medio Ambiente"
              isNew={true}
            />
            <AvailableCourseCard
              title="Tecnologías de Monitoreo en Cultivos Marinos"
              image="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500"
              senceId="3958472"
              duration="20 Horas lectivas"
              category="Tecnología"
            />
            <AvailableCourseCard
              title="Nutrición Avanzada en Salmónidos"
              image="https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500"
              senceId="4729183"
              duration="24 Horas lectivas"
              category="Nutrición"
            />
            <AvailableCourseCard
              title="Certificación ISO 14001 para Centros de Cultivo"
              image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500"
              senceId="5618294"
              duration="32 Horas lectivas"
              category="Certificaciones"
              isNew={true}
            />
          </div>
        </footer>

      </div>
    </MainLayout>
  );
}