// src/pages/RelatorStatsPage.tsx
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
  FileText, 
  Star, 
  Download, 
  BarChart3, 
  PieChart
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/relator/StatCard'; // <--- Importación agregada
import { Badge } from '@/components/ui/Badge';           // <--- Importación agregada
import api from '@/api/axios';

// Gráficos
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Tooltip, Legend, Filler
);

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Material {
  id: number;
  tipo: string;
  created_at: string;
}

interface Inscripcion {
  id: number;
  nota_final: number | null;
  porcentaje_avance: number;
  curso: number;
}

interface Curso {
  id: number;
  nombre: string;
}

export function RelatorStatsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Carga de Datos ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mRes, iRes, cRes] = await Promise.all([
          api.get('/materiales/'),
          api.get('/inscripciones/'),
          api.get('/cursos/')
        ]);
        setMateriales(mRes.data?.results || mRes.data || []);
        setInscripciones(iRes.data?.results || iRes.data || []);
        setCursos(cRes.data?.results || cRes.data || []);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Lógica de Procesamiento de Datos ──

  // 1. Materiales por mes (Últimos 6 meses)
  const lineData = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const labels = [];
    const dataPoints = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      labels.push(meses[d.getMonth()]);
      const count = materiales.filter(m => {
        const fm = new Date(m.created_at);
        return fm.getMonth() === d.getMonth() && fm.getFullYear() === d.getFullYear();
      }).length;
      dataPoints.push(count);
    }

    return {
      labels,
      datasets: [{
        label: 'Materiales Creados',
        data: dataPoints,
        borderColor: '#064D91',
        backgroundColor: 'rgba(6, 77, 145, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#064D91',
      }]
    };
  }, [materiales]);

  // 2. Distribución de Notas
  const doughnutData = useMemo(() => {
    const validNotas = inscripciones.filter(i => i.nota_final !== null).map(i => i.nota_final as number);
    const buckets = [0, 0, 0, 0]; 
    
    validNotas.forEach(n => {
      if (n >= 6) buckets[0]++;
      else if (n >= 5) buckets[1]++;
      else if (n >= 4) buckets[2]++;
      else buckets[3]++;
    });

    return {
      labels: ['Excelente (6.0-7.0)', 'Bueno (5.0-5.9)', 'Suficiente (4.0-4.9)', 'Insuficiente (<4.0)'],
      datasets: [{
        data: buckets,
        backgroundColor: ['#10b981', '#52A9B7', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      }]
    };
  }, [inscripciones]);

  const totalImpacto = inscripciones.length;
  const notaPromedio = inscripciones.length > 0 
    ? (inscripciones.reduce((acc, curr) => acc + (curr.nota_final || 0), 0) / (inscripciones.filter(i => i.nota_final !== null).length || 1)).toFixed(1)
    : "0.0";

  const handleLogout = () => { logout(); navigate('/login'); };

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
        { icon: <BookOpen size={20} />, label: 'Mis Cursos', href: '/relator/cursos' },
        { icon: <Users size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes' },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas', href: '/relator/stats', isActive: true },
      ],
    },
    {
        title: 'Cuenta',
        items: [
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones' },
          { icon: <Users size={20} />, label: 'Mi Perfil', href: '/relator/perfil' },
        ],
    },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Generando reportes estadísticos...</div>;

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Mis Estadísticas"
      headerSubtitle="Análisis de impacto y rendimiento académico"
      headerActions={
        <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs uppercase flex items-center hover:bg-slate-50 transition shadow-sm">
            <Download size={16} className="mr-2 text-jc-blue" /> Exportar Reporte
        </button>
      }
    >
      <div className="space-y-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard icon={FileText} title="Contenidos" value={materiales.length} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
            <StatCard icon={Users} title="Estudiantes" value={totalImpacto} iconColor="text-green-600" iconBgColor="bg-green-50" />
            <StatCard icon={BookOpen} title="Cursos" value={cursos.length} iconColor="text-purple-600" iconBgColor="bg-purple-50" />
            <StatCard icon={Star} title="Nota Promedio" value={notaPromedio} iconColor="text-amber-600" iconBgColor="bg-amber-50" />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <BarChart3 size={20} className="text-jc-blue" /> Materiales Creados
                    </h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Histórico últimos 6 meses</p>
                </div>
            </div>
            <div className="h-64">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <PieChart size={20} className="text-jc-calipso" /> Desempeño Académico
                    </h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Distribución de calificaciones</p>
                </div>
            </div>
            <div className="h-64 flex justify-center">
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

        </div>

        {/* Tabla de Rendimiento por Curso */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg">Rendimiento por Programa</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Curso</th>
                            <th className="px-6 py-4 text-center">Alumnos</th>
                            <th className="px-6 py-4 text-center">Avance Prom.</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {cursos.map(c => {
                            const inscritos = inscripciones.filter(i => i.curso === c.id);
                            const avance = inscritos.length > 0 
                                ? Math.round(inscritos.reduce((acc, curr) => acc + curr.porcentaje_avance, 0) / inscritos.length)
                                : 0;
                            return (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{c.nombre}</td>
                                    <td className="px-6 py-4 text-center font-semibold text-slate-600">{inscritos.length}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-jc-blue" style={{ width: `${avance}%` }}></div>
                                            </div>
                                            <span className="font-bold text-jc-blue">{avance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="success">Activo</Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </MainLayout>
  );
}