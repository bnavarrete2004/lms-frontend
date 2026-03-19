// src/pages/StudentDashboardPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseCard } from '@/components/common/CourseCard';
import { AvailableCourseCard } from '@/components/common/AvailableCourseCard';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { useApi } from '@/hooks/useApi';
import { inscripcionService, type Inscripcion } from '@/api/services/inscripcionService';
import { cursoService, type Curso } from '@/api/services/cursoService';
import { WelcomeBanner } from '@/components/student/WelcomeBanner';

// ─── Sticky Notes ─────────────────────────────────────────────────────────────

interface StickyNote {
  id: string;
  texto: string;
  creado: string;
}

const STORAGE_KEY = 'lms_sticky_notes';

function loadNotes(): StickyNote[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function StickyNotesWidget() {
  const [notes, setNotes] = useState<StickyNote[]>(() => loadNotes());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (adding && textareaRef.current) textareaRef.current.focus();
  }, [adding]);

  const addNote = () => {
    if (!newText.trim()) { setAdding(false); return; }
    setNotes(prev => [{
      id: Date.now().toString(),
      texto: newText.trim(),
      creado: new Date().toISOString(),
    }, ...prev]);
    setNewText('');
    setAdding(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateNote = (id: string, texto: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, texto } : n));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="text-base">📌</span> Mis Notas
        </h3>
        <button
          onClick={() => { setAdding(true); setNewText(''); }}
          className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          + Nueva nota
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {adding && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <textarea
              ref={textareaRef}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote();
                if (e.key === 'Escape') setAdding(false);
              }}
              placeholder="Escribe tu nota..."
              rows={3}
              className="w-full text-xs text-slate-700 bg-transparent resize-none outline-none placeholder-amber-400"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setAdding(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">
                Cancelar
              </button>
              <button
                onClick={addNote}
                className="text-xs font-bold bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 && !adding && (
          <div className="text-center py-6 text-slate-400">
            <p className="text-2xl mb-1">📝</p>
            <p className="text-xs">Sin notas todavía</p>
          </div>
        )}

        {notes.map(note => (
          <div key={note.id} className="group bg-amber-50 border border-amber-100 rounded-xl p-3 hover:border-amber-300 transition-all">
            {editingId === note.id ? (
              <textarea
                autoFocus
                value={note.texto}
                onChange={e => updateNote(note.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                onKeyDown={e => { if (e.key === 'Escape') setEditingId(null); }}
                rows={3}
                className="w-full text-xs text-slate-700 bg-transparent resize-none outline-none"
              />
            ) : (
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-xs text-slate-700 leading-relaxed flex-1 cursor-text whitespace-pre-wrap"
                  onClick={() => setEditingId(note.id)}
                >
                  {note.texto}
                </p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-[10px] text-amber-400 mt-1.5 font-medium">
              {new Date(note.creado).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hitos Próximos ──────────────────────────────────────────────────────────

function HitosProximos({ inscripciones }: { inscripciones: Inscripcion[] }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const hitos: { tipo: 'vence' | 'inicia'; nombre: string; diasRestantes: number }[] = [];

  for (const ins of inscripciones) {
    const data = ins.curso_data;
    if (!data) continue;

    if (data.fecha_fin) {
      const fechaFin = new Date(data.fecha_fin);
      fechaFin.setHours(0, 0, 0, 0);
      const dias = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (dias >= 0 && dias <= 14) {
        hitos.push({ tipo: 'vence', nombre: data.nombre, diasRestantes: dias });
      }
    }

    if (data.fecha_inicio && data.estado_temporal === 'programado') {
      const fechaInicio = new Date(data.fecha_inicio);
      fechaInicio.setHours(0, 0, 0, 0);
      const dias = Math.ceil((fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (dias >= 0 && dias <= 14) {
        hitos.push({ tipo: 'inicia', nombre: data.nombre, diasRestantes: dias });
      }
    }
  }

  hitos.sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
        <span className="text-base">🗓️</span> Hitos Próximos
      </h3>
      {hitos.length === 0 ? (
        <div className="text-center py-5 text-slate-400">
          <p className="text-xs">Sin hitos en los próximos 14 días</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hitos.map((h, i) => {
            const urgente = h.diasRestantes <= 3;
            const medio = h.diasRestantes <= 7;
            const esVence = h.tipo === 'vence';
            const colorClasses = esVence
              ? urgente ? 'bg-red-50 border-red-200 text-red-700' : medio ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-orange-50 border-orange-100 text-orange-700'
              : 'bg-blue-50 border-blue-100 text-blue-700';
            const subColorClasses = esVence
              ? urgente ? 'text-red-500' : medio ? 'text-amber-500' : 'text-orange-400'
              : 'text-blue-400';
            const emoji = esVence ? (urgente ? '🔴' : '🟡') : '🔵';
            const textoFecha = h.diasRestantes === 0 ? 'hoy' : h.diasRestantes === 1 ? 'mañana' : `en ${h.diasRestantes} días`;

            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${colorClasses}`}>
                <span className="text-base flex-shrink-0 mt-0.5">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{h.nombre}</p>
                  <p className={`mt-0.5 ${subColorClasses}`}>
                    {esVence ? 'Vence' : 'Comienza'} {textoFecha}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleCourseClick = (cursoId: number) => navigate(`/student/courses/${cursoId}`);

  const {
    data: inscripciones,
    loading: loadingInscripciones,
    error: errorInscripciones,
    execute: cargarInscripciones,
  } = useApi(() => inscripcionService.getMisInscripciones());

  const [catalogo, setCatalogo] = useState<Curso[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);

  useEffect(() => {
    cargarInscripciones();
    cursoService.getCatalogo()
      .then(data => setCatalogo(data))
      .catch(() => setCatalogo([]))
      .finally(() => setLoadingCatalogo(false));
  }, []);

  const inscripcionesActivas = inscripciones?.filter(
  i => i.estado === 'en_curso' || i.estado === 'inscrito') || [];
  const progresoGeneral = inscripciones && inscripciones.length > 0
    ? Math.round(inscripciones.reduce((sum, i) => sum + (i.porcentaje_avance || 0), 0) / inscripciones.length)
    : 0;

  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { href: '/student/dashboard', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label: 'Mi Panel', isActive: true },
        { href: '/student/courses', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, label: 'Mis Cursos' },
        { href: '/student/diplomas', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Mis Diplomas' },
        { href: '/student/progress', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, label: 'Mi Progreso' },
        { href: '/student/notifications', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, label: 'Notificaciones', badge: 2, badgeVariant: 'danger' as const, badgeAnimated: true },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { href: '/student/profile', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, label: 'Mi Perfil' },
      ],
    },
  ];

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Usuario'}
      userSubtitle={user?.rut || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Dashboard General"
      headerSubtitle={`Bienvenido de vuelta, ${user?.nombre_completo || user?.username || 'Usuario'}`}
      sessionTime="1h 23min"
      notificationCount={2}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Columna principal ── */}
        <div className="xl:col-span-8 space-y-8">

          {/* Banner de bienvenida */}
          {loadingInscripciones ? (
            <div className="h-56 bg-slate-200 animate-pulse rounded-2xl" />
          ) : (
            <WelcomeBanner
              nombreCompleto={user?.nombre_completo || user?.username || 'Estudiante'}
              inscripciones={inscripciones || []}
            />
          )}

          {/* Capacitaciones Activas */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <span className="w-2 h-8 bg-jc-blue rounded-full mr-3" />
                Capacitaciones Activas
              </h3>
              <Badge variant="info" className="text-slate-600 bg-slate-100">{inscripcionesActivas.length} En curso</Badge>
            </div>

            {loadingInscripciones ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
                <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
              </div>
            ) : errorInscripciones ? (
              <Alert variant="danger" title="Error al cargar cursos"><p className="text-sm">{errorInscripciones.message}</p></Alert>
            ) : inscripcionesActivas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inscripcionesActivas.map(ins => {
                  const bloqueado = ins.curso_data?.estado_temporal === 'programado' || ins.curso_data?.estado_temporal === 'cerrado';
                  return (
                    <div key={ins.id} style={bloqueado ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
                      <CourseCard
                        title={ins.curso_data?.nombre || 'Sin título'}
                        image={ins.curso_data?.imagen_portada || ''}
                        senceId={ins.curso_data?.codigo_sence_data?.codigo}
                        duration={`${ins.curso_data?.horas_totales || 0} Horas lectivas`}
                        progress={ins.porcentaje_avance || 0}
                        onClick={() => { if (!bloqueado) handleCourseClick(ins.curso); }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <Alert variant="info" title="No tienes cursos activos"><p className="text-sm">Explora el catálogo para inscribirte en nuevos cursos</p></Alert>
            )}
          </section>
        </div>

        {/* ── Aside ── */}
        <aside className="xl:col-span-4 space-y-6">

          {/* Hitos Próximos — datos reales */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            {loadingInscripciones ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2 mb-3" />
                <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <HitosProximos inscripciones={inscripciones || []} />
            )}
          </div>

          {/* Progreso general */}
          <div className="bg-gradient-to-br from-jc-calipso to-jc-blue rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Progreso General</span>
              <p className="font-bold text-3xl mt-3 mb-1">{progresoGeneral}%</p>
              <p className="text-sm text-white/80">{inscripciones?.length || 0} cursos en total</p>
            </div>
          </div>

          {/* Sticky Notes — solo frontend */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <StickyNotesWidget />
          </div>

        </aside>

        {/* ── Footer: Explora más cursos ── */}
        <footer className="xl:col-span-12 pt-8 border-t border-slate-200">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Explora Más Cursos</h3>
              <p className="text-slate-500 mt-1">Potencia tu carrera profesional con estas nuevas capacitaciones</p>
            </div>
            <button onClick={() => navigate('/student/courses')} className="group flex items-center text-jc-blue font-bold hover:text-jc-calipso transition-colors">
              Ver catálogo completo
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {loadingCatalogo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl" />)}
            </div>
          ) : catalogo.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 text-sm font-medium">No hay cursos disponibles en este momento.</p>
              <p className="text-slate-400 text-xs mt-1">El administrador publicará nuevos cursos próximamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {catalogo.slice(0, 4).map(curso => (
                <AvailableCourseCard
                  key={curso.id}
                  title={curso.nombre}
                  image={curso.imagen_portada || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                  senceId={curso.codigo_sence_data?.codigo}
                  duration={`${curso.horas_totales} Horas lectivas`}
                  onClick={() => navigate('/student/courses')}
                />
              ))}
            </div>
          )}
        </footer>

      </div>
    </MainLayout>
  );
}