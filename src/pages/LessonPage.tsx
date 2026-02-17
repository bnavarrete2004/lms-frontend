// src/pages/LessonPage.tsx
// Vista de lección individual con flujo secuencial dinámico
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { leccionService, type Leccion } from '@/api/services/leccionService';
import { materialService, type LeccionMaterial } from '@/api/services/materialService';
import { respuestaDiagnosticoService, type RespuestaDiagnostico } from '@/api/services/respuestaDiagnosticoService';

type StepType = 'video' | 'pdf' | 'quiz' | 'completed';

interface Step {
  id: string;
  number: number;
  title: string;
  type: StepType;
  completed: boolean;
  data?: any; // Video URL, PDF URL, Quiz ID, etc.
}

export function LessonPage() {
  const { cursoId, leccionId } = useParams<{ cursoId: string; moduloId: string; leccionId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  // const [materiales, setMateriales] = useState<LeccionMaterial[]>([]); // Para uso futuro
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);

  // Estados para cada tipo de paso
  const [videoWatched, setVideoWatched] = useState(false);
  const [diagnosticAnswer, setDiagnosticAnswer] = useState('');
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState(false);
  const [forumResponses, setForumResponses] = useState<RespuestaDiagnostico[]>([]);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [totalPdfPages] = useState(8);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Timer de sesión SENCE
  // ============================================
  // CONFIGURACIÓN DEL SIDEBAR (igual que StudentDashboard)
  // ============================================
  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        {
          href: '/student/dashboard',
          icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
          label: 'Mi Panel',
        },
        {
          href: '/student/courses',
          icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
          label: 'Mis Cursos',
          isActive: true,
        },
        {
          href: '/student/diplomas',
          icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
          label: 'Mis Diplomas',
        },
        {
          href: '/student/progress',
          icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
          label: 'Mi Progreso',
        },
        {
          href: '/student/notifications',
          icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>),
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
          href: '/student/profile',
          icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
          label: 'Mi Perfil',
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 60000); // Incrementar cada minuto

    return () => clearInterval(timer);
  }, []);

  // Cargar datos de la lección
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!leccionId) return;

      try {
        setLoading(true);

        // 1. Cargar lección
        const leccionData = await leccionService.getById(parseInt(leccionId));
        setLeccion(leccionData);

        // 2. Cargar materiales de la lección
        const materialesData = await materialService.getByLeccion(parseInt(leccionId));
        // setMateriales(materialesData); // Para uso futuro

        // 3. Construir pasos dinámicamente según tipo de lección y materiales
        const constructedSteps = constructSteps(leccionData, materialesData);
        setSteps(constructedSteps);
      } catch (err) {
        console.error('Error al cargar lección:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [leccionId]);

  // Construir pasos dinámicamente
  const constructSteps = (leccion: Leccion, materiales: LeccionMaterial[]): Step[] => {
    const steps: Step[] = [];
    let stepNumber = 1;

    // Paso 0: INTRODUCCIÓN (Siempre primero)
    steps.push({
      id: `intro-${leccion.id}`,
      number: stepNumber++,
      title: 'Introducción',
      type: 'video', // Usamos 'video' como type genérico, pero será un componente de introducción
      completed: false,
      data: { 
        isIntro: true,
        descripcion: leccion.descripcion,
        objetivos: leccion.objetivos,
      },
    });

    // Paso 1: Si la lección es tipo video, agregar paso de video
    if (leccion.tipo === 'teorica' || leccion.tipo === 'mixta') {
      steps.push({
        id: `video-${leccion.id}`,
        number: stepNumber++,
        title: 'Video de la Lección',
        type: 'video',
        completed: false,
        data: { url: 'https://www.youtube.com/embed/xRgeOxlK6Sc' }, // En producción vendría de leccion
      });
    }

    // Paso 2: Diagnóstico/Reflexión inicial (siempre incluir)
    steps.push({
      id: `diagnostic-${leccion.id}`,
      number: stepNumber++,
      title: 'Diagnóstico Inicial',
      type: 'quiz',
      completed: false,
      data: { isDiagnostic: true, leccionId: leccion.id },
    });

    // Paso 3: Materiales (PDFs, documentos)
    materiales.forEach((leccionMaterial) => {
      const material = leccionMaterial.material_data;
      if (!material) return;

      if (material.tipo === 'documento' || material.tipo === 'presentacion') {
        steps.push({
          id: `pdf-${material.id}`,
          number: stepNumber++,
          title: material.nombre,
          type: 'pdf',
          completed: false,
          data: { url: material.archivo_url, material },
        });
      }
    });

    // Paso 4: Quiz final (simulado)
    steps.push({
      id: `quiz-final-${leccion.id}`,
      number: stepNumber++,
      title: 'Quiz de Verificación',
      type: 'quiz',
      completed: false,
      data: { isDiagnostic: false },
    });

    // Paso final: Completado
    steps.push({
      id: 'completed',
      number: stepNumber,
      title: 'Lección Completada',
      type: 'completed',
      completed: false,
    });

    return steps;
  };

  // Formatear tiempo de sesión
  const formatSessionTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // Navegar al siguiente paso
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const currentStep = steps[currentStepIndex];
      currentStep.completed = true;
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  // Navegar al paso anterior
  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  // Marcar video como visto
  const handleMarkVideoComplete = () => {
    setVideoWatched(true);
    alert('✓ Video marcado como visto');
  };

  // Enviar diagnóstico y cargar respuestas de compañeros
  const handleSubmitDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (diagnosticAnswer.length < 50) {
      alert('Por favor, escribe una respuesta más detallada (mínimo 50 caracteres).');
      return;
    }

    try {
      // 1. Intentar enviar respuesta
      //    Si ya existe (400 unique_together), ignorar el error y seguir igual
      try {
        await respuestaDiagnosticoService.crear({
          leccion: parseInt(leccionId!),
          respuesta_texto: diagnosticAnswer,
        });
      } catch (postErr: any) {
        // Cualquier error 400 se ignora — puede ser unique_together u otra validación
        // El flujo continúa igual: mostrar el foro con las respuestas existentes
        if (postErr?.response?.status !== 400) {
          throw postErr; // Solo re-lanzar si es un error grave (500, red, etc.)
        }
      }

      // 2. Cargar todas las respuestas de la lección (incluyendo la propia)
      const respuestas = await respuestaDiagnosticoService.getByLeccion(
        parseInt(leccionId!)
      );

      // 3. Separar mi respuesta de las de compañeros usando el ID del usuario
      const misRespuestas = respuestas.filter(r => r.estudiante === user?.id);
      const respuestasCompañeros = respuestas.filter(r => r.estudiante !== user?.id);

      // Si el usuario aún no tenía respuesta registrada, mostrar la que acaba de escribir
      if (misRespuestas.length === 0) {
        setForumResponses(respuestasCompañeros);
      } else {
        setForumResponses(respuestasCompañeros);
      }

      setDiagnosticSubmitted(true);

    } catch (err: any) {
      console.error('Error al enviar diagnóstico:', err);
      alert('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  // Navegar PDF
  const handleNextPdfPage = () => {
    if (currentPdfPage < totalPdfPages) {
      setCurrentPdfPage(currentPdfPage + 1);
    }
  };

  const handlePrevPdfPage = () => {
    if (currentPdfPage > 1) {
      setCurrentPdfPage(currentPdfPage - 1);
    }
  };

  // Progreso de lectura PDF
  const pdfProgress = Math.round((currentPdfPage / totalPdfPages) * 100);
  const isPdfComplete = currentPdfPage === totalPdfPages;

  // Enviar quiz
  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Respuestas correctas (hardcoded para demo)
    const correctAnswers: Record<string, string> = {
      q1: 'c',
      q2: 'c',
      q3: 'a',
      q4: 'a',
    };

    let score = 0;
    const total = Object.keys(correctAnswers).length;

    Object.keys(correctAnswers).forEach((question) => {
      if (quizAnswers[question] === correctAnswers[question]) {
        score++;
      }
    });

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;

    setQuizResult({ score: percentage, passed });
  };

  if (loading || !leccion) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-jc-blue"></div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progressPercentage = Math.round((currentStepIndex / (steps.length - 1)) * 100);

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : user?.username || 'Usuario'}
      userSubtitle={user?.rut || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle={leccion.nombre}
      headerSubtitle="Curso → Módulo → Lección"
      sessionTime={formatSessionTime(sessionTime)}
      notificationCount={2}
      headerActions={
        /* Progreso de pasos — aparece en el header como indicador visual */
        <div className="flex items-center space-x-2">
          {steps.slice(0, -1).map((step, index) => (
            <div
              key={step.id}
              title={step.title}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : index === currentStepIndex
                  ? 'bg-jc-cyan text-white scale-110'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step.completed ? '✓' : step.number}
            </div>
          ))}
          <span className="ml-2 text-xs font-semibold text-slate-600">{progressPercentage}%</span>
        </div>
      }
    >
      <div>
          {/* RENDERIZAR PASO ACTUAL */}
          {currentStep.type === 'video' && currentStep.data?.isIntro && (
            <IntroStep
              step={currentStep}
              leccion={leccion}
              onNext={goToNextStep}
              onBack={() => navigate(`/student/courses/${cursoId}`)}
            />
          )}

          {currentStep.type === 'video' && !currentStep.data?.isIntro && (
            <VideoStep
              step={currentStep}
              onMarkComplete={handleMarkVideoComplete}
              onNext={goToNextStep}
              onBack={() => navigate(`/student/courses/${cursoId}`)}
              canContinue={videoWatched}
            />
          )}

          {currentStep.type === 'quiz' && currentStep.data?.isDiagnostic && (
            <DiagnosticStep
              step={currentStep}
              answer={diagnosticAnswer}
              setAnswer={setDiagnosticAnswer}
              submitted={diagnosticSubmitted}
              forumResponses={forumResponses}
              user={user}
              onSubmit={handleSubmitDiagnostic}
              onNext={goToNextStep}
              onBack={goToPrevStep}
              canContinue={diagnosticSubmitted}
            />
          )}

          {currentStep.type === 'pdf' && (
            <PdfStep
              step={currentStep}
              currentPage={currentPdfPage}
              totalPages={totalPdfPages}
              progress={pdfProgress}
              onNextPage={handleNextPdfPage}
              onPrevPage={handlePrevPdfPage}
              onNext={goToNextStep}
              onBack={goToPrevStep}
              canContinue={isPdfComplete}
            />
          )}

          {currentStep.type === 'quiz' && !currentStep.data?.isDiagnostic && (
            <QuizStep
              step={currentStep}
              answers={quizAnswers}
              setAnswers={setQuizAnswers}
              result={quizResult}
              onSubmit={handleSubmitQuiz}
              onRetry={() => {
                setQuizAnswers({});
                setQuizResult(null);
              }}
              onComplete={() => goToNextStep()}
            />
          )}

          {currentStep.type === 'completed' && (
            <CompletedStep
              score={quizResult?.score || 0}
              sessionTime={formatSessionTime(sessionTime)}
              onDownload={() => alert('Descargando material...')}
              onNextLesson={() => alert('Siguiente lección...')}
              onBackToCourse={() => navigate(`/student/courses/${cursoId}`)}
            />
          )}
        </div>
    </MainLayout>
  );
}

