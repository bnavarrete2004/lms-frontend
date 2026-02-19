// src/pages/AdminRevisionPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Settings, CheckCircle2, 
  XCircle, Video, FileType, ClipboardList, Info, Pencil
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
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
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  relator_autor_nombre?: string;
  categoria?: string;
}

export function AdminRevisionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de Datos
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para Modales
  const [modalRechazo, setModalRechazo] = useState<{ active: boolean; id: number | null }>({ active: false, id: null });
  const [modalCambios, setModalCambios] = useState<{ active: boolean; id: number | null }>({ active: false, id: null });
  const [comentario, setComentario] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Carga de Datos ──────────────────────────────────────────────────────────
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materiales/', { params: { estado: 'pendiente' } });
      setMateriales(res.data?.results || res.data || []);
    } catch (err) {
      console.error("Error al cargar materiales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ── Handlers de Acción ──────────────────────────────────────────────────────

  const handleApprove = async (id: number) => {
    if (!window.confirm("¿Aprobar este material?\n\nEstará disponible inmediatamente para los estudiantes.")) return;
    try {
      await api.post(`/materiales/${id}/aprobar/`);
      setMateriales(prev => prev.filter(m => m.id !== id));
      alert(`Material #${id} aprobado exitosamente.`);
    } catch { alert("Error al aprobar."); }
  };

  const handleConfirmAction = async (type: 'rechazar' | 'cambios') => {
    const targetId = type === 'rechazar' ? modalRechazo.id : modalCambios.id;
    if (!targetId || !comentario.trim()) {
        alert("Por favor ingresa un motivo.");
        return;
    }
    setIsProcessing(true);
    try {
      await api.post(`/materiales/${targetId}/rechazar/`, { comentarios: comentario });
      setMateriales(prev => prev.filter(m => m.id !== targetId));
      setModalRechazo({ active: false, id: null });
      setModalCambios({ active: false, id: null });
      setComentario('');
      alert("Acción realizada con éxito.");
    } catch { alert("Error al procesar solicitud."); }
    finally { setIsProcessing(false); }
  };

  // ── Helpers Visuales ────────────────────────────────────────────────────────

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <Video className="text-red-600" size={28} />;
      case 'pdf': return <FileType className="text-blue-600" size={28} />;
      default: return <ClipboardList className="text-purple-600" size={28} />;
    }
  };

  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General', href: '/admin/dashboard' },
        { icon: <FileSearch size={20} />, label: 'Revisión Material', href: '/admin/revision', isActive: true, badge: materiales.length || undefined, badgeVariant: 'danger' as const, badgeAnimated: true },
        { icon: <BookOpen size={20} />, label: 'Gestión Cursos', href: '/admin/cursos' },
        { icon: <Users size={20} />, label: 'Usuarios y Roles', href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3 size={20} />, label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Archivos', href: '/admin/repositorio' },
        { icon: <FileText size={20} />, label: 'Reportes SENCE', href: '/admin/reportes' },
      ],
    },
    {
        title: 'Otros',
        items: [
          { icon: <Globe size={20} />, label: 'Contenido Público', href: '/admin/landing' },
          { icon: <Settings size={20} />, label: 'Configuración', href: '/admin/config' },
        ],
    },
  ];

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || 'Admin'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Revisión de Material"
      headerSubtitle="Validación de contenido enviado por relatores"
    >
      <div className="space-y-6">
        
        {/* Resumen */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="grid grid-cols-4 gap-4">
                <SummaryItem value={materiales.length} label="Pendientes" color="text-red-600" />
                <SummaryItem value="23" label="Aprobados (hoy)" color="text-green-600" />
                <SummaryItem value="3" label="Rechazados (hoy)" color="text-slate-600" />
                <SummaryItem value="2.5h" label="Promedio Revisión" color="text-blue-600" />
            </div>
        </div>

        {/* Lista de Materiales */}
        <div className="space-y-4">
            {loading ? (
                <div className="p-20 text-center text-slate-400 font-medium italic">Consultando base de datos...</div>
            ) : materiales.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-semibold">No hay materiales pendientes por revisar</p>
                </div>
            ) : (
                materiales.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-jc-blue/30 transition-all">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-5 flex-1">
                                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${m.tipo === 'video' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                        {getFileIcon(m.tipo)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">{m.nombre}</h3>
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                                                    ID: #{m.id} • {m.archivo_size ? `${(m.archivo_size / 1024 / 1024).toFixed(1)} MB` : 'S/T'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 text-[10px] font-bold uppercase rounded-full">Pendiente</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curso / Área</p>
                                                <p className="text-sm font-semibold text-slate-700">{m.categoria || 'Sin Categoría'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Autoría</p>
                                                <div className="flex items-center">
                                                    <span className="text-sm font-bold text-jc-blue">{m.relator_autor_nombre || 'Relator'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Envío</p>
                                                <p className="text-sm font-semibold text-slate-700">{new Date(m.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nota del Relator:</p>
                                            <p className="text-sm text-slate-600 leading-relaxed italic">"{m.descripcion || 'Sin descripción adicional.'}"</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <a href={m.archivo_url} target="_blank" rel="noreferrer" className="px-6 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition flex items-center gap-2">
                                                <Info size={14} /> Vista Previa
                                            </a>
                                            <button onClick={() => handleApprove(m.id)} className="px-6 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition flex items-center gap-2">
                                                <CheckCircle2 size={14} /> Aprobar
                                            </button>
                                            <button onClick={() => setModalRechazo({ active: true, id: m.id })} className="px-6 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition flex items-center gap-2">
                                                <XCircle size={14} /> Rechazar
                                            </button>
                                            <button onClick={() => setModalCambios({ active: true, id: m.id })} className="px-6 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition flex items-center gap-2">
                                                <Pencil size={14} /> Pedir Ajustes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Modales */}
      {(modalRechazo.active || modalCambios.active) && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[4px]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden p-6">
                <h2 className={`text-xl font-bold border-b pb-4 mb-4 ${modalRechazo.active ? 'text-red-600' : 'text-amber-600'}`}>
                    {modalRechazo.active ? 'Rechazar Material definitivamente' : 'Solicitar Ajustes al Relator'}
                </h2>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Comentarios para el relator:</label>
                <textarea 
                    value={comentario} 
                    onChange={(e) => setComentario(e.target.value)} 
                    rows={4} 
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none resize-none" 
                    placeholder="Escribe aquí las observaciones..."
                />
                <div className="mt-6 flex gap-3">
                    <button 
                        onClick={() => handleConfirmAction(modalRechazo.active ? 'rechazar' : 'cambios')} 
                        disabled={isProcessing} 
                        className={`flex-1 px-4 py-2 text-white rounded-lg font-bold ${modalRechazo.active ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                    >
                        {isProcessing ? 'Procesando...' : 'Confirmar Acción'}
                    </button>
                    <button 
                        onClick={() => { setModalRechazo({ active: false, id: null }); setModalCambios({ active: false, id: null }); setComentario(''); }} 
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
      )}
    </MainLayout>
  );
}

function SummaryItem({ value, label, color }: { value: string | number, label: string, color: string }) {
    return (
        <div className="text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
}