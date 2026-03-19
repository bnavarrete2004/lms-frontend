// src/pages/LessonPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { leccionService, type Leccion } from '@/api/services/leccionService';
import { progresoLeccionService } from '@/api/services/progresoService';
import { inscripcionService } from '@/api/services/inscripcionService';
import { materialService, type LeccionMaterial } from '@/api/services/materialService';
import {
  CheckCircle, ChevronLeft, ChevronRight,
  ExternalLink, FileText, Presentation, Youtube, ClipboardList,
} from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type StepType = 'intro' | 'video' | 'pdf' | 'presentacion' | 'scorm' | 'completed';

interface Pregunta {
  tipo: 'alternativas' | 'verdadero_falso';
  enunciado: string;
  opciones: string[];
  respuesta_correcta: number;
}

interface Step {
  id: string;
  number: number;
  title: string;
  type: StepType;
  completed: boolean;
  data?: any;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
}

function getProxyUrl(url: string): string {
  return `http://localhost:8000/api/proxy-archivo/?url=${encodeURIComponent(url)}`;
}

// ── Página principal ──────────────────────────────────────────────────────────

export function LessonPage() {
  const { cursoId, leccionId } = useParams<{ cursoId: string; moduloId: string; leccionId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [leccion, setLeccion]                     = useState<Leccion | null>(null);
  const [steps, setSteps]                         = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex]   = useState(0);
  const [loading, setLoading]                     = useState(true);
  const [progresoId, setProgresoId]               = useState<number | null>(null);
  const [siguienteLeccion, setSiguienteLeccion]   = useState<Leccion | null>(null); // ← NUEVO

  // ── Construcción de steps ──────────────────────────────────────────────────
  const constructSteps = (leccionData: Leccion, materiales: LeccionMaterial[]): Step[] => {
    const newSteps: Step[] = [];
    let n = 1;

    newSteps.push({
      id: `intro-${leccionData.id}`, number: n++,
      title: 'Introducción', type: 'intro', completed: false,
      data: { descripcion: leccionData.descripcion, objetivos: leccionData.objetivos },
    });

    materiales.forEach(item => {
      const m = item.material_data;
      if (!m) return;
      switch (m.tipo) {
        case 'video':
          newSteps.push({ id: `video-${m.id}`, number: n++, title: m.nombre, type: 'video', completed: false, data: { url: m.archivo_url } });
          break;
        case 'pdf':
        case 'documento':
          newSteps.push({ id: `pdf-${m.id}`, number: n++, title: m.nombre, type: 'pdf', completed: false, data: { url: m.archivo_url } });
          break;
        case 'presentacion':
          newSteps.push({ id: `pptx-${m.id}`, number: n++, title: m.nombre, type: 'presentacion', completed: false, data: { url: m.archivo_url } });
          break;
        case 'scorm':
          newSteps.push({ id: `quiz-${m.id}`, number: n++, title: m.nombre, type: 'scorm', completed: false, data: { preguntas: (m as any).preguntas || [] } });
          break;
        default:
          if (m.archivo_url) {
            newSteps.push({ id: `doc-${m.id}`, number: n++, title: m.nombre, type: 'pdf', completed: false, data: { url: m.archivo_url } });
          }
      }
    });

    newSteps.push({ id: 'completed', number: n, title: 'Lección Finalizada', type: 'completed', completed: false });
    return newSteps;
  };

  // ── Carga de datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!leccionId) return;
      try {
        setLoading(true);
        const [leccionData, materialesData, inscripciones] = await Promise.all([
          leccionService.getById(parseInt(leccionId)),
          materialService.getByLeccion(parseInt(leccionId)),
          inscripcionService.getMisInscripciones(),
        ]);

        setLeccion(leccionData);
        setSteps(constructSteps(leccionData, materialesData));

        const savedStep = localStorage.getItem(`lesson_progress_${leccionId}`);
        if (savedStep) setCurrentStepIndex(parseInt(savedStep));

        const inscripcionActual = inscripciones.find((ins: any) => ins.curso === parseInt(cursoId ?? '0'));
        if (inscripcionActual) {
          const progresos = await progresoLeccionService.getProgresoInscripcion(inscripcionActual.id);
          const miProgreso = progresos.find((p: any) => p.leccion === parseInt(leccionId));
          if (miProgreso) setProgresoId(miProgreso.id);
        }

        // ── NUEVO: buscar la siguiente lección dentro del mismo módulo ─────────
        try {
          const todasLasLecciones = await leccionService.getByModulo(leccionData.modulo);
          const indexActual = todasLasLecciones.findIndex(
            (l: Leccion) => l.id === parseInt(leccionId)
          );
          if (indexActual !== -1 && indexActual < todasLasLecciones.length - 1) {
            setSiguienteLeccion(todasLasLecciones[indexActual + 1]);
          } else {
            setSiguienteLeccion(null); // era la última lección del módulo
          }
        } catch {
          setSiguienteLeccion(null);
        }
        // ─────────────────────────────────────────────────────────────────────

      } catch (err) {
        console.error('Error al cargar lección:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [leccionId]);

  // ── Navegación entre steps ─────────────────────────────────────────────────
  const goToNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      if (steps[nextIndex].type === 'completed' && progresoId) {
        try {
          await progresoLeccionService.completar(progresoId);
        } catch (error) {
          console.error('Error guardando progreso:', error);
        }
      }
      setCurrentStepIndex(nextIndex);
      localStorage.setItem(`lesson_progress_${leccionId}`, String(nextIndex));
      if (progresoId && steps[nextIndex].type !== 'completed') {
        const porcentajeParcial = Math.round((nextIndex / (steps.length - 1)) * 100);
        progresoLeccionService.parcial(progresoId, porcentajeParcial).catch(() => {});
      }
      window.scrollTo(0, 0);
    }
  };

  const goToPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
      localStorage.setItem(`lesson_progress_${leccionId}`, String(currentStepIndex - 1));
      window.scrollTo(0, 0);
    }
  };

  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { href: '/student/dashboard', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label: 'Mi Panel' },
        { href: '/student/courses', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, label: 'Mis Cursos', isActive: true },
        { href: '/student/diplomas', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Mis Diplomas' },
        { href: '/student/progress', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, label: 'Mi Progreso' },
        { href: '/student/notifications', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, label: 'Notificaciones', badge: 2, badgeVariant: 'danger' as const, badgeAnimated: true },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { href: '/student/profile', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, label: 'Mi Perfil' },
      ],
    },
  ];

  if (loading || !leccion || steps.length === 0) {
    return <div className="p-20 text-center text-slate-400 italic">Cargando contenido...</div>;
  }

  const currentStep        = steps[currentStepIndex];
  const progressPercentage = Math.round((currentStepIndex / (steps.length - 1)) * 100);

  // ── Handler navegación a siguiente lección ─────────────────────────────────
  const handleNextLesson = siguienteLeccion
    ? () => {
        localStorage.removeItem(`lesson_progress_${leccionId}`);
        navigate(
          `/student/courses/${cursoId}/modules/${siguienteLeccion.modulo}/lessons/${siguienteLeccion.id}`
        );
      }
    : null;

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Usuario'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle={leccion.nombre}
      headerSubtitle="Capacitación en curso"
      headerActions={<span className="text-xs font-bold text-jc-blue">{progressPercentage}% completado</span>}
    >
      <div className="max-w-5xl mx-auto space-y-4">
        <StepBar steps={steps} currentIndex={currentStepIndex} onGoTo={setCurrentStepIndex} />

        {currentStep.type === 'intro' && (
          <IntroStep
            leccion={leccion}
            onNext={goToNext}
            onBack={() => navigate(`/student/courses/${cursoId}`)}
          />
        )}
        {currentStep.type === 'video' && (
          <VideoStep step={currentStep} onNext={goToNext} onBack={goToPrev} />
        )}
        {currentStep.type === 'pdf' && (
          <PdfStep step={currentStep} onNext={goToNext} onBack={goToPrev} />
        )}
        {currentStep.type === 'presentacion' && (
          <PresentacionStep step={currentStep} onNext={goToNext} onBack={goToPrev} />
        )}
        {currentStep.type === 'scorm' && (
          <QuizStep step={currentStep} onNext={goToNext} onBack={goToPrev} />
        )}

        {/* ── MODIFICADO: CompletedStep ahora recibe la siguiente lección ── */}
        {currentStep.type === 'completed' && (
          <CompletedStep
            onBackToCourse={() => navigate(`/student/courses/${cursoId}`)}
            onNextLesson={handleNextLesson}
            nombreSiguienteLeccion={siguienteLeccion?.nombre ?? null}
          />
        )}
      </div>
    </MainLayout>
  );
}