// ============================================
// COMPONENTES DE PASOS
// ============================================

// Paso de Introducción (SIEMPRE PRIMERO)
function IntroStep({ step, leccion, onNext, onBack }: any) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Paso {step.number}</span>
        <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{step.title}</h2>
        <p className="text-slate-600">Bienvenido a esta lección. Lee atentamente la información antes de continuar.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        {/* Encabezado de la lección */}
        <div className="bg-gradient-to-r from-jc-blue to-jc-cyan p-8 text-white">
          <h1 className="text-2xl font-bold mb-2">{leccion.nombre}</h1>
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {leccion.duracion_minutos} minutos
            </span>
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
              {leccion.tipo === 'video' ? '📹 Video' : leccion.tipo === 'texto' ? '📄 Lectura' : '🎯 Interactivo'}
            </span>
            {leccion.obligatoria && (
              <span className="px-2 py-1 bg-amber-500 rounded-full text-xs font-semibold">
                ⚠️ Obligatoria
              </span>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-jc-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Descripción
            </h3>
            <p className="text-slate-700 leading-relaxed">{leccion.descripcion}</p>
          </div>

          {/* Objetivos de aprendizaje */}
          {leccion.objetivos && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Objetivos de Aprendizaje
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{leccion.objetivos}</p>
            </div>
          )}

          {/* Qué aprenderás */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm font-semibold text-slate-800">Contenido Estructurado</p>
              <p className="text-xs text-slate-600 mt-1">Sigue el flujo paso a paso</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm font-semibold text-slate-800">Evaluación Continua</p>
              <p className="text-xs text-slate-600 mt-1">Verifica tu comprensión</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-2xl mb-2">📚</div>
              <p className="text-sm font-semibold text-slate-800">Material de Apoyo</p>
              <p className="text-xs text-slate-600 mt-1">Recursos descargables</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition">
          ← Volver al curso
        </button>
        <button onClick={onNext} className="px-6 py-3 bg-[#064D91] text-white rounded-lg font-semibold hover:bg-[#265379] transition">
          Comenzar lección →
        </button>
      </div>
    </div>
  );
}

