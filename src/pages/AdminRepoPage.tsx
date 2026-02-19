// src/pages/AdminRepoPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Search, 
  X, Download, Eye, Pencil, Trash2, Video, ClipboardCheck, 
  Presentation, FileArchive, Save, Globe, Settings
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Material {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  archivo_url: string;
  archivo_size?: number;
  created_at: string;
  estado: string;
  subido_por_nombre?: string;
}

interface Curso {
  id: number;
  nombre: string;
}

export function AdminRepoPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de datos
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');

  // Estados para Edición
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Carga de Datos ──────────────────────────────────────────────────────────
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mRes, cRes] = await Promise.all([
        api.get('/materiales/'),
        api.get('/cursos/')
      ]);
      setMateriales(mRes.data?.results || mRes.data || []);
      setCursos(cRes.data?.results || cRes.data || []);
    } catch (error) {
      console.error("Error cargando repositorio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ── Lógica de Filtros ───────────────────────────────────────────────────────
  const materialesFiltrados = useMemo(() => {
    return materiales.filter(m => {
      const cumpleBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleTipo = filtroTipo === '' || m.tipo === filtroTipo;
      // Filtrado por curso (si se implementa relación directa en el futuro)
      const cumpleCurso = filtroCurso === '' || (m as any).curso_id === parseInt(filtroCurso);
      
      return cumpleBusqueda && cumpleTipo && cumpleCurso;
    });
  }, [materiales, busqueda, filtroTipo, filtroCurso]);

  const counts = {
    videos: materiales.filter(m => m.tipo === 'video').length,
    pdfs: materiales.filter(m => m.tipo === 'pdf').length,
    quizzes: materiales.filter(m => m.tipo === 'scorm').length,
    presentaciones: materiales.filter(m => m.tipo === 'presentacion').length,
    total: materiales.length
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/materiales/${id}/`);
      setMateriales(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      alert("Error al intentar eliminar el archivo.");
    }
  };

  const handleGuardarEdicion = async () => {
    if (!materialEditando) return;
    setIsSaving(true);
    try {
      await api.patch(`/materiales/${materialEditando.id}/`, {
        nombre: materialEditando.nombre,
        descripcion: materialEditando.descripcion
      });
      setMateriales(prev => prev.map(m => m.id === materialEditando.id ? materialEditando : m));
      setMaterialEditando(null);
      alert("Cambios guardados");
    } catch (error) {
      alert("Error al actualizar metadatos");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportar = () => {
    alert(`Exportando inventario de ${materialesFiltrados.length} archivos...`);
  };

  // ── Helpers Visuales ────────────────────────────────────────────────────────

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <Video className="text-red-600" size={20} />;
      case 'pdf': return <FileText className="text-blue-600" size={20} />;
      case 'presentacion': return <Presentation className="text-amber-600" size={20} />;
      case 'scorm': return <ClipboardCheck className="text-purple-600" size={20} />;
      default: return <FileArchive className="text-slate-600" size={20} />;
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '---';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General', href: '/admin/dashboard' },
        { icon: <FileSearch size={20} />, label: 'Revisión Material', href: '/admin/revision', badge: '5', badgeVariant: 'danger' as const },
        { icon: <BookOpen size={20} />, label: 'Gestión Cursos', href: '/admin/cursos' },
        { icon: <Users size={20} />, label: 'Usuarios y Roles', href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3 size={20} />, label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Archivos', href: '/admin/repositorio', isActive: true },
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

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || 'Admin'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Repositorio de Archivos"
      headerSubtitle="Gestión centralizada del material académico"
    >
      <div className="space-y-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatMiniCard icon={<Video className="text-red-600" />} count={counts.videos} label="Videos" color="bg-red-50" />
            <StatMiniCard icon={<FileText className="text-blue-600" />} count={counts.pdfs} label="Guías PDF" color="bg-blue-50" />
            <StatMiniCard icon={<ClipboardCheck className="text-purple-600" />} count={counts.quizzes} label="SCORM/Quiz" color="bg-purple-50" />
            <StatMiniCard icon={<Presentation className="text-amber-600" />} count={counts.presentaciones} label="Presentaciones" color="bg-amber-50" />
            <StatMiniCard icon={<FolderTree className="text-green-600" />} count={counts.total} label="Total Archivos" color="bg-green-50" />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Búsqueda rápida</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20"
                            placeholder="Nombre del archivo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
                    <select 
                        className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value="">Cualquiera</option>
                        <option value="video">Videos</option>
                        <option value="pdf">Documentos PDF</option>
                        <option value="presentacion">Presentaciones</option>
                        <option value="scorm">Módulos SCORM</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Curso</label>
                    <select 
                        className="w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20"
                        value={filtroCurso}
                        onChange={(e) => setFiltroCurso(e.target.value)}
                    >
                        <option value="">Todos los cursos</option>
                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => { setBusqueda(''); setFiltroTipo(''); setFiltroCurso(''); }}>
                    <X size={14} className="mr-2" /> Limpiar Filtros
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleExportar}>
                    <Download size={14} className="mr-2" /> Exportar Inventario
                </Button>
            </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Archivo</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Subido por</th>
                            <th className="px-6 py-4 text-center">Peso</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Consultando base de datos...</td></tr>
                        ) : materialesFiltrados.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400">Sin resultados</td></tr>
                        ) : materialesFiltrados.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">{getFileIcon(m.tipo)}</div>
                                        <div>
                                            <p className="font-bold text-slate-700">{m.nombre}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-black">ID: {m.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="info" className="capitalize">{m.tipo}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-600">{m.subido_por_nombre || 'Relator'}</span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600 font-medium">{formatSize(m.archivo_size)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                        <a href={m.archivo_url} target="_blank" rel="noreferrer" className="p-2 text-jc-blue hover:bg-blue-50 rounded-lg transition"><Eye size={18} /></a>
                                        <button onClick={() => setMaterialEditando({...m})} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"><Pencil size={18} /></button>
                                        <button onClick={() => handleEliminar(m.id, m.nombre)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* MODAL EDICIÓN */}
      {materialEditando && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={18} className="text-amber-500" /> Editar Metadatos</h3>
                    <button onClick={() => setMaterialEditando(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <Input label="Nombre del Archivo" value={materialEditando.nombre} onChange={e => setMaterialEditando({...materialEditando, nombre: e.target.value})} />
                    <label className="block text-sm font-medium text-slate-700">Descripción</label>
                    <textarea className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-jc-blue/20 outline-none min-h-[100px] resize-none" value={materialEditando.descripcion} onChange={e => setMaterialEditando({...materialEditando, descripcion: e.target.value})} />
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setMaterialEditando(null)}>Cancelar</Button>
                    <Button onClick={handleGuardarEdicion} isLoading={isSaving}><Save size={18} className="mr-2" /> Guardar</Button>
                </div>
            </div>
        </div>
      )}
    </MainLayout>
  );
}

function StatMiniCard({ icon, count, label, color }: { icon: React.ReactNode, count: number, label: string, color: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-slate-800">{count}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
        </div>
    );
}