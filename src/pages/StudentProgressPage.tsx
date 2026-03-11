// src/pages/StudentProgressPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, CheckCircle2,
  TrendingUp, PieChart, CheckCircle, ChevronRight,
  Video, XCircle, BookMarked, Calendar
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

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
  const [errorActividades, setErrorActividades] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch inscripciones — crítico, sin esto no hay nada que mostrar
        const iRes = await api.get('/inscripciones/');
        setInscripciones(iRes.data?.results || iRes.data || []);

        // Fetch actividades — opcional, no bloquea el render si falla
        try {
          const aRes = await api.get('/actividades-estudiante/');
          setActividades(aRes.data?.results || aRes.data || []);
        } catch {
          setErrorActividades(true);
        }

      } catch (error) {
        console.error('Error cargando inscripciones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Actividad semanal ─────────────────────────────────────────────────────
  const activityData = useMemo(() => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hoy = new Date();
    const dataPoints = new Array(7).fill(0);
    const labels: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() - i);
      labels.push(diasSemana[fecha.getDay()]);

      const minutos = actividades
        .filter(a => new Date(a.timestamp_inicio).toLocaleDateString() === fecha.toLocaleDateString())
        .reduce((acc, a) => acc + (a.duracion_segundos || 0) / 60, 0);
      dataPoints[6 - i] = Math.round(minutos);
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

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalCursos = inscripciones.length;
    const completados = inscripciones.filter(
      i => i.estado === 'aprobado' || i.estado === 'completado'
    ).length;
    const promedio = totalCursos > 0
      ? Math.round(inscripciones.reduce((acc, i) => acc + (i.porcentaje_avance || 0), 0) / totalCursos)
      : 0;
    return { totalCursos, completados, promedio };
  }, [inscripciones, actividades]);

  const progressChartData = {
    labels: inscripciones.map(i => {
      const nombre = i.curso_data?.nombre || 'Curso';
      return nombre.length > 18 ? nombre.substring(0, 18) + '…' : nombre;
    }),
    datasets: [{
      label: 'Progreso %',
      data: inscripciones.map(i => i.porcentaje_avance || 0),
      backgroundColor: '#064D91',
      borderRadius: 8,
    }]
  };

  const performanceData = {
    labels: ['Excelente (≥6)', 'Bueno (4–6)', 'Insuficiente (<4)'],
    datasets: [{
      data: [
        inscripciones.filter(i => (i.nota_final || 0) >= 6).length,
        inscripciones.filter(i => (i.nota_final || 0) >= 4 && (i.nota_final || 0) < 6).length,
        inscripciones.filter(i => (i.nota_final || 0) > 0 && (i.nota_final || 0) < 4).length,
      ],
      backgroundColor: ['#10b981', '#064D91', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const tieneNotas = inscripciones.some(i => i.nota_final);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { href: '/student/dashboard', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label: 'Mi Panel' },
        { href: '/student/courses', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, label: 'Mis Cursos' },
        { href: '/student/diplomas', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Mis Diplomas' },
        { href: '/student/progress', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, label: 'Mi Progreso', isActive: true },
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

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <MainLayout role="estudiante" userName={user?.nombre_completo || 'Estudiante'} sidebarSections={sidebarSections} onLogout={handleLogout} headerTitle="Mi Progreso" headerSubtitle="Estadísticas de aprendizaje">
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 h-80 bg-slate-100 rounded-xl animate-pulse" />
            <div className="col-span-4 h-80 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </MainLayout>
    );
  }

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

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox icon={<BookOpen className="text-jc-blue" />}        label="Cursos inscritos"  value={stats.totalCursos} />
          <StatBox icon={<CheckCircle2 className="text-green-600" />}  label="Avance promedio"   value={`${stats.promedio}%`} />
          <StatBox icon={<TrendingUp className="text-amber-600" />}    label="Completados"       value={`${stats.completados} de ${stats.totalCursos}`} />
        </div>

        {/* ── Gráficos principales ── */}
        {inscripciones.length > 0 ? (
          <div className="grid grid-cols-12 gap-6">

            {/* Avance por curso */}
            <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">Avance por Programa</h3>
              <div className="h-64">
                <Bar
                  data={progressChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { max: 100, ticks: { callback: (v) => `${v}%` } } }
                  }}
                />
              </div>
            </div>

            {/* Rendimiento */}
            <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PieChart size={18} /> Rendimiento
              </h3>
              <div className="h-64 flex items-center justify-center">
                {tieneNotas
                  ? <Doughnut data={performanceData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                  : (
                    <div className="text-center">
                      <CheckCircle size={32} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-xs text-slate-400 italic">Sin notas registradas aún</p>
                    </div>
                  )
                }
              </div>
            </div>

            {/* Actividad semanal */}
            <div className="col-span-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Actividad Semanal</h3>
                {errorActividades && (
                  <span className="text-[10px] text-slate-400 italic">Sin datos de actividad disponibles</span>
                )}
              </div>
              <div className="h-48">
                <Line
                  data={activityData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { ticks: { callback: (v) => `${v} min` } } }
                  }}
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
            <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="font-bold text-slate-500">No tienes cursos inscritos aún</p>
            <p className="text-sm text-slate-400 mt-1">Explora el catálogo para comenzar</p>
            <button onClick={() => navigate('/student/courses')} className="mt-6 px-6 py-2 bg-jc-blue text-white rounded-lg text-sm font-semibold hover:bg-jc-calipso transition-colors">
              Ver catálogo
            </button>
          </div>
        )}

        {/* ── Detalle por curso ── */}
        {inscripciones.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookMarked size={20} className="text-jc-blue" /> Detalle por Curso
            </h3>
            {inscripciones.map((i) => {
              const pct = i.porcentaje_avance || 0;
              const completado = i.estado === 'aprobado' || i.estado === 'completado';
              return (
                <div key={i.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800">{i.curso_data?.nombre || 'Curso'}</h4>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        completado ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-jc-blue'
                      }`}>
                        {i.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`text-2xl font-black ${completado ? 'text-green-600' : 'text-jc-blue'}`}>
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${completado ? 'bg-green-500' : 'bg-jc-blue'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <MetricItem label="Nota final"   value={i.nota_final ? String(i.nota_final) : '—'} />
                    <MetricItem label="Asistencia"   value={`${i.porcentaje_asistencia || 0}%`} />
                    <MetricItem label="Inscrito el"  value={i.fecha_inscripcion ? new Date(i.fecha_inscripcion).toLocaleDateString('es-CL') : '—'} />
                    <button
                      onClick={() => navigate(`/student/courses/${i.curso}`)}
                      className="text-jc-blue text-xs font-bold hover:text-jc-calipso transition-colors flex items-center justify-center gap-1"
                    >
                      Ver curso <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Historial de actividad ── */}
        {!errorActividades && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" /> Historial de Actividad
              </h3>
              <XCircle size={16} className="text-slate-200" />
            </div>
            <div className="divide-y divide-slate-100">
              {actividades.length > 0 ? actividades.slice(0, 20).map((a, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      a.tipo_actividad?.includes('eval') ? 'bg-green-50' : 'bg-blue-50'
                    }`}>
                      {a.tipo_actividad?.includes('eval')
                        ? <CheckCircle size={18} className="text-green-600" />
                        : <Video size={18} className="text-blue-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 capitalize">
                        {a.tipo_actividad?.replace(/_/g, ' ') || 'Actividad'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(a.timestamp_inicio).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {Math.round((a.duracion_segundos || 0) / 60)} min
                  </span>
                </div>
              )) : (
                <p className="p-10 text-center text-slate-400 italic text-sm">No hay actividad reciente.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700 capitalize">{value}</p>
    </div>
  );
}