// src/pages/RelatorMaterialesPage.tsx
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
  Eye, 
  Trash2, 
  FileText,  
  XCircle, 
  AlertCircle,
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  PlayCircle,
  X // <--- Ícono agregado para solucionar el error "Cannot find name 'X'"
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Material {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cambios_solicitados';
  archivo_url: string;
  archivo_size?: number;
  created_at: string;
  updated_at: string;
  comentarios_revision?: string;
}

type TabEstado = 'todos' | 'pendiente' | 'aprobado' | 'rechazado';

export function RelatorMaterialesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabEstado>('todos');
  const [busqueda, setBusqueda] = useState('');
  
  const [modalRechazo, setModalRechazo] = useState<{ active: boolean; material: Material | null }>({
    active: false,
    material: null
  });

  const cargarMateriales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materiales/');
      setMateriales(res.data?.results || res.data || []);
    } catch (error) {
      console.error("Error cargando materiales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMateriales();
  }, []);

  const materialesFiltrados = useMemo(() => {
    return materiales.filter(m => {
      const coincideBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = activeTab === 'todos' || m.estado === activeTab;
      return coincideBusqueda && coincideEstado;
    });
  }, [materiales, activeTab, busqueda]);

  const counts = {
    total: materiales.length,
    pendiente: materiales.filter(m => m.estado === 'pendiente').length,
    aprobado: materiales.filter(m => m.estado === 'aprobado').length,
    rechazado: materiales.filter(m => m.estado === 'rechazado' || m.estado === 'cambios_solicitados').length,
  };

  const [materialAEliminar, setMaterialAEliminar] = useState<Material | null>(null);

  const handleEliminar = async () => {
  if (!materialAEliminar) return;
  try {
    await api.delete(`/materiales/${materialAEliminar.id}/`);
    setMateriales(prev => prev.filter(m => m.id !== materialAEliminar.id));
    setMaterialAEliminar(null);
  } catch {
    setMaterialAEliminar(null);
  }
};

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/relator/dashboard' },
        { icon: <FolderOpen size={20} />, label: 'Mis Materiales', href: '/relator/materiales', isActive: true, badge: materiales.length || undefined },
        { icon: <Upload size={20} />, label: 'Subir Material', href: '/relator/subir' },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { icon: <BookOpen size={20} />, label: 'Mis Cursos', href: '/relator/cursos' },
        { icon: <Users size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes' },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas', href: '/relator/stats' },
      ],
    },
    {
        title: 'Cuenta',
        items: [
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones', badge: '3', badgeVariant: 'danger' as const },
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
      headerTitle="Mis Materiales"
      headerSubtitle="Repositorio de tus contenidos"
      headerActions={
        <button 
            onClick={() => navigate('/relator/subir')}
            className="px-6 py-2.5 bg-[#064D91] text-white rounded-lg font-semibold hover:bg-[#265379] transition flex items-center shadow-lg"
        >
            <Upload size={18} className="mr-2" /> Subir Material
        </button>
      }
    >
      <div className="space-y-8">
        
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SummaryCard label="Total" value={counts.total} color="border-slate-200" text="text-slate-800" />
            <SummaryCard label="Pendientes" value={counts.pendiente} color="border-amber-200" text="text-amber-600" />
            <SummaryCard label="Rechazados" value={counts.rechazado} color="border-red-200" text="text-red-600" />
            <SummaryCard label="Publicados" value={counts.aprobado} color="border-green-200" text="text-green-600" />
        </div>

        {/* Tabs de Filtro */}
        <div className="flex gap-2 flex-wrap">
            <TabButton active={activeTab === 'todos'} label={`Todos (${counts.total})`} onClick={() => setActiveTab('todos')} color="bg-[#064D91]" />
            <TabButton active={activeTab === 'pendiente'} label={`Pendientes (${counts.pendiente})`} onClick={() => setActiveTab('pendiente')} color="bg-amber-500" />
            <TabButton active={activeTab === 'rechazado'} label={`Rechazados (${counts.rechazado})`} onClick={() => setActiveTab('rechazado')} color="bg-red-500" />
            <TabButton active={activeTab === 'aprobado'} label={`Publicados (${counts.aprobado})`} onClick={() => setActiveTab('aprobado')} color="bg-green-600" />
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por título..."
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#52A9B7] outline-none"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-end">
                    <Button variant="ghost" onClick={() => {setBusqueda(''); setActiveTab('todos');}}>
                        <Filter size={14} className="mr-2" /> Limpiar Filtros
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
                            <th className="px-6 py-4">Material</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">Cargando...</td></tr>
                        ) : materialesFiltrados.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${m.tipo === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {m.tipo === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700">{m.nombre}</p>
                                            <p className="text-[10px] text-slate-400 font-black">ID: #{m.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="info" className="capitalize">{m.tipo}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge estado={m.estado} />
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(m.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {m.estado === 'rechazado' && (
                                            <button 
                                                onClick={() => setModalRechazo({ active: true, material: m })}
                                                className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded-lg"
                                            >
                                                Ver Motivo
                                            </button>
                                        )}
                                        <a href={m.archivo_url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-jc-blue transition">
                                            <Eye size={18} />
                                        </a>
                                        <button 
                                        onClick={() => setMaterialAEliminar(m)} 
                                        className="p-2 text-slate-400 hover:text-red-600 transition"
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
            <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                <p className="text-xs text-slate-500">Total: {materialesFiltrados.length} archivos</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled><ChevronLeft size={16} /></Button>
                    <Button variant="outline" size="sm" disabled><ChevronRight size={16} /></Button>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL: Motivo de Rechazo */}
      {modalRechazo.active && modalRechazo.material && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-red-100 bg-red-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <XCircle className="text-red-600" size={28} />
                        <div>
                            <h2 className="text-xl font-bold text-red-900">Material Rechazado</h2>
                            <p className="text-sm text-red-700">{modalRechazo.material.nombre}</p>
                        </div>
                    </div>
                    <button onClick={() => setModalRechazo({ active: false, material: null })} className="text-red-400 hover:text-red-600 transition"><X size={24} /></button>
                </div>
                <div className="px-8 py-6">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-500" /> Observaciones:
                    </h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 italic text-slate-700">
                        "{modalRechazo.material.comentarios_revision || 'Sin comentarios adicionales.'}"
                    </div>
                    
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1" onClick={() => setModalRechazo({ active: false, material: null })}>Cerrar</Button>
                        <Button className="flex-1 bg-[#064D91]" onClick={() => navigate('/relator/subir')}>
                            <Upload size={16} className="mr-2" /> Corregir y Re-subir
                        </Button>
                    </div>
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
          <h3 className="font-bold text-slate-800">¿Eliminar material?</h3>
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

function SummaryCard({ label, value, color, text }: any) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border ${color} p-6`}>
            <p className="text-sm font-semibold text-slate-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
        </div>
    );
}

function TabButton({ active, label, onClick, color }: any) {
    return (
        <button 
            onClick={onClick}
            className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase transition-all
            ${active ? `${color} text-white shadow-lg` : 'bg-white text-slate-600 border border-slate-200'}`}
        >
            {label}
        </button>
    );
}

function StatusBadge({ estado }: { estado: string }) {
    const configs: any = {
        aprobado: { cls: 'bg-green-100 text-green-700', label: 'Publicado', dot: 'bg-green-500' },
        pendiente: { cls: 'bg-amber-100 text-amber-700', label: 'Pendiente', dot: 'bg-amber-500' },
        rechazado: { cls: 'bg-red-100 text-red-700', label: 'Rechazado', dot: 'bg-red-500' },
        cambios_solicitados: { cls: 'bg-purple-100 text-purple-700', label: 'Revisión', dot: 'bg-purple-500' }
    };
    const c = configs[estado] || configs.pendiente;
    return (
        <span className={`px-3 py-1 ${c.cls} text-[10px] font-bold uppercase rounded-full flex items-center w-fit`}>
            <span className={`w-1.5 h-1.5 ${c.dot} rounded-full mr-2`}></span>
            {c.label}
        </span>
    );
}