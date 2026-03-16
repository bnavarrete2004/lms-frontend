// src/pages/StudentProfilePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Camera, 
  Mail, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

export function StudentProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        {
          href: '/student/dashboard',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          label: 'Mi Panel',
        },
        {
          href: '/student/courses',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: 'Mis Cursos',
        },
        {
          href: '/student/diplomas',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Mis Diplomas',
        },
        {
          href: '/student/progress',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          label: 'Mi Progreso',
        },
        {
          href: '/student/notifications',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          label: 'Notificaciones',
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          href: '/student/profile',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          label: 'Mi Perfil',
          isActive: true
        },
      ],
    },
  ];

  // ── Foto de perfil ──────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload/avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // ── CORREGIDO: la respuesta real es res.data.usuario.avatar_url ────────
      const avatarUrl = res.data.usuario?.avatar_url || res.data.url || res.data.avatar_url;
      if (user && avatarUrl) {
        updateUser({ ...user, avatar_url: avatarUrl, avatar: avatarUrl });
      }
      alert('✓ Foto de perfil actualizada');
    } catch (error) {
      alert('Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Cambiar contraseña ──────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    if (!passwords.old_password) {
      alert('Debes ingresar tu contraseña actual.');
      return;
    }
    if (passwords.new_password.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(passwords.new_password)) {
      alert('La nueva contraseña debe tener al menos una letra mayúscula.');
      return;
    }
    if (!/[0-9]/.test(passwords.new_password)) {
      alert('La nueva contraseña debe tener al menos un número.');
      return;
    }
    if (passwords.new_password !== passwords.confirm_password) {
      alert('Las nuevas contraseñas no coinciden.');
      return;
    }
    
    setIsSaving(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
        new_password2: passwords.confirm_password
      });
      alert('✓ Contraseña actualizada correctamente');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      const msg = error?.response?.data?.error;
      alert(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join('\n') : 'Error al cambiar la contraseña.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Avatar source (mismo patrón que MainLayout) ────────────────────────────
  const avatarSrc = user?.avatar_url || user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre_completo || 'E')}&background=fff&color=064D91&size=128`;

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Mi Perfil"
      headerSubtitle="Gestiona tu información personal y seguridad"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner de Perfil */}
        <div className="bg-gradient-to-r from-[#064D91] to-[#52A9B7] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">

            {/* Avatar con upload — usa avatarSrc en lugar de user?.avatar */}
            <div className="relative group cursor-pointer flex-shrink-0">
              <img
                src={avatarSrc}
                alt="Perfil"
                className="w-32 h-32 rounded-full border-4 border-white/30 shadow-xl object-cover"
              />
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingPhoto ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{user?.nombre_completo || user?.username}</h2>
              <p className="text-lg text-blue-100 mb-4">
                {user?.rol === 'estudiante' ? 'Estudiante de Capacitación' : user?.rol}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm opacity-90">
                <span className="flex items-center gap-2"><Mail size={16} /> {user?.email}</span>
                <span className="flex items-center gap-2"><ShieldCheck size={16} /> Cuenta Verificada</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre Completo" value={user?.nombre_completo || ''} disabled />
                <Input label="RUT" value={user?.rut || ''} disabled />
                <Input label="Correo Electrónico" value={user?.email || ''} disabled icon={<Mail size={16} />} />
                <Input label="Teléfono" value={user?.telefono || 'No registrado'} disabled />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Seguridad de la Cuenta</h3>
              <div className="space-y-6">
                <Input 
                  label="Contraseña Actual *" 
                  type="password" 
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
                  placeholder="Ingresa tu contraseña actual" 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Nueva Contraseña *" 
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                    placeholder="Mínimo 8 caracteres" 
                  />
                  <Input 
                    label="Confirmar Nueva Contraseña *" 
                    type="password"
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="text-blue-600 shrink-0" size={20} />
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-bold mb-1">Requisitos de contraseña:</p>
                    <ul className="list-disc list-inside">
                      <li>Mínimo 8 caracteres</li>
                      <li>Al menos una letra mayúscula</li>
                      <li>Al menos un número</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePassword} isLoading={isSaving} disabled={!passwords.new_password}>
                    Actualizar Contraseña
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Resumen de Actividad</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Cursos Activos</p>
                    <p className="text-xl font-bold text-slate-800">---</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Completados</p>
                    <p className="text-xl font-bold text-slate-800">---</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Diplomas</p>
                    <p className="text-xl font-bold text-slate-800">---</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Promedio</p>
                    <p className="text-xl font-bold text-slate-800">---</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Accesos Directos</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/student/diplomas')}
                  className="w-full px-4 py-3 bg-[#064D91] text-white rounded-xl font-bold hover:bg-[#265379] transition text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <Award size={18} /> Ver Mis Diplomas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}