// src/pages/RelatorEstudiantesPage.tsx
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
  Search, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink, 
  MessageCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface InscripcionEstudiante {
  id: number;
  estudiante_data: {
    id: number;
    nombre_completo: string;
    rut_completo: string;
    email: string;
    avatar_url?: string;
  };
  curso_data: {
    id: number;
    nombre: string;
  };
  porcentaje_avance: number;
  nota_final: number | null;
  estado: string;
  updated_at: string;
}

export function RelatorEstudiantesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [estudiantes, setEstudiantes] = useState<InscripcionEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');

  // ── Carga de Datos ──
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/inscripciones/');
        setEstudiantes(res.data?.results || res.data || []);
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // ── Lógica de Filtros ──
  const listaCursos = useMemo(() => {
    const nombres = estudiantes.map(i => i.curso_data.nombre);
    return Array.from(new Set(nombres));
  }, [estudiantes]);

  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(i => {
      const nombre = i.estudiante_data.nombre_completo.toLowerCase();
      const rut = i.estudiante_data.rut_completo.toLowerCase();
      const matchBusqueda = nombre.includes(busqueda.toLowerCase()) || rut.includes(busqueda.toLowerCase());
      const matchCurso = filtroCurso === '' || i.curso_data.nombre === filtroCurso;
      return matchBusqueda && matchCurso;
    });
  }, [estudiantes, busqueda, filtroCurso]);

  // KPIs
  const stats = {
    total: estudiantes.length,
    completados: estudiantes.filter(e => e.porcentaje_avance === 100).length,
    promedioAvance: estudiantes.length > 0 
      ? Math.round(estudiantes.reduce((acc, curr) => acc + curr.porcentaje_avance, 0) / estudiantes.length)
      : 0,
    enRiesgo: estudiantes.filter(e => e.porcentaje_avance < 20).length
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
        { icon: <BookOpen size={20} />, label: 'Mis Cursos', href: '/relator/cursos' },
        { icon: <Users size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes', isActive: true },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas', href: '/relator/stats' },
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

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Mis Estudiantes"
      headerSubtitle="Rendimiento académico y avance de tus alumnos"
    >
      <div className="space-y-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard label="Total Alumnos" value={stats.total} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
            <SummaryCard label="Completados" value={stats.completados} icon={<CheckCircle2 className="text-green-600" />} color="bg-green-50" />
            <SummaryCard label="Avance Promedio" value={`${stats.promedioAvance}%`} icon={<TrendingUp className="text-jc-calipso" />} color="bg-cyan-50" />
            <SummaryCard label="En Riesgo" value={stats.enRiesgo} icon={<Clock className="text-red-600" />} color="bg-red-50" />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o RUT..."
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#52A9B7] outline-none text-sm"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-3 border border-slate-300 rounded-lg outline-none bg-white text-sm"
                    value={filtroCurso}
                    onChange={(e) => setFiltroCurso(e.target.value)}
                >
                    <option value="">Todos los cursos</option>
                    {listaCursos.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
                </select>
                <div className="flex items-center justify-end">
                    <Button variant="ghost" size="sm" onClick={() => {setBusqueda(''); setFiltroCurso('');}}>
                        <Filter size={14} className="mr-2" /> Limpiar
                    </Button>
                </div>
            </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Estudiante</th>
                            <th className="px-6 py-4">Curso</th>
                            <th className="px-6 py-4">Progreso</th>
                            <th className="px-6 py-4 text-center">Nota Final</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Cargando...</td></tr>
                        ) : estudiantesFiltrados.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Sin resultados</td></tr>
                        ) : (
                            estudiantesFiltrados.map((i) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-jc-blue font-bold text-xs">
                                                {i.estudiante_data.nombre_completo[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">{i.estudiante_data.nombre_completo}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{i.estudiante_data.rut_completo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-600">{i.curso_data.nombre}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                                                <div 
                                                    className={`h-full rounded-full transition-all ${i.porcentaje_avance === 100 ? 'bg-green-500' : 'bg-jc-blue'}`}
                                                    style={{ width: `${i.porcentaje_avance}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-bold text-slate-700">{i.porcentaje_avance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {i.nota_final ? (
                                            <span className={`font-bold ${i.nota_final >= 4 ? 'text-green-600' : 'text-red-600'}`}>
                                                {i.nota_final.toFixed(1)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 italic text-xs">S/N</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-jc-blue transition" title="Mensaje">
                                                <MessageCircle size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-jc-blue transition" title="Detalle">
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-500">
                <p>Mostrando {estudiantesFiltrados.length} estudiantes</p>
                <div className="flex gap-2">
                    <button className="p-1 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
                    <button className="p-1 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>

      </div>
    </MainLayout>
  );
}

function SummaryCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-black text-slate-800">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}