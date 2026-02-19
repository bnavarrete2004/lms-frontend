// src/pages/RelatorCursosPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, 
  FolderOpen, 
  Upload, 
  Bell, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Clock, 
  FileText, 
  Calendar, 
  Tag, 
  Star, 
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CursoExtendido {
  id: number;
  nombre: string;
  descripcion: string;
  horas_totales: number;
  fecha_inicio: string;
  fecha_fin: string;
  codigo_sence_curso: string;
  estado: 'activo' | 'borrador' | 'inactivo' | 'archivado';
  total_inscritos: number;
  total_materiales?: number;
  progreso_promedio?: number;
  nota_promedio?: number;
}

type TabFiltro = 'todos' | 'activo' | 'proximamente' | 'completado';

export function RelatorCursosPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [cursos, setCursos] = useState<CursoExtendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFiltro>('todos');

  // ── Carga de Datos ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/cursos/');
        const data = res.data?.results || res.data || [];
        
        // Enriquecimiento de datos simulado
        const dataEnriquecida = data.map((c: any) => ({
          ...c,
          total_materiales: Math.floor(Math.random() * 20) + 5,
          progreso_promedio: Math.floor(Math.random() * 40) + 50,
          nota_promedio: parseFloat((Math.random() * 2 + 5).toFixed(1))
        }));

        setCursos(dataEnriquecida);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  // ── Lógica de Filtrado ──────────────────────────────────────────────────────
  const cursosFiltrados = useMemo(() => {
    if (activeTab === 'todos') return cursos;
    if (activeTab === 'proximamente') return cursos.filter(c => new Date(c.fecha_inicio) > new Date());
    if (activeTab === 'completado') return cursos.filter(c => c.estado === 'archivado');
    return cursos.filter(c => c.estado === 'activo');
  }, [cursos, activeTab]);

  const stats = {
    total: cursos.length,
    estudiantes: cursos.reduce((acc, c) => acc + (c.total_inscritos || 0), 0),
    materiales: cursos.reduce((acc, c) => acc + (c.total_materiales || 0), 0),
    notaGral: (cursos.reduce((acc, c) => acc + (c.nota_promedio || 0), 0) / (cursos.length || 1)).toFixed(1)
  };

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/relator/dashboard' },
        { icon: <FolderOpen size={20} />, label: 'Mis Materiales', href: '/relator/materiales' },
        { icon: <Upload size={20} />, label: 'Subir Material', href: '/relator/subir' },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { icon: <BookOpen size={20} />, label: 'Mis Cursos', href: '/relator/cursos', isActive: true },
        { icon: <Users size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes' },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas', href: '/relator/stats' },
      ],
    },
    {
        title: 'Cuenta',
        items: [
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones', badge: '3', badgeVariant: 'danger' as const },
          { icon: <Users size={20} />, label: 'Mi Perfil', href: '/relator/perfil' },
        ],
    },
  ];

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Mis Cursos Asignados"
      headerSubtitle="Gestión de programas académicos"
    >
      <div className="space-y-8">
        
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <CourseStat icon={<BookOpen className="text-blue-600" />} value={stats.total} label="Cursos" color="bg-blue-50" />
          <CourseStat icon={<Users className="text-green-600" />} value={stats.estudiantes} label="Estudiantes" color="bg-green-50" />
          <CourseStat icon={<FileText className="text-purple-600" />} value={stats.materiales} label="Materiales" color="bg-purple-50" />
          <CourseStat icon={<Star className="text-amber-600" />} value={stats.notaGral} label="Promedio" color="bg-amber-50" />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
            <TabButton active={activeTab === 'todos'} label={`Todos (${stats.total})`} onClick={() => setActiveTab('todos')} />
            <TabButton active={activeTab === 'activo'} label="Activos" onClick={() => setActiveTab('activo')} />
            <TabButton active={activeTab === 'proximamente'} label="Próximamente" onClick={() => setActiveTab('proximamente')} />
            <TabButton active={activeTab === 'completado'} label="Completados" onClick={() => setActiveTab('completado')} />
        </div>

        {/* Listado de Cursos */}
        <div className="grid grid-cols-1 gap-6">
            {loading ? (
                <div className="p-10 text-center text-slate-400 italic">Cargando...</div>
            ) : cursosFiltrados.map((curso) => (
                <div key={curso.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            <div className="flex items-start gap-5">
                                <div className="w-16 h-16 bg-[#064D91] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                    <Award className="text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{curso.nombre}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 max-w-2xl">{curso.descripcion}</p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> {curso.horas_totales}h</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(curso.fecha_inicio).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><Tag size={14} /> {curso.codigo_sence_curso}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge variant={curso.estado === 'activo' ? 'success' : 'info'}>
                                {curso.estado.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <CourseSubStat value={curso.total_inscritos || 0} label="Alumnos" />
                            <CourseSubStat value={curso.total_materiales || 0} label="Materiales" />
                            <CourseSubStat value={`${curso.progreso_promedio}%`} label="Progreso" />
                            <CourseSubStat value={curso.nota_promedio || 0} label="Nota Prom." />
                        </div>

                        <div className="flex items-center gap-3 mt-8">
                            <button className="flex-1 py-3 bg-[#064D91] text-white rounded-xl font-bold text-sm hover:bg-blue-900 transition-colors shadow-md">
                                Gestionar Contenido
                            </button>
                            <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                                Estudiantes
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Página 1 de 1</p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled><ChevronLeft size={16} /></Button>
                <Button variant="outline" size="sm" disabled><ChevronRight size={16} /></Button>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}

function CourseStat({ icon, value, label, color }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
            <div>
                <p className="text-2xl font-black text-slate-800">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

function TabButton({ active, label, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all
            ${active ? 'bg-[#064D91] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
        >
            {label}
        </button>
    );
}

function CourseSubStat({ value, label }: any) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
            <p className="text-xl font-black text-slate-700">{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
}