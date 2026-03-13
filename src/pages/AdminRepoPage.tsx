// src/pages/AdminRepoPage.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, User, BarChart3,
  FolderTree, FileText, Search, X, Download, Eye, Pencil,
  Trash2, Video, FileArchive, Save, Globe,
  Upload, CloudUpload, CheckCircle, ChevronLeft, ChevronRight,
  FileType, ClipboardList, ExternalLink,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  archivo_url: string;
  archivo_size?: number;
  created_at: string;
  estado: 'pendiente' | 'en_diseno' | 'aprobado' | 'rechazado' | 'cambios_solicitados';
  relator_autor_nombre?: string;
  preguntas?: Pregunta[];
  subcategoria_examen?: 'intermedio' | 'final';
  modulo_destino?: number;
  modulo_destino_nombre?: string;
  curso_destino?: number;
  curso_destino_nombre?: string;
}

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
    default:             return <CheckCircle   className="text-green-600"  size={28} />;
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

// ── PreviewModal (idéntico a AdminRevisionPage / RelatorMaterialesPage) ────────

function PreviewModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const [preguntaActual, setPreguntaActual] = useState(0);

  // Helper para renderizar preguntas (quiz y examen comparten la misma UI)
  const renderPreguntas = (preguntas: any[], accentColor: string) => {
    if (preguntas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
          <ClipboardList size={48} className="opacity-30" />
          <p className="text-sm">Este material no tiene preguntas cargadas.</p>
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
          <div className={`${accentColor} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }} />
        </div>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <p className="text-base font-semibold text-slate-800 leading-relaxed">{p.enunciado}</p>
        </div>
        <div className="space-y-2">
          {p.opciones.map((opcion: string, oidx: number) => {
            const esCorrecta = p.respuesta_correcta === oidx;
            const etiqueta = p.tipo === 'verdadero_falso'
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
                className={`w-2 h-2 rounded-full transition ${i === preguntaActual ? accentColor : 'bg-slate-200 hover:bg-slate-300'}`} />
            ))}
          </div>
          <button onClick={() => setPreguntaActual(p => Math.min(preguntas.length - 1, p + 1))} disabled={preguntaActual === preguntas.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

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
            {renderPreguntas(preguntas, 'bg-purple-500')}
          </div>
        );
      }

      case 'scorm': {
        let preguntas: any[] = [];
        try {
          preguntas = typeof material.preguntas === 'string'
            ? JSON.parse(material.preguntas) : (material.preguntas || []);
        } catch { preguntas = []; }
        return renderPreguntas(preguntas, 'bg-jc-blue');
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
              <button
                onClick={() => {
                  const downloadUrl = material.archivo_url.replace('/upload/', '/upload/fl_attachment/');
                  window.open(downloadUrl, '_blank');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
              >
                <Download size={13} /> Descargar
              </button>
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

export function AdminRepoPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [materialParaDiseno, setMaterialParaDiseno] = useState<Material | null>(null);
  const [materialAEliminar, setMaterialAEliminar] = useState<Material | null>(null);
  const [archivoFinal, setArchivoFinal] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const mRes = await api.get('/materiales/');
      setMateriales(mRes.data?.results || mRes.data || []);
    } catch (error) {
      console.error('Error cargando repositorio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const materialesFiltrados = useMemo(() => {
    return materiales.filter(m => {
      const cumpleBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || m.id.toString() === busqueda;
      const cumpleEstado = filtroEstado === '' || m.estado === filtroEstado;
      return cumpleBusqueda && cumpleEstado;
    });
  }, [materiales, busqueda, filtroEstado]);

  const counts = {
    total:     materiales.length,
    enDiseno:  materiales.filter(m => m.estado === 'en_diseno').length,
    aprobados: materiales.filter(m => m.estado === 'aprobado').length,
  };

  const handleEliminar = async () => {
    if (!materialAEliminar) return;
    try {
      await api.delete(`/materiales/${materialAEliminar.id}/`);
      setMateriales(prev => prev.filter(m => m.id !== materialAEliminar.id));
      setMaterialAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setMaterialAEliminar(null);
    }
  };

  const handleGuardarDisenoFinal = async () => {
    if (!materialParaDiseno || !archivoFinal) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', archivoFinal);
      await api.post(`/materiales/${materialParaDiseno.id}/subir_version_final/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✓ Versión oficial maquetada y reemplazada correctamente.');
      setMaterialParaDiseno(null);
      setArchivoFinal(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al subir final:', error);
      alert('Error al procesar el archivo final.');
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
        descripcion: materialEditando.descripcion,
      });
      await cargarDatos();
      setMaterialEditando(null);
      alert('Metadatos actualizados');
    } catch {
      alert('Error al actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const getFileIconSmall = (tipo: string) => {
    if (tipo === 'video') return <Video className="text-red-600" size={20} />;
    if (tipo === 'scorm' || tipo === 'examen') return <ClipboardList className="text-purple-600" size={20} />;
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
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',     href: '/admin/dashboard' },
        { icon: <FileSearch      size={20} />, label: 'Revisión Material', href: '/admin/revision', badge: '5', badgeVariant: 'danger' as const },
        { icon: <BookOpen        size={20} />, label: 'Gestión Cursos',    href: '/admin/cursos' },
        { icon: <Users           size={20} />, label: 'Usuarios y Roles',  href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3  size={20} />, label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Archivos',  href: '/admin/repositorio', isActive: true },
        { icon: <FileText   size={20} />, label: 'Reportes SENCE',        href: '/admin/reportes' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { icon: <Globe size={20} />, label: 'Contenido Público', href: '/admin/landing' },
        { icon: <User  size={20} />, label: 'Mi Perfil',         href: '/admin/config' },
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
          <StatMiniCard icon={<FolderTree className="text-blue-600" />}   count={counts.total}     label="Total Archivos"    color="bg-blue-50" />
          <StatMiniCard icon={<Pencil className="text-amber-600" />}      count={counts.enDiseno}  label="Faltan Maquetar"   color="bg-amber-50" />
          <StatMiniCard icon={<CheckCircle className="text-green-600" />} count={counts.aprobados} label="Oficiales Listos"  color="bg-green-50" />
          <StatMiniCard icon={<FileArchive className="text-slate-600" />} count={formatSize(materiales.reduce((acc, m) => acc + (m.archivo_size || 0), 0))} label="Peso Total" color="bg-slate-50" />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="text"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20"
                placeholder="Buscar por nombre o ID..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <select
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jc-blue/20 bg-white"
              value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
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

        {/* Tabla */}
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
                          {getFileIconSmall(m.tipo)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{m.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-black">ID: #{m.id} · {getTipoLabel(m.tipo)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><BadgeStatus estado={m.estado} /></td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 font-medium">{m.relator_autor_nombre || 'Admin'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Vista Previa — ahora abre modal */}
                        <button
                          onClick={() => setPreviewMaterial(m)}
                          className="p-2 text-jc-blue hover:bg-blue-50 rounded-lg transition"
                          title="Vista previa"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Descarga (no aplica para quiz/examen) */}
                        {m.tipo !== 'scorm' && m.tipo !== 'examen' && (
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
                        )}

                        {/* Maquetar */}
                        {m.estado === 'en_diseno' && m.tipo !== 'video' && m.tipo !== 'scorm' && (
                          <button
                            onClick={() => setMaterialParaDiseno(m)}
                            className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Upload size={14} />
                            <span className="text-[10px] font-bold uppercase">Maquetar</span>
                          </button>
                        )}

                        <button onClick={() => setMaterialEditando(m)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition">
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setMaterialAEliminar(m)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
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

      {/* ── Modal Vista Previa ── */}
      {previewMaterial && (
        <PreviewModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
      )}

      {/* ── Modal Subir Diseño Final ── */}
      {materialParaDiseno && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
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
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf"
                  onChange={(e) => setArchivoFinal(e.target.files?.[0] || null)} />
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
              <Button onClick={handleGuardarDisenoFinal} isLoading={isSaving} disabled={!archivoFinal}
                className="bg-green-600 hover:bg-green-700 text-white">
                <Save size={18} className="mr-2" /> Publicar Diseño Final
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edición ── */}
      {materialEditando && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={18} className="text-amber-500" /> Editar Metadatos</h3>
              <button onClick={() => setMaterialEditando(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Nombre" value={materialEditando.nombre}
                onChange={e => setMaterialEditando({ ...materialEditando, nombre: e.target.value })} />
              <textarea
                className="w-full border rounded-lg p-3 text-sm outline-none h-24 resize-none"
                value={materialEditando.descripcion}
                onChange={e => setMaterialEditando({ ...materialEditando, descripcion: e.target.value })}
              />
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setMaterialEditando(null)}>Cancelar</Button>
              <Button onClick={handleGuardarEdicion} isLoading={isSaving}><Save size={18} className="mr-2" /> Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Eliminar ── */}
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
                Esta acción es <strong>permanente</strong> y no se puede deshacer:<br />
                <span className="font-semibold text-slate-800">"{materialAEliminar.nombre}"</span>
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setMaterialAEliminar(null)}>Cancelar</Button>
                <button onClick={handleEliminar}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition text-sm">
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

// ── Sub-componentes ───────────────────────────────────────────────────────────

function BadgeStatus({ estado }: { estado: string }) {
  const config: any = {
    pendiente: { cls: 'bg-slate-100 text-slate-600',                         label: 'Nuevo' },
    en_diseno: { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Falta Diseño' },
    aprobado:  { cls: 'bg-green-100 text-green-700',                         label: 'Oficial' },
    rechazado: { cls: 'bg-red-100 text-red-700',                             label: 'Rechazado' },
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