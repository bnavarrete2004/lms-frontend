// src/pages/AdminRevisionPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, User, CheckCircle2,
  XCircle, Video, FileType, ClipboardList, Pencil, X,
  ExternalLink, ChevronLeft, ChevronRight, Download, Upload,
  Plus, Trash2, Save,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
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
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  relator_autor_nombre?: string;
  categoria?: string;
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

// ── Modal de Preview ──────────────────────────────────────────────────────────

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

      case 'pdf':
        return (
          <div className="w-full rounded-xl overflow-hidden border border-slate-200">
            <iframe src={`${material.archivo_url}#toolbar=1&navpanes=0`} className="w-full"
              style={{ height: '70vh' }} title={material.nombre} />
          </div>
        );

      case 'presentacion':
      case 'documento': {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(material.archivo_url)}&embedded=true`;
        return (
          <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <iframe src={viewerUrl} className="w-full" style={{ height: '70vh' }} />
            <div className="p-2 text-center">
              <a href={material.archivo_url} target="_blank" className="text-xs text-jc-blue underline">
                Si no visualiza el archivo, haga click aquí para descargar
              </a>
            </div>
          </div>
        );
      }

      case 'examen':
      case 'scorm': {
        let preguntas: any[] = [];
        try {
          preguntas = typeof material.preguntas === 'string'
            ? JSON.parse(material.preguntas) : (material.preguntas || []);
        } catch { preguntas = []; }

        const esExamen = material.tipo === 'examen';
        const barColor = esExamen ? 'bg-purple-500' : 'bg-jc-blue';

        const destino = material.subcategoria_examen === 'intermedio'
          ? `Módulo: ${material.modulo_destino_nombre || `#${material.modulo_destino}`}`
          : material.subcategoria_examen === 'final'
          ? `Curso: ${material.curso_destino_nombre || `#${material.curso_destino}`}`
          : null;

        return (
          <div className="space-y-5">
            {esExamen && destino && (
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
                <p className="text-sm">No hay preguntas cargadas.</p>
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
                  <div className={`${barColor} h-1.5 rounded-full transition-all`}
                    style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }} />
                </div>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <p className="text-base font-semibold text-slate-800 leading-relaxed">
                    {preguntas[preguntaActual].enunciado}
                  </p>
                </div>
                <div className="space-y-2">
                  {preguntas[preguntaActual].opciones.map((opcion: string, oidx: number) => {
                    const esCorrecta = preguntas[preguntaActual].respuesta_correcta === oidx;
                    const etiqueta = preguntas[preguntaActual].tipo === 'verdadero_falso'
                      ? (oidx === 0 ? 'V' : 'F') : ['A','B','C','D'][oidx];
                    return (
                      <div key={oidx} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 ${esCorrecta ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${esCorrecta ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {etiqueta}
                        </span>
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
                        className={`w-2 h-2 rounded-full transition ${i === preguntaActual ? (esExamen ? 'bg-purple-500' : 'bg-jc-blue') : 'bg-slate-200 hover:bg-slate-300'}`} />
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
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${material.tipo === 'video' ? 'bg-red-50' : material.tipo === 'pdf' ? 'bg-blue-50' : material.tipo === 'presentacion' ? 'bg-amber-50' : 'bg-green-50'}`}>
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
              <a href={material.archivo_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">
                <ExternalLink size={13} /> Abrir original
              </a>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{renderContenido()}</div>
      </div>
    </div>
  );
}

// ── Modal de Edición ──────────────────────────────────────────────────────────

