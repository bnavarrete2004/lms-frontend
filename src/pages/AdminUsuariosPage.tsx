// src/pages/AdminUsuariosPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, BarChart3,
  FolderTree, FileText, Globe, Settings, Eye, Pencil, X, Save,
  UserCheck, UserX, ShieldCheck, GraduationCap, Mic2, UserPlus, Upload,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import api from '@/api/axios';

// ── Tipos — estructura real del backend ──────────────────────────────────────

type TipoUsuario = 'administrador' | 'relator' | 'estudiante';
type TabActivo   = 'estudiantes' | 'relatores';

interface UsuarioAPI {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
  };
  nombre_completo: string;
  rut_completo: string;
  tipo_usuario: TipoUsuario;
  activo: boolean;
  avatar_url: string;
  telefono?: string;
  comuna?: string;
  region?: string;
  profesion?: string;
  empresa_actual?: string;
  cargo_actual?: string;
  porcentaje_avance?: number;
}

interface CursoOpcion {
  id: number;
  nombre: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getIniciales(nombre: string): string {
  return nombre.split(' ').filter(w => w.length > 1).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}

const COLORES_AVATAR = [
  'from-blue-500 to-blue-600', 'from-green-500 to-green-600',
  'from-purple-500 to-purple-600', 'from-red-500 to-red-600',
  'from-teal-500 to-teal-600', 'from-amber-500 to-amber-600',
  'from-indigo-500 to-indigo-600', 'from-pink-500 to-pink-600',
];

// ── Badges ────────────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: TipoUsuario }) {
  const map: Record<TipoUsuario, { label: string; cls: string; icon: React.ReactNode }> = {
    administrador: { label: 'Admin',      cls: 'bg-purple-100 text-purple-700', icon: <ShieldCheck   size={12} className="mr-1" /> },
    relator:       { label: 'Relator',    cls: 'bg-blue-100 text-blue-700',     icon: <Mic2          size={12} className="mr-1" /> },
    estudiante:    { label: 'Estudiante', cls: 'bg-green-100 text-green-700',   icon: <GraduationCap size={12} className="mr-1" /> },
  };
  const { label, cls, icon } = map[tipo] ?? map.estudiante;
  return <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${cls}`}>{icon}{label}</span>;
}

function EstadoBadge({ activo }: { activo: boolean }) {
  return activo
    ? <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700"><UserCheck size={10} className="mr-1" />Activo</span>
    : <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500"><UserX size={10} className="mr-1" />Inactivo</span>;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function useSidebarSections() {
  return [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',    href: '/admin/dashboard' },
        { icon: <FileSearch size={20} />,      label: 'Revisión Material', href: '/admin/revision', badge: '5', badgeVariant: 'danger' as const, badgeAnimated: true },
        { icon: <BookOpen size={20} />,        label: 'Gestión Cursos',   href: '/admin/cursos' },
        { icon: <Users size={20} />,           label: 'Usuarios y Roles', href: '/admin/usuarios', isActive: true },
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
        { icon: <Globe size={20} />,    label: 'Contenido Público',   href: '/admin/landing' },
        { icon: <Settings size={20} />, label: 'Ajustes del Sistema', href: '/admin/config' },
      ],
    },
  ];
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({ icon, iconBg, label, valor, tag, tagColor }: {
  icon: React.ReactNode; iconBg: string; label: string; valor: string; tag: string; tagColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>{icon}</div>
        <span className={`text-xs font-semibold ${tagColor}`}>{tag}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

// ── Fila tabla ────────────────────────────────────────────────────────────────

function FilaUsuario({ usuario, colorAvatar, mostrarProgreso, onVer, onEditar }: {
  usuario: UsuarioAPI; colorAvatar: string; mostrarProgreso: boolean; onVer: () => void; onEditar: () => void;
}) {
  const nombre = usuario.nombre_completo || usuario.user.username;
  const progreso = usuario.porcentaje_avance ?? null;

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          {usuario.avatar_url
            ? <img src={usuario.avatar_url} alt={nombre} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            : <div className={`w-10 h-10 bg-gradient-to-br ${colorAvatar} rounded-full flex items-center justify-center flex-shrink-0`}><span className="text-white font-bold text-sm">{getIniciales(nombre)}</span></div>
          }
          <div>
            <p className="text-sm font-semibold text-slate-800">{nombre}</p>
            <p className="text-xs text-slate-500">{usuario.user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-600 font-mono">{usuario.rut_completo || '—'}</p>
      </td>
      {mostrarProgreso && (
        <td className="px-6 py-4">
          {progreso !== null ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[80px]">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progreso}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-600 w-8">{progreso}%</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Sin curso</span>
          )}
        </td>
      )}
      <td className="px-6 py-4"><EstadoBadge activo={usuario.activo} /></td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button onClick={onVer}    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Ver"><Eye size={16} /></button>
          <button onClick={onEditar} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition" title="Editar"><Pencil size={16} /></button>
        </div>
      </td>
    </tr>
  );
}

// ── Modal Inscripción Individual ──────────────────────────────────────────────

function ModalInscripcion({ onClose }: { onClose: () => void }) {
  const [rol, setRol]                     = useState<'estudiante' | 'relator'>('estudiante');
  const [guardando, setGuardando]         = useState(false);
  const [cursos, setCursos]               = useState<CursoOpcion[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  useEffect(() => {
    api.get('/cursos/', { params: { estado: 'activo' } })
      .then(res => setCursos(res.data?.results ?? res.data ?? []))
      .catch(() => setCursos([]))
      .finally(() => setLoadingCursos(false));
  }, []);

  const handleSubmit = async () => {
    setGuardando(true);
    // TODO: conectar a POST /usuarios/ cuando esté listo el endpoint de creación
    await new Promise(r => setTimeout(r, 800));
    alert(`✓ ${rol === 'estudiante' ? 'Estudiante' : 'Relator'} inscrito exitosamente`);
    setGuardando(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Inscribir Nuevo Usuario</h2>
            <p className="text-sm text-slate-500 mt-0.5">Selecciona el tipo y completa la información</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Selector rol */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Tipo de Usuario <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-4">
              {(['estudiante', 'relator'] as const).map(r => (
                <button key={r} onClick={() => setRol(r)}
                  className={`p-6 border-2 rounded-xl text-center transition-all ${rol === r ? 'border-jc-blue bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {r === 'estudiante'
                    ? <GraduationCap size={36} className={`mx-auto mb-2 ${rol === r ? 'text-jc-blue' : 'text-slate-400'}`} />
                    : <Mic2          size={36} className={`mx-auto mb-2 ${rol === r ? 'text-jc-calipso' : 'text-slate-400'}`} />
                  }
                  <p className="font-semibold text-slate-800 capitalize">{r}</p>
                  <p className="text-xs text-slate-500 mt-1">{r === 'estudiante' ? 'Usuario que cursará capacitaciones' : 'Instructor que crea contenido'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Información Personal</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre Completo *" placeholder="Ej: Carlos Pérez" />
              <Input label="RUT *" placeholder="12.345.678-9" />
              <Input label="Correo *" type="email" placeholder="correo@empresa.cl" />
              <Input label="Teléfono" type="tel" placeholder="+56 9 1234 5678" />
            </div>
          </div>

          {rol === 'estudiante' ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b pb-2">Asignación de Curso</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Curso *</label>
                  {loadingCursos ? (
                    <div className="w-full h-10 bg-slate-100 animate-pulse rounded-lg" />
                  ) : cursos.length === 0 ? (
                    <div className="w-full border border-amber-200 bg-amber-50 rounded-lg p-2.5 text-sm text-amber-700">
                      No hay cursos activos disponibles
                    </div>
                  ) : (
                    <select className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20">
                      <option value="">-- Seleccionar curso --</option>
                      {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio *</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin *</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b pb-2">Información Profesional</h3>
              <Input label="Especialidad *" placeholder="Ej: Especialista en HACCP" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biografía Breve</label>
                <textarea rows={3} placeholder="Descripción profesional..." className="w-full border border-slate-300 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-jc-blue/20" />
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} isLoading={guardando}>
            <UserPlus size={16} className="mr-2" /> Inscribir Usuario
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Inscripción Masiva ──────────────────────────────────────────────────

function ModalMasivo({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-8 py-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Inscripción Masiva</h2>
            <p className="text-sm text-slate-500 mt-0.5">Sube un CSV con los datos de los usuarios</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
        </div>
        <div className="px-8 py-6 space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-jc-blue hover:bg-blue-50/30 transition-all cursor-pointer">
            <Upload size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">Arrastra el archivo CSV aquí</p>
            <p className="text-xs text-slate-400 mt-1">o haz click para seleccionar</p>
            <p className="text-[10px] text-slate-400 mt-3 uppercase font-bold tracking-wider">
              Columnas requeridas: nombre, rut, email, tipo_usuario
            </p>
          </div>
          <Alert variant="info" title="Formato del archivo">
            Incluye una columna <strong>tipo_usuario</strong> con valor <code>estudiante</code> o <code>relator</code>.
          </Alert>
        </div>
        <div className="px-8 py-5 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button><Upload size={16} className="mr-2" /> Procesar Archivo</Button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Ver / Editar ────────────────────────────────────────────────────────

function ModalUsuario({ usuario, isEditMode, isSaving, onCambiar, onGuardar, onCerrar, onIrEditar }: {
  usuario: UsuarioAPI; isEditMode: boolean; isSaving: boolean;
  onCambiar: (c: Partial<UsuarioAPI>) => void; onGuardar: () => void; onCerrar: () => void; onIrEditar: () => void;
}) {
  const nombre = usuario.nombre_completo || usuario.user.username;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {isEditMode ? <Pencil size={18} className="text-amber-500" /> : <Eye size={18} className="text-jc-blue" />}
            {isEditMode ? 'Editar Usuario' : 'Detalles del Usuario'}
          </h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          {isEditMode ? (
            <>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Usuario</p>
                <p className="font-semibold text-slate-800">{nombre}</p>
                <p className="text-xs text-slate-500">{usuario.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Usuario</label>
                <select className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20"
                  value={usuario.tipo_usuario}
                  onChange={e => onCambiar({ tipo_usuario: e.target.value as TipoUsuario })}
                >
                  <option value="estudiante">Estudiante</option>
                  <option value="relator">Relator</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado de la Cuenta</label>
                <select className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20"
                  value={usuario.activo ? 'activo' : 'inactivo'}
                  onChange={e => onCambiar({ activo: e.target.value === 'activo' })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo (bloqueado)</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {usuario.avatar_url
                  ? <img src={usuario.avatar_url} alt={nombre} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  : <div className={`w-14 h-14 bg-gradient-to-br ${COLORES_AVATAR[usuario.id % COLORES_AVATAR.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-lg">{getIniciales(nombre)}</span>
                    </div>
                }
                <div>
                  <p className="font-bold text-slate-800 text-lg">{nombre}</p>
                  <p className="text-sm text-slate-500">{usuario.user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo</p>
                  <div className="mt-1"><TipoBadge tipo={usuario.tipo_usuario} /></div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Estado</p>
                  <div className="mt-1"><EstadoBadge activo={usuario.activo} /></div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">RUT</p>
                  <p className="font-mono text-sm font-semibold text-slate-700 mt-1">{usuario.rut_completo || '—'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Username</p>
                  <p className="font-mono text-sm text-slate-700 mt-1">@{usuario.user.username}</p>
                </div>
                {usuario.empresa_actual && (
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Empresa</p>
                    <p className="text-sm text-slate-700 mt-1">{usuario.empresa_actual}{usuario.cargo_actual ? ` · ${usuario.cargo_actual}` : ''}</p>
                  </div>
                )}
              </div>
              {usuario.user.date_joined && (
                <p className="text-xs text-slate-400 text-center">
                  Registrado el {new Date(usuario.user.date_joined).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">
          {isEditMode ? (
            <>
              <Button variant="ghost" onClick={onCerrar}>Cancelar</Button>
              <Button onClick={onGuardar} isLoading={isSaving}><Save size={16} className="mr-2" /> Guardar Cambios</Button>
            </>
          ) : (
            <Button className="w-full" onClick={onIrEditar}><Pencil size={16} className="mr-2" /> Editar Tipo / Estado</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AdminUsuariosPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarSections = useSidebarSections();

  const [usuarios, setUsuarios]   = useState<UsuarioAPI[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [tabActivo, setTabActivo] = useState<TabActivo>('estudiantes');
  const [busqueda, setBusqueda]   = useState('');

  const [modalInscripcion, setModalInscripcion] = useState(false);
  const [modalMasivo, setModalMasivo]           = useState(false);
  const [usuarioSel, setUsuarioSel]             = useState<UsuarioAPI | null>(null);
  const [isEditMode, setIsEditMode]             = useState(false);
  const [isSaving, setIsSaving]                 = useState(false);

  const cargarUsuarios = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/usuarios/');
      setUsuarios(res.data?.results ?? res.data ?? []);
    } catch {
      setError('No se pudieron cargar los usuarios. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleGuardar = async () => {
    if (!usuarioSel) return;
    setIsSaving(true);
    try {
      await api.patch(`/usuarios/${usuarioSel.id}/`, {
        tipo_usuario: usuarioSel.tipo_usuario,
        activo: usuarioSel.activo,
      });
      await cargarUsuarios();
      setUsuarioSel(null);
    } catch { alert('Error al actualizar el usuario.'); }
    finally { setIsSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tipoTab: TipoUsuario = tabActivo === 'estudiantes' ? 'estudiante' : 'relator';
  const usuariosFiltrados = usuarios
    .filter(u => u.tipo_usuario === tipoTab)
    .filter(u => {
      const n = (u.nombre_completo || u.user.username).toLowerCase();
      return n.includes(busqueda.toLowerCase()) ||
        u.user.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.rut_completo ?? '').includes(busqueda);
    });

  const estudiantes = usuarios.filter(u => u.tipo_usuario === 'estudiante');
  const relatores   = usuarios.filter(u => u.tipo_usuario === 'relator');
  const activos     = usuarios.filter(u => u.activo);

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || user?.username || 'Admin'}
      userSubtitle={user?.rol}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Usuarios y Roles"
      headerSubtitle="Administrar estudiantes y relatores del sistema"
      notificationCount={0}
    >
      <div className="space-y-8">

        <div className="flex gap-3">
          <button onClick={() => setModalInscripcion(true)} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-jc-blue to-[#043360] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            <UserPlus size={20} className="mr-2" /> Inscribir Usuario
          </button>
          <button onClick={() => setModalMasivo(true)} className="inline-flex items-center px-6 py-3 bg-jc-calipso text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            <Upload size={20} className="mr-2" /> Inscripción Masiva
          </button>
        </div>

        {error && <Alert variant="danger" title="Error al cargar usuarios">{error}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard icon={<Users size={24} className="text-blue-600" />}          iconBg="bg-blue-100"   label="Usuarios registrados"  valor={loading ? '—' : String(usuarios.length)}    tag="Total"       tagColor="text-blue-600" />
          <MetricCard icon={<GraduationCap size={24} className="text-green-600" />} iconBg="bg-green-100"  label="Alumnos en plataforma" valor={loading ? '—' : String(estudiantes.length)} tag="Estudiantes" tagColor="text-green-600" />
          <MetricCard icon={<Mic2 size={24} className="text-blue-600" />}           iconBg="bg-blue-100"   label="Docentes asignados"    valor={loading ? '—' : String(relatores.length)}   tag="Relatores"   tagColor="text-blue-600" />
          <MetricCard icon={<ShieldCheck size={24} className="text-purple-600" />}  iconBg="bg-purple-100" label="Cuentas habilitadas"   valor={loading ? '—' : String(activos.length)}     tag="Activos"     tagColor="text-purple-600" />
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-2">
            {(['estudiantes', 'relatores'] as TabActivo[]).map(tab => (
              <button key={tab} onClick={() => { setTabActivo(tab); setBusqueda(''); }}
                className={`px-8 py-4 font-semibold text-sm rounded-t-lg flex items-center gap-2 transition-all ${tabActivo === tab ? 'bg-jc-blue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {tab === 'estudiantes' ? <GraduationCap size={18} /> : <Mic2 size={18} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tabActivo === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {tab === 'estudiantes' ? estudiantes.length : relatores.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input type="text"
                placeholder={`Buscar ${tabActivo === 'estudiantes' ? 'estudiante' : 'relator'} por nombre, RUT o correo...`}
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-jc-blue outline-none"
              />
              <Eye size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
            <span className="text-sm text-slate-400 ml-auto">
              {!loading && `${usuariosFiltrados.length} resultado${usuariosFiltrados.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {loading && (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2"><div className="w-40 h-3 bg-slate-200 rounded" /><div className="w-56 h-2 bg-slate-100 rounded" /></div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && usuariosFiltrados.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Users size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">No se encontraron usuarios</p>
              <p className="text-sm text-slate-400 mt-1">
                {usuarios.length === 0 ? 'No hay usuarios registrados aún' : 'Prueba ajustando la búsqueda'}
              </p>
            </div>
          )}

          {!loading && !error && usuariosFiltrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{tabActivo === 'estudiantes' ? 'Estudiante' : 'Relator'}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RUT</th>
                    {tabActivo === 'estudiantes' && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Progreso</th>}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usuariosFiltrados.map((u, idx) => (
                    <FilaUsuario key={u.id} usuario={u} colorAvatar={COLORES_AVATAR[idx % COLORES_AVATAR.length]}
                      mostrarProgreso={tabActivo === 'estudiantes'}
                      onVer={() => { setUsuarioSel(u); setIsEditMode(false); }}
                      onEditar={() => { setUsuarioSel({ ...u }); setIsEditMode(true); }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalInscripcion && <ModalInscripcion onClose={() => setModalInscripcion(false)} />}
      {modalMasivo      && <ModalMasivo      onClose={() => setModalMasivo(false)} />}
      {usuarioSel && (
        <ModalUsuario
          usuario={usuarioSel} isEditMode={isEditMode} isSaving={isSaving}
          onCambiar={c => setUsuarioSel(prev => prev ? { ...prev, ...c } : prev)}
          onGuardar={handleGuardar}
          onCerrar={() => setUsuarioSel(null)}
          onIrEditar={() => setIsEditMode(true)}
        />
      )}
    </MainLayout>
  );
}