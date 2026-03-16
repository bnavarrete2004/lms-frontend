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
  Camera,
  Mail,
  Clock,
  Phone,
  Lock,
  AlertCircle,
  ShieldCheck,
  Award,
  Trash2,
  Save,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/api/axios';

export function RelatorProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [counts, setCounts] = useState({ materiales: 0, estudiantes: 0 });
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSolicitandoBaja, setIsSolicitandoBaja] = useState(false);

  const [profile, setProfile] = useState({
    telefono: '',
    biografia: '',
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });


  useEffect(() => {
  const fetchCounts = async () => {
    try {
      const [mRes, iRes, verifyRes] = await Promise.all([
        api.get('/materiales/'),
        api.get('/inscripciones/'),
        api.get('/auth/verify/'),
      ]);
      setCounts({
        materiales: mRes.data?.count || mRes.data?.results?.length || 0,
        estudiantes: iRes.data?.count || iRes.data?.results?.length || 0,
      });
      if (verifyRes.data?.user) {
        setProfile({
          telefono: verifyRes.data.user.telefono || '',
          biografia: verifyRes.data.user.biografia || '',
        });
      }
    } catch (error) {
      console.error('Error al cargar actividad:', error);
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
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard',      href: '/relator/dashboard' },
        { icon: <FolderOpen size={20} />,     label: 'Mis Materiales',  href: '/relator/materiales' },
        { icon: <Upload size={20} />,         label: 'Subir Material',  href: '/relator/subir' },
      ],
    },
    {
      title: 'Seguimiento',
      items: [
        { icon: <BookOpen size={20} />,   label: 'Mis Cursos',      href: '/relator/cursos' },
        { icon: <Users size={20} />,      label: 'Mis Estudiantes', href: '/relator/estudiantes' },
        { icon: <TrendingUp size={20} />, label: 'Estadísticas',    href: '/relator/stats' },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        { icon: <Bell size={20} />,  label: 'Notificaciones', href: '/relator/notificaciones' },
        { icon: <Users size={20} />, label: 'Mi Perfil',      href: '/relator/perfil', isActive: true },
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
      const res = await api.post('/auth/upload-avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (user) updateUser({ ...user, avatar_url: res.data.url, avatar: res.data.url });
      alert('✓ Foto de perfil actualizada');
    } catch (error) {
      alert('Error al subir la foto. Intenta nuevamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Guardar perfil (teléfono + biografía) ──────────────────────────────────
    const handleSaveProfile = async () => {
  setIsSavingProfile(true);
  try {
    await api.patch('/auth/update-profile/', {
      telefono: profile.telefono,
      biografia: profile.biografia,
    });
    // Refrescar user en contexto
    const res = await api.get('/auth/verify/');
    if (res.data?.user && user) {
      updateUser({ ...user, ...res.data.user, telefono: res.data.user.telefono });
    }
    alert('✓ Perfil actualizado correctamente');
  } catch (error) {
    alert('Error al guardar el perfil.');
  } finally {
    setIsSavingProfile(false);
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

    setIsSavingPassword(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
        new_password2: passwords.confirm_password,
      });
      alert('✓ Contraseña actualizada correctamente');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      const msg = error?.response?.data?.error;
      alert(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join('\n') : 'Error al cambiar la contraseña.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Solicitar baja ──────────────────────────────────────────────────────────
  const handleSolicitarBaja = async () => {
    if (!window.confirm(
      '¿Estás seguro de que deseas solicitar la baja de tu cuenta?\n\nUn administrador revisará tu solicitud y te contactará.'
    )) return;

    setIsSolicitandoBaja(true);
    try {
      await api.post('/auth/solicitar-baja/', {});
      alert('✓ Tu solicitud ha sido enviada. El administrador te contactará pronto.');
    } catch (error) {
      alert('Error al enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSolicitandoBaja(false);
    }
  };

  const avatarSrc = user?.avatar_url || user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre_completo || 'R')}&background=fff&color=064D91&size=128`;

  return (
    <MainLayout
      role="relator"
      userName={user?.nombre_completo || 'Relator'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Mi Perfil"
      headerSubtitle="Gestiona tu información docente y seguridad"
    >
      <div className="space-y-8">

        {/* ── Banner de Perfil ── */}
        <div className="bg-gradient-to-r from-[#064D91] to-[#52A9B7] rounded-2xl shadow-sm p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

            {/* Avatar con upload */}
            <div className="relative group cursor-pointer flex-shrink-0">
              <img
                src={avatarSrc}
                className="w-32 h-32 rounded-full border-4 border-white/30 shadow-xl object-cover"
                alt="Perfil"
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

          {/* ── Columna Izquierda ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Info Personal (solo lectura) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users size={20} className="text-jc-blue" /> Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre Completo" value={user?.nombre_completo || ''} disabled />
                <Input label="RUT" value={user?.rut || ''} disabled />
                <Input label="Email Institucional" value={user?.email || ''} disabled icon={<Mail size={16} />} />
                <Input
                  label="Teléfono de Contacto"
                  value={profile.telefono}
                  onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                  placeholder="+56 9..."
                  icon={<Phone size={16} />}
                />
              </div>
              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Biografía Profesional</label>
                <textarea
                  value={profile.biografia}
                  onChange={(e) => setProfile({ ...profile, biografia: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-jc-blue/20 outline-none h-32 resize-none"
                  placeholder="Describe tu experiencia y especialidades..."
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveProfile} isLoading={isSavingProfile}>
                  <Save size={16} className="mr-2" /> Guardar Cambios
                </Button>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-jc-calipso" /> Seguridad y Acceso
              </h3>
              <div className="space-y-6">
                <Input
                  label="Contraseña Actual"
                  type="password"
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                  placeholder="••••••••"
                  icon={<Lock size={16} />}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nueva Contraseña"
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <Input
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="text-jc-blue shrink-0" size={20} />
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-bold mb-1">Requisitos de contraseña:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Mínimo 8 caracteres</li>
                      <li>Al menos una letra mayúscula</li>
                      <li>Al menos un número</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSavePassword} isLoading={isSavingPassword} disabled={!passwords.new_password}>
                    Actualizar Contraseña
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Columna Derecha ── */}
          <div className="space-y-6">

            {/* Zona de Peligro */}
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
              <h3 className="font-bold text-red-800 mb-2">Zona de Peligro</h3>
              <p className="text-xs text-red-600/70 mb-4">
                Si solicitas la baja, un administrador revisará tu caso y te contactará. Perderás acceso a todos tus cursos y materiales.
              </p>
              <button
                onClick={handleSolicitarBaja}
                disabled={isSolicitandoBaja}
                className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-sm disabled:opacity-50"
              >
                {isSolicitandoBaja ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Solicitar Baja de Cuenta
              </button>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}