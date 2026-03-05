// src/pages/CourseDetailPage.tsx
// BASADO EN MOCKUP HTML - vista_curso.html
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { cursoService, type Curso } from '@/api/services/cursoService';
import { moduloService, type Modulo } from '@/api/services/moduloService';
import { leccionService, type Leccion } from '@/api/services/leccionService';
import progresoService, { type ProgresoModulo } from '@/api/services/progresoService';
import { inscripcionService, type Inscripcion } from '@/api/services/inscripcionService';
import api from '@/api/axios';

import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  BarChart3, 
  Bell, 
  User,
  Clock // Añadido para el mensaje de espera
} from 'lucide-react';

// Tipos de estado del módulo
type EstadoModulo = 'completado' | 'en_progreso' | 'bloqueado';

// Estado del examen final para las cards de cierre
interface EstadoCierre {
  examenFinalId: number | null;
  examenRendido: boolean;
  encuestaHecha: boolean;
  diplomaUrl: string | null;
}

interface ModuloConEstado extends Modulo {
  estado: EstadoModulo;
  progreso: number;
  totalLecciones: number;
  totalVideos: number;
  totalGuias: number;
  totalEvaluaciones: number;
  examenIntermedioId: number | null;
  lecciones?: Leccion[];
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<ModuloConEstado[]>([]);
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cierre, setCierre] = useState<EstadoCierre>({
    examenFinalId: null,
    examenRendido: false,
    encuestaHecha: false,
    diplomaUrl: null,
  });

  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { href: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Mi Panel' },
        { href: '/student/courses',   icon: <BookOpen size={20} />,        label: 'Mis Cursos', isActive: true },
        { href: '/student/diplomas',  icon: <Award size={20} />,           label: 'Mis Diplomas' },
        { href: '/student/progress',  icon: <BarChart3 size={20} />,       label: 'Mi Progreso' },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        {
          href: '/student/notifications',
          icon: <Bell size={20} />,
          label: 'Notificaciones',
          badge: 2,
          badgeVariant: 'danger' as const,
          badgeAnimated: true,
        },
        { href: '/student/profile', icon: <User size={20} />, label: 'Mi Perfil' },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cargar datos del curso
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // 1. Obtener curso
        const cursoData = await cursoService.getById(parseInt(id));
        setCurso(cursoData);

        // 2. Obtener módulos
        const modulosData = await moduloService.getByCurso(parseInt(id));

        // 3. Obtener inscripción del estudiante para este curso
        const inscripciones = await inscripcionService.filter({ curso: id });
        const inscripcionActual = inscripciones[0];
        setInscripcion(inscripcionActual ?? null);

        // 4. Obtener progresos reales del backend (si hay inscripción)
        let progresos: ProgresoModulo[] = [];
        if (inscripcionActual) {
          progresos = await progresoService.getProgresoInscripcion(inscripcionActual.id);
        }

        // 5. Enriquecer módulos con información de lecciones y progreso REAL
        const evalRes = await api.get('/evaluaciones/', { params: { tipo: 'sumativa' } });
        const todasEvaluaciones = evalRes.data?.results || evalRes.data || [];

        const modulosConEstado = await Promise.all(
          modulosData.map(async (modulo) => {
            try {
              const lecciones = await leccionService.getByModulo(modulo.id);

              const totalLecciones    = lecciones.length;
              const totalVideos       = lecciones.filter(l => l.tipo === 'teorica' || l.tipo === 'mixta').length;
              const totalGuias        = lecciones.filter(l => l.tipo === 'practica').length;
              const evalModulo        = todasEvaluaciones.filter((e: any) => e.modulo === modulo.id);
              const totalEvaluaciones = evalModulo.length;
              const examenIntermedioId = evalModulo[0]?.id ?? null;

              const progresoModulo = progresos.find(p => p.modulo === modulo.id);
              const progreso   = progresoModulo?.porcentaje_avance ?? 0;
              const completado = progresoModulo?.completado ?? false;

              let estado: EstadoModulo;
              if (completado || progreso === 100) {
                estado = 'completado';
              } else if (progreso > 0) {
                estado = 'en_progreso';
              } else {
                const esElPrimero = modulo.orden === 1;
                if (esElPrimero) {
                  estado = 'en_progreso';
                } else {
                  const moduloAnteriorIndex = modulosData.findIndex(m => m.id === modulo.id) - 1;
                  const moduloAnterior      = modulosData[moduloAnteriorIndex];
                  const progresoAnterior    = progresos.find(p => p.modulo === moduloAnterior?.id);
                  estado = progresoAnterior?.completado ? 'en_progreso' : 'bloqueado';
                }
              }

              return {
                ...modulo,
                estado,
                progreso,
                totalLecciones,
                totalVideos,
                totalGuias,
                totalEvaluaciones,
                examenIntermedioId,
                lecciones,
              };
            } catch (err) {
              console.error(`Error al cargar lecciones del módulo ${modulo.id}:`, err);
              return {
                ...modulo,
                estado: 'bloqueado' as EstadoModulo,
                progreso: 0,
                totalLecciones: 0,
                totalVideos: 0,
                totalGuias: 0,
                totalEvaluaciones: 0,
                examenIntermedioId: null,
                lecciones: [],
              };
            }
          })
        );

        setModulos(modulosConEstado);

        // 6. Cargar estado de cierre de curso
        if (inscripcionActual) {
          await cargarEstadoCierre(parseInt(id), inscripcionActual);
        }

      } catch (err: any) {
        console.error('Error al cargar datos del curso:', err);
        setError(err.message || 'Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  // Carga el estado de las cards de cierre: examen final, encuesta, diploma
  const cargarEstadoCierre = useCallback(async (cursoId: number, insc: Inscripcion) => {
    try {
      // Buscar evaluación de tipo 'final' del curso
      const evalRes = await api.get('/evaluaciones/', { params: { curso: cursoId, tipo: 'final' } });
      const evaluaciones = evalRes.data?.results || evalRes.data || [];
      const examenFinal  = evaluaciones[0] ?? null;

      if (!examenFinal) return; // Sin examen final configurado → no mostrar sección de cierre

      // Buscar intentos completados del estudiante en ese examen
      const intentosRes = await api.get('/intentos-evaluacion/', {
        params: { evaluacion: examenFinal.id }
      });
      const intentos: any[] = intentosRes.data?.results || intentosRes.data || [];
      const examenRendido = intentos.some((i: any) => i.estado === 'completado');

      // Encuesta
      const encuestaRes = await api.get('/respuestas-encuesta/', {
        params: { inscripcion: insc.id }
      }).catch(() => ({ data: [] }));
      const respuestasEncuesta = encuestaRes.data?.results || encuestaRes.data || [];
      const encuestaHecha = respuestasEncuesta.length > 0;

      // Diploma
      const diplomaUrl = (insc as any).diploma_url ?? null;

      setCierre({
        examenFinalId: examenFinal.id,
        examenRendido,
        encuestaHecha,
        diplomaUrl,
      });
    } catch (err) {
      console.error('Error al cargar estado de cierre:', err);
    }
  }, []);

  const handleIrAExamen = () => {
    if (cierre.examenFinalId && id) {
      navigate(`/student/courses/${id}/examen/${cierre.examenFinalId}`);
    }
  };

  const handleEncuestaEnviada = async () => {
    if (inscripcion && id) {
      await cargarEstadoCierre(parseInt(id), inscripcion);
    }
  };

  // Clases CSS según el estado del módulo
  const getModuleStateClasses = (estado: EstadoModulo) => {
    switch (estado) {
      case 'completado':
        return {
          cardBg: 'bg-green-50/30',
          iconBg: 'bg-green-500',
          iconColor: 'text-white',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-700',
          progressColor: 'text-green-600',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ),
          label: 'Completado',
        };
      case 'en_progreso':
        return {
          cardBg: 'bg-blue-50/30',
          iconBg: 'bg-[#52A9B7]',
          iconColor: 'text-white',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-700',
          progressColor: 'text-[#52A9B7]',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'En progreso',
        };
      case 'bloqueado':
        return {
          cardBg: '',
          iconBg: 'bg-slate-200',
          iconColor: 'text-slate-400',
          badgeBg: 'bg-slate-100',
          badgeText: 'text-slate-600',
          progressColor: 'text-slate-300',
          icon: (
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
          label: 'Bloqueado',
        };
    }
  };

  if (loading) {
    return (
      <MainLayout
        role="estudiante"
        userName={user?.nombre_completo || user?.username || 'Usuario'}
        userSubtitle={user?.rut || 'Estudiante'}
        sidebarSections={sidebarSections}
        onLogout={handleLogout}
        headerTitle="Cargando curso..."
        headerSubtitle="Por favor espera"
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-jc-blue"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !curso) {
    return (
      <MainLayout
        role="estudiante"
        userName={user?.nombre_completo || user?.username || 'Usuario'}
        userSubtitle={user?.rut || 'Estudiante'}
        sidebarSections={sidebarSections}
        onLogout={handleLogout}
        headerTitle="Error"
        headerSubtitle="No se pudo cargar el curso"
      >
        <Alert variant="danger" title="Error">
          <p>{error || 'Curso no encontrado'}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mt-4 text-sm text-jc-blue hover:underline"
          >
            ← Volver al dashboard
          </button>
        </Alert>
      </MainLayout>
    );
  }

  const progresoGeneral = modulos.length > 0
    ? Math.round(modulos.reduce((acc, m) => acc + m.progreso, 0) / modulos.length)
    : 0;

  const leccionesCompletadas = modulos.reduce((acc, m) =>
    m.estado === 'completado' ? acc + m.totalLecciones : acc, 0
  );
  const leccionesTotales = modulos.reduce((acc, m) => acc + m.totalLecciones, 0);

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Usuario'}
      userSubtitle={user?.rut || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle={curso.nombre}
      headerSubtitle={curso.codigo_sence_data?.codigo ? `Código SENCE: ${curso.codigo_sence_data.codigo}` : ''}
    >
      {/* HERO SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="relative h-64 bg-slate-900">
          {curso.imagen_portada && (
            <img
              src={curso.imagen_portada}
              alt={curso.nombre}
              className="absolute inset-0 w-full h-full object-cover opacity-100"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-center text-white p-8">
              <h1 className="text-4xl font-bold mb-2 drop-shadow-md">{curso.nombre}</h1>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <Badge variant="info" className="bg-black/40 backdrop-blur-md text-white border-white/20">
                  {curso.horas_totales} horas
                </Badge>
                <Badge variant="info" className="bg-black/40 backdrop-blur-md text-white border-white/20">
                  {modulos.length} módulos
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Descripción del Curso</h2>
            <p className="text-slate-600">{curso.descripcion}</p>
          </div>

          {/* Estadísticas del curso */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#064D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Duración</p>
                <p className="text-sm font-bold text-slate-800">{curso.horas_totales} Horas lectivas</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Actividades completadas</p>
                <p className="text-sm font-bold text-slate-800">{leccionesCompletadas} de {leccionesTotales}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha límite</p>
                <p className="text-sm font-bold text-slate-800">
                  {curso.fecha_fin
                    ? new Date(curso.fecha_fin).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Sin fecha límite'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Relator</p>
                <p className="text-sm font-bold text-slate-800">
                  {curso.relatores && curso.relatores.length > 0
                    ? curso.relatores.map(r => r.relator_nombre || r.nombre_completo || 'Relator').join(', ')
                    : 'No asignado'}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Progreso General del Curso</span>
              <span className="text-sm font-bold text-jc-blue">{progresoGeneral}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-jc-blue to-jc-cyan h-full rounded-full transition-all duration-500"
                style={{ width: `${progresoGeneral}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULOS DEL CURSO */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Módulos del curso</h2>

        {modulos.length === 0 ? (
          <Alert variant="info" title="Sin contenido">
            <p>Este curso aún no tiene módulos configurados.</p>
          </Alert>
        ) : (
          modulos.map((modulo) => {
            const stateClasses = getModuleStateClasses(modulo.estado);
            const isBloqueado  = modulo.estado === 'bloqueado';

            return (
              <div
                key={modulo.id}
                className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${isBloqueado ? 'opacity-60' : ''}`}
              >
                <div className={`p-6 ${stateClasses.cardBg}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 ${stateClasses.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {stateClasses.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-800">
                            Módulo {modulo.orden}: {modulo.nombre}
                          </h3>
                          <span className={`px-2 py-1 ${stateClasses.badgeBg} ${stateClasses.badgeText} text-xs font-semibold rounded-full`}>
                            {stateClasses.label}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-3">{modulo.descripcion}</p>

                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          {modulo.totalVideos > 0 && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {modulo.totalVideos} {modulo.totalVideos === 1 ? 'video' : 'videos'}
                            </span>
                          )}
                          {modulo.totalGuias > 0 && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {modulo.totalGuias} {modulo.totalGuias === 1 ? 'guía' : 'guías'}
                            </span>
                          )}
                          {modulo.totalEvaluaciones > 0 && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {modulo.totalEvaluaciones} {modulo.totalEvaluaciones === 1 ? 'evaluación' : 'evaluaciones'}
                            </span>
                          )}
                        </div>

                        {modulo.examenIntermedioId && modulo.estado === 'completado' && (
                          <button
                            onClick={() => navigate(`/student/courses/${id}/examen/${modulo.examenIntermedioId}`)}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Rendir Examen Intermedio
                          </button>
                        )}

                        {isBloqueado && (
                          <p className="text-xs text-amber-600 mt-3 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Completa el Módulo {modulo.orden - 1} para desbloquear
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-bold ${stateClasses.progressColor}`}>
                        {modulo.progreso}%
                      </div>
                      <p className="text-xs text-slate-500">{modulo.horas_estimadas}h estimadas</p>

                      {!isBloqueado && (
                        <button
                          onClick={() => {
                            if (modulo.lecciones && modulo.lecciones.length > 0) {
                              const primeraLeccion = modulo.lecciones[0];
                              navigate(`/student/courses/${id}/modules/${modulo.id}/lessons/${primeraLeccion.id}`);
                            }
                          }}
                          className="mt-3 px-4 py-2 bg-jc-blue hover:bg-jc-blue/90 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {modulo.estado === 'completado' ? 'Revisar' : 'Continuar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SECCIÓN DE CIERRE DE CURSO — visible cuando todos los módulos están al 100% y hay examen final */}
      {progresoGeneral === 100 && cierre.examenFinalId && (
        <div className="mt-12 space-y-5 border-t-2 border-dashed border-slate-200 pt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Certificación Final</h2>
            <p className="text-sm text-slate-500 mt-1">
              Has completado todos los módulos. Sigue los pasos para obtener tu diploma.
            </p>
          </div>

          {/* ── Card 1: Examen Final ── */}
          <div className={`bg-white rounded-xl border-2 transition-all shadow-sm ${
            !cierre.examenRendido ? 'border-[#064D91]' : 'border-slate-200'
          }`}>
            <div className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  cierre.examenRendido ? 'bg-green-500 text-white' : 'bg-[#064D91] text-white'
                }`}>
                  {cierre.examenRendido ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : '1'}
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#064D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Examen Final de Competencias</h3>
                  <p className="text-sm text-slate-500">Evaluación obligatoria para certificación SENCE</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {!cierre.examenRendido ? (
                  <Button onClick={handleIrAExamen}>Rendir Examen</Button>
                ) : (
                  <Badge variant="success">Completado ✓</Badge>
                )}
              </div>
            </div>
          </div>

          {/* ── Card 2: Encuesta de Satisfacción — visible apenas el examen esté rendido ── */}
          {cierre.examenRendido && (
            <div className={`bg-white rounded-xl border-2 transition-all shadow-sm ${
              !cierre.encuestaHecha ? 'border-[#52A9B7]' : 'border-slate-200'
            }`}>
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    cierre.encuestaHecha ? 'bg-green-500 text-white' : 'bg-[#52A9B7] text-white'
                  }`}>
                    {cierre.encuestaHecha ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : '2'}
                  </div>
                  <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#52A9B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Encuesta de Satisfacción</h3>
                    <p className="text-sm text-slate-500">Tu opinión es fundamental para nuestra mejora continua</p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {!cierre.encuestaHecha ? (
                    <ModalEncuesta
                      inscripcionId={inscripcion!.id}
                      onEnviada={handleEncuestaEnviada}
                    />
                  ) : (
                    <Badge variant="success">Completada ✓</Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Card 3: Diploma o Mensaje de Espera ── */}
          {cierre.encuestaHecha && (
            <>
              {/* CASO A: APROBADO -> Mostrar Diploma */}
              {inscripcion?.estado === 'aprobado' ? (
                <div className="bg-gradient-to-r from-[#064D91] via-[#088395] to-[#06B6D4] rounded-xl p-8 text-white shadow-xl animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">3</div>
                        <span className="text-white/70 text-sm font-semibold uppercase tracking-wider">Certificación oficial</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-1">
                        ¡Felicitaciones, {user?.nombre_completo || user?.username}!
                      </h3>
                      <p className="text-white/80">
                        Has cumplido todos los requisitos. Tu diploma está listo para descargar.
                      </p>
                    </div>

                    {cierre.diplomaUrl && (
                      <a
                        href={cierre.diplomaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-2 bg-white text-[#064D91] font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-base shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar Diploma
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                /* CASO B: COMPLETADO (pero no aprobado) -> Mostrar mensaje de espera */
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 shadow-sm flex items-start gap-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-1">
                      Procesando aprobación final
                    </h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Has completado todas las lecciones y la encuesta. El sistema está validando tus notas del examen final y asistencias para generar tu certificado oficial.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      Estado actual: Pendiente de validación
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Botón para volver */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="px-6 py-3 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </button>
      </div>
    </MainLayout>
  );
}

// ── Componente ModalEncuesta ──────────────────────────────────────────────────

interface ModalEncuestaProps {
  inscripcionId: number;
  onEnviada: () => void;
}

function ModalEncuesta({ inscripcionId, onEnviada }: ModalEncuestaProps) {
  const [abierto, setAbierto]     = useState(false);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando]   = useState(false);

  const preguntas = [
    '¿Cómo calificarías el contenido del curso?',
    '¿Cómo calificarías la metodología del relator?',
    '¿Recomendarías este curso a un colega?',
  ];
  const [respuestas, setRespuestas] = useState<number[]>([0, 0, 0]);

  const handleEnviar = async () => {
    if (respuestas.some(r => r === 0)) {
      alert('Por favor responde todas las preguntas antes de enviar.');
      return;
    }
    try {
      setEnviando(true);
      const encuestaRes = await api.get('/encuestas/', { params: { activa: true } });
      const encuestas   = encuestaRes.data?.results || encuestaRes.data || [];
      const encuesta    = encuestas.find((e: any) => e.tipo === 'satisfaccion_curso') || encuestas[0];
      if (!encuesta) throw new Error('No hay encuesta activa configurada');

      const respuestasJson: Record<string, number | string> = {};
      preguntas.forEach((_, idx) => { respuestasJson[String(idx + 1)] = respuestas[idx]; });
      if (comentario.trim()) respuestasJson['comentario'] = comentario;

      await api.post('/respuestas-encuesta/', {
        encuesta:    encuesta.id,
        inscripcion: inscripcionId,
        respuestas:  respuestasJson,
      });

      // Intentar generar diploma automáticamente
      try {
        await api.post('/diplomas/generar/', { inscripcion_id: inscripcionId });
      } catch (diplomaErr) {
        console.log('Diploma no generado aún (puede requerir condiciones adicionales):', diplomaErr);
      }

      setAbierto(false);
      onEnviada();
    } catch (err) {
      console.error('Error al enviar encuesta:', err);
      setAbierto(false);
      onEnviada();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        Responder Encuesta
      </Button>

      {abierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Encuesta de Satisfacción</h3>
                <p className="text-sm text-slate-500">Solo tomará 2 minutos</p>
              </div>
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {preguntas.map((pregunta, idx) => (
                <div key={idx}>
                  <p className="text-sm font-semibold text-slate-700 mb-3">{pregunta}</p>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          const nuevas = [...respuestas];
                          nuevas[idx]  = val;
                          setRespuestas(nuevas);
                        }}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                          respuestas[idx] === val
                            ? 'bg-[#064D91] text-white shadow-md scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    {respuestas[idx] > 0 && (
                      <span className="text-xs text-slate-400 ml-1">
                        {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][respuestas[idx]]}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Comentarios adicionales (opcional)</p>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="¿Qué mejorarías del curso?"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#064D91] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => setAbierto(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <Button onClick={handleEnviar} isLoading={enviando} className="flex-1">
                Enviar Encuesta
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}