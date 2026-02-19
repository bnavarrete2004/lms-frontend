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
  Video, 
  FileText, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  FileUp,
  Bell,
  User
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

// ── Tipos y Configuración ───────────────────────────────────────────────────

type Paso = 1 | 2 | 3 | 4;

const TIPOS_MATERIAL = [
  { id: 'video', label: 'Video', icon: <Video size={32} />, color: 'bg-red-100 text-red-600', desc: 'MP4, AVI, MOV' },
  { id: 'pdf', label: 'PDF / Guía', icon: <FileText size={32} />, color: 'bg-blue-100 text-blue-600', desc: 'Documentos PDF' },
  { id: 'presentacion', label: 'Presentación', icon: <ClipboardList size={32} />, color: 'bg-amber-100 text-amber-600', desc: 'PPTX, Slides' },
  { id: 'scorm', label: 'SCORM/Quiz', icon: <CheckCircle2 size={32} />, color: 'bg-green-100 text-green-600', desc: 'Contenido Interactivo' },
];

export function RelatorUploadPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Estado del Formulario ──
  const [paso, setPaso] = useState<Paso>(1);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    categoria: '',
    tags: '',
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const nextStep = () => setPaso((prev) => Math.min(prev + 1, 4) as Paso);
  const prevStep = () => setPaso((prev) => Math.max(prev - 1, 1) as Paso);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('file', formData.file);
    data.append('tipo', formData.tipo);
    data.append('nombre', formData.nombre);
    data.append('descripcion', formData.descripcion);
    data.append('categoria', formData.categoria);
    data.append('tags', formData.tags);

    try {
      await api.post('/upload/material/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('✓ Material enviado a revisión exitosamente.');
      navigate('/relator/materiales');
    } catch (error) {
      console.error(error);
      alert('Error al subir el archivo. Verifica el tamaño y formato.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Configuración Sidebar (RESTAURADA COMPLETA) ──
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
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones', badge: '3', badgeVariant: 'danger' as const },
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
      headerSubtitle="Paso a paso para publicar tu contenido"
      headerActions={
        <button 
            onClick={() => navigate('/relator/materiales')}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold flex items-center transition"
        >
            <ChevronLeft size={18} className="mr-1" /> Volver
        </button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Indicador de Pasos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  paso === num ? 'bg-[#064D91] text-white shadow-lg' : 
                  paso > num ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {paso > num ? '✓' : num}
                </div>
                <span className={`text-[10px] font-bold uppercase mt-2 ${paso === num ? 'text-jc-blue' : 'text-slate-400'}`}>
                  {num === 1 ? 'Tipo' : num === 2 ? 'Info' : num === 3 ? 'Archivo' : 'Enviar'}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
          </div>
        </div>

        {/* Contenido del Paso */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 min-h-[400px]">
          
          {paso === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 1: Selecciona el formato</h2>
              <p className="text-slate-500 mb-8">Elige el tipo de recurso que deseas compartir.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TIPOS_MATERIAL.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => { setFormData({...formData, tipo: t.id}); nextStep(); }}
                    className={`p-8 border-2 rounded-2xl text-left transition-all hover:border-jc-blue group ${formData.tipo === t.id ? 'border-jc-blue bg-blue-50' : 'border-slate-100'}`}
                  >
                    <div className={`${t.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {t.icon}
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">{t.label}</h4>
                    <p className="text-sm text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 2: Detalles del contenido</h2>
              <div className="space-y-4">
                <Input 
                    label="Título del Material" 
                    placeholder="Ej: Manual de Inocuidad Nivel 1" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción / Notas</label>
                    <textarea 
                        className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-jc-blue/20 outline-none h-32 resize-none"
                        placeholder="Explica de qué trata este material..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Categoría" 
                        placeholder="Ej: HACCP" 
                        value={formData.categoria}
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    />
                    <Input 
                        label="Etiquetas (separadas por coma)" 
                        placeholder="Ej: salud, normativa" 
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    />
                </div>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 3: Carga de archivo</h2>
                <p className="text-slate-500 mb-8">Sube el archivo original para revisión.</p>
                
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${formData.file ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-jc-blue hover:bg-blue-50'}`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    {formData.file ? (
                        <div className="text-green-600">
                            <CheckCircle2 size={64} className="mx-auto mb-4" />
                            <p className="font-bold text-lg">{formData.file.name}</p>
                            <p className="text-sm">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className="text-slate-400">
                            <FileUp size={64} className="mx-auto mb-4" />
                            <p className="font-bold text-slate-600 text-lg">Haz click para seleccionar archivo</p>
                            <p className="text-sm">Tamaño máximo recomendado: 500MB</p>
                        </div>
                    )}
                </div>
            </div>
          )}

          {paso === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 4: Confirmar Envío</h2>
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 space-y-4">
                    <SummaryItem label="Tipo" value={formData.tipo.toUpperCase()} />
                    <SummaryItem label="Título" value={formData.nombre} />
                    <SummaryItem label="Descripción" value={formData.descripcion} />
                    <SummaryItem label="Archivo" value={formData.file?.name || '---'} />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
                    <AlertCircle className="text-jc-blue" size={24} />
                    <p className="text-sm text-blue-800">
                        Tu material pasará por revisión administrativa antes de ser publicado oficialmente.
                    </p>
                </div>
            </div>
          )}

        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={paso === 1 || isUploading}
          >
            <ChevronLeft size={18} className="mr-2" /> Anterior
          </Button>
          
          {paso < 4 ? (
            <Button 
                onClick={nextStep} 
                disabled={paso === 1 && !formData.tipo || paso === 2 && !formData.nombre || paso === 3 && !formData.file}
            >
                Siguiente Paso
            </Button>
          ) : (
            <Button 
                onClick={handleSubmit} 
                isLoading={isUploading}
                className="bg-green-600 hover:bg-green-700 text-white px-10"
            >
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
        <div className="flex flex-col border-b border-slate-200 pb-3 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-slate-800 font-medium">{value || '---'}</span>
        </div>
    );
}