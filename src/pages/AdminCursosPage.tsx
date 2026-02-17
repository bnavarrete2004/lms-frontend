// src/pages/AdminCursosPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  BookOpen,
  Users,
  BarChart3,
  FolderTree,
  FileText,
  Globe,
  Settings,
  Plus,
  Eye,
  Pencil,
  Star,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { cursoService, type Curso } from '@/api/services/cursoService';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Genera iniciales a partir del nombre del curso */
function getIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

/** Paleta de colores para los avatares de curso (rota por índice) */
const COLORES_AVATAR = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
  'from-amber-500 to-amber-600',
  'from-indigo-500 to-indigo-600',
  'from-pink-500 to-pink-600',
];

/** Badge de estado del curso */
function EstadoBadge({ estado }: { estado: Curso['estado'] }) {
  const map = {
    activo:   { label: 'Activo',    cls: 'bg-green-100 text-green-700' },
    inactivo: { label: 'Inactivo',  cls: 'bg-slate-100 text-slate-500' },
    borrador: { label: 'Borrador',  cls: 'bg-amber-100 text-amber-700' },
  };
  const { label, cls } = map[estado] ?? map.borrador;
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${cls}`}>
      {label}
    </span>
  );
}

// ── Secciones del sidebar (igual que AdminDashboardPage pero con Gestión Cursos activo) ──

function useSidebarSections() {
  return [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',     href: '/admin/dashboard' },
        { icon: <FileSearch   size={20} />, label: 'Revisión Material', href: '/admin/revision',
          badge: '5', badgeVariant: 'danger' as const, badgeAnimated: true },
        { icon: <BookOpen     size={20} />, label: 'Gestión Cursos',    href: '/admin/cursos', isActive: true },
        { icon: <Users        size={20} />, label: 'Usuarios y Roles',  href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3  size={20} />, label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Central',   href: '/admin/repositorio' },
        { icon: <FileText   size={20} />, label: 'Reportes SENCE',        href: '/admin/reportes' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { icon: <Globe    size={20} />, label: 'Contenido Público',      href: '/admin/landing' },
        { icon: <Settings size={20} />, label: 'Ajustes del Sistema',    href: '/admin/config' },
      ],
    },
  ];
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AdminCursosPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarSections = useSidebarSections();

  // Estado
  const [cursos, setCursos]         = useState<Curso[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | Curso['estado']>('todos');

  // Cargar cursos
  useEffect(() => {
    async function cargar() {
      try {
        setLoading(true);
        const data = await cursoService.getAll();
        setCursos(data);
      } catch {
        setError('No se pudieron cargar los cursos. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  // Filtrado local
  const cursosFiltrados = cursos.filter(c => {
    const coincideBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado   = filtroEstado === 'todos' || c.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  // Métricas derivadas
  const totalCursos    = cursos.length;
  const cursosActivos  = cursos.filter(c => c.estado === 'activo').length;
  const totalEstudiantes = cursos.reduce((acc, c) => acc + (c.total_inscritos ?? 0), 0);

  // Top cursos por inscritos (para la sección de análisis)
  const topPorInscritos = [...cursos]
    .sort((a, b) => (b.total_inscritos ?? 0) - (a.total_inscritos ?? 0))
    .slice(0, 3);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre || 'Admin'}
      userSubtitle="Superusuario"
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Gestión de Cursos"
      headerSubtitle="Administración y seguimiento de todos los cursos disponibles"
      notificationCount={5}
    >
      <div className="space-y-8">

        {/* ── Botón Crear Curso ─────────────────────────────────────────── */}
        <div>
          <button
            onClick={() => navigate('/admin/cursos/crear')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-jc-blue to-[#043360] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Crear Nuevo Curso
          </button>
        </div>

        {/* ── Métricas ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            icon={<BookOpen size={24} className="text-blue-600" />}
            iconBg="bg-blue-100"
            label="Cursos totales"
            valor={loading ? '—' : String(totalCursos)}
            tag="Total"
            tagColor="text-blue-600"
          />
          <MetricCard
            icon={<CheckCircle2 size={24} className="text-green-600" />}
            iconBg="bg-green-100"
            label="Cursos en progreso"
            valor={loading ? '—' : String(cursosActivos)}
            tag="Activos"
            tagColor="text-green-600"
          />
          <MetricCard
            icon={<Users size={24} className="text-purple-600" />}
            iconBg="bg-purple-100"
            label="Estudiantes totales"
            valor={loading ? '—' : String(totalEstudiantes)}
            tag="Inscritos"
            tagColor="text-purple-600"
          />
          <MetricCard
            icon={<Star size={24} className="text-amber-600" />}
            iconBg="bg-amber-100"
            label="Calificación global"
            valor="—"
            tag="Promedio"
            tagColor="text-amber-600"
          />
        </div>

        {/* ── Tabla de Cursos ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">

          {/* Cabecera de la tabla */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={22} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Cursos Activos</h2>
                  <p className="text-sm text-slate-500">Cursos actualmente disponibles en la plataforma</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Buscar curso..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-blue"
                />
                <select
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value as typeof filtroEstado)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-blue"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="borrador">En borrador</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estado de carga / error / vacío */}
          {loading && (
            <div className="py-16 text-center text-slate-400 text-sm">Cargando cursos...</div>
          )}
          {error && !loading && (
            <div className="py-16 text-center text-red-500 text-sm">{error}</div>
          )}
          {!loading && !error && cursosFiltrados.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">
              {busqueda || filtroEstado !== 'todos'
                ? 'Sin resultados para los filtros aplicados.'
                : 'Aún no hay cursos creados. ¡Crea el primero!'}
            </div>
          )}

          {/* Tabla */}
          {!loading && !error && cursosFiltrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Curso', 'Estado', 'Inscritos', 'Progreso Prom.', 'Popularidad', 'Tasa Éxito', 'Acciones'].map(col => (
                      <th key={col} className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cursosFiltrados.map((curso, idx) => (
                    <FilaCurso
                      key={curso.id}
                      curso={curso}
                      colorAvatar={COLORES_AVATAR[idx % COLORES_AVATAR.length]}
                      onVer={() => navigate(`/admin/cursos/${curso.id}`)}
                      onEditar={() => navigate(`/admin/cursos/${curso.id}/editar`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Sección Análisis ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Cursos más populares */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-amber-600" />
              Cursos Más Populares
            </h3>
            {loading
              ? <p className="text-sm text-slate-400">Cargando...</p>
              : topPorInscritos.length === 0
                ? <p className="text-sm text-slate-400">Sin datos aún.</p>
                : (
                  <div className="space-y-4">
                    {topPorInscritos.map((curso, idx) => (
                      <div key={curso.id} className={`flex items-center justify-between ${idx < topPorInscritos.length - 1 ? 'pb-4 border-b border-slate-100' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${COLORES_AVATAR[idx]} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-xs">{getIniciales(curso.nombre)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{curso.nombre}</p>
                            <p className="text-xs text-slate-500">{curso.total_inscritos ?? 0} estudiantes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-600">— ⭐</p>
                          <p className="text-xs text-slate-500">sin calif.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>

          {/* Mayor tasa de éxito — placeholder hasta que el backend lo provea */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <CheckCircle2 size={20} className="mr-2 text-green-600" />
              Mayor Tasa de Éxito
            </h3>
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <BarChart3 size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Disponible cuando el backend exponga datos de aprobación por curso.</p>
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function MetricCard({
  icon, iconBg, label, valor, tag, tagColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  valor: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold ${tagColor}`}>{tag}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function FilaCurso({
  curso,
  colorAvatar,
  onVer,
  onEditar,
}: {
  curso: Curso;
  colorAvatar: string;
  onVer: () => void;
  onEditar: () => void;
}) {
  return (
    <tr className="hover:bg-slate-50 transition">

      {/* Nombre */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${colorAvatar} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">{getIniciales(curso.nombre)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{curso.nombre}</p>
            <p className="text-xs text-slate-500">{curso.horas_totales}h · {curso.modalidad}</p>
          </div>
        </div>
      </td>

      {/* Estado */}
      <td className="px-6 py-4">
        <EstadoBadge estado={curso.estado} />
      </td>

      {/* Inscritos */}
      <td className="px-6 py-4">
        <p className="text-sm font-bold text-slate-800">{curso.total_inscritos ?? 0}</p>
        <p className="text-xs text-slate-500">estudiantes</p>
      </td>

      {/* Progreso promedio — no disponible en API actual */}
      <td className="px-6 py-4">
        <span className="text-sm text-slate-400">—</span>
      </td>

      {/* Popularidad — no disponible en API actual */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-sm text-slate-400">—</span>
        </div>
      </td>

      {/* Tasa de éxito — no disponible en API actual */}
      <td className="px-6 py-4">
        <span className="text-sm text-slate-400">—</span>
      </td>

      {/* Acciones */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onVer}
            className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            <Eye size={13} className="mr-1" /> Ver
          </button>
          <button
            onClick={onEditar}
            className="inline-flex items-center px-3 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition"
          >
            <Pencil size={13} className="mr-1" /> Editar
          </button>
        </div>
      </td>

    </tr>
  );
}