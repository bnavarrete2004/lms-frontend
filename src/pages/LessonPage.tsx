// src/pages/LessonPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { leccionService, type Leccion } from '@/api/services/leccionService';
import { materialService, type LeccionMaterial } from '@/api/services/materialService';

// Importamos los iconos que TypeScript no encontraba
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckCircle} from 'lucide-react';

type StepType = 'video' | 'pdf' | 'completed';

interface Step {
  id: string;
  number: number;
  title: string;
  type: StepType;
  completed: boolean;
  data?: any; 
}

export function LessonPage() {
  const { cursoId, leccionId } = useParams<{ cursoId: string; moduloId: string; leccionId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Lógica Dinámica de Pasos ──
  const constructSteps = (leccionData: Leccion, materiales: LeccionMaterial[]): Step[] => {
    const newSteps: Step[] = [];
    let stepNumber = 1;

    // 1. Paso 1: Introducción
    newSteps.push({
      id: `intro-${leccionData.id}`,
      number: stepNumber++,
      title: 'Introducción a la lección',
      type: 'video', 
      completed: false,
      data: { 
        isIntro: true,
        descripcion: leccionData.descripcion,
        objetivos: leccionData.objetivos,
      },
    });

    // 2. Pasos de Materiales
    materiales.forEach((item) => {
      const material = item.material_data;
      if (!material) return;

      if (material.tipo === 'video') {
        newSteps.push({
          id: `video-${material.id}`,
          number: stepNumber++,
          title: material.nombre,
          type: 'video',
          completed: false,
          data: { url: material.archivo_url, isIntro: false },
        });
      } 
      // Corregimos el error 2367: Usamos "documento" que es el tipo real en el servicio
      else if (material.tipo === 'documento' || material.tipo === 'presentacion') {
        newSteps.push({
          id: `pdf-${material.id}`,
          number: stepNumber++,
          title: material.nombre,
          type: 'pdf',
          completed: false,
          data: { url: material.archivo_url, material },
        });
      }
    });

    // 3. Paso final
    newSteps.push({
      id: 'completed',
      number: stepNumber,
      title: 'Lección Finalizada',
      type: 'completed',
      completed: false,
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
          materialService.getByLeccion(parseInt(leccionId))
        ]);

        setLeccion(leccionData);
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

  const handleLogout = () => { logout(); navigate('/login'); };
  
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading || !leccion || steps.length === 0) {
    return <div className="p-20 text-center">Cargando contenido...</div>;
  }

  const currentStep = steps[currentStepIndex];
  const progressPercentage = Math.round((currentStepIndex / (steps.length - 1)) * 100);

  const sidebarSections = [
    {
      title: 'Contenido',
      items: [
        { href: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Mi Panel' },
        { href: '/student/courses', icon: <BookOpen size={20} />, label: 'Mis Cursos', isActive: true },
      ],
    }
  ];

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Usuario'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle={leccion.nombre}
      headerSubtitle="Capacitación en curso"
      headerActions={
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-jc-blue">{progressPercentage}% completado</span>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto">
          {currentStep.type === 'video' && currentStep.data?.isIntro && (
            <IntroStep leccion={leccion} onNext={goToNextStep} onBack={() => navigate(`/student/courses/${cursoId}`)} />
          )}

          {currentStep.type === 'video' && !currentStep.data?.isIntro && (
            <VideoStep step={currentStep} onNext={goToNextStep} onBack={goToPrevStep} />
          )}

          {currentStep.type === 'pdf' && (
            <PdfStep step={currentStep} onNext={goToNextStep} onBack={goToPrevStep} />
          )}

          {currentStep.type === 'completed' && (
            <CompletedStep onBackToCourse={() => navigate(`/student/courses/${cursoId}`)} />
          )}
      </div>
    </MainLayout>
  );
}

// ── COMPONENTES AUXILIARES ──

function IntroStep({ leccion, onNext, onBack }: any) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{leccion.nombre}</h2>
        <div className="bg-blue-50 border-l-4 border-jc-blue p-4 mb-8">
            <p className="text-sm text-slate-600 italic">"{leccion.descripcion || 'Sin descripción.'}"</p>
        </div>
        <div className="space-y-4 mb-10">
            <h4 className="font-bold text-slate-700">Objetivos de esta lección:</h4>
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{leccion.objetivos || 'Contenido lectivo estándar.'}</p>
        </div>
        <div className="flex gap-4">
            <button onClick={onBack} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Volver al curso</button>
            <button onClick={onNext} className="flex-1 px-6 py-3 bg-jc-blue text-white rounded-xl font-bold shadow-lg">Comenzar ahora →</button>
        </div>
      </div>
    );
}

function VideoStep({ step, onNext, onBack }: any) {
    const videoUrl = step.data.url;
    let embedUrl = videoUrl;
    if (videoUrl.includes('watch?v=')) {
        const id = videoUrl.split('v=')[1];
        embedUrl = `https://www.youtube.com/embed/${id}`;
    }

    return (
        <div className="space-y-6">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                <iframe width="100%" height="100%" src={embedUrl} frameBorder="0" allowFullScreen></iframe>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800">{step.title}</h3>
                    <p className="text-xs text-slate-400">Video oficial del curso</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-5 py-2 text-slate-500 font-bold">Anterior</button>
                    <button onClick={onNext} className="px-8 py-2 bg-jc-blue text-white rounded-lg font-bold">Siguiente Paso</button>
                </div>
            </div>
        </div>
    );
}

function PdfStep({ step, onNext, onBack }: any) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{step.title}</h3>
                <a href={step.data.url} target="_blank" rel="noreferrer" className="text-jc-blue text-sm font-bold underline">Descargar PDF</a>
            </div>
            <div className="bg-slate-200 rounded-2xl h-[600px] flex flex-col items-center justify-center text-slate-500 overflow-hidden">
                <iframe src={step.data.url} className="w-full h-full border-0" />
            </div>
            <div className="flex justify-between">
                <button onClick={onBack} className="px-6 py-2 font-bold text-slate-500">Atrás</button>
                <button onClick={onNext} className="px-10 py-3 bg-jc-blue text-white rounded-xl font-bold">Marcar como leído y continuar</button>
            </div>
        </div>
    );
}

function CompletedStep({ onBackToCourse }: any) {
    return (
        <div className="text-center p-20 bg-white rounded-3xl border border-slate-200 shadow-xl">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Lección Finalizada!</h2>
            <p className="text-slate-500 mb-10">Has completado todo el material de esta sección.</p>
            <button onClick={onBackToCourse} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all">Volver al Panel del Curso</button>
        </div>
    );
}