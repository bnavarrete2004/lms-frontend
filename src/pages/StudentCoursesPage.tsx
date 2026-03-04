// src/pages/StudentCoursesPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { inscripcionService, type Inscripcion } from '@/api/services/inscripcionService';

export function StudentCoursesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'en_curso' | 'completados'>('todos');

  // ── Carga de Datos ──
  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        setLoading(true);
        const data = await inscripcionService.getMisInscripciones();
        setInscripciones(data);
      } catch (err) {
        setError("No se pudieron cargar tus cursos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchInscripciones();
  }, []);

  // ── Filtrado ──
  const cursosFiltrados = useMemo(() => {
    if (filtro === 'en_curso') return inscripciones.filter(i => i.estado === 'en_curso' || i.estado === 'inscrito');
    if (filtro === 'completados') return inscripciones.filter(i => i.estado === 'completado' || i.estado === 'aprobado');
    return inscripciones;
  }, [inscripciones, filtro]);

  // ── Sidebar Config (Copia fiel del Dashboard) ──
  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        {
          href: '/student/dashboard', // Ajustado a la ruta de App.tsx
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          label: 'Mi Panel',
        },
        {
          href: '/student/courses',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: 'Mis Cursos',
          isActive: true,
        },
        {
          href: '/student/diplomas',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Mis Diplomas',
        },
        {
          href: '/student/progress',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          label: 'Mi Progreso',
        },
        {
          href: '/student/notifications',
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
          href: '/student/profile',
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

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, { text: string; variant: any }> = {
      en_curso: { text: 'En Curso', variant: 'info' },
      inscrito: { text: 'Por Iniciar', variant: 'warning' },
      completado: { text: 'Finalizado', variant: 'success' },
      aprobado: { text: 'Aprobado', variant: 'success' },
      reprobado: { text: 'No Aprobado', variant: 'danger' },
    };
    return labels[estado] || { text: estado, variant: 'default' };
  };

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || 'Estudiante'} 
      userSubtitle={user?.rut}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Mis Capacitaciones"
      headerSubtitle="Lista completa de tus cursos y estados de avance"
    >
      <div className="space-y-8">
        
        {/* ── Widgets Resumen ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-jc-blue"><BookOpen /></div>
            <div><p className="text-2xl font-bold">{inscripciones.length}</p><p className="text-xs text-slate-500 uppercase font-bold">Cursos Totales</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600"><Clock /></div>
            <div><p className="text-2xl font-bold">{inscripciones.filter(i => i.estado === 'en_curso').length}</p><p className="text-xs text-slate-500 uppercase font-bold">En Pregreso</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><CheckCircle /></div>
            <div><p className="text-2xl font-bold">{inscripciones.filter(i => i.estado === 'aprobado').length}</p><p className="text-xs text-slate-500 uppercase font-bold">Certificados</p></div>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="flex gap-2">
          {(['todos', 'en_curso', 'completados'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filtro === f ? 'bg-jc-blue text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              {f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Contenido ── */}
        {loading ? (
          <div className="text-center p-20 text-slate-400 font-medium">Sincronizando con el servidor...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100">{error}</div>
        ) : inscripciones.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookMarked size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Todavía no estás inscrito en ningún curso</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Cuando seas asignado a una nueva capacitación, aparecerá en esta sección.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {cursosFiltrados.map((i) => {
              const status = getStatusLabel(i.estado);
              return (
                <div 
                  key={i.id} 
                  onClick={() => navigate(`/student/courses/${i.curso}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={i.curso_data?.imagen_portada || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Curso" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">{i.curso_data?.nombre}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold uppercase">
                        <span className="flex items-center gap-1"><Clock size={14}/> {i.curso_data?.horas_totales}H Totales</span>
                        <span className="flex items-center gap-1"><CheckCircle size={14}/> {i.porcentaje_avance}% Avance</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <Badge variant={status.variant}>{status.text}</Badge>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">INSCRITO: {new Date(i.fecha_inscripcion).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-jc-blue group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}