// Paso de Video
function VideoStep({ step, onMarkComplete, onNext, onBack, canContinue }: any) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Paso {step.number} de {step.number}</span>
        <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{step.title}</h2>
        <p className="text-slate-600">Comienza viendo este video introductorio para continuar.</p>
      </div>

      {/* Video Embed */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="aspect-video">
          <iframe width="100%" height="100%" src={step.data.url} title="Video de lección" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                <p className="text-xs text-slate-500">Duración: 8:32 minutos</p>
              </div>
            </div>
            <button onClick={onMarkComplete} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition">
              ✓ Marcar como visto
            </button>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition">
          ← Volver al curso
        </button>
        <button onClick={onNext} disabled={!canContinue} className={`px-6 py-3 bg-[#064D91] text-white rounded-lg font-semibold transition ${!canContinue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#265379]'}`}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// Resto de componentes en el siguiente mensaje...

// Paso de Diagnóstico con Mini-Foro
interface DiagnosticStepProps {
  step: Step;
  answer: string;
  setAnswer: (v: string) => void;
  submitted: boolean;
  forumResponses: RespuestaDiagnostico[];
  user: any;
  onSubmit: (e: React.FormEvent) => void;
  onNext: () => void;
  onBack: () => void;
  canContinue: boolean;
}
function DiagnosticStep({ step, answer, setAnswer, submitted, forumResponses, user, onSubmit, onNext, onBack, canContinue }: DiagnosticStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Paso {step.number}</span>
        <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{step.title}</h2>
        <p className="text-slate-600">Reflexiona sobre lo siguiente. Tu respuesta quedará registrada y podrás ver las respuestas de tus compañeros.</p>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex">
              <svg className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-2">Pregunta de Reflexión</p>
                <p className="text-sm text-amber-800">Basándote en tu experiencia o conocimientos previos: <strong>¿Cuáles crees que son los aspectos más importantes de este tema?</strong> Menciona al menos 2 ejemplos.</p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tu respuesta:</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#52A9B7] focus:border-[#52A9B7] outline-none resize-none" placeholder="Escribe tu respuesta aquí... (mínimo 50 caracteres)" required></textarea>
            <p className="text-xs text-slate-500 mt-2">Esta es una actividad de reflexión. No hay respuestas correctas o incorrectas.</p>

            <button type="submit" className="mt-4 px-6 py-3 bg-[#52A9B7] text-white rounded-lg font-semibold hover:bg-[#3D808A] transition">
              Enviar respuesta
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center py-6">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold text-slate-800">Respuesta enviada correctamente</p>
              <p className="text-sm text-slate-600 mt-2">Tu reflexión ha sido registrada y es visible para tus compañeros</p>
            </div>
          </div>

          {/* MINI-FORO: Respuestas de compañeros */}
          {forumResponses && forumResponses.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#064D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                Respuestas de compañeros
              </h3>

              <div className="space-y-4">
                {/* Tu respuesta primero */}
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-400">
                  <div className="flex items-start space-x-3">
                    <img src={`https://ui-avatars.com/api/?name=${user?.nombre || 'Usuario'}&background=064D91&color=fff`} className="w-10 h-10 rounded-full" alt="User" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800">{user?.nombre || 'Usuario'} (Tú)</p>
                        <span className="text-xs text-slate-500">Ahora</span>
                      </div>
                      <p className="text-sm text-slate-700">{answer}</p>
                    </div>
                  </div>
                </div>

                {/* Respuestas de otros */}
                {forumResponses.map((response) => (
                  <div key={response.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start space-x-3">
                      <img src={`https://ui-avatars.com/api/?name=${response.estudiante_nombre}&background=52A9B7&color=fff`} className="w-10 h-10 rounded-full" alt="User" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-semibold text-slate-800">{response.estudiante_nombre}</p>
                          <span className="text-xs text-slate-500">
                            Hace {response.fecha_envio_relativa ?? response.fecha_envio}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{response.respuesta_texto}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition">
          ← Anterior
        </button>
        <button onClick={onNext} disabled={!canContinue} className={`px-6 py-3 bg-[#064D91] text-white rounded-lg font-semibold transition ${!canContinue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#265379]'}`}>
          Continuar con el contenido →
        </button>
      </div>
    </div>
  );
}

// Paso de PDF
function PdfStep({ step, currentPage, totalPages, progress, onNextPage, onPrevPage, onNext, onBack, canContinue }: any) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Paso {step.number}</span>
        <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{step.title}</h2>
        <p className="text-slate-600">Estudia el material completo. Navega por todas las páginas para continuar.</p>
      </div>

      {/* Visor de PDF */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-[#064D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-slate-800">{step.title}.pdf</p>
              <p className="text-xs text-slate-500">Página {currentPage} de {totalPages}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onPrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50">
              ← Anterior
            </button>
            <button onClick={onNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50">
              Siguiente →
            </button>
          </div>
        </div>

        {/* Contenido del PDF simulado */}
        <div className="bg-white p-10" style={{ minHeight: '600px' }}>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Contenido de la lección - Página {currentPage}</h1>
            <p className="text-slate-700 mb-4 leading-relaxed">
              Este es el contenido educativo de la página {currentPage}. En producción, aquí se renderizaría el PDF completo usando una librería como PDF.js o react-pdf.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <p className="text-sm font-semibold text-blue-900 mb-2">Punto Clave</p>
              <p className="text-sm text-blue-800">Información importante sobre el tema de la lección.</p>
            </div>
            <p className="text-xs text-slate-500 text-center mt-8">[En producción: PDF renderizado aquí]</p>
          </div>
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className={`${canContinue ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border rounded-lg p-4 mb-8`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className={`w-6 h-6 ${canContinue ? 'text-green-600' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.754 18 18.168 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
              <p className={`text-sm font-semibold ${canContinue ? 'text-green-800' : 'text-amber-800'}`}>Progreso de Lectura</p>
              <p className={`text-xs ${canContinue ? 'text-green-700' : 'text-amber-700'}`}>
                {canContinue ? '✓ Lectura completa' : `Página ${currentPage} de ${totalPages} - Sigue leyendo`}
              </p>
            </div>
          </div>
          <span className={`text-2xl font-bold ${canContinue ? 'text-green-600' : 'text-amber-600'}`}>{progress}%</span>
        </div>
        <div className="mt-3">
          <div className={`w-full h-2 ${canContinue ? 'bg-green-200' : 'bg-amber-200'} rounded-full`}>
            <div className={`h-full ${canContinue ? 'bg-green-600' : 'bg-amber-600'} rounded-full transition-all`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition">
          ← Anterior
        </button>
        <button onClick={onNext} disabled={!canContinue} className={`px-6 py-3 bg-[#064D91] text-white rounded-lg font-semibold transition ${!canContinue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#265379]'}`}>
          Continuar con el quiz →
        </button>
      </div>
    </div>
  );
}

// Paso de Quiz
function QuizStep({ step, answers, setAnswers, result, onSubmit, onRetry, onComplete }: any) {
  const questions = [
    {
      id: 'q1',
      text: '¿Cuál es el concepto principal de esta lección?',
      options: [
        { value: 'a', text: 'Opción A' },
        { value: 'b', text: 'Opción B' },
        { value: 'c', text: 'Opción C (Correcta)' },
        { value: 'd', text: 'Opción D' },
      ],
    },
    {
      id: 'q2',
      text: '¿Cuál es la mejor práctica mencionada?',
      options: [
        { value: 'a', text: 'Práctica A' },
        { value: 'b', text: 'Práctica B' },
        { value: 'c', text: 'Práctica C (Correcta)' },
        { value: 'd', text: 'Práctica D' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Paso {step.number}</span>
        <h2 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{step.title}</h2>
        <p className="text-slate-600">Responde las siguientes preguntas. Necesitas al menos 70% para aprobar.</p>
      </div>

      {!result ? (
        <form onSubmit={onSubmit}>
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Pregunta {index + 1} de {questions.length}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{q.text}</h3>
              </div>
              <div className="space-y-3">
                {q.options.map((opt) => (
                  <label key={opt.value} className="flex items-start p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-[#52A9B7] transition">
                    <input type="radio" name={q.id} value={opt.value} checked={answers[q.id] === opt.value} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className="mt-1 mr-3" required />
                    <span className="text-sm text-slate-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button type="submit" className="w-full py-4 bg-[#064D91] text-white rounded-lg text-lg font-bold hover:bg-[#265379] transition">
            Enviar respuestas
          </button>
        </form>
      ) : (
        <div className={`p-8 rounded-xl ${result.passed ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
          <div className="text-center">
            <div className={`w-20 h-20 ${result.passed ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="text-4xl text-white font-bold">{result.score}%</span>
            </div>
            <h3 className={`text-2xl font-bold ${result.passed ? 'text-green-800' : 'text-red-800'} mb-2`}>{result.passed ? '¡Aprobado!' : 'No aprobado'}</h3>
            <p className={`text-sm ${result.passed ? 'text-green-700' : 'text-red-700'} mb-6`}>Calificación: {result.score}%</p>
            {result.passed ? (
              <button onClick={onComplete} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                Finalizar lección →
              </button>
            ) : (
              <button onClick={onRetry} className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                Reintentar quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Paso Completado
function CompletedStep({ score, sessionTime, onDownload, onNextLesson, onBackToCourse }: any) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="bg-white rounded-2xl shadow-xl p-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Lección Completada!</h2>
        <p className="text-lg text-slate-600 mb-8">Has finalizado exitosamente esta lección.</p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Calificación Quiz</p>
            <p className="text-2xl font-bold text-[#064D91]">{score}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Tiempo empleado</p>
            <p className="text-2xl font-bold text-green-600">{sessionTime}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Estado</p>
            <p className="text-2xl font-bold text-purple-600">Aprobado</p>
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={onDownload} className="w-full py-3 bg-[#52A9B7] text-white rounded-lg font-semibold hover:bg-[#3D808A] transition flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar material completo
          </button>

          <button onClick={onNextLesson} className="w-full py-3 bg-[#064D91] text-white rounded-lg font-semibold hover:bg-[#265379] transition">
            Continuar con la siguiente lección →
          </button>

          <button onClick={onBackToCourse} className="w-full py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition">
            Volver al curso
          </button>
        </div>
      </div>
    </div>
  );
}