// ── Barra de steps ────────────────────────────────────────────────────────────

function StepBar({ steps, currentIndex, onGoTo }: {
  steps: Step[];
  currentIndex: number;
  onGoTo: (i: number) => void;
}) {
  const iconMap: Record<StepType, React.ReactNode> = {
    intro: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>,
    video:        <Youtube size={12} />,
    pdf:          <FileText size={12} />,
    presentacion: <Presentation size={12} />,
    scorm:        <ClipboardList size={12} />,
    completed:    <CheckCircle size={12} />,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 py-4">
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const activo     = idx === currentIndex;
          const completado = idx < currentIndex;
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => onGoTo(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activo     ? 'bg-jc-blue text-white shadow-sm' :
                  completado ? 'bg-green-100 text-green-700'     :
                               'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {iconMap[step.type]}
                <span className="hidden sm:inline max-w-[120px] truncate">{step.title}</span>
                <span className="sm:hidden">{step.number}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`w-4 h-0.5 mx-0.5 flex-shrink-0 ${idx < currentIndex ? 'bg-green-300' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Intro ─────────────────────────────────────────────────────────────────────

function IntroStep({ leccion, onNext, onBack }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">{leccion.nombre}</h2>
      {leccion.descripcion && (
        <div className="bg-blue-50 border-l-4 border-jc-blue p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-slate-600 italic">"{leccion.descripcion}"</p>
        </div>
      )}
      {leccion.objetivos && (
        <div className="space-y-2 mb-10">
          <h4 className="font-bold text-slate-700">Objetivos de esta lección:</h4>
          <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{leccion.objetivos}</p>
        </div>
      )}
      <div className="flex gap-4">
        <button onClick={onBack} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">
          Volver al curso
        </button>
        <button onClick={onNext} className="flex-1 px-6 py-3 bg-jc-blue text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition">
          Comenzar ahora →
        </button>
      </div>
    </div>
  );
}

// ── Video ─────────────────────────────────────────────────────────────────────

function VideoStep({ step, onNext, onBack }: any) {
  const embedUrl = getYoutubeEmbedUrl(step.data.url);
  return (
    <div className="space-y-4">
      <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
        {embedUrl
          ? <iframe className="w-full h-full" src={embedUrl} title={step.title} allowFullScreen />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
              <Youtube size={48} className="opacity-40" />
              <a href={step.data.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-red-600 rounded-lg text-sm font-semibold">
                Abrir en YouTube
              </a>
            </div>
          )
        }
      </div>
      <NavBar title={step.title} subtitle="Video oficial del curso" onBack={onBack} onNext={onNext} labelNext="Siguiente" />
    </div>
  );
}

// ── PDF ───────────────────────────────────────────────────────────────────────

function PdfStep({ step, onNext, onBack }: any) {
  const [numPages, setNumPages]           = useState<number | null>(null);
  const [pageNumber, setPageNumber]       = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);
  const [loadError, setLoadError]         = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setContainerWidth(node.clientWidth - 48);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            <span className="font-semibold text-slate-700 text-sm">{step.title}</span>
          </div>
          <a href={step.data.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
            Descargar PDF
          </a>
        </div>
        <div ref={containerRef} className="px-6 py-4 bg-slate-50 flex flex-col items-center min-h-[70vh]">
          {loadError
            ? <p>Error al cargar PDF</p>
            : (
              <Document
                file={step.data.url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={() => setLoadError(true)}
              >
                <Page pageNumber={pageNumber} width={containerWidth} />
              </Document>
            )
          }
        </div>
        {numPages && numPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-3 border-t border-slate-100">
            <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="px-4 py-2 bg-slate-100 rounded-lg text-sm disabled:opacity-40">
              Anterior
            </button>
            <span className="text-sm font-semibold">Página {pageNumber} de {numPages}</span>
            <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="px-4 py-2 bg-slate-100 rounded-lg text-sm disabled:opacity-40">
              Siguiente
            </button>
          </div>
        )}
      </div>
      <NavBar title="" subtitle="" onBack={onBack} onNext={onNext} labelNext="Marcar como leído y continuar" />
    </div>
  );
}

// ── Presentación ──────────────────────────────────────────────────────────────

function PresentacionStep({ step, onNext, onBack }: any) {
  const [numPages, setNumPages]             = useState<number | null>(null);
  const [slideActual, setSlideActual]       = useState(1);
  const [loadError, setLoadError]           = useState(false);
  const [containerWidth, setContainerWidth] = useState(900);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setContainerWidth(node.clientWidth);
  }, []);

  const slideHeight = Math.round(containerWidth * 9 / 16);

  const irAnterior  = () => setSlideActual(p => Math.max(1, p - 1));
  const irSiguiente = () => setSlideActual(p => Math.min(numPages ?? 1, p + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') irSiguiente();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   irAnterior();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [numPages, slideActual]);

  const esPrimera = slideActual === 1;
  const esUltima  = slideActual === (numPages ?? 1);

  const renderSlide = (pageNo: number, isVisible: boolean) => (
    <div key={`page-${pageNo}`} style={{ display: isVisible ? 'block' : 'none' }}>
      <Page
        pageNumber={pageNo}
        width={containerWidth}
        height={slideHeight}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        loading=""
        className="shadow-md"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Presentation size={18} className="text-jc-blue" />
            <span className="font-bold text-slate-700 text-sm">{step.title}</span>
          </div>
          <div className="flex items-center gap-3">
            {numPages && (
              <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                {slideActual} / {numPages}
              </span>
            )}
            <a href={step.data.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition shadow-sm">
              <ExternalLink size={12} /> Descargar
            </a>
          </div>
        </div>

        <div ref={containerRef} className="relative flex items-center justify-center bg-slate-100/50"
          style={{ height: loadError ? 300 : slideHeight }}>
          <button onClick={irAnterior} disabled={esPrimera}
            className="absolute left-4 z-20 w-11 h-11 rounded-full bg-white shadow-xl text-slate-400 hover:text-jc-blue disabled:opacity-0 transition-all flex items-center justify-center border border-slate-100">
            <ChevronLeft size={24} />
          </button>

          {loadError ? (
            <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
              <Presentation size={48} className="opacity-20" />
              <p className="text-sm italic">No se pudo cargar la presentación.</p>
            </div>
          ) : (
            <Document
              file={getProxyUrl(step.data.url)}
              onLoadSuccess={({ numPages }) => { setNumPages(numPages); setSlideActual(1); }}
              onLoadError={() => setLoadError(true)}
              loading={
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-5 h-5 border-2 border-jc-blue border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Preparando diapositivas...</span>
                </div>
              }
            >
              {numPages && (
                <>
                  {slideActual > 1 && renderSlide(slideActual - 1, false)}
                  {renderSlide(slideActual, true)}
                  {slideActual < numPages && renderSlide(slideActual + 1, false)}
                </>
              )}
            </Document>
          )}

          <button onClick={irSiguiente} disabled={esUltima}
            className="absolute right-4 z-20 w-11 h-11 rounded-full bg-white shadow-xl text-slate-400 hover:text-jc-blue disabled:opacity-0 transition-all flex items-center justify-center border border-slate-100">
            <ChevronRight size={24} />
          </button>
        </div>

        {numPages && (
          <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-jc-blue rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(slideActual / numPages) * 100}%` }} />
            </div>
            <span className="text-[11px] text-slate-400 font-bold tabular-nums">
              {Math.round((slideActual / numPages) * 100)}% COMPLETADO
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-400">
        <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold">←</kbd>
        <span className="text-[10px] font-bold uppercase tracking-wider">Navega con el teclado</span>
        <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold">→</kbd>
      </div>

      <NavBar title="" subtitle="" onBack={onBack} onNext={onNext} labelNext="Continuar con la lección" />
    </div>
  );
}

