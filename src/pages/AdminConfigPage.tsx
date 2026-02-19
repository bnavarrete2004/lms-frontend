// src/pages/AdminConfigPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Settings, Save, User, Building2,
  Users2, BookOpenCheck, Bell, Shield, Plug, Wrench, Monitor,
  Database, Trash2, RefreshCw, Mail, Phone, Clock, Lock, Eye,
  ChevronRight, Wifi,
} from 'lucide-react';
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
        { icon: <Settings size={20} />, label: 'Ajustes del Sistema', href: '/admin/config', isActive: true },
      ],
    },
  ];
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-jc-calipso/30 ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, description, value, onChange, border = true }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void; border?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 ${border ? 'border-b border-slate-200' : ''}`}>
      <div>
        <p className="font-semibold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
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
const selectCls = inputCls;

// ── Section card ──────────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <h3 className="text-sm font-bold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'perfil',         label: 'Mi Perfil',       icon: User },
  { id: 'plataforma',     label: 'Plataforma',       icon: Building2 },
  { id: 'usuarios',       label: 'Usuarios',         icon: Users2 },
  { id: 'cursos',         label: 'Cursos',           icon: BookOpenCheck },
  { id: 'notificaciones', label: 'Notificaciones',   icon: Bell },
  { id: 'seguridad',      label: 'Seguridad',        icon: Shield },
  { id: 'integraciones',  label: 'Integraciones',    icon: Plug },
  { id: 'avanzado',       label: 'Avanzado',         icon: Wrench },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Página Principal ──────────────────────────────────────────────────────────
export function AdminConfigPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarSections = useSidebarSections();
  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  const [saved, setSaved] = useState(false);

  // ── Estado de toggles ──
  const [toggles, setToggles] = useState({
    autoRegistro: false,
    verificacionEmail: true,
    loginRut: true,
    aprobarMaterial: false,
    descargarMateriales: true,
    foros: true,
    mostrarRespuestas: false,
    certificadosAuto: true,
    emailNuevoMaterial: true,
    emailNuevoUsuario: true,
    emailCursoCompletado: false,
    emailReportes: true,
    alertasSistema: true,
    sonidoNotif: false,
    dosFactor: false,
    contrasenaSegura: true,
    registrarAcciones: true,
    sence: true,
    smtp: true,
    nube: false,
    mantenimiento: false,
    cache: true,
  });

  const toggle = (key: keyof typeof toggles) => setToggles(p => ({ ...p, [key]: !p[key] }));

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

      case 'plataforma':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Configuración de la Plataforma</h2>
            <div className="space-y-6">
              <Card title="Información General">
                <div className="space-y-4">
                  <Field label="Nombre de la Plataforma">
                    <input type="text" defaultValue="JC Digital Training" className={inputCls} />
                  </Field>
                  <Field label="Descripción">
                    <textarea rows={3} defaultValue="Plataforma de capacitación empresarial online certificada por SENCE" className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email de Contacto">
                      <input type="email" defaultValue="contacto@jcdigitaltraining.cl" className={inputCls} />
                    </Field>
                    <Field label="Teléfono de Soporte">
                      <input type="tel" defaultValue="+56 9 1234 5678" className={inputCls} />
                    </Field>
                  </div>
                </div>
              </Card>
              <Card title="Localización">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Zona Horaria">
                    <select className={selectCls}>
                      <option>América/Santiago (UTC-3)</option>
                      <option>América/Buenos_Aires (UTC-3)</option>
                      <option>América/Lima (UTC-5)</option>
                    </select>
                  </Field>
                  <Field label="Idioma">
                    <select className={selectCls}>
                      <option>Español</option>
                      <option>Inglés</option>
                      <option>Portugués</option>
                    </select>
                  </Field>
                </div>
              </Card>
              <Card title="Límites de Uso">
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Usuarios Máximos"><input type="number" defaultValue={500} className={inputCls} /></Field>
                  <Field label="Cursos Máximos"><input type="number" defaultValue={50} className={inputCls} /></Field>
                  <Field label="Almacenamiento (GB)"><input type="number" defaultValue={100} className={inputCls} /></Field>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'usuarios':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Configuración de Usuarios</h2>
            <div className="space-y-6">
              <Card title="Registro y Acceso">
                <ToggleRow label="Permitir auto-registro de estudiantes" description="Los estudiantes pueden crear su propia cuenta" value={toggles.autoRegistro} onChange={() => toggle('autoRegistro')} />
                <ToggleRow label="Requiere verificación de email" description="Los usuarios deben verificar su correo electrónico" value={toggles.verificacionEmail} onChange={() => toggle('verificacionEmail')} />
                <ToggleRow label="Permitir login con RUT" description="Los usuarios pueden iniciar sesión con su RUT chileno" value={toggles.loginRut} onChange={() => toggle('loginRut')} border={false} />
              </Card>
              <Card title="Roles de Usuario">
                <div className="space-y-3">
                  {[
                    { icon: '👤', name: 'Estudiante', desc: 'Acceso a cursos asignados y materiales' },
                    { icon: '📚', name: 'Relator',    desc: 'Crear y gestionar contenido de cursos' },
                    { icon: '⚙️', name: 'Administrador', desc: 'Control total del sistema' },
                  ].map(r => (
                    <div key={r.name} className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{r.icon} {r.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                      </div>
                      <button className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition">Editar Permisos</button>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Sesiones">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tiempo de inactividad (minutos)">
                    <div className="relative">
                      <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" defaultValue={30} className={`${inputCls} pl-9`} />
                    </div>
                  </Field>
                  <Field label="Duración máxima de sesión (horas)">
                    <input type="number" defaultValue={8} className={inputCls} />
                  </Field>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'cursos':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Configuración de Cursos</h2>
            <div className="space-y-6">
              <Card title="Ajustes Generales">
                <ToggleRow label="Aprobar automáticamente material de relatores" description="El material se publica sin revisión del admin" value={toggles.aprobarMaterial} onChange={() => toggle('aprobarMaterial')} />
                <ToggleRow label="Permitir descarga de materiales" description="Estudiantes pueden descargar PDFs y recursos" value={toggles.descargarMateriales} onChange={() => toggle('descargarMateriales')} />
                <ToggleRow label="Habilitar foros de discusión" description="Los cursos pueden tener foros de estudiantes" value={toggles.foros} onChange={() => toggle('foros')} border={false} />
              </Card>
              <Card title="Evaluaciones">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Field label="Intentos máximos por examen"><input type="number" defaultValue={3} className={inputCls} /></Field>
                  <Field label="Nota mínima aprobación (%)"><input type="number" defaultValue={70} className={inputCls} /></Field>
                  <Field label="Tiempo entre intentos (horas)"><input type="number" defaultValue={24} className={inputCls} /></Field>
                </div>
                <ToggleRow label="Mostrar respuestas correctas después del intento" description="Los estudiantes ven las respuestas correctas" value={toggles.mostrarRespuestas} onChange={() => toggle('mostrarRespuestas')} border={false} />
              </Card>
              <Card title="Certificados">
                <ToggleRow label="Generar certificados automáticamente" description="Al completar el curso con nota aprobatoria" value={toggles.certificadosAuto} onChange={() => toggle('certificadosAuto')} />
                <div className="mt-4">
                  <Field label="Plantilla de Certificado">
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-jc-blue text-white rounded-lg text-sm font-semibold hover:bg-jc-blue-dark transition">Subir Plantilla (.PDF)</button>
                      <span className="text-xs text-slate-500">Archivo actual: certificado_template.pdf</span>
                    </div>
                  </Field>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'notificaciones':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Preferencias de Notificaciones</h2>
            <div className="space-y-6">
              <Card title="Notificaciones por Email">
                <ToggleRow label="Nuevo material para revisar" description="Cuando un relator sube material" value={toggles.emailNuevoMaterial} onChange={() => toggle('emailNuevoMaterial')} />
                <ToggleRow label="Nuevo usuario registrado" description="Cuando se registra un nuevo estudiante" value={toggles.emailNuevoUsuario} onChange={() => toggle('emailNuevoUsuario')} />
                <ToggleRow label="Curso completado" description="Cuando un estudiante termina un curso" value={toggles.emailCursoCompletado} onChange={() => toggle('emailCursoCompletado')} />
                <ToggleRow label="Reportes semanales" description="Resumen de actividad semanal" value={toggles.emailReportes} onChange={() => toggle('emailReportes')} border={false} />
              </Card>
              <Card title="Notificaciones en Plataforma">
                <ToggleRow label="Alertas de sistema" description="Errores y alertas importantes" value={toggles.alertasSistema} onChange={() => toggle('alertasSistema')} />
                <ToggleRow label="Sonido de notificaciones" description="Reproducir sonido al recibir notificaciones" value={toggles.sonidoNotif} onChange={() => toggle('sonidoNotif')} border={false} />
              </Card>
            </div>
          </div>
        );

      case 'seguridad':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Seguridad y Privacidad</h2>
            <div className="space-y-6">
              <Card title="Autenticación">
                <ToggleRow label="Autenticación de dos factores (2FA)" description="Requiere código adicional al iniciar sesión" value={toggles.dosFactor} onChange={() => toggle('dosFactor')} />
                <ToggleRow label="Forzar contraseñas seguras" description="Mínimo 8 caracteres, mayúsculas, números" value={toggles.contrasenaSegura} onChange={() => toggle('contrasenaSegura')} border={false} />
              </Card>
              <Card title="Sesiones Activas">
                <div className="bg-white rounded-lg p-4 border border-slate-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Monitor size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Windows 11 — Chrome</p>
                      <p className="text-xs text-slate-500">Santiago, Chile • IP: 190.xxx.xxx.xxx</p>
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" /> Sesión actual</p>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition">Cerrar Todas las Sesiones</button>
              </Card>
              <Card title="Registro de Actividad">
                <ToggleRow label="Registrar acciones de admin" description="Guardar historial de cambios importantes" value={toggles.registrarAcciones} onChange={() => toggle('registrarAcciones')} border={false} />
                <button className="mt-4 px-4 py-2 bg-jc-blue text-white rounded-lg text-sm font-semibold hover:bg-jc-blue-dark transition flex items-center gap-2">
                  <Eye size={15} /> Ver Registro Completo
                </button>
              </Card>
            </div>
          </div>
        );

      case 'integraciones':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Integraciones Externas</h2>
            <div className="space-y-6">
              {/* SENCE */}
              <Card title="">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">🏛️</div>
                    <div>
                      <p className="font-bold text-slate-800">SENCE</p>
                      <p className="text-xs text-slate-500">Sistema Nacional de Certificación</p>
                    </div>
                  </div>
                  <Toggle value={toggles.sence} onChange={() => toggle('sence')} />
                </div>
                <div className="space-y-3">
                  <Field label="Código OTEC"><input type="text" defaultValue="OT-2024-XXXX" className={inputCls} /></Field>
                  <Field label="API Key"><input type="password" defaultValue="••••••••••••••••" className={inputCls} /></Field>
                </div>
                <button className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition flex items-center gap-2">
                  <Wifi size={15} /> Probar Conexión
                </button>
              </Card>
              {/* SMTP */}
              <Card title="">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">📧</div>
                    <div>
                      <p className="font-bold text-slate-800">Servidor de Email (SMTP)</p>
                      <p className="text-xs text-slate-500">Envío de notificaciones y certificados</p>
                    </div>
                  </div>
                  <Toggle value={toggles.smtp} onChange={() => toggle('smtp')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Servidor SMTP"><input type="text" defaultValue="smtp.gmail.com" className={inputCls} /></Field>
                  <Field label="Puerto"><input type="text" defaultValue="587" className={inputCls} /></Field>
                  <Field label="Usuario"><input type="text" defaultValue="noreply@jcdigitaltraining.cl" className={inputCls} /></Field>
                  <Field label="Contraseña"><input type="password" defaultValue="••••••••••••" className={inputCls} /></Field>
                </div>
                <button className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition flex items-center gap-2">
                  <Mail size={15} /> Enviar Email de Prueba
                </button>
              </Card>
              {/* Nube */}
              <Card title="">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">☁️</div>
                    <div>
                      <p className="font-bold text-slate-800">Almacenamiento en la Nube</p>
                      <p className="text-xs text-slate-500">AWS S3, Google Cloud Storage, Azure</p>
                    </div>
                  </div>
                  <Toggle value={toggles.nube} onChange={() => toggle('nube')} />
                </div>
                <Field label="Proveedor">
                  <select className={selectCls}>
                    <option>Seleccionar proveedor</option>
                    <option>Amazon S3</option>
                    <option>Google Cloud Storage</option>
                    <option>Microsoft Azure</option>
                  </select>
                </Field>
              </Card>
            </div>
          </div>
        );

      case 'avanzado':
        return (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">Configuración Avanzada</h2>
            <div className="space-y-6">
              <Card title="Modo Mantenimiento">
                <ToggleRow label="Activar modo mantenimiento" description="La plataforma no estará disponible para usuarios" value={toggles.mantenimiento} onChange={() => toggle('mantenimiento')} />
                <div className="mt-3">
                  <Field label="Mensaje de mantenimiento">
                    <textarea rows={2} defaultValue="Estamos realizando mejoras en el sistema. Volveremos pronto." className={inputCls} />
                  </Field>
                </div>
              </Card>
              <Card title="Base de Datos">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Última copia de seguridad</p>
                    <p className="text-base font-bold text-slate-800">19 Feb 2026, 03:00</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Tamaño de BD</p>
                    <p className="text-base font-bold text-slate-800">2.4 GB</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-jc-blue text-white rounded-lg text-sm font-semibold hover:bg-jc-blue-dark transition flex items-center gap-2">
                    <Database size={15} /> Crear Backup Ahora
                  </button>
                  <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition flex items-center gap-2">
                    <RefreshCw size={15} /> Restaurar desde Backup
                  </button>
                </div>
              </Card>
              <Card title="Caché y Rendimiento">
                <ToggleRow label="Habilitar caché de contenido" description="Mejora la velocidad de carga" value={toggles.cache} onChange={() => toggle('cache')} border={false} />
                <button className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition">Limpiar Caché</button>
              </Card>
              {/* Zona de peligro */}
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
                  <span>⚠️</span> Zona de Peligro
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center justify-between">
                    <span className="flex items-center gap-2"><RefreshCw size={15} /> Resetear todas las configuraciones</span>
                    <ChevronRight size={16} />
                  </button>
                  <button className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition flex items-center justify-between">
                    <span className="flex items-center gap-2"><Trash2 size={15} /> Eliminar todos los datos de prueba</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
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
      headerTitle="Configuración del Sistema"
      headerSubtitle="Administra los ajustes generales de la plataforma"
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-4 px-3 text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-jc-blue font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
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