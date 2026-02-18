// Ubicación: src/pages/admin/AdminCursoDetailPage.tsx
import { useEffect } from 'react'; // Eliminado useState ya que useApi maneja el estado
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { cursoService } from '@/api/services/cursoService'; // Eliminado 'Curso' (tipo)
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ChevronLeft, 
  Pencil, 
  Users, 
  Clock, 
  FileText,
  LayoutDashboard,
  BookOpen as BookIcon // Renombrado para evitar conflicto si fuera necesario
} from 'lucide-react';

export function AdminCursoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // useApi ya nos da el estado 'data' (que es el curso), 'loading' y la función para ejecutar
  const { data: curso, loading, execute: fetchCurso } = useApi(() => cursoService.getById(id!));

  useEffect(() => {
    fetchCurso();
  }, [id]);

  if (loading || !curso) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jc-blue"></div>
      </div>
    );
  }

  // Secciones del sidebar (Copiadas de tu AdminDashboard para consistencia)
  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General', href: '/admin/dashboard' },
        { icon: <BookIcon size={20} />, label: 'Gestión Cursos', href: '/admin/cursos', isActive: true },
      ],
    }
  ];

  return (
    <MainLayout
      role="administrador"
      userName="Admin Sistema"
      sidebarSections={sidebarSections}
      headerTitle="Detalle del Curso"
      headerSubtitle={curso.nombre}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <button 
          onClick={() => navigate('/admin/cursos')}
          className="flex items-center text-slate-500 hover:text-jc-blue transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          <span>Volver a la lista de cursos</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-start">
            <div>
              <Badge variant={curso.estado === 'activo' ? 'success' : 'warning'} className="mb-3">
                {curso.estado.toUpperCase()}
              </Badge>
              <h1 className="text-3xl font-bold text-slate-800">{curso.nombre}</h1>
            </div>
            <Button onClick={() => navigate(`/admin/cursos/${id}/editar`)}>
              <Pencil size={18} className="mr-2" />
              Editar Información
            </Button>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <Users className="text-jc-blue mb-2" size={24} />
              <p className="text-3xl font-bold text-slate-800">{curso.total_inscritos || 0}</p>
              <p className="text-sm text-slate-500">Estudiantes Inscritos</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <Clock className="text-jc-calipso mb-2" size={24} />
              <p className="text-3xl font-bold text-slate-800">{curso.horas_totales}h</p>
              <p className="text-sm text-slate-500">Duración del Programa</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <FileText className="text-jc-cyan mb-2" size={24} />
              <p className="text-lg font-bold text-slate-800 truncate">
                {curso.codigo_sence_data?.codigo || 'Sin Código SENCE'}
              </p>
              <p className="text-sm text-slate-500">Identificador SENCE</p>
            </div>
          </div>

          <div className="p-8 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Descripción del curso</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {curso.descripcion || curso.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}