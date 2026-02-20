// src/pages/RelatorUploadPage.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, 
  FolderOpen, 
  Upload, 
  BookOpen, 
  TrendingUp, 
  Users, 
  ChevronLeft,  
  FileText, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  FileUp,
  Bell,
  User,
  Youtube,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

type Paso = 1 | 2 | 3 | 4;

const TIPOS_MATERIAL = [
  { id: 'video', label: 'Video (YouTube)', icon: <Youtube size={32} />, color: 'bg-red-100 text-red-600', desc: 'Links unlisted o públicos' },
  { id: 'pdf', label: 'PDF / Guía', icon: <FileText size={32} />, color: 'bg-blue-100 text-blue-600', desc: 'Documentos de lectura' },
  { id: 'presentacion', label: 'Presentación', icon: <ClipboardList size={32} />, color: 'bg-amber-100 text-amber-600', desc: 'PPTX o Slides' },
  { id: 'scorm', label: 'SCORM/Quiz', icon: <CheckCircle2 size={32} />, color: 'bg-green-100 text-green-600', desc: 'Contenido interactivo' },
];

export function RelatorUploadPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paso, setPaso] = useState<Paso>(1);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    categoria: '',
    tags: '',
    video_url: '', // Nueva propiedad para el link de YouTube
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const nextStep = () => setPaso((prev) => Math.min(prev + 1, 4) as Paso);
  const prevStep = () => setPaso((prev) => Math.max(prev - 1, 1) as Paso);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.file && formData.tipo !== 'video') return;

    setIsUploading(true);
    const data = new FormData();
    if (formData.file) data.append('file', formData.file);
    data.append('tipo', formData.tipo);
    data.append('nombre', formData.nombre);
    data.append('descripcion', formData.descripcion);
    data.append('categoria', formData.categoria);
    data.append('tags', formData.tags);
    
    // Si es video, enviamos el link en el campo de descripción o metadatos según tu backend
    // Por ahora lo concatenamos o lo enviamos como campo extra
    if (formData.tipo === 'video') {
        data.append('archivo_url', formData.video_url); 
    }

    try {
      await api.post('/upload/material/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('✓ Contenido enviado a revisión.');
      navigate('/relator/materiales');
    } catch (error) {
      console.error(error);
      alert('Error en la carga. Revisa los datos e intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/relator/dashboard' },
        { icon: <FolderOpen size={20} />, label: 'Mis Materiales', href: '/relator/materiales' },
        { icon: <Upload size={20} />, label: 'Subir Material', href: '/relator/subir', isActive: true },
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
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones' },
          { icon: <User size={20} />, label: 'Mi Perfil', href: '/relator/perfil' },
        ],
    },
  ];

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Subir Nuevo Material"
      headerSubtitle="Publicación de recursos de aprendizaje"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Stepper */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  paso === num ? 'bg-[#064D91] text-white shadow-lg' : 
                  paso > num ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-50'
                }`}>
                  {paso > num ? '✓' : num}
                </div>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 min-h-[400px]">
          
          {paso === 1 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Paso 1: ¿Qué vas a subir hoy?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TIPOS_MATERIAL.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => { setFormData({...formData, tipo: t.id}); nextStep(); }}
                    className={`p-6 border-2 rounded-2xl text-left transition-all hover:border-jc-blue group ${formData.tipo === t.id ? 'border-jc-blue bg-blue-50' : 'border-slate-50'}`}
                  >
                    <div className={`${t.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {t.icon}
                    </div>
                    <h4 className="font-bold text-slate-800">{t.label}</h4>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 2: Información general</h2>
              <div className="space-y-4">
                <Input 
                    label="Título" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
                
                {formData.tipo === 'video' && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                        <label className="block text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                            <LinkIcon size={16} /> Link de YouTube (Obligatorio)
                        </label>
                        <input 
                            type="url"
                            className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={formData.video_url}
                            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                        />
                    </div>
                )}

                <label className="block text-sm font-semibold text-slate-700">Descripción</label>
                <textarea 
                    className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-jc-blue/20 outline-none h-24 resize-none"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Categoría" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} />
                    <Input label="Tags" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {formData.tipo === 'video' ? 'Paso 3: Imagen de Portada' : 'Paso 3: Carga de archivo'}
                </h2>
                <p className="text-slate-500 mb-8">
                    {formData.tipo === 'video' 
                        ? 'Sube una imagen o miniatura para identificar el video en la plataforma.' 
                        : 'Sube el archivo original (PDF, PPTX, etc.)'}
                </p>
                
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${formData.file ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-jc-blue hover:bg-blue-50'}`}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange} 
                        accept={formData.tipo === 'video' ? "image/*" : ".pdf,.pptx,.docx,.zip"}
                    />
                    {formData.file ? (
                        <div className="text-green-600">
                            <CheckCircle2 size={64} className="mx-auto mb-4" />
                            <p className="font-bold">{formData.file.name}</p>
                        </div>
                    ) : (
                        <div className="text-slate-400">
                            {formData.tipo === 'video' ? <ImageIcon size={64} className="mx-auto mb-4" /> : <FileUp size={64} className="mx-auto mb-4" />}
                            <p className="font-bold text-slate-600">Haz click para seleccionar {formData.tipo === 'video' ? 'imagen' : 'archivo'}</p>
                        </div>
                    )}
                </div>
            </div>
          )}

          {paso === 4 && (
            <div className="animate-in fade-in duration-300 space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Paso 4: Resumen Final</h2>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                    <SummaryItem label="Formato" value={formData.tipo.toUpperCase()} />
                    <SummaryItem label="Nombre" value={formData.nombre} />
                    {formData.tipo === 'video' && <SummaryItem label="URL YouTube" value={formData.video_url} />}
                    <SummaryItem label="Archivo/Miniatura" value={formData.file?.name || '---'} />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
                    <AlertCircle className="text-amber-600" size={24} />
                    <p className="text-xs text-amber-800">
                        Tu material quedará en estado de revisión. Te notificaremos una vez que el administrador lo valide para su uso en cursos.
                    </p>
                </div>
            </div>
          )}

        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={prevStep} disabled={paso === 1 || isUploading}>
            <ChevronLeft size={18} className="mr-2" /> Anterior
          </Button>
          
          {paso < 4 ? (
            <Button 
                onClick={nextStep} 
                disabled={
                    (paso === 1 && !formData.tipo) || 
                    (paso === 2 && (!formData.nombre || (formData.tipo === 'video' && !formData.video_url))) || 
                    (paso === 3 && !formData.file)
                }
            >
                Siguiente
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={isUploading} className="bg-green-600 hover:bg-green-700 text-white px-10">
                Confirmar y Enviar
            </Button>
          )}
        </div>

      </div>
    </MainLayout>
  );
}

function SummaryItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col border-b border-slate-200 pb-2 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-slate-700 font-medium truncate">{value || '---'}</span>
        </div>
    );
}