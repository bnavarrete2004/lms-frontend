// src/pages/StudentProgressPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  BarChart3, 
  Bell, 
  User, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  TrendingUp,
  PieChart, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Video, 
  Lock, 
  XCircle, 
  BookMarked // <--- Agregado para solucionar el error de "Cannot find name"
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

// Gráficos
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Tooltip, Legend, Filler
);

export function StudentProgressPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [iRes, aRes] = await Promise.all([
          api.get('/inscripciones/'),
          api.get('/actividades-estudiante/')
        ]);
        setInscripciones(iRes.data?.results || iRes.data || []);
        setActividades(aRes.data?.results || aRes.data || []);
      } catch (error) {
        console.error("Error cargando progreso:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Lógica de Actividad Semanal Real ──
  const activityData = useMemo(() => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hoy = new Date();
    const dataPoints = new Array(7).fill(0);
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const fechaBusqueda = new Date();
      fechaBusqueda.setDate(hoy.getDate() - i);
      labels.push(diasSemana[fechaBusqueda.getDay()]);

      const actividadesDia = actividades.filter(act => {
        const fechaAct = new Date(act.timestamp_inicio);
        return fechaAct.toLocaleDateString() === fechaBusqueda.toLocaleDateString();
      });

      const minutosTotales = actividadesDia.reduce((acc, curr) => acc + (curr.duracion_segundos / 60), 0);
      dataPoints[6 - i] = Math.round(minutosTotales);
    }

    return {
      labels,
      datasets: [{
        label: 'Minutos de estudio',
        data: dataPoints,
        borderColor: '#52A9B7',
        backgroundColor: 'rgba(82, 169, 183, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#52A9B7',
      }]
    };
  }, [actividades]);

  // ── Estadísticas Reales ──
  const stats = useMemo(() => {
    const totalCursos = inscripciones.length;
    const completados = inscripciones.filter(i => i.estado === 'aprobado' || i.estado === 'completado').length;
    const promedio = totalCursos > 0 
      ? Math.round(inscripciones.reduce((acc, i) => acc + i.porcentaje_avance, 0) / totalCursos) 
      : 0;
    const horas = (inscripciones.reduce((acc, i) => acc + (i.tiempo_total_minutos || 0), 0) / 60).toFixed(1);

    return { totalCursos, completados, promedio, horas };
  }, [inscripciones]);

  const progressChartData = {
    labels: inscripciones.map(i => i.curso_data?.nombre?.substring(0, 15) + '...'),
    datasets: [{
      label: 'Progreso %',
      data: inscripciones.map(i => i.porcentaje_avance),
      backgroundColor: '#064D91',
      borderRadius: 8,
    }]
  };

  const performanceData = {
    labels: ['Excelente', 'Bueno', 'Suficiente'],
    datasets: [{
      data: [
        inscripciones.filter(i => (i.nota_final || 0) >= 6).length,
        inscripciones.filter(i => (i.nota_final || 0) >= 4 && (i.nota_final || 0) < 6).length,
        inscripciones.filter(i => (i.nota_final || 0) > 0 && (i.nota_final || 0) < 4).length,
      ],
      backgroundColor: ['#10b981', '#064D91', '#f59e0b'],
      borderWidth: 0
    }]
  };

  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Mi Panel', href: '/student/dashboard' },
        { icon: <BookOpen size={20} />, label: 'Mis Cursos', href: '/student/courses' },
        { icon: <Award size={20} />, label: 'Mis Diplomas', href: '/student/diplomas' },
        { icon: <BarChart3 size={20} />, label: 'Mi Progreso', href: '/student/progress', isActive: true },
      ],
    },
    {
        title: 'Cuenta',
        items: [
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/student/notifications' },
          { icon: <User size={20} />, label: 'Mi Perfil', href: '/student/profile' },
        ],
    },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="p-20 text-center text-slate-500 font-medium italic">Sincronizando...</div>;

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Mi Progreso"
      headerSubtitle="Estadísticas de aprendizaje"
    >
      <div className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatBox icon={<BookOpen className="text-jc-blue" />} label="Cursos" value={stats.totalCursos} />
            <StatBox icon={<CheckCircle2 className="text-green-600" />} label="Avance" value={`${stats.promedio}%`} />
            <StatBox icon={<Clock className="text-purple-600" />} label="Estudio" value={`${stats.horas}h`} />
            <StatBox icon={<TrendingUp className="text-amber-600" />} label="Logros" value={`${stats.completados}/${stats.totalCursos}`} />
        </div>

        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Avance por Programa</h3>
                <div className="h-64"><Bar data={progressChartData} options={{ maintainAspectRatio: false }} /></div>
            </div>
            <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><PieChart size={18} /> Rendimiento</h3>
                <div className="h-64 flex justify-center">
                    {inscripciones.some(i => i.nota_final) ? <Doughnut data={performanceData} /> : <p className="text-xs text-slate-400 mt-20 italic">Sin notas registradas</p>}
                </div>
            </div>
            <div className="col-span-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-2">Actividad Semanal</h3>
                <div className="h-48"><Line data={activityData} options={{ maintainAspectRatio: false }} /></div>
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><BookMarked size={20} className="text-jc-blue" /> Detalle por Curso</h3>
            {inscripciones.map((i) => (
                <div key={i.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">{i.curso_data?.nombre}</h4>
                        <span className="text-2xl font-black text-jc-blue">{i.porcentaje_avance}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-jc-blue" style={{ width: `${i.porcentaje_avance}%` }} />
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <MetricItem label="Estado" value={i.estado.replace('_', ' ')} />
                        <MetricItem label="Nota" value={i.nota_final || '---'} />
                        <MetricItem label="Asistencia" value={`${i.porcentaje_asistencia || 0}%`} />
                        <button onClick={() => navigate(`/student/courses/${i.curso}`)} className="text-jc-blue text-xs font-bold hover:underline flex items-center justify-center gap-1">
                            Ver curso <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                    <ChevronLeft className="text-slate-300" size={20} />
                    <h3 className="font-bold text-slate-800">Historial de Actividad</h3>
                </div>
                <div className="flex gap-3">
                    <Lock size={16} className="text-slate-200" />
                    <XCircle size={16} className="text-slate-200" />
                    <Calendar size={16} className="text-slate-200" />
                </div>
            </div>
            <div className="divide-y divide-slate-100">
                {actividades.length > 0 ? actividades.map((a, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.tipo_actividad.includes('eval') ? 'bg-green-50' : 'bg-blue-50'}`}>
                                {a.tipo_actividad.includes('eval') ? <CheckCircle size={18} className="text-green-600" /> : <Video size={18} className="text-blue-600" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 capitalize">{a.tipo_actividad.replace('_', ' ')}</p>
                                <p className="text-xs text-slate-400">{new Date(a.timestamp_inicio).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{Math.round(a.duracion_segundos / 60)} min</span>
                    </div>
                )) : <p className="p-10 text-center text-slate-400 italic">No hay actividad reciente.</p>}
            </div>
        </div>
      </div>
    </MainLayout>
  );
}

function StatBox({ icon, label, value }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">{icon}</div>
            <div>
                <p className="text-2xl font-black text-slate-800">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

function MetricItem({ label, value }: any) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
            <p className="text-sm font-bold text-slate-700 capitalize">{value}</p>
        </div>
    );
}