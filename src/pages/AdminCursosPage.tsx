// src/pages/AdminCursosPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Settings, Plus, Eye, Pencil,
  X, Trash2, Save, UserPlus, Search,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { cursoService, type Curso } from '@/api/services/cursoService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getIniciales(nombre: string): string {
  return nombre.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const COLORES_AVATAR = [
  'from-blue-500 to-blue-600', 'from-green-500 to-green-600',
  'from-purple-500 to-purple-600', 'from-red-500 to-red-600',
  'from-teal-500 to-teal-600', 'from-amber-500 to-amber-600',
  'from-indigo-500 to-indigo-600', 'from-pink-500 to-pink-600',
];

function EstadoBadge({ estado }: { estado: Curso['estado'] }) {
  const map = {
    activo:   { label: 'Activo',   cls: 'bg-green-100 text-green-700' },
    inactivo: { label: 'Inactivo', cls: 'bg-slate-100 text-slate-500' },
    borrador: { label: 'Borrador', cls: 'bg-amber-100 text-amber-700' },
  };
  const { label, cls } = map[estado] ?? map.borrador;
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${cls}`}>{label}</span>;
}

// ── Fila con confirmación inline ──────────────────────────────────────────────

function FilaCurso({ curso, colorAvatar, onVer, onEditar, onEliminar }: {
  curso: Curso; colorAvatar: string;
  onVer: () => void; onEditar: () => void; onEliminar: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${colorAvatar} rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
            {getIniciales(curso.nombre)}
          </div>
          <span className="text-sm font-semibold text-slate-700">{curso.nombre}</span>
        </div>
      </td>
      <td className="px-6 py-4"><EstadoBadge estado={curso.estado} /></td>
      <td className="px-6 py-4 text-sm font-bold text-slate-600">{curso.total_inscritos || 0}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end items-center gap-2">
          {confirmando ? (
            <>
              <span className="text-xs text-red-600 font-medium">¿Eliminar?</span>
              <button
                onClick={() => { setConfirmando(false); onEliminar(); }}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmando(false)}
                className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition"
              >
                No
              </button>
            </>
          ) : (
            <>
              <button onClick={onVer}    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Ver"><Eye size={16} /></button>
              <button onClick={onEditar} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition" title="Editar"><Pencil size={16} /></button>
              <button onClick={() => setConfirmando(true)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Eliminar"><Trash2 size={16} /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AdminCursosPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [cursos, setCursos]     = useState<Curso[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [isEditMode, setIsEditMode]               = useState(false);
  const [isSaving, setIsSaving]                   = useState(false);
  const [confirmandoModal, setConfirmandoModal]   = useState(false);

  const [estudiantes, setEstudiantes]         = useState<any[]>([]);
  const [modoAsignacion, setModoAsignacion]   = useState<'individual' | 'masivo'>('individual');
  const [busquedaManual, setBusquedaManual]   = useState('');
  const [estudianteIdSel, setEstudianteIdSel] = useState('');
  const [codigoEmpInput, setCodigoEmpInput]   = useState('');
  const [asignando, setAsignando]             = useState(false);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const data = await cursoService.getAll();
      setCursos(data);
    } catch {
      console.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarCursos(); }, [location.key]);

  useEffect(() => {
    if (isEditMode) {
      api.get('/usuarios/', { params: { tipo_usuario: 'estudiante' } }).then(res => {
        setEstudiantes(res.data?.results || res.data || []);
      });
    }
  }, [isEditMode]);

  const estudiantesFiltradosBusqueda = useMemo(() => {
    if (busquedaManual.length < 2) return [];
    return estudiantes.filter(est =>
      est.nombre_completo.toLowerCase().includes(busquedaManual.toLowerCase()) ||
      est.rut_completo.includes(busquedaManual)
    ).slice(0, 5);
  }, [busquedaManual, estudiantes]);

  const handleOpenVer = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setIsEditMode(false);
    setConfirmandoModal(false);
  };

  const handleOpenEditar = (curso: Curso) => {
    setCursoSeleccionado({ ...curso });
    setIsEditMode(true);
    setConfirmandoModal(false);
  };

  const handleCloseModal = () => {
    setCursoSeleccionado(null);
    setIsEditMode(false);
    setConfirmandoModal(false);
    setEstudianteIdSel('');
    setCodigoEmpInput('');
    setBusquedaManual('');
  };

  const handleGuardarCambios = async () => {
    if (!cursoSeleccionado) return;
    setIsSaving(true);
    try {
      await cursoService.patch(cursoSeleccionado.id, cursoSeleccionado);
      await cargarCursos();
      handleCloseModal();
    } catch {
      alert('Error al actualizar el curso');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminarCurso = async (cursoId: number) => {
    try {
      await cursoService.delete(cursoId);
      await cargarCursos();
      handleCloseModal();
    } catch {
      alert('No se pudo eliminar el curso');
    }
  };

  const handleAsignarEstudiantes = async () => {
    if (!cursoSeleccionado) return;
    setAsignando(true);
    try {
      const payload = modoAsignacion === 'individual'
        ? { usuario_id: parseInt(estudianteIdSel) }
        : { codigo_empleado: codigoEmpInput };
      const res: any = await cursoService.customAction(cursoSeleccionado.id, 'asignar_estudiantes', payload);
      alert(res.mensaje || 'Asignación completada');
      setEstudianteIdSel('');
      setBusquedaManual('');
      setCodigoEmpInput('');
      cargarCursos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo realizar la asignación');
    } finally {
      setAsignando(false);
    }
  };

  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',    href: '/admin/dashboard' },
        { icon: <FileSearch size={20} />,      label: 'Revisión Material', href: '/admin/revision', badge: '5', badgeVariant: 'danger' as const },
        { icon: <BookOpen size={20} />,        label: 'Gestión Cursos',   href: '/admin/cursos', isActive: true },
        { icon: <Users size={20} />,           label: 'Usuarios y Roles', href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3 size={20} />,  label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Central',   href: '/admin/repositorio' },
        { icon: <FileText size={20} />,   label: 'Reportes SENCE',        href: '/admin/reportes' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { icon: <Globe size={20} />,    label: 'Contenido Público',   href: '/admin/landing' },
        { icon: <Settings size={20} />, label: 'Ajustes del Sistema', href: '/admin/config' },
      ],
    },
  ];

  const cursosFiltrados = cursos.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || 'Admin'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Gestión de Cursos"
      headerSubtitle="Administración de programas e inscripciones"
    >
      <div className="space-y-8">

        <div>
          <button
            onClick={() => navigate('/admin/cursos/crear')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-jc-blue to-[#043360] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={20} className="mr-2" /> Crear Nuevo Curso
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Listado de Programas</h2>
            <input
              type="text"
              placeholder="Buscar curso..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Curso</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Inscritos</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Cargando cursos...</td></tr>
                ) : cursosFiltrados.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">No se encontraron cursos</td></tr>
                ) : (
                  cursosFiltrados.map((curso, idx) => (
                    <FilaCurso
                      key={curso.id}
                      curso={curso}
                      colorAvatar={COLORES_AVATAR[idx % COLORES_AVATAR.length]}
                      onVer={()      => handleOpenVer(curso)}
                      onEditar={()   => handleOpenEditar(curso)}
                      onEliminar={()  => handleEliminarCurso(curso.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {cursoSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {isEditMode ? <Pencil size={18} className="text-amber-500" /> : <Eye size={18} className="text-jc-blue" />}
                {isEditMode ? 'Gestionar Curso' : 'Detalles del Curso'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {isEditMode ? (
                <>
                  <div className="space-y-4">
                    <Input
                      label="Nombre del Curso"
                      value={cursoSeleccionado.nombre}
                      onChange={e => setCursoSeleccionado({ ...cursoSeleccionado, nombre: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Horas"
                        type="number"
                        value={cursoSeleccionado.horas_totales}
                        onChange={e => setCursoSeleccionado({ ...cursoSeleccionado, horas_totales: Number(e.target.value) })}
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                        <select
                          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-jc-blue/20 bg-white"
                          value={cursoSeleccionado.estado}
                          onChange={e => setCursoSeleccionado({ ...cursoSeleccionado, estado: e.target.value as Curso['estado'] })}
                        >
                          <option value="activo">Activo</option>
                          <option value="borrador">Borrador</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Inscripción */}
                  <div className="pt-5 border-t-2 border-dashed border-slate-100">
                    <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2 mb-4">
                      <UserPlus size={18} className="text-jc-blue" /> Inscripción de Alumnos
                    </h4>

                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                      <button
                        type="button"
                        onClick={() => { setModoAsignacion('individual'); setEstudianteIdSel(''); setBusquedaManual(''); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${modoAsignacion === 'individual' ? 'bg-white shadow-sm text-jc-blue' : 'text-slate-500'}`}
                      >
                        Individual
                      </button>
                      <button
                        type="button"
                        onClick={() => { setModoAsignacion('masivo'); setEstudianteIdSel(''); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${modoAsignacion === 'masivo' ? 'bg-white shadow-sm text-jc-blue' : 'text-slate-500'}`}
                      >
                        Por Código (Masivo)
                      </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex gap-2">
                        {modoAsignacion === 'individual' ? (
                          <div className="flex-1 relative">
                            <div className="relative">
                              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                              <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg p-2.5 pl-9 text-sm outline-none focus:ring-2 focus:ring-jc-blue/20 bg-white"
                                placeholder="Buscar nombre o RUT..."
                                value={busquedaManual}
                                onChange={e => { setBusquedaManual(e.target.value); setEstudianteIdSel(''); }}
                              />
                            </div>
                            {estudiantesFiltradosBusqueda.length > 0 && !estudianteIdSel && (
                              <div className="absolute z-[110] left-0 right-0 top-11 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                                {estudiantesFiltradosBusqueda.map(est => (
                                  <button
                                    key={est.id}
                                    onClick={() => { setEstudianteIdSel(est.id.toString()); setBusquedaManual(`${est.nombre_completo} (${est.rut_completo})`); }}
                                    className="w-full text-left p-3 hover:bg-slate-50 text-xs border-b last:border-0 flex flex-col"
                                  >
                                    <span className="font-bold text-slate-700">{est.nombre_completo}</span>
                                    <span className="text-slate-400">{est.rut_completo}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm outline-none bg-white"
                            placeholder="Ej: ENJOY-01"
                            value={codigoEmpInput}
                            onChange={e => setCodigoEmpInput(e.target.value)}
                          />
                        )}
                        <Button
                          type="button"
                          onClick={handleAsignarEstudiantes}
                          isLoading={asignando}
                          disabled={modoAsignacion === 'individual' ? !estudianteIdSel : !codigoEmpInput}
                          className="px-6"
                        >
                          Inscribir
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-800">{cursoSeleccionado.nombre}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Inscritos</p>
                      <p className="font-bold text-jc-blue">{cursoSeleccionado.total_inscritos || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">SENCE</p>
                      <p className="font-bold text-jc-calipso">{cursoSeleccionado.codigo_sence_data?.codigo || '---'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{cursoSeleccionado.descripcion}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">
              {isEditMode ? (
                <>
                  {confirmandoModal ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600 font-medium">¿Confirmar?</span>
                      <button
                        onClick={() => { setConfirmandoModal(false); handleEliminarCurso(cursoSeleccionado.id); }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setConfirmandoModal(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold transition"
                    >
                      <Trash2 size={15} /> Eliminar Curso
                    </button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleCloseModal}>Cerrar</Button>
                    <Button variant="ghost" onClick={() => { handleCloseModal(); navigate(`/admin/cursos/${cursoSeleccionado.id}/editar`); }}>
                      Edición avanzada
                    </Button>
                    <Button onClick={handleGuardarCambios} isLoading={isSaving}>
                      <Save size={16} className="mr-2" /> Guardar Cambios
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="w-full" onClick={() => setIsEditMode(true)}>Gestionar Programa</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}