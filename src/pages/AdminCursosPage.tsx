// src/pages/AdminCursosPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  // Iconos necesarios para la lógica de modales
  X,
  Trash2,
  Save
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { cursoService, type Curso } from '@/api/services/cursoService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

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
  const location = useLocation();

  // Estado de Datos
  const [cursos, setCursos]         = useState<Curso[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | Curso['estado']>('todos');

  // Estados para Modales
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const data = await cursoService.getAll();
      setCursos(data);
    } catch {
      setError('No se pudieron cargar los cursos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, [location.key]);

  // Handlers para Modales
  const handleOpenVer = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setIsEditMode(false);
  };

  const handleOpenEditar = (curso: Curso) => {
    setCursoSeleccionado({ ...curso }); // Clon para edición limpia
    setIsEditMode(true);
  };

  const handleCloseModal = () => {
    setCursoSeleccionado(null);
    setIsEditMode(false);
  };

  const handleGuardarCambios = async () => {
    if (!cursoSeleccionado) return;
    setIsSaving(true);
    try {
      await cursoService.patch(cursoSeleccionado.id, cursoSeleccionado);
      await cargarCursos();
      handleCloseModal();
    } catch {
      alert("Error al actualizar el curso");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminarCurso = async () => {
    if (!cursoSeleccionado) return;
    if (!window.confirm(`¿Estás seguro de eliminar el curso "${cursoSeleccionado.nombre}"?`)) return;
    
    try {
      await cursoService.delete(cursoSeleccionado.id);
      await cargarCursos();
      handleCloseModal();
    } catch {
      alert("No se pudo eliminar el curso");
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // Filtrado
  const cursosFiltrados = cursos.filter(c => {
    const coincideBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado   = filtroEstado === 'todos' || c.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const topPorInscritos = [...cursos]
    .sort((a, b) => (b.total_inscritos ?? 0) - (a.total_inscritos ?? 0))
    .slice(0, 3);

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

        {/* Botón Crear */}
        <div>
          <button
            onClick={() => navigate('/admin/cursos/crear')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-jc-blue to-[#043360] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Crear Nuevo Curso
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            icon={<BookOpen size={24} className="text-blue-600" />}
            iconBg="bg-blue-100"
            label="Cursos totales"
            valor={loading ? '—' : String(cursos.length)}
            tag="Total"
            tagColor="text-blue-600"
          />
          <MetricCard
            icon={<CheckCircle2 size={24} className="text-green-600" />}
            iconBg="bg-green-100"
            label="Cursos en progreso"
            valor={loading ? '—' : String(cursos.filter(c => c.estado === 'activo').length)}
            tag="Activos"
            tagColor="text-green-600"
          />
          <MetricCard
            icon={<Users size={24} className="text-purple-600" />}
            iconBg="bg-purple-100"
            label="Estudiantes totales"
            valor={loading ? '—' : String(cursos.reduce((acc, c) => acc + (c.total_inscritos ?? 0), 0))}
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

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Cursos Activos</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Buscar curso..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-jc-blue outline-none"
              />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="borrador">Borrador</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Curso</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Inscritos</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cursosFiltrados.map((curso, idx) => (
                  <FilaCurso
                    key={curso.id}
                    curso={curso}
                    colorAvatar={COLORES_AVATAR[idx % COLORES_AVATAR.length]}
                    onVer={() => handleOpenVer(curso)}
                    onEditar={() => handleOpenEditar(curso)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-amber-600" />
              Cursos Más Populares
            </h3>
            <div className="space-y-4">
              {topPorInscritos.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded bg-gradient-to-br ${COLORES_AVATAR[idx]} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {getIniciales(c.nombre)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{c.nombre}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{c.total_inscritos} alumnos</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-slate-400">
             <BarChart3 size={40} className="mb-2 opacity-20" />
             <p className="text-sm">Datos adicionales de rendimiento próximamente</p>
          </div>
        </div>
      </div>

      {/* ── MODAL OVERLAY (PREVIEW / EDIT) ── */}
      {cursoSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {isEditMode ? <Pencil size={18} className="text-amber-500" /> : <Eye size={18} className="text-jc-blue" />}
                {isEditMode ? 'Editar Curso' : 'Detalles del Curso'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {isEditMode ? (
                <>
                  <Input 
                    label="Nombre del Curso" 
                    value={cursoSeleccionado.nombre} 
                    onChange={e => setCursoSeleccionado({...cursoSeleccionado, nombre: e.target.value})} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Horas Totales" 
                      type="number"
                      value={cursoSeleccionado.horas_totales} 
                      onChange={e => setCursoSeleccionado({...cursoSeleccionado, horas_totales: Number(e.target.value)})} 
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                      <select 
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20"
                        value={cursoSeleccionado.estado}
                        onChange={e => setCursoSeleccionado({...cursoSeleccionado, estado: e.target.value as any})}
                      >
                        <option value="activo">Activo</option>
                        <option value="borrador">Borrador</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                    <textarea 
                      className="w-full border rounded-lg p-3 h-32 resize-none outline-none focus:ring-2 focus:ring-jc-blue/20"
                      value={cursoSeleccionado.descripcion || ''}
                      onChange={e => setCursoSeleccionado({...cursoSeleccionado, descripcion: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre del Programa</p>
                    <p className="text-lg font-bold text-slate-800">{cursoSeleccionado.nombre}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Carga Horaria</p>
                      <p className="font-bold text-jc-blue">{cursoSeleccionado.horas_totales} Horas</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">SENCE</p>
                      <p className="font-bold text-jc-calipso">{cursoSeleccionado.codigo_sence_data?.codigo || 'Sin Código'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Descripción</p>
                    <p className="text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto">{cursoSeleccionado.descripcion || 'Sin descripción disponible.'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">
              {isEditMode ? (
                <>
                  <button onClick={handleEliminarCurso} className="flex items-center text-red-500 hover:text-red-700 text-sm font-bold">
                    <Trash2 size={16} className="mr-1.5" /> Eliminar
                  </button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleGuardarCambios} isLoading={isSaving}>
                      <Save size={16} className="mr-2" /> Guardar
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="w-full" onClick={() => setIsEditMode(true)}>
                  <Pencil size={16} className="mr-2" /> Pasar a Edición Rápida
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

// ── Subcomponentes Internos ───────────────────────────────────────────────────

function MetricCard({ icon, iconBg, label, valor, tag, tagColor }: any) {
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

function FilaCurso({ curso, colorAvatar, onVer, onEditar }: any) {
  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${colorAvatar} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">{getIniciales(curso.nombre)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{curso.nombre}</p>
            <p className="text-xs text-slate-500">{curso.horas_totales}h</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <EstadoBadge estado={curso.estado} />
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-bold text-slate-800">{curso.total_inscritos ?? 0}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onVer} 
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={onEditar} 
            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"
            title="Editar rápido"
          >
            <Pencil size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}