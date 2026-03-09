// src/pages/AdminUsuariosPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, BookOpen, Users, User, BarChart3,
  FolderTree, FileText, Globe, Settings, Eye, Pencil, X, Save,
  UserCheck, UserX, ShieldCheck, GraduationCap, Mic2, UserPlus,
  Building2, ChevronDown, Trash2, Search,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import api from '@/api/axios';
import { empresaService, type EmpresaCliente } from '@/api/services/empresaService';

// ── Tipos ─────────────────────────────────────────────────────────────────────

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
  empresa?: number | null;
  empresa_data?: { id: number; nombre: string; codigo_empresa: string; rut_empresa: string } | null;
  codigo_empleado?: string;
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
        { icon: <User size={20} />, label: 'Mi Perfil', href: '/admin/config' },
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
  const nombre   = usuario.nombre_completo || usuario.user.username;
  const progreso = usuario.porcentaje_avance ?? null;
  const empresa  = usuario.empresa_data?.nombre ?? usuario.empresa_actual ?? null;

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
          {empresa ? (
            <div className="flex items-center gap-1.5">
              <Building2 size={13} className="text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate max-w-[140px]">{empresa}</span>
              {usuario.codigo_empleado && (
                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  {usuario.codigo_empleado}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Sin empresa</span>
          )}
        </td>
      )}
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

