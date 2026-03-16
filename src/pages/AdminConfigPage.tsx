// src/pages/AdminConfigPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Save, User, Mail, Phone, Lock,
  Camera, AlertCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

// ── Sidebar ───────────────────────────────────────────────────────────────────
function useSidebarSections() {
  return [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',     href: '/admin/dashboard' },
        { icon: <FileSearch      size={20} />, label: 'Revisión Material', href: '/admin/revision' },
        { icon: <BookOpen        size={20} />, label: 'Gestión Cursos',    href: '/admin/cursos' },
        { icon: <Users           size={20} />, label: 'Usuarios y Roles',  href: '/admin/usuarios' },
      ],
    },
    {
      title: 'Análisis y Datos',
      items: [
        { icon: <BarChart3  size={20} />, label: 'Estadísticas Globales', href: '/admin/stats' },
        { icon: <FolderTree size={20} />, label: 'Repositorio Central',   href: '/admin/repositorio' },
        { icon: <FileText   size={20} />, label: 'Reportes SENCE',        href: '/admin/reportes' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { icon: <Globe size={20} />, label: 'Contenido Público', href: '/admin/landing' },
        { icon: <User  size={20} />, label: 'Mi Perfil',         href: '/admin/config', isActive: true },
      ],
    },
  ];
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-jc-calipso/30 bg-white";
const inputDisabledCls = "w-full px-4 py-2 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed";

// ── Página Principal ──────────────────────────────────────────────────────────
export function AdminConfigPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const sidebarSections = useSidebarSections();

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [profile, setProfile] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Cargar datos actuales del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/verify/');
        if (res.data?.user) {
          const u = res.data.user;
          setProfile({
            nombres:          u.nombres          || '',
            apellido_paterno: u.apellido_paterno  || '',
            apellido_materno: u.apellido_materno  || '',
            telefono:         u.telefono          || '',
          });
        }
      } catch (e) {
        console.error('Error cargando perfil:', e);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Foto ────────────────────────────────────────────────────────────────────
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
    } catch {
      alert('Error al subir la foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Guardar perfil ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Refrescar nombre en contexto
      const verifyRes = await api.get('/auth/verify/');
      if (verifyRes.data?.user && user) {
        updateUser({ ...user, nombre_completo: verifyRes.data.user.nombre_completo, telefono: profile.telefono });
      }
      alert('✓ Perfil actualizado correctamente');
    } catch {
      alert('Error al guardar el perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Contraseña ──────────────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    if (!passwords.old_password) { alert('Debes ingresar tu contraseña actual.'); return; }
    if (passwords.new_password.length < 8) { alert('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (!/[A-Z]/.test(passwords.new_password)) { alert('La nueva contraseña debe tener al menos una mayúscula.'); return; }
    if (!/[0-9]/.test(passwords.new_password)) { alert('La nueva contraseña debe tener al menos un número.'); return; }
    if (passwords.new_password !== passwords.confirm_password) { alert('Las contraseñas no coinciden.'); return; }

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

  const avatarSrc = user?.avatar_url || user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre_completo || 'Admin')}&background=064D91&color=fff&size=128`;

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || user?.username || 'Admin'}
      userSubtitle={user?.rol || 'Administrador'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      onNotificationClick={() => navigate('/admin/notificaciones')}
      headerTitle="Mi Perfil"
      headerSubtitle="Gestiona tu información personal y ajustes de cuenta"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-10">

        {/* ── Sección: Información Personal ── */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-6">Información Personal</h2>
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Foto */}
            <div className="bg-slate-50 rounded-xl p-6 text-center flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer">
                <img
                  src={avatarSrc}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  alt="Avatar"
                />
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploadingPhoto ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              </div>
              <p className="text-xs text-slate-400">Haz clic en la foto para cambiarla</p>
            </div>

            {/* Datos editables */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Nombres">
                  <input
                    type="text"
                    value={profile.nombres}
                    onChange={(e) => setProfile({ ...profile, nombres: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Apellido Paterno">
                  <input
                    type="text"
                    value={profile.apellido_paterno}
                    onChange={(e) => setProfile({ ...profile, apellido_paterno: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Apellido Materno">
                  <input
                    type="text"
                    value={profile.apellido_materno}
                    onChange={(e) => setProfile({ ...profile, apellido_materno: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Correo Electrónico">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="email" value={user?.email || ''} disabled className={`${inputDisabledCls} pl-9`} />
                </div>
              </Field>

              <Field label="Teléfono">
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={profile.telefono}
                    onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                    placeholder="+56 9..."
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>

              <Field label="RUT">
                <input type="text" value={user?.rut || ''} disabled className={inputDisabledCls} />
              </Field>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-jc-blue text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#053d73] transition disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sección: Cambiar Contraseña ── */}
        <div className="border-t border-slate-200 pt-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Lock size={16} className="text-slate-500" /> Cambiar Contraseña
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Field label="Contraseña Actual">
              <input
                type="password"
                value={passwords.old_password}
                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                placeholder="••••••••"
                className={inputCls}
              />
            </Field>
            <Field label="Nueva Contraseña">
              <input
                type="password"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                className={inputCls}
              />
            </Field>
            <Field label="Confirmar Contraseña">
              <input
                type="password"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                placeholder="••••••••"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-4">
            <AlertCircle className="text-jc-blue shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-blue-800">
              <p className="font-bold mb-1">Requisitos de contraseña:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos un número</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePassword}
              disabled={isSavingPassword || !passwords.new_password}
              className="px-6 py-2.5 bg-jc-blue text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#053d73] transition disabled:opacity-50"
            >
              {isSavingPassword ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock size={15} />
              )}
              Actualizar Contraseña
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}