// ── Quiz / SCORM ──────────────────────────────────────────────────────────────

function QuizStep({ step, onNext }: any) {
  const preguntasRaw = step.data.preguntas;
  const preguntas: Pregunta[] = Array.isArray(preguntasRaw)
    ? preguntasRaw
    : (() => { try { return JSON.parse(preguntasRaw || '[]'); } catch { return []; } })();

  const [respuestas, setRespuestas]         = useState<Record<number, number>>({});
  const [enviado, setEnviado]               = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);

  if (preguntas.length === 0)
    return <div className="text-center p-12 bg-white rounded-2xl">No hay preguntas cargadas.</div>;

  const totalCorrectas = preguntas.filter((p, i) => respuestas[i] === p.respuesta_correcta).length;
  const porcentaje     = Math.round((totalCorrectas / preguntas.length) * 100);
  const aprobado       = porcentaje >= 60;

  if (enviado) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className={`px-8 py-6 text-center ${aprobado ? 'bg-green-50' : 'bg-amber-50'}`}>
          <div className={`text-5xl font-bold mb-1 ${aprobado ? 'text-green-700' : 'text-amber-700'}`}>
            {porcentaje}%
          </div>
          <p className={`text-sm font-semibold ${aprobado ? 'text-green-600' : 'text-amber-600'}`}>
            {totalCorrectas} de {preguntas.length} correctas · {aprobado ? '¡Aprobado! ✓' : 'No aprobado'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {preguntas.map((pregunta, idx) => {
            const respuestaIdx = respuestas[idx];
            const correctaIdx  = pregunta.respuesta_correcta;
            const esCorrecta   = respuestaIdx === correctaIdx;
            const sinResponder = respuestaIdx === undefined;
            const opciones: string[] = Array.isArray(pregunta.opciones) ? pregunta.opciones : [];

            return (
              <div key={idx} className={`rounded-xl border-2 overflow-hidden ${esCorrecta ? 'border-green-200' : 'border-red-200'}`}>
                <div className={`px-4 py-2.5 flex items-center gap-2 text-sm font-semibold ${esCorrecta ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {esCorrecta
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  }
                  Pregunta {idx + 1} · {esCorrecta ? 'Correcta' : sinResponder ? 'Sin responder' : 'Incorrecta'}
                </div>
                <div className="px-4 py-4 bg-white space-y-2">
                  <p className="text-sm font-medium text-slate-800 mb-3">{pregunta.enunciado}</p>
                  {opciones.map((opcion, opIdx) => {
                    const esTuRespuesta = respuestaIdx === opIdx;
                    const esLaCorrecta  = correctaIdx === opIdx;
                    let clases = 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ';
                    if      (esTuRespuesta && esLaCorrecta)  clases += 'bg-green-50 text-green-800 font-medium';
                    else if (esTuRespuesta && !esLaCorrecta) clases += 'bg-red-50 text-red-700 font-medium line-through';
                    else if (!esTuRespuesta && esLaCorrecta) clases += 'bg-green-50 text-green-800 font-medium';
                    else                                      clases += 'text-slate-400';

                    return (
                      <div key={opIdx} className={clases}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          esTuRespuesta && esLaCorrecta  ? 'bg-green-200 text-green-700' :
                          esTuRespuesta && !esLaCorrecta ? 'bg-red-200 text-red-700'     :
                          esLaCorrecta                   ? 'bg-green-200 text-green-700' :
                                                           'bg-slate-100 text-slate-400'
                        }`}>
                          {esTuRespuesta && esLaCorrecta  ? '✓' :
                           esTuRespuesta && !esLaCorrecta ? '✗' :
                           esLaCorrecta                   ? '★' : '·'}
                        </span>
                        <span>{opcion}</span>
                        {esTuRespuesta && esLaCorrecta  && <span className="ml-auto text-[11px] text-green-600 font-semibold">Tu respuesta ✓</span>}
                        {esTuRespuesta && !esLaCorrecta && <span className="ml-auto text-[11px] text-red-500 font-semibold">Tu respuesta</span>}
                        {!esTuRespuesta && esLaCorrecta && <span className="ml-auto text-[11px] text-green-600 font-semibold">Respuesta correcta</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onNext} className="w-full py-3 bg-jc-blue text-white rounded-xl font-bold hover:opacity-90 transition">
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  const p = preguntas[preguntaActual];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b flex justify-between">
        <span className="font-bold">{step.title}</span>
        <span className="text-xs">{preguntaActual + 1} / {preguntas.length}</span>
      </div>
      <div className="p-8 space-y-6">
        <p className="font-semibold text-lg">{p.enunciado}</p>
        <div className="space-y-3">
          {(Array.isArray(p.opciones) ? p.opciones : []).map((op: string, i: number) => (
            <button
              key={i}
              onClick={() => setRespuestas(prev => ({ ...prev, [preguntaActual]: i }))}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                respuestas[preguntaActual] === i ? 'border-jc-blue bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <button onClick={() => setPreguntaActual(i => i - 1)} disabled={preguntaActual === 0} className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-40">
            Anterior
          </button>
          {preguntaActual < preguntas.length - 1 ? (
            <button onClick={() => setPreguntaActual(i => i + 1)} disabled={respuestas[preguntaActual] === undefined} className="px-6 py-2 bg-jc-blue text-white rounded-lg">
              Siguiente
            </button>
          ) : (
            <button onClick={() => setEnviado(true)} disabled={Object.keys(respuestas).length < preguntas.length} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">
              Enviar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Completado ────────────────────────────────────────────────────────────────
// ── MODIFICADO: ahora recibe onNextLesson y nombreSiguienteLeccion ────────────

function CompletedStep({
  onBackToCourse,
  onNextLesson,
  nombreSiguienteLeccion,
}: {
  onBackToCourse: () => void;
  onNextLesson: (() => void) | null;
  nombreSiguienteLeccion: string | null;
}) {
  return (
    <div className="text-center p-20 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Lección Finalizada!</h2>
      <p className="text-slate-500 mb-8">
        {onNextLesson
          ? <>Puedes continuar con la siguiente lección{nombreSiguienteLeccion ? `: "${nombreSiguienteLeccion}"` : ''}.</>
          : 'Has completado todas las lecciones de este módulo. Vuelve al curso para rendir el examen.'
        }
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onBackToCourse}
          className="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition"
        >
          Volver al curso
        </button>
        {onNextLesson && (
          <button
            onClick={onNextLesson}
            className="px-10 py-3 bg-jc-blue text-white rounded-2xl font-bold hover:opacity-90 transition flex items-center gap-2 justify-center"
          >
            Siguiente lección <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Barra de navegación inferior ──────────────────────────────────────────────

function NavBar({
  title, subtitle, onBack, onNext, labelNext,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  onNext: () => void;
  labelNext: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex justify-between items-center">
      {title
        ? <div><p className="font-bold text-slate-800 text-sm">{title}</p>{subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}</div>
        : <div />
      }
      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200">
          <ChevronLeft size={15} /> Anterior
        </button>
        <button onClick={onNext} className="flex items-center gap-2 px-6 py-2 bg-jc-blue text-white rounded-lg font-semibold text-sm hover:opacity-90 transition">
          {labelNext} <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}