function EditarModal({ material, onClose, onGuardado }: {
  material: Material;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const esEditorPreguntas = material.tipo === 'scorm' || material.tipo === 'examen';
  const esArchivo = ['pdf', 'presentacion', 'video', 'documento'].includes(material.tipo);

  const [nombre, setNombre]       = useState(material.nombre);
  const [descripcion, setDescripcion] = useState(material.descripcion || '');
  const [guardando, setGuardando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [nuevaUrlVideo, setNuevaUrlVideo] = useState(material.archivo_url || '');

  // Estado para editor de preguntas
  const [preguntas, setPreguntas] = useState<Pregunta[]>(() => {
    try {
      const raw = material.preguntas;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  });

  // ── Guardar preguntas / nombre ──
  const handleGuardarPreguntas = async () => {
    setGuardando(true);
    try {
      await api.patch(`/materiales/${material.id}/editar_contenido/`, {
        nombre,
        descripcion,
        preguntas,
        ...(material.tipo === 'video' ? { archivo_url: nuevaUrlVideo } : {}),
      });
      onGuardado();
      onClose();
    } catch {
      alert('Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  // ── Subir archivo nuevo (pdf/ppt) ──
  const handleSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoArchivo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/materiales/${material.id}/subir_version_final/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Guardar nombre/descripción
      await api.patch(`/materiales/${material.id}/editar_contenido/`, { nombre, descripcion });
      onGuardado();
      onClose();
    } catch {
      alert('Error al subir el archivo.');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  // ── Helpers para editar preguntas ──
  const agregarPregunta = () => {
    setPreguntas(prev => [...prev, {
      tipo: 'alternativas',
      enunciado: '',
      opciones: ['', '', '', ''],
      respuesta_correcta: 0,
    }]);
  };

  const eliminarPregunta = (idx: number) => {
    setPreguntas(prev => prev.filter((_, i) => i !== idx));
  };

  const actualizarPregunta = (idx: number, campo: keyof Pregunta, valor: any) => {
    setPreguntas(prev => prev.map((p, i) => i === idx ? { ...p, [campo]: valor } : p));
  };

  const actualizarOpcion = (pidx: number, oidx: number, valor: string) => {
    setPreguntas(prev => prev.map((p, i) => {
      if (i !== pidx) return p;
      const ops = [...p.opciones];
      ops[oidx] = valor;
      return { ...p, opciones: ops };
    }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Pencil size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Editar Material</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTipoBadgeColor(material.tipo)}`}>
                {getTipoLabel(material.tipo)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Aviso de estado */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <Pencil size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Al guardar los cambios, el material volverá a estado <strong>Pendiente</strong> y pasará por maquetado antes de publicarse.
            </p>
          </div>

          {/* Nombre y descripción — siempre editables */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del material</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-blue/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-blue/30 resize-none" />
            </div>
          </div>

          {/* ── EDITOR DE PREGUNTAS (quiz/examen) ── */}
          {esEditorPreguntas && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Preguntas ({preguntas.length})</h3>
                <button onClick={agregarPregunta}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-jc-blue text-white rounded-lg text-xs font-bold hover:bg-[#053d73] transition">
                  <Plus size={14} /> Agregar pregunta
                </button>
              </div>

              {preguntas.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                  <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay preguntas. Haz clic en "Agregar pregunta" para comenzar.</p>
                </div>
              )}

              {preguntas.map((p, pidx) => (
                <div key={pidx} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Pregunta {pidx + 1}</span>
                    <div className="flex items-center gap-2">
                      <select value={p.tipo} onChange={e => actualizarPregunta(pidx, 'tipo', e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none">
                        <option value="alternativas">Alternativas</option>
                        <option value="verdadero_falso">Verdadero / Falso</option>
                      </select>
                      <button onClick={() => eliminarPregunta(pidx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <textarea value={p.enunciado} onChange={e => actualizarPregunta(pidx, 'enunciado', e.target.value)}
                    placeholder="Escribe el enunciado de la pregunta..." rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-jc-blue/30 resize-none" />

                  <div className="space-y-2">
                    {(p.tipo === 'verdadero_falso' ? ['Verdadero', 'Falso'] : p.opciones).map((opcion, oidx) => {
                      const esCorrecta = p.respuesta_correcta === oidx;
                      const etiqueta = p.tipo === 'verdadero_falso' ? (oidx === 0 ? 'V' : 'F') : ['A','B','C','D'][oidx];
                      return (
                        <div key={oidx} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition ${esCorrecta ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white'}`}>
                          <button onClick={() => actualizarPregunta(pidx, 'respuesta_correcta', oidx)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${esCorrecta ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-green-100'}`}
                            title="Marcar como correcta">
                            {etiqueta}
                          </button>
                          {p.tipo === 'verdadero_falso' ? (
                            <span className="text-sm text-slate-700 flex-1">{opcion}</span>
                          ) : (
                            <input type="text" value={opcion as string}
                              onChange={e => actualizarOpcion(pidx, oidx, e.target.value)}
                              placeholder={`Opción ${etiqueta}`}
                              className="flex-1 text-sm bg-transparent outline-none" />
                          )}
                          {esCorrecta && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Correcta</span>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400">Haz clic en la letra de la opción para marcarla como correcta.</p>
                </div>
              ))}
            </div>
          )}

          {/* ── REEMPLAZO DE ARCHIVO (pdf/ppt/video) ── */}
          {esArchivo && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Reemplazar Archivo</h3>

              {/* Archivo actual */}
              {material.archivo_url && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  {getFileIcon(material.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">Archivo actual</p>
                    <p className="text-xs text-slate-400 truncate">{material.archivo_url}</p>
                  </div>
                  <a href={material.archivo_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition flex-shrink-0">
                    <Download size={13} /> Descargar
                  </a>
                </div>
              )}

              {material.tipo === 'video' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nueva URL de YouTube</label>
                    <input
                      type="url"
                      value={nuevaUrlVideo}
                      onChange={e => setNuevaUrlVideo(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-blue/30"
                    />
                  </div>
                </div>
              )}

              {material.tipo !== 'video' && (
                <>
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-jc-blue hover:bg-blue-50 transition-colors">
                    {subiendoArchivo ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-jc-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500">Subiendo archivo...</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="text-slate-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">Haz clic para subir el nuevo archivo</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {material.tipo === 'pdf' ? 'PDF' : 'PPT, PPTX, PDF'}
                        </p>
                      </>
                    )}
                    <input type="file" className="hidden"
                      accept={material.tipo === 'pdf' ? '.pdf' : '.ppt,.pptx,.pdf'}
                      onChange={handleSubirArchivo}
                      disabled={subiendoArchivo} />
                  </label>
                  <p className="text-xs text-slate-400 text-center">
                    Al subir el nuevo archivo, los cambios se guardan automáticamente y el material vuelve a <strong>Pendiente</strong>.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-300 transition">
            Cancelar
          </button>
          {(esEditorPreguntas || material.tipo === 'video') && (
            <button onClick={handleGuardarPreguntas} disabled={guardando}
              className="px-5 py-2 bg-jc-blue text-white rounded-lg font-semibold text-sm hover:bg-[#053d73] transition disabled:opacity-50 flex items-center gap-2">
              {guardando ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              Guardar Cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AdminRevisionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [materiales, setMateriales]           = useState<Material[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [editarMaterial, setEditarMaterial]   = useState<Material | null>(null);
  const [materialAprobar, setMaterialAprobar] = useState<Material | null>(null);
  const [modalRechazo, setModalRechazo]       = useState<{ active: boolean; id: number | null }>({ active: false, id: null });
  const [comentario, setComentario]           = useState('');
  const [isProcessing, setIsProcessing]       = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materiales/', { params: { estado: 'pendiente' } });
      setMateriales(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Error al cargar materiales', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleApprove = async () => {
    if (!materialAprobar) return;
    setIsProcessing(true);
    try {
      await api.post(`/materiales/${materialAprobar.id}/aprobar/`);
      setMateriales(prev => prev.filter(m => m.id !== materialAprobar.id));
      setMaterialAprobar(null);
    } catch (err: any) {
      console.error('Error:', err.response?.data);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRechazar = async () => {
    if (!modalRechazo.id || !comentario.trim()) { alert('Por favor ingresa un motivo.'); return; }
    setIsProcessing(true);
    try {
      await api.post(`/materiales/${modalRechazo.id}/rechazar/`, { comentarios: comentario });
      setMateriales(prev => prev.filter(m => m.id !== modalRechazo.id));
      setModalRechazo({ active: false, id: null });
      setComentario('');
    } catch {
      alert('Error al rechazar material.');
    } finally {
      setIsProcessing(false);
    }
  };

  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',     href: '/admin/dashboard' },
        { icon: <FileSearch size={20} />,      label: 'Revisión Material', href: '/admin/revision', isActive: true, badge: materiales.length || undefined, badgeVariant: 'danger' as const, badgeAnimated: true },
        { icon: <BookOpen size={20} />,        label: 'Gestión Cursos',    href: '/admin/cursos' },
        { icon: <Users size={20} />,           label: 'Usuarios y Roles',  href: '/admin/usuarios' },
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
      headerTitle="Revisión de Material"
      headerSubtitle="Validación de contenido enviado por relatores"
    >
      <div className="space-y-6">

        {/* Resumen */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <SummaryItem value={materiales.length} label="Pendientes de revisión" color="text-red-600" />
            <SummaryItem value={materiales.filter(m => m.tipo === 'examen' || m.tipo === 'scorm').length} label="Evaluaciones pendientes" color="text-purple-600" />
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-20 text-center text-slate-400 font-medium italic">Consultando base de datos...</div>
          ) : materiales.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <CheckCircle2 size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-semibold">No hay materiales pendientes por revisar</p>
            </div>
          ) : (
            materiales.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-jc-blue/30 transition-all">
                <div className="p-6">
                  <div className="flex items-start space-x-5">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${m.tipo === 'video' ? 'bg-red-50' : m.tipo === 'pdf' ? 'bg-blue-50' : m.tipo === 'presentacion' ? 'bg-amber-50' : 'bg-green-50'}`}>
                      {getFileIcon(m.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{m.nombre}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTipoBadgeColor(m.tipo)}`}>
                              {getTipoLabel(m.tipo)}
                            </span>
                            {m.tipo === 'examen' && m.subcategoria_examen && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                {m.subcategoria_examen === 'intermedio'
                                  ? `📋 Módulo: ${m.modulo_destino_nombre || `#${m.modulo_destino}`}`
                                  : `🎓 Curso: ${m.curso_destino_nombre || `#${m.curso_destino}`}`}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              ID: #{m.id} {m.archivo_size ? `• ${(m.archivo_size / 1024 / 1024).toFixed(1)} MB` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 text-[10px] font-bold uppercase rounded-full">Pendiente</span>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-5">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curso / Área</p>
                          <p className="text-sm font-semibold text-slate-700">{m.categoria || 'Sin Categoría'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Autoría</p>
                          <p className="text-sm font-bold text-jc-blue">{m.relator_autor_nombre || 'Relator'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Envío</p>
                          <p className="text-sm font-semibold text-slate-700">{new Date(m.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4 mb-5 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nota del Relator:</p>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{m.descripcion || 'Sin descripción adicional.'}"</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setPreviewMaterial(m)}
                          className="px-5 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition flex items-center gap-2">
                          <FileSearch size={14} /> Vista Previa
                        </button>
                        <button onClick={() => setMaterialAprobar(m)}
                          className="px-5 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition flex items-center gap-2">
                          <CheckCircle2 size={14} /> Aprobar
                        </button>
                        <button onClick={() => setEditarMaterial(m)}
                          className="px-5 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition flex items-center gap-2">
                          <Pencil size={14} /> Editar
                        </button>
                        <button onClick={() => setModalRechazo({ active: true, id: m.id })}
                          className="px-5 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition flex items-center gap-2">
                          <XCircle size={14} /> Rechazar
                        </button>
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
      {previewMaterial && <PreviewModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />}

      {editarMaterial && (
        <EditarModal
          material={editarMaterial}
          onClose={() => setEditarMaterial(null)}
          onGuardado={() => { setEditarMaterial(null); cargarDatos(); }}
        />
      )}

      {/* Modal Rechazo */}
      {modalRechazo.active && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[4px]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
            <h2 className="text-xl font-bold text-red-600 border-b pb-4 mb-4">Rechazar Material</h2>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo del rechazo:</label>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none resize-none"
              placeholder="Escribe aquí las observaciones para el relator..." />
            <div className="mt-6 flex gap-3">
              <button onClick={handleRechazar} disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold disabled:opacity-50">
                {isProcessing ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
              <button onClick={() => { setModalRechazo({ active: false, id: null }); setComentario(''); }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aprobar */}
      {materialAprobar && (() => {
        const esEvaluacion = materialAprobar.tipo === 'examen' || materialAprobar.tipo === 'scorm';
        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[4px]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={20} />
                </div>
                <h3 className="font-bold text-slate-800">¿Aprobar este material?</h3>
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-3">"{materialAprobar.nombre}"</p>
              {esEvaluacion ? (
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-6">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">
                    {materialAprobar.tipo === 'examen' ? '✅ Examen' : '✅ Quiz'} — Activación directa
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {materialAprobar.tipo === 'examen'
                      ? 'El examen no requiere maquetado. Al aprobar quedará activo en el curso.'
                      : 'El quiz no requiere maquetado. Al aprobar quedará activo en la lección.'}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">📐 Pasará a Mesa de Diseño</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    El material irá a <strong>Repositorio → Mesa de Diseño</strong> para ser maquetado antes de publicarse.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setMaterialAprobar(null)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm">
                  Cancelar
                </button>
                <button onClick={handleApprove} disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm disabled:opacity-50">
                  {isProcessing ? 'Aprobando...' : 'Sí, aprobar'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </MainLayout>
  );
}

function SummaryItem({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}