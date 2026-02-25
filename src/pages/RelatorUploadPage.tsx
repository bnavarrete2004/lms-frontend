// src/pages/RelatorUploadPage.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Upload, BookOpen, TrendingUp, Users,
  ChevronLeft, FileText, ClipboardList, CheckCircle2, AlertCircle,
  FileUp, Bell, User, Youtube, Link as LinkIcon,
  Plus, Trash2, ChevronDown, ChevronUp, 
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

type Paso = 1 | 2 | 3 | 4;
type TipoPregunta = 'alternativas' | 'verdadero_falso';

interface Pregunta {
  id: string;
  tipo: TipoPregunta;
  enunciado: string;
  opciones: string[];
  respuesta_correcta: number;
}

const TIPOS_MATERIAL = [
  { id: 'video',        label: 'Video (YouTube)',  icon: <Youtube size={32} />,       color: 'bg-red-100 text-red-600',    desc: 'Links unlisted o públicos' },
  { id: 'pdf',          label: 'PDF / Guía',       icon: <FileText size={32} />,      color: 'bg-blue-100 text-blue-600',  desc: 'Documentos de lectura' },
  { id: 'presentacion', label: 'Presentación',     icon: <ClipboardList size={32} />, color: 'bg-amber-100 text-amber-600',desc: 'PPTX o Slides' },
  { id: 'scorm',        label: 'Quiz Interactivo', icon: <CheckCircle2 size={32} />,  color: 'bg-green-100 text-green-700',desc: 'Preguntas con alternativas' },
];

function generarId() {
  return Math.random().toString(36).slice(2, 9);
}

function nuevaPregunta(): Pregunta {
  return {
    id: generarId(),
    tipo: 'alternativas',
    enunciado: '',
    opciones: ['', '', '', ''],
    respuesta_correcta: 0,
  };
}