function ModalInscripcion({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [rol, setRol]                     = useState<'estudiante' | 'relator'>('estudiante');
  const [guardando, setGuardando]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [cursos, setCursos]               = useState<CursoOpcion[]>([]);
  const [empresas, setEmpresas]           = useState<EmpresaCliente[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  const [nombres, setNombres]                 = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [rut, setRut]                         = useState('');
  const [email, setEmail]                     = useState('');
  const [telefono, setTelefono]               = useState('');
  const [cursoId, setCursoId]                 = useState('');
  const [empresaId, setEmpresaId]             = useState('');
  const [codigoEmpleado, setCodigoEmpleado]   = useState('');
  const [especialidad, setEspecialidad]       = useState('');
  const [biografia, setBiografia]             = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/cursos/', { params: { estado: 'activo' } }),
      empresaService.listarActivas(),
    ]).then(([resCursos, resEmpresas]) => {
      setCursos(resCursos.data?.results ?? resCursos.data ?? []);
      setEmpresas(resEmpresas);
    }).catch(() => {}).finally(() => setLoadingCursos(false));
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!nombres.trim() || !apellidoPaterno.trim() || !rut.trim() || !email.trim()) {
      setError('Nombre, apellido paterno, RUT y correo son obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      const rutLimpio = rut.replace(/\./g, '').replace('-', '');
      const rutNumero = parseInt(rutLimpio.slice(0, -1));
      const rutDv     = rutLimpio.slice(-1).toUpperCase();

      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + rutNumero;
      const userRes = await api.post('/users/', {
        username,
        email,
        password:   `Jc${rutNumero}${rutDv}!`,
        first_name: nombres,
        last_name:  apellidoPaterno,
        is_active:  true,
      });

      const perfilPayload: Record<string, unknown> = {
        user:             userRes.data.id,
        rut_numero:       rutNumero,
        rut_dv:           rutDv,
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        telefono,
        tipo_usuario:     rol,
        activo:           true,
        ...(rol === 'estudiante' && empresaId      ? { empresa:         parseInt(empresaId) } : {}),
        ...(rol === 'estudiante' && codigoEmpleado ? { codigo_empleado: codigoEmpleado }      : {}),
      };

      const perfilRes = await api.post('/usuarios/', perfilPayload);

      if (rol === 'estudiante' && cursoId) {
        await api.post('/inscripciones/', {
          estudiante: perfilRes.data.id,
          curso:      parseInt(cursoId),
          estado:     'inscrito',
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, unknown> } };
      const msg = axiosErr?.response?.data
        ? Object.values(axiosErr.response.data).flat().join(' ')
        : 'Error al crear el usuario. Intenta nuevamente.';
      setError(String(msg));
    } finally {
      setGuardando(false);
    }
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
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

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
              <Input label="Nombres *"          placeholder="Ej: Carlos Andrés"    value={nombres}          onChange={e => setNombres(e.target.value)} />
              <Input label="Apellido Paterno *" placeholder="Ej: Pérez"            value={apellidoPaterno}  onChange={e => setApellidoPaterno(e.target.value)} />
              <Input label="Apellido Materno"   placeholder="Ej: González"         value={apellidoMaterno}  onChange={e => setApellidoMaterno(e.target.value)} />
              <Input label="RUT *"              placeholder="12.345.678-9"          value={rut}              onChange={e => setRut(e.target.value)} />
              <Input label="Correo *"           type="email" placeholder="correo@empresa.cl" value={email}  onChange={e => setEmail(e.target.value)} />
              <Input label="Teléfono"           type="tel"   placeholder="+56 9 1234 5678"  value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>
          </div>

          {rol === 'estudiante' ? (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400" /> Empresa Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                    <div className="relative">
                      <select
                        className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20 appearance-none pr-8"
                        value={empresaId}
                        onChange={e => setEmpresaId(e.target.value)}
                      >
                        <option value="">-- Sin empresa --</option>
                        {empresas.map(e => (
                          <option key={e.id} value={e.id}>{e.nombre} ({e.codigo_empresa})</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <Input
                    label="Código Empleado"
                    placeholder="Ej: SC-0042"
                    value={codigoEmpleado}
                    onChange={e => setCodigoEmpleado(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 border-b pb-2">
                  Asignación de Curso <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
                  {loadingCursos ? (
                    <div className="w-full h-10 bg-slate-100 animate-pulse rounded-lg" />
                  ) : cursos.length === 0 ? (
                    <div className="w-full border border-amber-200 bg-amber-50 rounded-lg p-2.5 text-sm text-amber-700">
                      No hay cursos activos disponibles
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20 appearance-none pr-8"
                        value={cursoId}
                        onChange={e => setCursoId(e.target.value)}
                      >
                        <option value="">-- Sin curso por ahora --</option>
                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b pb-2">Información Profesional</h3>
              <Input label="Especialidad *" placeholder="Ej: Especialista en HACCP" value={especialidad} onChange={e => setEspecialidad(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biografía Breve</label>
                <textarea rows={3} placeholder="Descripción profesional..." value={biografia} onChange={e => setBiografia(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-jc-blue/20" />
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">🔑 Contraseña temporal</p>
            <p>Se generará automáticamente como <span className="font-mono">Jc + RUT + dígito verificador + !</span><br />
            El usuario deberá cambiarla en su primer inicio de sesión.</p>
          </div>
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

// ── Modal Inscripción Masiva por Empresa ──────────────────────────────────────

function ModalMasivo({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [empresas, setEmpresas]         = useState<EmpresaCliente[]>([]);
  const [cursos, setCursos]             = useState<CursoOpcion[]>([]);
  const [empresaId, setEmpresaId]       = useState('');
  const [cursoId, setCursoId]           = useState('');
  const [loading, setLoading]           = useState(true);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [resultado, setResultado]       = useState<{ inscritos: number; ya_inscritos: number; total_empleados: number } | null>(null);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      empresaService.listarActivas(),
      api.get('/cursos/', { params: { estado: 'activo' } }),
    ]).then(([resEmpresas, resCursos]) => {
      setEmpresas(resEmpresas);
      setCursos(resCursos.data?.results ?? resCursos.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleInscribir = async () => {
    if (!empresaId || !cursoId) {
      setError('Debes seleccionar una empresa y un curso.');
      return;
    }
    setError(null);
    setInscribiendo(true);
    try {
      const res = await empresaService.inscribirEnCurso(parseInt(empresaId), parseInt(cursoId));
      setResultado(res);
    } catch {
      setError('Error al inscribir. Verifica que la empresa tenga estudiantes registrados.');
    } finally {
      setInscribiendo(false);
    }
  };

  const empresaSeleccionada = empresas.find(e => e.id === parseInt(empresaId));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-8 py-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Inscripción Masiva por Empresa</h2>
            <p className="text-sm text-slate-500 mt-0.5">Inscribe a todos los empleados de una empresa en un curso</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
        </div>

        <div className="px-8 py-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {resultado ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck size={32} className="text-green-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">¡Inscripción completada!</h3>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{resultado.inscritos}</p>
                  <p className="text-xs text-green-600 mt-1">Nuevos inscritos</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-600">{resultado.ya_inscritos}</p>
                  <p className="text-xs text-slate-500 mt-1">Ya estaban</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{resultado.total_empleados}</p>
                  <p className="text-xs text-blue-600 mt-1">Total empleados</p>
                </div>
              </div>
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="mt-6 px-8 py-3 bg-jc-blue text-white rounded-xl font-semibold hover:opacity-90 transition"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                  <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Empresa Cliente <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20 appearance-none pr-8"
                        value={empresaId}
                        onChange={e => setEmpresaId(e.target.value)}
                      >
                        <option value="">-- Seleccionar empresa --</option>
                        {empresas.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.nombre} ({e.codigo_empresa}) — {e.total_empleados ?? 0} empleados
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    {empresaSeleccionada && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Building2 size={12} />
                        <span>{empresaSeleccionada.total_empleados ?? 0} estudiantes serán inscritos</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Curso <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20 appearance-none pr-8"
                        value={cursoId}
                        onChange={e => setCursoId(e.target.value)}
                      >
                        <option value="">-- Seleccionar curso --</option>
                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <Alert variant="info" title="¿Cómo funciona?">
                    Se inscriben automáticamente todos los empleados de tipo <strong>estudiante</strong> asociados a la empresa. Si alguno ya estaba inscrito, no se duplica.
                  </Alert>
                </>
              )}
            </>
          )}
        </div>

        {!resultado && (
          <div className="px-8 py-5 border-t bg-slate-50 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleInscribir} isLoading={inscribiendo} disabled={!empresaId || !cursoId}>
              <Users size={16} className="mr-2" /> Inscribir Todos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal Ver / Editar ────────────────────────────────────────────────────────

function ModalUsuario({
  usuario, isEditMode, isSaving, empresas,
  onCambiar, onGuardar, onCerrar, onIrEditar, onEliminar,
}: {
  usuario: UsuarioAPI;
  isEditMode: boolean;
  isSaving: boolean;
  empresas: EmpresaCliente[];
  onCambiar: (c: Partial<UsuarioAPI>) => void;
  onGuardar: () => void;
  onCerrar: () => void;
  onIrEditar: () => void;
  onEliminar: () => void;
}) {
  const nombre = usuario.nombre_completo || usuario.user.username;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {isEditMode
              ? <Pencil size={18} className="text-amber-500" />
              : <Eye    size={18} className="text-jc-blue" />
            }
            {isEditMode ? 'Editar Usuario' : 'Detalles del Usuario'}
          </h3>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {isEditMode ? (
            <>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Usuario</p>
                <p className="font-semibold text-slate-800">{nombre}</p>
                <p className="text-xs text-slate-500">{usuario.user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Usuario</label>
                <select
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20"
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
                <select
                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20"
                  value={usuario.activo ? 'activo' : 'inactivo'}
                  onChange={e => onCambiar({ activo: e.target.value === 'activo' })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo (bloqueado)</option>
                </select>
              </div>

              {usuario.tipo_usuario === 'estudiante' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Empresa Cliente</label>
                    <div className="relative">
                      <select
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20 appearance-none pr-8"
                        value={usuario.empresa ?? ''}
                        onChange={e => onCambiar({ empresa: e.target.value ? parseInt(e.target.value) : null })}
                      >
                        <option value="">-- Sin empresa --</option>
                        {empresas.map(e => (
                          <option key={e.id} value={e.id}>{e.nombre} ({e.codigo_empresa})</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código Empleado</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-jc-blue/20 font-mono text-sm"
                      placeholder="Ej: SC-0042"
                      value={usuario.codigo_empleado ?? ''}
                      onChange={e => onCambiar({ codigo_empleado: e.target.value })}
                    />
                  </div>
                </>
              )}
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
                {(usuario.empresa_data || usuario.empresa_actual) && (
                  <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1">
                      <Building2 size={10} /> Empresa
                    </p>
                    <p className="text-sm text-slate-700 mt-1 font-semibold">
                      {usuario.empresa_data?.nombre ?? usuario.empresa_actual}
                    </p>
                    {usuario.empresa_data && (
                      <p className="text-xs text-slate-500 font-mono">{usuario.empresa_data.codigo_empresa}</p>
                    )}
                    {usuario.codigo_empleado && (
                      <p className="text-xs text-slate-500 mt-0.5">Código empleado: <span className="font-mono">{usuario.codigo_empleado}</span></p>
                    )}
                    {usuario.cargo_actual && (
                      <p className="text-xs text-slate-500">{usuario.cargo_actual}</p>
                    )}
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
              <button
                onClick={onEliminar}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold transition"
              >
                <Trash2 size={15} /> Eliminar
              </button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onCerrar}>Cancelar</Button>
                <Button onClick={onGuardar} isLoading={isSaving}>
                  <Save size={16} className="mr-2" /> Guardar Cambios
                </Button>
              </div>
            </>
          ) : (
            <Button className="w-full" onClick={onIrEditar}>
              <Pencil size={16} className="mr-2" /> Editar Tipo / Estado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AdminUsuariosPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const sidebarSections  = useSidebarSections();

  const [usuarios, setUsuarios]   = useState<UsuarioAPI[]>([]);
  const [empresas, setEmpresas]   = useState<EmpresaCliente[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [tabActivo, setTabActivo] = useState<TabActivo>('estudiantes');
  const [busqueda, setBusqueda]   = useState('');

  const [modalInscripcion, setModalInscripcion] = useState(false);
  const [modalMasivo, setModalMasivo]           = useState(false);
  const [usuarioSel, setUsuarioSel]             = useState<UsuarioAPI | null>(null);
  const [isEditMode, setIsEditMode]             = useState(false);
  const [isSaving, setIsSaving]                 = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resUsuarios, resEmpresas] = await Promise.all([
        api.get('/usuarios/'),
        empresaService.listarActivas(),
      ]);
      setUsuarios(resUsuarios.data?.results ?? resUsuarios.data ?? []);
      setEmpresas(resEmpresas);
    } catch {
      setError('No se pudieron cargar los usuarios. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleGuardar = async () => {
    if (!usuarioSel) return;
    setIsSaving(true);
    try {
      await api.patch(`/usuarios/${usuarioSel.id}/`, {
        tipo_usuario:    usuarioSel.tipo_usuario,
        activo:          usuarioSel.activo,
        empresa:         usuarioSel.empresa ?? null,
        codigo_empleado: usuarioSel.codigo_empleado ?? '',
      });
      await cargarDatos();
      setUsuarioSel(null);
    } catch {
      alert('Error al actualizar el usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async (usuarioId: number) => {
    try {
      await api.delete(`/usuarios/${usuarioId}/`);
      await cargarDatos();
      setUsuarioSel(null);
    } catch {
      alert('Error al eliminar el usuario.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tipoTab: TipoUsuario = tabActivo === 'relatores' ? 'relator' : 'estudiante';
  const usuariosFiltrados = usuarios
    .filter(u => u.tipo_usuario === tipoTab)
    .filter(u => {
      const n = (u.nombre_completo || u.user.username).toLowerCase();
      return (
        n.includes(busqueda.toLowerCase()) ||
        u.user.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.rut_completo ?? '').includes(busqueda) ||
        (u.empresa_data?.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
      );
    });

  const estudiantes = usuarios.filter(u => u.tipo_usuario === 'estudiante');
  const relatores   = usuarios.filter(u => u.tipo_usuario === 'relator');

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

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={() => setModalInscripcion(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-jc-blue to-[#043360] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <UserPlus size={20} className="mr-2" /> Inscribir Usuario
          </button>
          <button
            onClick={() => setModalMasivo(true)}
            className="inline-flex items-center px-6 py-3 bg-jc-calipso text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Building2 size={20} className="mr-2" /> Inscripción por Empresa
          </button>
        </div>

        {error && <Alert variant="danger" title="Error al cargar usuarios">{error}</Alert>}

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            icon={<Users size={24} className="text-blue-600" />}
            iconBg="bg-blue-100" label="Usuarios registrados"
            valor={loading ? '—' : String(usuarios.length)}
            tag="Total" tagColor="text-blue-600"
          />
          <MetricCard
            icon={<GraduationCap size={24} className="text-green-600" />}
            iconBg="bg-green-100" label="Alumnos en plataforma"
            valor={loading ? '—' : String(estudiantes.length)}
            tag="Estudiantes" tagColor="text-green-600"
          />
          <MetricCard
            icon={<Mic2 size={24} className="text-blue-600" />}
            iconBg="bg-blue-100" label="Docentes asignados"
            valor={loading ? '—' : String(relatores.length)}
            tag="Relatores" tagColor="text-blue-600"
          />
          <MetricCard
            icon={<Building2 size={24} className="text-teal-600" />}
            iconBg="bg-teal-100" label="Empresas clientes"
            valor={loading ? '—' : String(empresas.length)}
            tag="Empresas" tagColor="text-teal-600"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-0">
            <button onClick={() => { setTabActivo('estudiantes'); setBusqueda(''); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${tabActivo === 'estudiantes' ? 'border-jc-blue text-jc-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <GraduationCap size={16} /> Estudiantes
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tabActivo === 'estudiantes' ? 'bg-jc-blue/10 text-jc-blue' : 'bg-slate-100 text-slate-500'}`}>{estudiantes.length}</span>
            </button>
            <button onClick={() => { setTabActivo('relatores'); setBusqueda(''); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${tabActivo === 'relatores' ? 'border-jc-blue text-jc-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <Mic2 size={16} /> Relatores
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tabActivo === 'relatores' ? 'bg-jc-blue/10 text-jc-blue' : 'bg-slate-100 text-slate-500'}`}>{relatores.length}</span>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={`Buscar por nombre, RUT, correo${tabActivo === 'estudiantes' ? ' o empresa' : ''}...`}
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-jc-blue outline-none"
              />
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
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
                  <div className="flex-1 space-y-2">
                    <div className="w-40 h-3 bg-slate-200 rounded" />
                    <div className="w-56 h-2 bg-slate-100 rounded" />
                  </div>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {tabActivo === 'estudiantes' ? 'Estudiante' : 'Relator'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RUT</th>
                    {tabActivo === 'estudiantes' && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Empresa</th>
                    )}
                    {tabActivo === 'estudiantes' && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Progreso</th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usuariosFiltrados.map((u, idx) => (
                    <FilaUsuario
                      key={u.id}
                      usuario={u}
                      colorAvatar={COLORES_AVATAR[idx % COLORES_AVATAR.length]}
                      mostrarProgreso={tabActivo === 'estudiantes'}
                      onVer={()    => { setUsuarioSel(u);         setIsEditMode(false); }}
                      onEditar={()  => { setUsuarioSel({ ...u }); setIsEditMode(true);  }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modales */}
      {modalInscripcion && (
        <ModalInscripcion
          onClose={() => setModalInscripcion(false)}
          onSuccess={cargarDatos}
        />
      )}
      {modalMasivo && (
        <ModalMasivo
          onClose={() => setModalMasivo(false)}
          onSuccess={cargarDatos}
        />
      )}
      {usuarioSel && (
        <ModalUsuario
          usuario={usuarioSel}
          isEditMode={isEditMode}
          isSaving={isSaving}
          empresas={empresas}
          onCambiar={c => setUsuarioSel(prev => prev ? { ...prev, ...c } : prev)}
          onGuardar={handleGuardar}
          onCerrar={() => setUsuarioSel(null)}
          onIrEditar={() => setIsEditMode(true)}
          onEliminar={() => handleEliminar(usuarioSel.id)}
        />
      )}
    </MainLayout>
  );
}