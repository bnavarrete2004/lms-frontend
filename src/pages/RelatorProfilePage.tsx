// src/pages/RelatorProfilePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, 
  FolderOpen, 
  Upload, 
  Bell, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Save,
  Camera,
  Mail,
  Clock,
  Phone,
  Lock,
  AlertCircle,
  ShieldCheck,
  Award,
  Download,
  Trash2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

export function RelatorProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para contadores reales
  const [counts, setCounts] = useState({ materiales: 0, cursos: 0, estudiantes: 0 });
  const [loading, setLoading] = useState(true);

  // ── Carga de Datos de Actividad ──
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [mRes, cRes, iRes] = await Promise.all([
          api.get('/materiales/'),
          api.get('/cursos/'),
          api.get('/inscripciones/')
        ]);
        setCounts({
          materiales: mRes.data?.count || mRes.data?.length || 0,
          cursos: cRes.data?.count || cRes.data?.length || 0,
          estudiantes: iRes.data?.count || iRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Error al cargar actividad:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarSections = [
    {
      title: 'Gestión Docente',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/relator/dashboard' },
        { icon: <FolderOpen size={20} />, label: 'Mis Materiales', href: '/relator/materiales' },
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
          { icon: <Bell size={20} />, label: 'Notificaciones', href: '/relator/notificaciones' },
          { icon: <Users size={20} />, label: 'Mi Perfil', href: '/relator/perfil', isActive: true },
        ],
    },
  ];

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Mi Perfil"
      headerSubtitle="Gestiona tu información docente y seguridad"
      headerActions={
        <Button onClick={() => alert('Perfil actualizado')} className="px-8 shadow-md">
            <Save size={18} className="mr-2" /> Guardar Cambios
        </Button>
      }
    >
      <div className="space-y-8">
        
        {/* ── Banner de Perfil ── */}
        <div className="bg-gradient-to-r from-[#064D91] to-[#52A9B7] rounded-2xl shadow-sm p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group cursor-pointer">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre_completo || 'R')}&background=fff&color=064D91&size=128`} 
                        className="w-32 h-32 rounded-full border-4 border-white/30 shadow-xl" 
                        alt="Perfil" 
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-1">{user?.nombre_completo}</h2>
                    <p className="text-blue-100 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                        <Award size={18} /> Especialista en Capacitación Digital
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm opacity-90">
                        <span className="flex items-center gap-2"><Mail size={16} /> {user?.email}</span>
                        <span className="flex items-center gap-2"><Clock size={16} /> Relator activo</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl text-center border border-white/10">
                        <p className="text-2xl font-bold">{loading ? '...' : counts.materiales}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Materiales</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl text-center border border-white/10">
                        <p className="text-2xl font-bold">{loading ? '...' : counts.estudiantes}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Alumnos</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ── Columna Izquierda: Formularios ── */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Info Personal */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-jc-blue" /> Información del Relator
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Nombre Completo" defaultValue={user?.nombre_completo} />
                        <Input label="RUT" defaultValue={user?.rut} disabled />
                        <Input label="Email Institucional" defaultValue={user?.email} icon={<Mail size={16}/>} />
                        <Input label="Teléfono de Contacto" placeholder="+56 9..." icon={<Phone size={16}/>} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Biografía Profesional</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-jc-blue/20 outline-none h-32 resize-none"
                                placeholder="Describe tu experiencia y especialidades..."
                            />
                        </div>
                    </div>
                </div>

                {/* Seguridad */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-jc-calipso" /> Seguridad y Acceso
                    </h3>
                    <div className="space-y-6">
                        <Input label="Contraseña Actual" type="password" placeholder="••••••••" icon={<Lock size={16}/>} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Nueva Contraseña" type="password" placeholder="Mínimo 8 caracteres" />
                            <Input label="Confirmar Nueva Contraseña" type="password" />
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                            <AlertCircle className="text-jc-blue shrink-0" size={20} />
                            <p className="text-xs text-blue-800 leading-relaxed">
                                La contraseña debe contener al menos 8 caracteres, una mayúscula y un número para garantizar la seguridad de tu cuenta docente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Columna Derecha: Preferencias y Acciones ── */}
            <div className="space-y-6">
                
                {/* Preferencias */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Notificaciones</h3>
                    <div className="space-y-4">
                        <ToggleOption label="Alertas de Aprobación" desc="Cuando revisen tu material" />
                        <ToggleOption label="Nuevas Consultas" desc="Dudas de alumnos en tus cursos" />
                        <ToggleOption label="Resumen Semanal" desc="Reporte de avance de alumnos" />
                    </div>
                </div>

                {/* Descarga de Datos */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Tus Datos</h3>
                    <p className="text-xs text-slate-500 mb-4">Puedes solicitar una copia de toda tu actividad y materiales en la plataforma.</p>
                    <button className="w-full py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-white/50 transition">
                        <Download size={16} /> Descargar Archivo .ZIP
                    </button>
                </div>

                {/* Peligro */}
                <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                    <h3 className="font-bold text-red-800 mb-2">Zona de Peligro</h3>
                    <p className="text-xs text-red-600/70 mb-4">Si eliminas tu cuenta, perderás acceso a todos tus cursos y materiales subidos.</p>
                    <button className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-sm">
                        <Trash2 size={16} /> Solicitar Baja de Cuenta
                    </button>
                </div>

            </div>
        </div>
      </div>
    </MainLayout>
  );
}

// ── Subcomponentes Limpios ──

function ToggleOption({ label, desc }: { label: string, desc: string }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-jc-blue transition-colors">{label}</p>
                <p className="text-[10px] text-slate-500">{desc}</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-jc-blue focus:ring-jc-calipso" />
        </label>
    );
}