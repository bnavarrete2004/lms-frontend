// src/pages/LessonPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { leccionService, type Leccion } from '@/api/services/leccionService';
import { materialService, type LeccionMaterial } from '@/api/services/materialService';
import {
  LayoutDashboard, BookOpen, CheckCircle, ChevronLeft, ChevronRight,
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

function getGoogleDocsViewerUrl(url: string): string {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

// ── Página principal ──────────────────────────────────────────────────────────

export function LessonPage() {
  const { cursoId, leccionId } = useParams<{ cursoId: string; moduloId: string; leccionId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [leccion, setLeccion]                       = useState<Leccion | null>(null);
  const [steps, setSteps]                           = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex]     = useState(0);
  const [loading, setLoading]                       = useState(true);

  const constructSteps = (leccionData: Leccion, materiales: LeccionMaterial[]): Step[] => {
    const newSteps: Step[] = [];
    let n = 1;

    // Intro siempre primero
    newSteps.push({
      id: `intro-${leccionData.id}`,
      number: n++,
      title: 'Introducción',
      type: 'intro',
      completed: false,
      data: { descripcion: leccionData.descripcion, objetivos: leccionData.objetivos },
    });

    // Un paso por material, respetando orden del backend
    materiales.forEach(item => {
      const m = item.material_data;
      if (!m) return;

      switch (m.tipo) {
        case 'video':
          newSteps.push({
            id: `video-${m.id}`, number: n++, title: m.nombre,
            type: 'video', completed: false,
            data: { url: m.archivo_url },
          });
          break;

        case 'pdf':
        case 'documento':
          newSteps.push({
            id: `pdf-${m.id}`, number: n++, title: m.nombre,
            type: 'pdf', completed: false,
            data: { url: m.archivo_url },
          });
          break;

        case 'presentacion':
          newSteps.push({
            id: `pptx-${m.id}`, number: n++, title: m.nombre,
            type: 'presentacion', completed: false,
            data: { url: m.archivo_url },
          });
          break;

        case 'scorm':
          newSteps.push({
            id: `quiz-${m.id}`, number: n++, title: m.nombre,
            type: 'scorm', completed: false,
            data: { preguntas: (m as any).preguntas || [] },
          });
          break;

        default:
          if (m.archivo_url) {
            newSteps.push({
              id: `doc-${m.id}`, number: n++, title: m.nombre,
              type: 'pdf', completed: false,
              data: { url: m.archivo_url },
            });
          }
      }
    });

    // Paso final
    newSteps.push({
      id: 'completed', number: n, title: 'Lección Finalizada',
      type: 'completed', completed: false,
    });

    return newSteps;
  };

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!leccionId) return;
      try {
        setLoading(true);
        const [leccionData, materialesData] = await Promise.all([
          leccionService.getById(parseInt(leccionId)),
          materialService.getByLeccion(parseInt(leccionId)),
        ]);
        setLeccion(leccionData);
        setSteps(constructSteps(leccionData, materialesData));
      } catch (err) {
        console.error('Error al cargar lección:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [leccionId]);

  const goToNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
      window.scrollTo(0, 0);
    }
  };
  const goToPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading || !leccion || steps.length === 0) {
    return <div className="p-20 text-center text-slate-400 italic">Cargando contenido...</div>;
  }

  const currentStep        = steps[currentStepIndex];
  const progressPercentage = Math.round((currentStepIndex / (steps.length - 1)) * 100);

  const sidebarSections = [
    {
      title: 'Contenido',
      items: [
        { href: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Mi Panel' },
        { href: '/student/courses',   icon: <BookOpen size={20} />,        label: 'Mis Cursos', isActive: true },
      ],
    },
  ];

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Usuario'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle={leccion.nombre}
      headerSubtitle="Capacitación en curso"
      headerActions={
        <span className="text-xs font-bold text-jc-blue">{progressPercentage}% completado</span>
      }
    >
      <div className="max-w-5xl mx-auto space-y-4">

        <StepBar steps={steps} currentIndex={currentStepIndex} onGoTo={setCurrentStepIndex} />

        {currentStep.type === 'intro' && (
          <IntroStep leccion={leccion} onNext={goToNext} onBack={() => navigate(`/student/courses/${cursoId}`)} />
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
        {currentStep.type === 'completed' && (
          <CompletedStep onBackToCourse={() => navigate(`/student/courses/${cursoId}`)} />
        )}
      </div>
    </MainLayout>
  );
}

// ── Barra de steps ────────────────────────────────────────────────────────────

function StepBar({ steps, currentIndex, onGoTo }: {
  steps: Step[]; currentIndex: number; onGoTo: (i: number) => void;
}) {
  const iconMap: Record<StepType, React.ReactNode> = {
    intro:        <LayoutDashboard size={12} />,
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
                title={step.title}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activo     ? 'bg-jc-blue text-white shadow-sm' :
                  completado ? 'bg-green-100 text-green-700' :
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
        <button onClick={onBack}
          className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">
          Volver al curso
        </button>
        <button onClick={onNext}
          className="flex-1 px-6 py-3 bg-jc-blue text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition">
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
        {embedUrl ? (
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={step.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
            <Youtube size={48} className="opacity-40" />
            <p className="text-sm opacity-60">URL de video no reconocida</p>
            <a href={step.data.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-sm font-semibold hover:bg-red-700 transition">
              <ExternalLink size={14} /> Abrir en YouTube
            </a>
          </div>
        )}
      </div>
      <NavBar title={step.title} subtitle="Video oficial del curso" onBack={onBack} onNext={onNext} labelNext="Siguiente" />
    </div>
  );
}

// ── PDF ───────────────────────────────────────────────────────────────────────

function PdfStep({ step, onNext, onBack }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            <span className="font-semibold text-slate-700 text-sm">{step.title}</span>
          </div>
          <a href={step.data.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
            <ExternalLink size={12} /> Abrir original
          </a>
        </div>
        <iframe
          src={getGoogleDocsViewerUrl(step.data.url)}
          className="w-full border-0"
          style={{ height: '70vh' }}
          title={step.title}
        />
      </div>
      <NavBar title="" subtitle="" onBack={onBack} onNext={onNext} labelNext="Marcar como leído y continuar" />
    </div>
  );
}

// ── Presentación ──────────────────────────────────────────────────────────────

function PresentacionStep({ step, onNext, onBack }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-amber-50">
          <div className="flex items-center gap-2">
            <Presentation size={16} className="text-amber-600" />
            <span className="font-semibold text-slate-700 text-sm">{step.title}</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Presentación</span>
          </div>
          <a href={step.data.url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
            <ExternalLink size={12} /> Descargar PPTX
          </a>
        </div>
        <iframe
          src={getGoogleDocsViewerUrl(step.data.url)}
          className="w-full border-0"
          style={{ height: '70vh' }}
          title={step.title}
        />
      </div>
      <NavBar title="" subtitle="" onBack={onBack} onNext={onNext} labelNext="Continuar" />
    </div>
  );
}

// ── Quiz / SCORM ──────────────────────────────────────────────────────────────

function QuizStep({ step, onNext, onBack }: any) {
  const preguntas: Pregunta[] = step.data.preguntas || [];
  const [respuestas, setRespuestas]         = useState<Record<number, number>>({});
  const [enviado, setEnviado]               = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);

  if (preguntas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <ClipboardList size={48} className="mx-auto text-slate-200" />
        <p className="text-slate-400 italic">Este quiz no tiene preguntas cargadas aún.</p>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={onBack} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm">Anterior</button>
          <button onClick={onNext} className="px-6 py-2 bg-jc-blue text-white rounded-lg font-semibold text-sm">Continuar</button>
        </div>
      </div>
    );
  }

  const totalCorrectas = preguntas.filter((p, i) => respuestas[i] === p.respuesta_correcta).length;
  const porcentaje     = Math.round((totalCorrectas / preguntas.length) * 100);
  const aprobado       = porcentaje >= 60;

  if (enviado) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 space-y-6">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${aprobado ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className={`text-2xl font-bold ${aprobado ? 'text-green-600' : 'text-red-600'}`}>{porcentaje}%</span>
          </div>
          <h3 className={`text-2xl font-bold ${aprobado ? 'text-green-700' : 'text-red-700'}`}>
            {aprobado ? '¡Aprobado!' : 'Intenta de nuevo'}
          </h3>
          <p className="text-slate-500 mt-1">
            {totalCorrectas} de {preguntas.length} respuestas correctas
          </p>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {preguntas.map((p, idx) => {
            const correcta = respuestas[idx] === p.respuesta_correcta;
            const etiqueta = (oidx: number) => p.tipo === 'verdadero_falso' ? (oidx === 0 ? 'V' : 'F') : ['A','B','C','D'][oidx];
            return (
              <div key={idx} className={`p-4 rounded-xl border-2 ${correcta ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="text-sm font-semibold text-slate-800 mb-1">{idx + 1}. {p.enunciado}</p>
                <p className={`text-xs font-bold ${correcta ? 'text-green-700' : 'text-red-700'}`}>
                  Tu respuesta: {etiqueta(respuestas[idx] ?? -1)}. {p.opciones[respuestas[idx]] ?? '—'}
                  {!correcta && (
                    <span className="text-green-700 ml-2">
                      · Correcta: {etiqueta(p.respuesta_correcta)}. {p.opciones[p.respuesta_correcta]}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          {!aprobado && (
            <button
              onClick={() => { setRespuestas({}); setEnviado(false); setPreguntaActual(0); }}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Reintentar
            </button>
          )}
          <button onClick={onNext}
            className="px-8 py-2 bg-jc-blue text-white rounded-xl font-semibold hover:opacity-90 transition">
            {aprobado ? 'Continuar →' : 'Continuar de todos modos'}
          </button>
        </div>
      </div>
    );
  }

  const p = preguntas[preguntaActual];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-green-600" />
          <span className="font-bold text-slate-700">{step.title}</span>
        </div>
        <span className="text-xs font-bold text-slate-400">{preguntaActual + 1} / {preguntas.length}</span>
      </div>

      <div className="h-1 bg-slate-100">
        <div className="h-1 bg-jc-blue transition-all duration-300"
          style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }} />
      </div>

      <div className="p-8 space-y-6">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <p className="text-base font-semibold text-slate-800 leading-relaxed">{p.enunciado}</p>
        </div>

        <div className="space-y-3">
          {p.opciones.map((opcion, oidx) => {
            const etiqueta    = p.tipo === 'verdadero_falso' ? (oidx === 0 ? 'V' : 'F') : ['A','B','C','D'][oidx];
            const seleccionada = respuestas[preguntaActual] === oidx;
            return (
              <button key={oidx} onClick={() => setRespuestas(prev => ({ ...prev, [preguntaActual]: oidx }))}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  seleccionada ? 'border-jc-blue bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                  seleccionada ? 'bg-jc-blue text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {etiqueta}
                </span>
                <span className={`text-sm font-medium ${seleccionada ? 'text-jc-blue' : 'text-slate-700'}`}>{opcion}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPreguntaActual(i => Math.max(0, i - 1))}
            disabled={preguntaActual === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-slate-200 transition">
            <ChevronLeft size={16} /> Anterior
          </button>

          {preguntaActual < preguntas.length - 1 ? (
            <button onClick={() => setPreguntaActual(i => i + 1)}
              disabled={respuestas[preguntaActual] === undefined}
              className="flex items-center gap-2 px-6 py-2 bg-jc-blue text-white rounded-lg text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition">
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={() => setEnviado(true)}
              disabled={Object.keys(respuestas).length < preguntas.length}
              className="px-8 py-2 bg-green-600 text-white rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-green-700 transition">
              Enviar respuestas ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Completado ────────────────────────────────────────────────────────────────

function CompletedStep({ onBackToCourse }: any) {
  return (
    <div className="text-center p-20 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Lección Finalizada!</h2>
      <p className="text-slate-500 mb-10">Has completado todo el material de esta sección.</p>
      <button onClick={onBackToCourse}
        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
        Volver al Panel del Curso
      </button>
    </div>
  );
}

// ── Barra de navegación inferior ──────────────────────────────────────────────

function NavBar({ title, subtitle, onBack, onNext, labelNext }: {
  title: string; subtitle: string; onBack: () => void; onNext: () => void; labelNext: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex justify-between items-center">
      {title ? (
        <div>
          <p className="font-bold text-slate-800 text-sm">{title}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      ) : <div />}
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition">
          <ChevronLeft size={15} /> Anterior
        </button>
        <button onClick={onNext}
          className="flex items-center gap-2 px-6 py-2 bg-jc-blue text-white rounded-lg font-semibold text-sm hover:opacity-90 transition">
          {labelNext} <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}