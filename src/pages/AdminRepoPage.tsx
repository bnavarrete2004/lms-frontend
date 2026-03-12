// src/pages/AdminRepoPage.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, User, BarChart3,
  FolderTree, FileText, Search, X, Download, Eye, Pencil, 
  Trash2, Video, FileArchive, Save, Globe, 
  Upload, CloudUpload, CheckCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

interface Material {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  archivo_url: string;
  archivo_size?: number;
  created_at: string;
  estado: 'pendiente' | 'en_diseno' | 'aprobado' | 'rechazado' | 'cambios_solicitados';
  relator_autor_nombre?: string;
}

export function AdminRepoPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de datos
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estados para Edición y Subida Final (Maquetación)
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [materialParaDiseno, setMaterialParaDiseno] = useState<Material | null>(null);
  const [archivoFinal, setArchivoFinal] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const mRes = await api.get('/materiales/');
      setMateriales(mRes.data?.results || mRes.data || []);
    } catch (error) {
      console.error("Error cargando repositorio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const materialesFiltrados = useMemo(() => {
    return materiales.filter(m => {
      const cumpleBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || m.id.toString() === busqueda;
      const cumpleEstado = filtroEstado === '' || m.estado === filtroEstado;
      return cumpleBusqueda && cumpleEstado;
    });
  }, [materiales, busqueda, filtroEstado]);

  const counts = {
    total: materiales.length,
    enDiseno: materiales.filter(m => m.estado === 'en_diseno').length,
    aprobados: materiales.filter(m => m.estado === 'aprobado').length,
  };

  // Estado para confirmación
  const [materialAEliminar, setMaterialAEliminar] = useState<Material | null>(null);

  // Handler simplificado (sin confirm)
  const handleEliminar = async () => {
    if (!materialAEliminar) return;
    try {
      await api.delete(`/materiales/${materialAEliminar.id}/`);
      setMateriales((prev) => prev.filter((m) => m.id !== materialAEliminar.id));
      setMaterialAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
      setMaterialAEliminar(null);
    }
  };

  // ── HANDLER: MAQUETAR (Evita duplicados) ──
  const handleGuardarDisenoFinal = async () => {
    if (!materialParaDiseno || !archivoFinal) return;
    
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', archivoFinal);

      // LLAMADA DIRECTA AL ID: Esto pisa el archivo y evita el archivo "fantasma"
      await api.post(`/materiales/${materialParaDiseno.id}/subir_version_final/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("✓ Versión oficial maquetada y reemplazada correctamente.");
      setMaterialParaDiseno(null);
      setArchivoFinal(null);
      await cargarDatos(); 
    } catch (error) {
      console.error("Error al subir final:", error);
      alert("Error al procesar el archivo final.");
    } finally {
      setIsSaving(false);
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
      await cargarDatos();
      setMaterialEditando(null);
      alert("Metadatos actualizados");
    } catch {
      alert("Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  const getFileIcon = (tipo: string) => {
    if (tipo === 'video') return <Video className="text-red-600" size={20} />;
    return <FileText className="text-blue-600" size={20} />;
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
        { icon: <User size={20} />, label: 'Mi Perfil', href: '/admin/config' },
      ],
    },
  ];

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || 'Admin'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      onNotificationClick={() => navigate('/admin/notificaciones')}
      headerTitle="Repositorio de Archivos"
      headerSubtitle="Gestión centralizada del material académico oficial"
    >
      <div className="space-y-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatMiniCard icon={<FolderTree className="text-blue-600" />} count={counts.total} label="Total Archivos" color="bg-blue-50" />
            <StatMiniCard icon={<Pencil className="text-amber-600" />} count={counts.enDiseno} label="Faltan Maquetar" color="bg-amber-50" />
            <StatMiniCard icon={<CheckCircle className="text-green-600" />} count={counts.aprobados} label="Oficiales Listos" color="bg-green-50" />
            <StatMiniCard icon={<FileArchive className="text-slate-600" />} count={formatSize(materiales.reduce((acc, m) => acc + (m.archivo_size || 0), 0))} label="Peso Total" color="bg-slate-50" />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20"
                        placeholder="Buscar por nombre o ID..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <select 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20 bg-white"
                    value={filtroEstado} 
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="">Cualquier estado</option>
                    <option value="en_diseno">Mesa de Diseño (Falta Maquetar)</option>
                    <option value="aprobado">Oficial (Listo para Cursos)</option>
                    <option value="pendiente">Nuevo (De Relator)</option>
                </select>
                <Button variant="ghost" onClick={() => { setBusqueda(''); setFiltroEstado(''); }}>
                    <X size={14} className="mr-2" /> Limpiar
                </Button>
            </div>
        </div>

        {/* Tabla principal */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Archivo</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Autor</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-10 text-center text-slate-400">Cargando repositorio...</td></tr>
                        ) : materialesFiltrados.length === 0 ? (
                            <tr><td colSpan={4} className="p-10 text-center text-slate-400">Sin resultados</td></tr>
                        ) : materialesFiltrados.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            {getFileIcon(m.tipo)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700">{m.nombre}</p>
                                            <p className="text-[10px] text-slate-400 font-black">ID: #{m.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <BadgeStatus estado={m.estado} />
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-600 font-medium">{m.relator_autor_nombre || 'Admin'}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                        {/* Vista Previa */}
                                        <a href={m.archivo_url} target="_blank" rel="noreferrer" className="p-2 text-jc-blue hover:bg-blue-50 rounded-lg transition" title="Abrir archivo">
                                            <Eye size={18} />
                                        </a>
                                        
                                        {/* Descarga Forzada Cloudinary */}
                                        <button 
                                            onClick={() => {
                                                const downloadUrl = m.archivo_url.replace('/upload/', '/upload/fl_attachment/');
                                                window.open(downloadUrl, '_blank');
                                            }}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                            title="Descargar para maquetar"
                                        >
                                            <Download size={18} />
                                        </button>

                                        {/* Botón Maquetar */}
                                        {m.estado === 'en_diseno' && m.tipo !== 'video' && m.tipo !== 'scorm' &&  (
                                            <button 
                                                onClick={() => setMaterialParaDiseno(m)}
                                                className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-1.5 shadow-sm"
                                            >
                                                <Upload size={14} />
                                                <span className="text-[10px] font-bold uppercase">Maquetar</span>
                                            </button>
                                        )}

                                        <button onClick={() => setMaterialEditando(m)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition"><Pencil size={18} /></button>
                                        
                                        {/* BOTÓN ELIMINAR REFORZADO */}
                                        <button 
                                        type="button"
                                        onClick={() => {
                                          console.log("Click en eliminar, material:", m.id);
                                          setMaterialAEliminar(m);
                                          console.log("Estado después de set:", m);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* MODAL: SUBIR DISEÑO FINAL */}
      {materialParaDiseno && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                <div className="flex items-center justify-between px-8 py-5 border-b bg-amber-50">
                    <div className="flex items-center gap-3">
                        <CloudUpload className="text-amber-600" size={24} />
                        <h3 className="font-bold text-slate-800">Cargar Versión Oficial Maquetada</h3>
                    </div>
                    <button onClick={() => setMaterialParaDiseno(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nombre del Material</p>
                        <p className="text-sm font-bold text-slate-700">{materialParaDiseno.nombre}</p>
                    </div>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${archivoFinal ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-jc-blue hover:bg-blue-50'}`}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => setArchivoFinal(e.target.files?.[0] || null)} />
                        {archivoFinal ? (
                            <div className="text-green-600">
                                <CheckCircle size={40} className="mx-auto mb-2" />
                                <p className="font-bold text-sm">{archivoFinal.name}</p>
                            </div>
                        ) : (
                            <div className="text-slate-400">
                                <CloudUpload size={40} className="mx-auto mb-2" />
                                <p className="font-bold text-sm">Selecciona el PDF maquetado</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setMaterialParaDiseno(null)}>Cancelar</Button>
                    <Button 
                        onClick={handleGuardarDisenoFinal} 
                        isLoading={isSaving}
                        disabled={!archivoFinal}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Save size={18} className="mr-2" /> Publicar Diseño Final
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL: EDICIÓN SIMPLE */}
      {materialEditando && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={18} className="text-amber-500" /> Editar Metadatos</h3>
                    <button onClick={() => setMaterialEditando(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <Input label="Nombre" value={materialEditando.nombre} onChange={e => setMaterialEditando({...materialEditando, nombre: e.target.value})} />
                    <textarea 
                        className="w-full border rounded-lg p-3 text-sm outline-none h-24 resize-none" 
                        value={materialEditando.descripcion} 
                        onChange={e => setMaterialEditando({...materialEditando, descripcion: e.target.value})} 
                    />
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setMaterialEditando(null)}>Cancelar</Button>
                    <Button onClick={handleGuardarEdicion} isLoading={isSaving}><Save size={18} className="mr-2" /> Guardar</Button>
                </div>
            </div>
        </div>
      )}
    {materialAEliminar && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <h3 className="font-bold text-slate-800">¿Eliminar archivo?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Esta acción es <strong>permanente</strong> y no se puede deshacer:
              <br/>
              <span className="font-semibold text-slate-800">"{materialAEliminar.nombre}"</span>
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setMaterialAEliminar(null)}>
                Cancelar
              </Button>
              <button 
                onClick={handleEliminar}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition text-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </MainLayout>
  );
}

function BadgeStatus({ estado }: { estado: string }) {
    const config: any = {
        pendiente: { cls: 'bg-slate-100 text-slate-600', label: 'Nuevo' },
        en_diseno: { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Falta Diseño' },
        aprobado:  { cls: 'bg-green-100 text-green-700', label: 'Oficial' },
        rechazado: { cls: 'bg-red-100 text-red-700', label: 'Rechazado' }
    };
    const c = config[estado] || config.pendiente;
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${c.cls}`}>{c.label}</span>;
}

function StatMiniCard({ icon, count, label, color }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-black text-slate-800">{count}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
        </div>
    );
}