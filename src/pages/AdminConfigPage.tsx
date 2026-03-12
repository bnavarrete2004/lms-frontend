// src/pages/AdminConfigPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Save, User, Mail, Phone, Lock} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// ── Sidebar sections ──────────────────────────────────────────────────────────
function useSidebarSections() {
  return [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',     href: '/admin/dashboard' },
        { icon: <FileSearch      size={20} />, label: 'Revisión Material', href: '/admin/revision', badge: '5', badgeVariant: 'danger' as const, badgeAnimated: true },
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
        { icon: <Globe    size={20} />, label: 'Contenido Público',   href: '/admin/landing' },
        { icon: <User     size={20} />, label: 'Mi Perfil',           href: '/admin/config', isActive: true },
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

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'perfil', label: 'Mi Perfil', icon: User },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Página Principal ──────────────────────────────────────────────────────────
export function AdminConfigPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarSections = useSidebarSections();
  const [activeTab] = useState<TabId>('perfil');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Render tabs ────────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Información Personal</h2>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Foto */}
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre_completo || 'Admin')}&background=064D91&color=fff&size=128`}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                  alt="Avatar"
                />
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-jc-blue text-white rounded-lg text-sm font-semibold hover:bg-jc-blue-dark transition">Cambiar Foto</button>
                  <button className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition">Eliminar</button>
                </div>
              </div>
              {/* Datos */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre">
                    <input type="text" defaultValue={user?.nombre_completo?.split(' ')[0] || 'Admin'} className={inputCls} />
                  </Field>
                  <Field label="Apellido">
                    <input type="text" defaultValue={user?.nombre_completo?.split(' ').slice(1).join(' ') || 'Sistema'} className={inputCls} />
                  </Field>
                </div>
                <Field label="Correo Electrónico">
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" defaultValue={user?.email || 'admin@jcdigitaltraining.cl'} className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Teléfono">
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" defaultValue="+56 9 1234 5678" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Cargo">
                  <input type="text" defaultValue="Administrador del Sistema" className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Lock size={16} className="text-slate-500" /> Cambiar Contraseña
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Contraseña Actual"><input type="password" placeholder="••••••••" className={inputCls} /></Field>
                <Field label="Nueva Contraseña"><input type="password" placeholder="••••••••" className={inputCls} /></Field>
                <Field label="Confirmar Contraseña"><input type="password" placeholder="••••••••" className={inputCls} /></Field>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
      headerActions={
        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-jc-blue text-white hover:bg-jc-blue-dark'
          }`}
        >
          <Save size={15} />
          {saved ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
      }
    >
      {/* Tab container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Tab nav */}
        <div className="border-b border-slate-200 px-6 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`relative py-4 px-3 text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-jc-blue font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-jc-calipso rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {renderTab()}
        </div>
      </div>
    </MainLayout>
  );
}