function QuizBuilder({ preguntas, onChange }: { preguntas: Pregunta[]; onChange: (ps: Pregunta[]) => void; }) {
  const [expandida, setExpandida] = useState<string | null>(preguntas[0]?.id ?? null);
  const agregar = () => { const nueva = nuevaPregunta(); onChange([...preguntas, nueva]); setExpandida(nueva.id); };
  const eliminar = (id: string) => { const restantes = preguntas.filter(p => p.id !== id); onChange(restantes); if (expandida === id) setExpandida(restantes[restantes.length - 1]?.id ?? null); };
  const actualizar = (id: string, cambios: Partial<Pregunta>) => { onChange(preguntas.map(p => p.id === id ? { ...p, ...cambios } : p)); };
  const cambiarTipo = (id: string, tipo: TipoPregunta) => { actualizar(id, { tipo, opciones: tipo === 'verdadero_falso' ? ['Verdadero', 'Falso'] : ['', '', '', ''], respuesta_correcta: 0 }); };
  const cambiarOpcion = (preguntaId: string, idx: number, valor: string) => { const p = preguntas.find(p => p.id === preguntaId)!; const nuevasOpciones = [...p.opciones]; nuevasOpciones[idx] = valor; actualizar(preguntaId, { opciones: nuevasOpciones }); };

  return (
    <div className="space-y-4">
      {preguntas.map((p, idx) => {
        const abierta = expandida === p.id;
        const completa = p.enunciado.trim() !== '' && (p.tipo === 'verdadero_falso' || p.opciones.every(o => o.trim() !== ''));
        return (
          <div key={p.id} className={`border-2 rounded-xl overflow-hidden transition-all ${completa ? 'border-green-200' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer select-none" onClick={() => setExpandida(abierta ? null : p.id)}>
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${completa ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{completa ? '✓' : idx + 1}</span>
                <span className="text-sm font-semibold text-slate-700 truncate max-w-xs">{p.enunciado.trim() || `Pregunta ${idx + 1}`}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tipo === 'verdadero_falso' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{p.tipo === 'verdadero_falso' ? 'V / F' : 'A/B/C/D'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); eliminar(p.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                {abierta ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>
            {abierta && (
              <div className="px-5 py-5 space-y-4 bg-white">
                <div className="flex gap-3">
                  {(['alternativas', 'verdadero_falso'] as TipoPregunta[]).map(t => (
                    <button key={t} onClick={() => cambiarTipo(p.id, t)} className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition ${p.tipo === t ? 'border-jc-blue bg-blue-50 text-jc-blue' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>{t === 'alternativas' ? 'Alternativas (A/B/C/D)' : 'Verdadero / Falso'}</button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enunciado *</label>
                  <textarea rows={2} className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-jc-blue/20 resize-none" placeholder="Escribe la pregunta aquí..." value={p.enunciado} onChange={e => actualizar(p.id, { enunciado: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Opciones — marca la correcta con el círculo</label>
                  <div className="space-y-2">
                    {p.opciones.map((opcion, oidx) => {
                      const letra = ['A', 'B', 'C', 'D'][oidx];
                      const esCorrecta = p.respuesta_correcta === oidx;
                      return (
                        <div key={oidx} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition ${esCorrecta ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}>
                          <button onClick={() => actualizar(p.id, { respuesta_correcta: oidx })} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition font-bold text-xs ${esCorrecta ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-slate-400 hover:border-green-400'}`}>{esCorrecta ? '✓' : letra}</button>
                          {p.tipo === 'alternativas' ? (
                            <input type="text" className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400" placeholder={`Opción ${letra}...`} value={opcion} onChange={e => cambiarOpcion(p.id, oidx, e.target.value)} />
                          ) : ( <span className="flex-1 text-sm font-medium text-slate-700">{opcion}</span> )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button onClick={agregar} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-jc-blue hover:text-jc-blue hover:bg-blue-50 transition flex items-center justify-center gap-2"><Plus size={18} /> Agregar pregunta</button>
    </div>
  );
}

export function RelatorUploadPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paso, setPaso] = useState<Paso>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([nuevaPregunta()]);

  const [formData, setFormData] = useState({
    nombre:      '',
    descripcion: '',
    tipo:        '',
    categoria:   '',
    tags:        '',
    video_url:   '',
    file:        null as File | null,
  });

  const nextStep = () => setPaso(prev => Math.min(prev + 1, 4) as Paso);
  const prevStep = () => setPaso(prev => Math.max(prev - 1, 1) as Paso);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFormData({ ...formData, file: e.target.files[0] });
  };

  const paso3Valido = () => {
    if (formData.tipo === 'scorm') {
      return preguntas.length > 0 && preguntas.every(p => p.enunciado.trim() !== '' && (p.tipo === 'verdadero_falso' || p.opciones.every(o => o.trim() !== '')));
    }
    if (formData.tipo === 'video') return true;
    return formData.file !== null;
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      if (formData.tipo === 'scorm') {
        await api.post('/upload/material/', { tipo: 'scorm', nombre: formData.nombre, descripcion: formData.descripcion, categoria: formData.categoria, tags: formData.tags, preguntas: preguntas.map(({ id: _id, ...p }) => p) });
      } else {
        const data = new FormData();
        if (formData.file && formData.tipo !== 'video') data.append('file', formData.file);
        data.append('tipo', formData.tipo);
        data.append('nombre', formData.nombre);
        data.append('descripcion', formData.descripcion);
        data.append('categoria', formData.categoria);
        data.append('tags', formData.tags);
        if (formData.tipo === 'video') data.append('archivo_url', formData.video_url);
        await api.post('/upload/material/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      alert('✓ Contenido enviado a revisión.');
      navigate('/relator/materiales');
    } catch (err) {
      console.error(err);
      alert('Error en la carga. Revisa los datos e intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarSections = [
    { title: 'Gestión Docente', items: [ { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/relator/dashboard' }, { icon: <FolderOpen size={20} />, label: 'Mis Materiales', href: '/relator/materiales' }, { icon: <Upload size={20} />, label: 'Subir Material', href: '/relator/subir', isActive: true } ] },
    { title: 'Seguimiento', items: [ { icon: <BookOpen size={20} />, label: 'Mis Cursos', href: '/relator/cursos' }, { icon: <Users size={20} />, label: 'Mis Estudiantes', href: '/relator/estudiantes' }, { icon: <TrendingUp size={20} />, label: 'Estadísticas', href: '/relator/stats' } ] },
    { title: 'Cuenta', items: [ { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones' }, { icon: <User size={20} />, label: 'Mi Perfil', href: '/relator/perfil' } ] }
  ];

  return (
    <MainLayout role="relator" userName={user?.nombre_completo || 'Relator'} sidebarSections={sidebarSections} onLogout={handleLogout} headerTitle="Subir Nuevo Material" headerSubtitle="Publicación de recursos de aprendizaje">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${paso === num ? 'bg-[#064D91] text-white shadow-lg' : paso > num ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{paso > num ? '✓' : num}</div>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 min-h-[400px]">
          {paso === 1 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Paso 1: ¿Qué vas a subir hoy?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TIPOS_MATERIAL.map(t => (
                  <button key={t.id} onClick={() => { setFormData({ ...formData, tipo: t.id }); nextStep(); }} className={`p-6 border-2 rounded-2xl text-left transition-all hover:border-jc-blue group ${formData.tipo === t.id ? 'border-jc-blue bg-blue-50' : 'border-slate-200'}`}>
                    <div className={`${t.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>{t.icon}</div>
                    <h4 className="font-bold text-slate-800">{t.label}</h4>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {paso === 2 && (
            <div className="animate-in fade-in duration-300 space-y-5">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 2: Información general</h2>
              <Input label="Título *" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
              {formData.tipo === 'video' && (
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                  <label className="block text-sm font-bold text-red-800 mb-2 flex items-center gap-2"><LinkIcon size={16} /> Link de YouTube (Obligatorio)</label>
                  <input type="url" className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none" placeholder="https://www.youtube.com/watch?v=..." value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea rows={3} className="w-full border border-slate-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-jc-blue/20 outline-none resize-none" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Categoría" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} />
                <Input label="Tags" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
              </div>
            </div>
          )}
          {paso === 3 && (
            <div className="animate-in fade-in duration-300">
              {formData.tipo === 'scorm' ? (
                <>
                  <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">Paso 3: Construir Quiz</h2><p className="text-slate-500 mt-1">Agrega las preguntas. Haz clic en el círculo de cada opción para marcarla como correcta.</p></div>
                  <QuizBuilder preguntas={preguntas} onChange={setPreguntas} />
                </>
              ) : formData.tipo === 'video' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Youtube size={40} /></div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Video Listo</h2>
                  <p className="text-slate-500">Se ha vinculado el enlace de YouTube correctamente. Pulsa siguiente para revisar el resumen.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 3: Carga de archivo</h2>
                  <p className="text-slate-500 mb-8">Sube el archivo original (PDF, PPTX, etc.)</p>
                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${formData.file ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-jc-blue hover:bg-blue-50'}`}>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.pptx,.docx,.zip" />
                    {formData.file ? (
                      <div className="text-green-600"><CheckCircle2 size={64} className="mx-auto mb-4" /><p className="font-bold">{formData.file.name}</p></div>
                    ) : (
                      <div className="text-slate-400"><FileUp size={64} className="mx-auto mb-4" /><p className="font-bold text-slate-600">Haz click para seleccionar archivo</p></div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          {paso === 4 && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Paso 4: Resumen Final</h2>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                <SummaryItem label="Formato" value={formData.tipo === 'scorm' ? 'QUIZ INTERACTIVO' : formData.tipo.toUpperCase()} />
                <SummaryItem label="Nombre" value={formData.nombre} />
                {formData.tipo === 'video' ? <SummaryItem label="URL YouTube" value={formData.video_url} /> : formData.tipo === 'scorm' ? <SummaryItem label="Preguntas" value={`${preguntas.length} preguntas`} /> : <SummaryItem label="Archivo" value={formData.file?.name || '---'} />}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={22} />
                <p className="text-xs text-amber-800">Tu material quedará en estado de revisión. Te notificaremos una vez que el administrador lo valide para su uso en cursos.</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={prevStep} disabled={paso === 1 || isUploading}><ChevronLeft size={18} className="mr-2" /> Anterior</Button>
          {paso < 4 ? (
            <Button onClick={nextStep} disabled={(paso === 1 && !formData.tipo) || (paso === 2 && (!formData.nombre || (formData.tipo === 'video' && !formData.video_url))) || (paso === 3 && !paso3Valido())}>Siguiente</Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={isUploading} className="bg-green-600 hover:bg-green-700 text-white px-10">Confirmar y Enviar</Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return ( <div className="flex flex-col border-b border-slate-200 pb-2 last:border-0"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span><span className="text-slate-700 font-medium truncate">{value || '---'}</span></div> );
}