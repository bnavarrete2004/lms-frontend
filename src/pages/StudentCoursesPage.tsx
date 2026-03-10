// src/pages/StudentCoursesPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  BookOpen, Clock, CheckCircle, ChevronRight, BookMarked,
  Compass, Users, Loader2, X, Calendar, ChevronDown, ChevronUp,
  GraduationCap, LayoutList,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { inscripcionService, type Inscripcion } from '@/api/services/inscripcionService';
import { cursoService, type Curso } from '@/api/services/cursoService';

// ─── Helpers ────────────────────────────────────────────────

const getStatusLabel = (estado: string) => {
  const labels: Record<string, { text: string; variant: any }> = {
    en_curso:   { text: 'En Curso',    variant: 'info' },
    inscrito:   { text: 'Por Iniciar', variant: 'warning' },
    completado: { text: 'Finalizado',  variant: 'success' },
    aprobado:   { text: 'Aprobado',    variant: 'success' },
    reprobado:  { text: 'No Aprobado', variant: 'danger' },
  };
  return labels[estado] || { text: estado, variant: 'default' };
};

const getTemporalChip = (estadoTemporal?: string, fechaInicio?: string) => {
  if (estadoTemporal === 'programado') {
    const fecha = fechaInicio
      ? new Date(fechaInicio).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';
    return { mostrar: true, texto: `Disponible el ${fecha}`, clases: 'bg-amber-100 text-amber-700' };
  }
  if (estadoTemporal === 'cerrado') {
    return { mostrar: true, texto: 'Curso finalizado', clases: 'bg-slate-100 text-slate-500' };
  }
  return { mostrar: false, texto: '', clases: '' };
};

const formatFecha = (fecha?: string) =>
  fecha ? new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

// ─── Sidebar ────────────────────────────────────────────────

const sidebarSections = [
  {
    title: 'Menú Principal',
    items: [
      {
        href: '/student/dashboard',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        label: 'Mi Panel',
      },
      {
        href: '/student/courses',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        label: 'Mis Cursos',
        isActive: true,
      },
      {
        href: '/student/diplomas',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        label: 'Mis Diplomas',
      },
      {
        href: '/student/progress',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        label: 'Mi Progreso',
      },
      {
        href: '/student/notifications',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
        label: 'Notificaciones',
        badge: 2,
        badgeVariant: 'danger' as const,
        badgeAnimated: true,
      },
    ],
  },
  {
    title: 'Configuración',
    items: [
      {
        href: '/student/profile',
        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        label: 'Mi Perfil',
      },
    ],
  },
];

// ─── Toast ───────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-sm font-semibold
      ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
      {message}
    </div>
  );
}

// ─── Drawer Detalle Curso ─────────────────────────────────────

interface CursoDetalleDrawerProps {
  curso: Curso;
  onClose: () => void;
  onInscribirse: (cursoId: number) => Promise<void>;
  inscribiendose: boolean;
}

