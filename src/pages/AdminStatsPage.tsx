// src/pages/AdminStatsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Users2,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  FolderTree,
  Globe,
  Settings
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/relator/StatCard';
import api from '@/api/axios';

// Importación de componentes de gráficos
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
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement, 
    ArcElement, 
    Tooltip, 
    Legend, 
    Filler
);

export function AdminStatsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [relatores, setRelatores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, cRes, iRes, rRes] = await Promise.all([
          api.get('/usuarios/'),
          api.get('/cursos/'),
          api.get('/inscripciones/'),
          api.get('/perfiles-relator/')
        ]);

        setUsuarios(uRes.data?.results || uRes.data || []);
        setCursos(cRes.data?.results || cRes.data || []);
        setInscripciones(iRes.data?.results || iRes.data || []);
        setRelatores(rRes.data?.results || rRes.data || []);
      } catch (error) {
        console.error("Error al sincronizar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- PROCESAMIENTO PARA GRÁFICO DE LÍNEAS (HISTÓRICO REAL) ---
  const procesarInscripcionesMensuales = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const labels = [];
    const dataCount = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      labels.push(meses[d.getMonth()]);
      
      const count = inscripciones.filter(ins => {
        const f = new Date(ins.fecha_inscripcion);
        return f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear();
      }).length;
      
      dataCount.push(count);
    }
    return { labels, dataCount };
  };

  const hist = procesarInscripcionesMensuales();

  const lineData = {
    labels: hist.labels,
    datasets: [{
      label: 'Nuevos Inscritos',
      data: hist.dataCount,
      borderColor: '#064D91',
      backgroundColor: 'rgba(6, 77, 145, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#064D91',
    }]
  };

  // --- OTROS PROCESAMIENTOS ---
  const inscripcionesPorCurso = cursos.map(curso => ({
    nombre: curso.nombre,
    cantidad: inscripciones.filter(i => i.curso === curso.id).length
  }));

  const rendimientoPorCurso = cursos.map(curso => {
    const inscritos = inscripciones.filter(i => i.curso === curso.id && i.nota_final != null);
    const promedio = inscritos.length > 0 
      ? inscritos.reduce((acc, curr) => acc + parseFloat(curr.nota_final), 0) / inscritos.length
      : 0;
    return { nombre: curso.nombre, promedio: (promedio * 10).toFixed(0) };
  });

  const doughnutData = {
    labels: inscripcionesPorCurso.map(c => c.nombre),
    datasets: [{
      data: inscripcionesPorCurso.map(c => c.cantidad),
      backgroundColor: ['#064D91', '#52A9B7', '#10b981', '#8b5cf6', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const barData = {
    labels: rendimientoPorCurso.map(c => c.nombre),
    datasets: [{
      label: 'Promedio (%)',
      data: rendimientoPorCurso.map(c => c.promedio),
      backgroundColor: '#52A9B7',
      borderRadius: 8,
    }]
  };

  const totalEstudiantes = usuarios.filter(u => u.tipo_usuario === 'estudiante').length;
  const cursando = inscripciones.filter(i => i.estado === 'en_curso').length;
  const aprobados = inscripciones.filter(i => i.estado === 'aprobado' || i.estado === 'completado').length;
  const totalHoras = inscripciones.reduce((acc, curr) => acc + (curr.tiempo_total_minutos || 0), 0);

  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General', href: '/admin/dashboard' },
        { icon: <FileSearch size={20} />, label: 'Revisión Material', href: '/admin/revision' },
        { icon: <BookOpen size={20} />, label: 'Gestión Cursos', href: '/admin/cursos' },
        { icon: <Users size={20} />, label: 'Usuarios y Roles', href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3 size={20} />, label: 'Estadísticas Globales', href: '/admin/stats', isActive: true },
        { icon: <FolderTree size={20} />, label: 'Repositorio Central', href: '/admin/repositorio' },
        { icon: <FileText size={20} />, label: 'Reportes SENCE', href: '/admin/reportes' },
      ],
    },
    {
        title: 'Configuración',
        items: [
          { icon: <Globe size={20} />, label: 'Contenido Público', href: '/admin/landing' },
          { icon: <Settings size={20} />, label: 'Ajustes del Sistema', href: '/admin/config' },
        ],
      },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Cargando métricas...</div>;

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || 'Admin'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Estadísticas de la Plataforma"
      headerSubtitle={`${totalEstudiantes} estudiantes registrados (${cursando} cursando actualmente)`}
    >
      <div className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={Users2} title="Total Alumnos" value={totalEstudiantes} iconColor="text-blue-600" iconBgColor="bg-blue-50" />
          <StatCard icon={CheckCircle2} title="Total Aprobados" value={aprobados} iconColor="text-green-600" iconBgColor="bg-green-100" />
          <StatCard icon={Clock} title="Horas Totales" value={`${Math.round(totalHoras / 60)}h`} iconColor="text-purple-600" iconBgColor="bg-purple-100" />
          <StatCard icon={BookOpen} title="Cursos" value={cursos.length} iconColor="text-amber-600" iconBgColor="bg-amber-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* GRÁFICO DE LÍNEAS RE-INCORPORADO */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-jc-blue" /> Inscripciones Mensuales
            </h3>
            <div className="h-64">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Distribución de Alumnos</h3>
            <div className="h-64 flex justify-center">
              <Doughnut data={doughnutData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Rendimiento por Curso</h3>
            <div className="h-64">
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Star size={18} className="text-amber-500" /> Relatores Activos
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b"><th className="pb-3">Nombre</th><th className="pb-3 text-right">Cursos</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {relatores.map((r: any) => (
                  <tr key={r.id}>
                    <td className="py-3 font-medium">{r.usuario_data?.nombre_completo}</td>
                    <td className="py-3 text-right font-bold text-jc-blue">{r.total_cursos_dictados || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-jc-blue" /> Listado de Estudiantes
            </h3>
            <table className="w-full text-sm">
                <thead>
                <tr className="text-left text-slate-500 border-b">
                    <th className="pb-3">Nombre Completo</th>
                    <th className="pb-3">RUT</th>
                    <th className="pb-3 text-right">Correo</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {usuarios.filter(u => u.tipo_usuario === 'estudiante').map((s: any) => (
                    <tr key={s.id}>
                    <td className="py-3 font-medium">{s.nombre_completo}</td>
                    <td className="py-3 font-mono text-xs">{s.rut_completo}</td>
                    <td className="py-3 text-right text-slate-500">{s.user.email}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </MainLayout>
  );
}