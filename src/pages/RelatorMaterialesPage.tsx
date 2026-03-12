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
  X,
  Download,
  CheckCircle2,
  Video,
  FileType,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Pregunta {
  tipo: 'alternativas' | 'verdadero_falso';
  enunciado: string;
  opciones: string[];
  respuesta_correcta: number;
}

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
  preguntas?: Pregunta[];
  subcategoria_examen?: 'intermedio' | 'final';
  modulo_destino?: number;
  modulo_destino_nombre?: string;
  curso_destino?: number;
  curso_destino_nombre?: string;
}

type TabEstado = 'todos' | 'pendiente' | 'aprobado' | 'rechazado';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getFileIcon(tipo: string) {
  switch (tipo) {
    case 'video':        return <Video         className="text-red-600"    size={28} />;
    case 'pdf':          return <FileType      className="text-blue-600"   size={28} />;
    case 'presentacion': return <ClipboardList className="text-amber-600"  size={28} />;
    case 'examen':       return <ClipboardList className="text-purple-600" size={28} />;
    default:             return <CheckCircle2  className="text-green-600"  size={28} />;
  }
}

function getTipoBadgeColor(tipo: string) {
  switch (tipo) {
    case 'video':        return 'bg-red-100 text-red-700';
    case 'pdf':          return 'bg-blue-100 text-blue-700';
    case 'presentacion': return 'bg-amber-100 text-amber-700';
    case 'examen':       return 'bg-purple-100 text-purple-700';
    default:             return 'bg-green-100 text-green-700';
  }
}

function getTipoLabel(tipo: string) {
  switch (tipo) {
    case 'video':        return 'Video YouTube';
    case 'pdf':          return 'PDF / Guía';
    case 'presentacion': return 'Presentación';
    case 'scorm':        return 'Quiz Interactivo';
    case 'examen':       return 'Examen';
    default:             return tipo.toUpperCase();
  }
}

// ── Modal de Preview (igual a AdminRevisionPage) ──────────────────────────────

function PreviewModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const [preguntaActual, setPreguntaActual] = useState(0);

  const renderContenido = () => {
    switch (material.tipo) {

      case 'video': {
        const embedUrl = getYoutubeEmbedUrl(material.archivo_url);
        if (!embedUrl) {
          return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
              <Video size={48} className="opacity-30" />
              <p className="text-sm">URL de YouTube no reconocida</p>
              <a href={material.archivo_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition">
                <ExternalLink size={14} /> Abrir en YouTube
              </a>
            </div>
          );
        }
        return (
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe src={embedUrl} className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={material.nombre} />
          </div>
        );
      }

      case 'pdf': {
        if (!material.archivo_url) {
          return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
              <FileType size={48} className="opacity-30" />
              <p className="text-sm">No hay archivo disponible</p>
            </div>
          );
        }
        return (
          <div className="w-full rounded-xl overflow-hidden border border-slate-200">
            <iframe src={`${material.archivo_url}#toolbar=1&navpanes=0`}
              className="w-full" style={{ height: '70vh' }} title={material.nombre} />
          </div>
        );
      }

      case 'presentacion':
      case 'documento': {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(material.archivo_url)}&embedded=true`;
        return (
          <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <iframe src={viewerUrl} className="w-full" style={{ height: '70vh' }} frameBorder="0" />
            <div className="p-2 text-center">
              <a href={material.archivo_url} target="_blank" className="text-xs text-jc-blue underline">
                Si no visualiza el archivo, haga click aquí para descargar
              </a>
            </div>
          </div>
        );
      }

      case 'examen': {
        let preguntas: any[] = [];
        try {
          preguntas = typeof material.preguntas === 'string'
            ? JSON.parse(material.preguntas) : (material.preguntas || []);
        } catch { preguntas = []; }

        const destino = material.subcategoria_examen === 'intermedio'
          ? `Módulo: ${material.modulo_destino_nombre || `#${material.modulo_destino}`}`
          : material.subcategoria_examen === 'final'
          ? `Curso: ${material.curso_destino_nombre || `#${material.curso_destino}`}`
          : null;

        return (
          <div className="space-y-5">
            {destino && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl w-fit">
                <span className="text-purple-600 font-bold text-sm">
                  {material.subcategoria_examen === 'intermedio' ? '📋 Examen Intermedio' : '🎓 Examen Final'}
                </span>
                <span className="text-slate-400 text-xs">—</span>
                <span className="text-slate-600 text-xs font-medium">{destino}</span>
              </div>
            )}
            {preguntas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                <ClipboardList size={48} className="opacity-30" />
                <p className="text-sm">Este examen no tiene preguntas cargadas.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Pregunta {preguntaActual + 1} de {preguntas.length}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${preguntas[preguntaActual].tipo === 'verdadero_falso' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {preguntas[preguntaActual].tipo === 'verdadero_falso' ? 'V / F' : 'A/B/C/D'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }} />
                </div>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <p className="text-base font-semibold text-slate-800 leading-relaxed">{preguntas[preguntaActual].enunciado}</p>
                </div>
                <div className="space-y-2">
                  {preguntas[preguntaActual].opciones.map((opcion: string, oidx: number) => {
                    const esCorrecta = preguntas[preguntaActual].respuesta_correcta === oidx;
                    const etiqueta = preguntas[preguntaActual].tipo === 'verdadero_falso'
                      ? (oidx === 0 ? 'V' : 'F') : ['A', 'B', 'C', 'D'][oidx];
                    return (
                      <div key={oidx} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 ${esCorrecta ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${esCorrecta ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{etiqueta}</span>
                        <span className={`text-sm ${esCorrecta ? 'font-semibold text-green-800' : 'text-slate-700'}`}>{opcion}</span>
                        {esCorrecta && <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Correcta</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setPreguntaActual(p => Math.max(0, p - 1))} disabled={preguntaActual === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <div className="flex gap-1.5">
                    {preguntas.map((_: any, i: number) => (
                      <button key={i} onClick={() => setPreguntaActual(i)}
                        className={`w-2 h-2 rounded-full transition ${i === preguntaActual ? 'bg-purple-500' : 'bg-slate-200 hover:bg-slate-300'}`} />
                    ))}
                  </div>
                  <button onClick={() => setPreguntaActual(p => Math.min(preguntas.length - 1, p + 1))} disabled={preguntaActual === preguntas.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }

      case 'scorm': {
        let preguntas: any[] = [];
        try {
          preguntas = typeof material.preguntas === 'string'
            ? JSON.parse(material.preguntas) : (material.preguntas || []);
        } catch { preguntas = []; }

        if (preguntas.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
              <CheckCircle2 size={48} className="opacity-30" />
              <p className="text-sm">Este quiz no tiene preguntas cargadas en la base de datos.</p>
            </div>
          );
        }

        const p = preguntas[preguntaActual];
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Pregunta {preguntaActual + 1} de {preguntas.length}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tipo === 'verdadero_falso' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {p.tipo === 'verdadero_falso' ? 'V / F' : 'A/B/C/D'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-jc-blue h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }} />
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <p className="text-base font-semibold text-slate-800 leading-relaxed">{p.enunciado}</p>
            </div>
            <div className="space-y-2">
              {p.opciones.map((opcion: string, oidx: number) => {
                const esCorrecta = p.respuesta_correcta === oidx;
                const etiqueta = p.tipo === 'verdadero_falso' ? (oidx === 0 ? 'V' : 'F') : ['A', 'B', 'C', 'D'][oidx];
                return (
                  <div key={oidx} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 ${esCorrecta ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${esCorrecta ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{etiqueta}</span>
                    <span className={`text-sm ${esCorrecta ? 'font-semibold text-green-800' : 'text-slate-700'}`}>{opcion}</span>
                    {esCorrecta && <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Correcta</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))} disabled={preguntaActual === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={16} /> Anterior
              </button>
              <div className="flex gap-1.5">
                {preguntas.map((_: any, i: number) => (
                  <button key={i} onClick={() => setPreguntaActual(i)}
                    className={`w-2 h-2 rounded-full transition ${i === preguntaActual ? 'bg-jc-blue' : 'bg-slate-200 hover:bg-slate-300'}`} />
                ))}
              </div>
              <button onClick={() => setPreguntaActual(prev => Math.min(preguntas.length - 1, prev + 1))} disabled={preguntaActual === preguntas.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <p className="text-sm">Tipo de contenido no soportado para preview</p>
            {material.archivo_url && (
              <a href={material.archivo_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-jc-blue text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">
                <ExternalLink size={14} /> Abrir archivo
              </a>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              material.tipo === 'video' ? 'bg-red-50' :
              material.tipo === 'pdf' ? 'bg-blue-50' :
              material.tipo === 'presentacion' ? 'bg-amber-50' : 'bg-green-50'
            }`}>
              {getFileIcon(material.tipo)}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{material.nombre}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTipoBadgeColor(material.tipo)}`}>
                {getTipoLabel(material.tipo)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {material.archivo_url && material.tipo !== 'scorm' && material.tipo !== 'examen' && (
              <a href={material.archivo_url} download target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
                <Download size={13} /> Descargar
              </a>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>
        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1">
          {renderContenido()}
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────

export function RelatorMaterialesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [eliminadosIds, setEliminadosIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabEstado>('todos');
  const [busqueda, setBusqueda] = useState('');

  const [modalRechazo, setModalRechazo] = useState<{ active: boolean; material: Material | null }>({ active: false, material: null });
  const [modalVista, setModalVista] = useState<Material | null>(null);
  const [materialAEliminar, setMaterialAEliminar] = useState<Material | null>(null);

  const cargarMateriales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materiales/');
      setMateriales(res.data?.results || res.data || []);
    } catch (error) {
      console.error('Error cargando materiales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarMateriales(); }, []);

  const handleEliminarVisual = () => {
    if (!materialAEliminar) return;
    setEliminadosIds(prev => new Set([...prev, materialAEliminar.id]));
    setMaterialAEliminar(null);
  };

  const materialesVisibles = useMemo(
    () => materiales.filter(m => !eliminadosIds.has(m.id)),
    [materiales, eliminadosIds]
  );

  const materialesFiltrados = useMemo(() => {
    return materialesVisibles.filter(m => {
      const coincideBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = activeTab === 'todos' || m.estado === activeTab;
      return coincideBusqueda && coincideEstado;
    });
  }, [materialesVisibles, activeTab, busqueda]);

  const counts = {
    total:     materialesVisibles.length,
    pendiente: materialesVisibles.filter(m => m.estado === 'pendiente').length,
    aprobado:  materialesVisibles.filter(m => m.estado === 'aprobado').length,
    rechazado: materialesVisibles.filter(m => m.estado === 'rechazado' || m.estado === 'cambios_solicitados').length,
  };

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard',      href: '/relator/dashboard' },
        { icon: <FolderOpen      size={20} />, label: 'Mis Materiales', href: '/relator/materiales', isActive: true, badge: materialesVisibles.length || undefined },
        { icon: <Upload          size={20} />, label: 'Subir Material', href: '/relator/subir' },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { icon: <BookOpen   size={20} />, label: 'Mis Cursos',      href: '/relator/cursos' },
        { icon: <Users      size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes' },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas',    href: '/relator/stats' },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { icon: <Bell  size={20} />, label: 'Notificaciones', href: '/relator/notificaciones', badge: '3', badgeVariant: 'danger' as const },
        { icon: <Users size={20} />, label: 'Mi Perfil',      href: '/relator/perfil' },
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
        <button onClick={() => navigate('/relator/subir')}
          className="px-6 py-2.5 bg-[#064D91] text-white rounded-lg font-semibold hover:bg-[#265379] transition flex items-center shadow-lg">
          <Upload size={18} className="mr-2" /> Subir Material
        </button>
      }
    >
      <div className="space-y-8">

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <SummaryCard label="Total"      value={counts.total}     color="border-slate-200" text="text-slate-800" />
          <SummaryCard label="Pendientes" value={counts.pendiente} color="border-amber-200" text="text-amber-600" />
          <SummaryCard label="Rechazados" value={counts.rechazado} color="border-red-200"   text="text-red-600" />
          <SummaryCard label="Publicados" value={counts.aprobado}  color="border-green-200" text="text-green-600" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          <TabButton active={activeTab === 'todos'}     label={`Todos (${counts.total})`}          onClick={() => setActiveTab('todos')}     color="bg-[#064D91]" />
          <TabButton active={activeTab === 'pendiente'} label={`Pendientes (${counts.pendiente})`} onClick={() => setActiveTab('pendiente')} color="bg-amber-500" />
          <TabButton active={activeTab === 'rechazado'} label={`Rechazados (${counts.rechazado})`} onClick={() => setActiveTab('rechazado')} color="bg-red-500" />
          <TabButton active={activeTab === 'aprobado'}  label={`Publicados (${counts.aprobado})`}  onClick={() => setActiveTab('aprobado')}  color="bg-green-600" />
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar por título..."
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#52A9B7] outline-none"
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <div className="flex items-center justify-end">
              <Button variant="ghost" onClick={() => { setBusqueda(''); setActiveTab('todos'); }}>
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
                ) : materialesFiltrados.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">Sin materiales en esta categoría.</td></tr>
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
                      <Badge variant="info" className="capitalize">{getTipoLabel(m.tipo)}</Badge>
                    </td>
                    <td className="px-6 py-4"><StatusBadge estado={m.estado} /></td>
                    <td className="px-6 py-4 text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {m.estado === 'rechazado' && (
                          <button onClick={() => setModalRechazo({ active: true, material: m })}
                            className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded-lg mr-1">
                            Ver Motivo
                          </button>
                        )}
                        <button onClick={() => setModalVista(m)}
                          className="p-2 text-slate-400 hover:text-jc-blue hover:bg-blue-50 rounded-lg transition" title="Vista previa">
                          <Eye size={18} />
                        </button>
                        {m.tipo !== 'scorm' && m.tipo !== 'examen' && (
                          <a href={m.archivo_url} download target="_blank" rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Descargar">
                            <Download size={18} />
                          </a>
                        )}
                        <button onClick={() => setMaterialAEliminar(m)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Quitar de lista">
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

      {/* ── Modal Vista Previa ── */}
      {modalVista && <PreviewModal material={modalVista} onClose={() => setModalVista(null)} />}

      {/* ── Modal Motivo de Rechazo ── */}
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
              <button onClick={() => setModalRechazo({ active: false, material: null })} className="text-red-400 hover:text-red-600 transition">
                <X size={24} />
              </button>
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

      {/* ── Modal Confirmar eliminar visual ── */}
      {materialAEliminar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={20} />
                </div>
                <h3 className="font-bold text-slate-800">¿Quitar de la lista?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-1">El material desaparecerá de tu vista:</p>
              <p className="font-semibold text-slate-800 text-sm mb-4">"{materialAEliminar.nombre}"</p>
              <p className="text-xs text-slate-400 mb-6 bg-slate-50 rounded-lg p-3 border border-slate-200">
                💡 Esto solo lo oculta de tu lista. El archivo sigue existiendo y puede ser restaurado por un administrador.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setMaterialAEliminar(null)}>Cancelar</Button>
                <button onClick={handleEliminarVisual}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition text-sm">
                  Quitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

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
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase transition-all
      ${active ? `${color} text-white shadow-lg` : 'bg-white text-slate-600 border border-slate-200'}`}>
      {label}
    </button>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const configs: any = {
    aprobado:            { cls: 'bg-green-100 text-green-700',   label: 'Publicado', dot: 'bg-green-500' },
    pendiente:           { cls: 'bg-amber-100 text-amber-700',   label: 'Pendiente', dot: 'bg-amber-500' },
    rechazado:           { cls: 'bg-red-100 text-red-700',       label: 'Rechazado', dot: 'bg-red-500' },
    cambios_solicitados: { cls: 'bg-purple-100 text-purple-700', label: 'Revisión',  dot: 'bg-purple-500' },
  };
  const c = configs[estado] || configs.pendiente;
  return (
    <span className={`px-3 py-1 ${c.cls} text-[10px] font-bold uppercase rounded-full flex items-center w-fit`}>
      <span className={`w-1.5 h-1.5 ${c.dot} rounded-full mr-2`}></span>
      {c.label}
    </span>
  );
}