function CursoDetalleDrawer({ curso, onClose, onInscribirse, inscribiendose }: CursoDetalleDrawerProps) {
  const [modulosExpanded, setModulosExpanded] = useState(false);
  const hayLugar = !curso.cupo_maximo || (curso.cupos_disponibles ?? 1) > 0;
  const relatores = (curso as any).relatores ?? [];
  const modulos = (curso as any).modulos ?? [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-50 w-full max-w-lg flex flex-col bg-white shadow-2xl">

        {/* Hero con imagen */}
        <div className="relative h-56 flex-shrink-0 overflow-hidden">
          <img
            src={curso.imagen_portada || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
            alt={curso.nombre}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all"
          >
            <X size={18} />
          </button>

          {/* Título */}
          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="text-xl font-bold text-white leading-tight drop-shadow-lg">
              {curso.nombre}
            </h2>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">

          {/* Pills metadata */}
          <div className="flex flex-wrap gap-2 px-5 pt-5 pb-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
              <Clock size={11} />
              {curso.horas_totales}h totales
            </span>
            {curso.fecha_inicio && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs font-bold">
                <Calendar size={11} />
                {formatFecha(curso.fecha_inicio)}
                {curso.fecha_fin && ` → ${formatFecha(curso.fecha_fin)}`}
              </span>
            )}
            {curso.cupo_maximo ? (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                ${hayLugar ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                <Users size={11} />
                {hayLugar ? `${curso.cupos_disponibles} cupos disponibles` : 'Sin cupos'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                <Users size={11} />
                Cupos libres
              </span>
            )}
          </div>

          <div className="px-5 space-y-5 pb-6">

            {/* Descripción */}
            {curso.descripcion && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{curso.descripcion}</p>
              </div>
            )}

            {/* Relator(es) */}
            {relatores.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {relatores.length === 1 ? 'Relator' : 'Relatores'}
                </h3>
                <div className="flex flex-col gap-2">
                  {relatores.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {r.relator_nombre || r.nombre_completo || `Relator #${r.relator}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Módulos colapsables */}
            {modulos.length > 0 && (
              <div>
                <button
                  onClick={() => setModulosExpanded(v => !v)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LayoutList size={14} className="text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">
                      Contenido del curso
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                      {modulos.length} módulos
                    </span>
                  </div>
                  {modulosExpanded
                    ? <ChevronUp size={15} className="text-slate-400" />
                    : <ChevronDown size={15} className="text-slate-400" />
                  }
                </button>

                {modulosExpanded && (
                  <div className="mt-2 space-y-1.5">
                    {modulos.map((m: any, i: number) => (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 rounded-xl">
                        <span className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700 font-medium flex-1">{m.nombre}</span>
                        {m.horas_estimadas && (
                          <span className="text-xs text-slate-400 font-semibold flex-shrink-0">
                            {m.horas_estimadas}h
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer fijo con botón */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
          <button
            onClick={() => hayLugar && !inscribiendose && onInscribirse(curso.id)}
            disabled={!hayLugar || inscribiendose}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
              ${hayLugar && !inscribiendose
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-200 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            {inscribiendose ? (
              <><Loader2 size={16} className="animate-spin" /> Inscribiendo...</>
            ) : hayLugar ? (
              'Inscribirme en este curso'
            ) : (
              'Sin cupos disponibles'
            )}
          </button>
          {hayLugar && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Quedarás inscrito de inmediato y el curso aparecerá en "Mis Cursos"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card Catálogo ───────────────────────────────────────────

function CatalogoCursoCard({ curso, onClick }: { curso: Curso; onClick: () => void }) {
  const hayLugar = !curso.cupo_maximo || (curso.cupos_disponibles ?? 1) > 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:border-teal-200 group cursor-pointer flex flex-col"
    >
      <div className="h-40 overflow-hidden relative flex-shrink-0">
        {!hayLugar && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 flex items-center justify-center">
            <span className="text-white font-bold text-xs bg-slate-800/80 px-3 py-1 rounded-full">Sin cupos</span>
          </div>
        )}
        <img
          src={curso.imagen_portada || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
          alt={curso.nombre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-bold text-slate-800 mb-1 leading-tight line-clamp-2 text-sm">
          {curso.nombre}
        </h4>
        {curso.descripcion && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed flex-1">
            {curso.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
            <Clock size={11} className="text-teal-500" />
            {curso.horas_totales}h
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
            ${hayLugar ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
            {hayLugar ? 'Disponible' : 'Sin cupos'}
          </span>
        </div>

        <div className="mt-3 w-full py-2 bg-teal-50 text-teal-600 rounded-lg font-bold text-xs text-center group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-cyan-500 group-hover:text-white transition-all">
          Ver detalles →
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────

export function StudentCoursesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loadingInscripciones, setLoadingInscripciones] = useState(true);
  const [errorInscripciones, setErrorInscripciones] = useState<string | null>(null);

  const [catalogo, setCatalogo] = useState<Curso[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);

  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [inscribiendoId, setInscribiendoId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'en_curso' | 'completados'>('todos');

  const fetchInscripciones = async () => {
    try {
      setLoadingInscripciones(true);
      const data = await inscripcionService.getMisInscripciones();
      setInscripciones(data);
    } catch {
      setErrorInscripciones('No se pudieron cargar tus cursos.');
    } finally {
      setLoadingInscripciones(false);
    }
  };

  const fetchCatalogo = async () => {
    try {
      setLoadingCatalogo(true);
      const data = await cursoService.getCatalogo();
      setCatalogo(data);
    } catch {
      setCatalogo([]);
    } finally {
      setLoadingCatalogo(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
    fetchCatalogo();
  }, []);

  const handleInscribirse = async (cursoId: number) => {
    setInscribiendoId(cursoId);
    try {
      await cursoService.inscribirse(cursoId);
      setToast({ message: '¡Te inscribiste exitosamente! El curso ya aparece en Mis Cursos.', type: 'success' });
      setCursoSeleccionado(null);
      await Promise.all([fetchInscripciones(), fetchCatalogo()]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'No se pudo completar la inscripción.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setInscribiendoId(null);
    }
  };

  const cursosFiltrados = useMemo(() => {
    if (filtro === 'en_curso') return inscripciones.filter(i => i.estado === 'en_curso' || i.estado === 'inscrito');
    if (filtro === 'completados') return inscripciones.filter(i => i.estado === 'completado' || i.estado === 'aprobado');
    return inscripciones;
  }, [inscripciones, filtro]);

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || 'Estudiante'}
      userSubtitle={user?.rut}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Mis Capacitaciones"
      headerSubtitle="Lista completa de tus cursos y estados de avance"
    >
      <div className="space-y-10">

        {/* Widgets resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <BookOpen />, bg: 'bg-blue-50', color: 'text-blue-600', value: inscripciones.length, label: 'Cursos Totales' },
            { icon: <Clock />, bg: 'bg-amber-50', color: 'text-amber-600', value: inscripciones.filter(i => i.estado === 'en_curso').length, label: 'En Progreso' },
            { icon: <CheckCircle />, bg: 'bg-green-50', color: 'text-green-600', value: inscripciones.filter(i => i.estado === 'aprobado').length, label: 'Certificados' },
          ].map((w, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 ${w.bg} ${w.color} rounded-lg flex items-center justify-center`}>{w.icon}</div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{w.value}</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">{w.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══ MIS CURSOS ══ */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Mis Cursos</h2>
              <p className="text-xs text-slate-500">Cursos en los que estás inscrito</p>
            </div>
            <div className="flex gap-2">
              {(['todos', 'en_curso', 'completados'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filtro === f
                      ? 'bg-slate-800 text-white shadow'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f === 'todos' ? 'Todos' : f === 'en_curso' ? 'En Curso' : 'Completados'}
                </button>
              ))}
            </div>
          </div>

          {loadingInscripciones ? (
            <div className="flex items-center justify-center p-16 text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-medium text-sm">Cargando tus cursos...</span>
            </div>
          ) : errorInscripciones ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 text-sm">{errorInscripciones}</div>
          ) : inscripciones.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookMarked size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Todavía no estás inscrito en ningún curso</h3>
              <p className="text-slate-500 text-sm">Explora los cursos disponibles más abajo para inscribirte.</p>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-slate-500 text-sm">No tienes cursos en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {cursosFiltrados.map(i => {
                const statusInfo = getStatusLabel(i.estado);
                const estadoTemporal = i.curso_data?.estado_temporal;
                const bloqueado = estadoTemporal === 'programado' || estadoTemporal === 'cerrado';
                const chip = getTemporalChip(estadoTemporal, i.curso_data?.fecha_inicio);

                return (
                  <div
                    key={i.id}
                    onClick={() => { if (!bloqueado) navigate(`/student/courses/${i.curso}`); }}
                    className={`bg-white rounded-2xl border border-slate-200 p-6 transition-all flex items-center justify-between
                      ${bloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer group'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={i.curso_data?.imagen_portada || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200'}
                          className={`w-full h-full object-cover transition-transform duration-500 ${!bloqueado ? 'group-hover:scale-110' : ''}`}
                          alt="Curso"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base mb-1">{i.curso_data?.nombre}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold uppercase">
                          <span className="flex items-center gap-1"><Clock size={12} /> {i.curso_data?.horas_totales}H</span>
                          <span className="flex items-center gap-1"><CheckCircle size={12} /> {i.porcentaje_avance}% Avance</span>
                        </div>
                        {chip.mostrar && (
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${chip.clases}`}>
                            {chip.texto}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold">
                          INSCRITO: {new Date(i.fecha_inscripcion).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <ChevronRight className={`transition-all ${bloqueado ? 'text-slate-200' : 'text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══ CATÁLOGO ══ */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-100">
              <Compass size={14} className="text-teal-500" />
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Explorar Cursos Disponibles</span>
            </div>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Cursos Disponibles</h2>
            <p className="text-xs text-slate-500">Haz clic en un curso para ver los detalles e inscribirte</p>
          </div>

          {loadingCatalogo ? (
            <div className="flex items-center justify-center p-16 text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={20} />
              <span className="font-medium text-sm">Buscando cursos disponibles...</span>
            </div>
          ) : catalogo.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass size={32} className="text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">No hay cursos disponibles en este momento</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Cuando el administrador publique nuevos cursos, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {catalogo.map(curso => (
                <CatalogoCursoCard
                  key={curso.id}
                  curso={curso}
                  onClick={() => setCursoSeleccionado(curso)}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Drawer detalle */}
      {cursoSeleccionado && (
        <CursoDetalleDrawer
          curso={cursoSeleccionado}
          onClose={() => setCursoSeleccionado(null)}
          onInscribirse={handleInscribirse}
          inscribiendose={inscribiendoId === cursoSeleccionado.id}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </MainLayout>
  );
}