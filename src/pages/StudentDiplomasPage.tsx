// src/pages/StudentDiplomasPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, ExternalLink, CheckCircle2, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

interface InscripcionConDiploma {
  id: number;
  curso: number;
  curso_data: { id: number; nombre: string; codigo_sence?: string | null };
  estado: string;
  nota_final: number | null;
  nota_final_calculada: number | null;
  fecha_inscripcion: string;
  diploma_generado: boolean;
  diploma_url: string;
  diploma_codigo_validacion: string;
  encuesta_completada: boolean;
  porcentaje_avance: number;
}

export function StudentDiplomasPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState<InscripcionConDiploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/inscripciones/');
        const todas: InscripcionConDiploma[] = res.data?.results || res.data || [];
        setInscripciones(todas.filter(i => i.estado === 'aprobado' || i.estado === 'completado'));
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar tus cursos.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarSections = [
    {
      title: 'Menú Principal',
      items: [
        { href: '/student/dashboard',      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label: 'Mi Panel' },
        { href: '/student/courses',        icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, label: 'Mis Cursos' },
        { href: '/student/diplomas',       icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Mis Diplomas', isActive: true },
        { href: '/student/progress',       icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, label: 'Mi Progreso' },
        { href: '/student/notifications',  icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, label: 'Notificaciones' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { href: '/student/profile', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, label: 'Mi Perfil' },
      ],
    },
  ];

  const diplomasListos    = inscripciones.filter(i => i.diploma_generado && i.diploma_url);
  const pendienteEncuesta = inscripciones.filter(i => !i.encuesta_completada);
  const pendienteDiploma  = inscripciones.filter(i => i.encuesta_completada && !i.diploma_generado);

  const nota = (i: InscripcionConDiploma) => i.nota_final ?? i.nota_final_calculada;

  // ── Loading skeletons ────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout role="estudiante" userName={user?.nombre_completo || 'Estudiante'} sidebarSections={sidebarSections} onLogout={handleLogout} headerTitle="Mis Diplomas" headerSubtitle="Tus certificados de cursos completados">
        <div className="space-y-4 max-w-4xl mx-auto">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-56" />
                <div className="h-3 bg-slate-100 rounded w-32" />
              </div>
              <div className="w-28 h-9 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Estudiante'}
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Mis Diplomas"
      headerSubtitle="Tus certificados de cursos completados"
    >
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Sin cursos completados */}
        {!error && inscripciones.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <BookOpen size={28} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Sin cursos completados aún</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
              Finaliza un curso y aprueba el examen final para obtener tu diploma.
            </p>
            <button
              onClick={() => navigate('/student/courses')}
              className="px-6 py-2.5 bg-jc-blue text-white rounded-xl font-semibold text-sm hover:bg-jc-calipso transition-colors"
            >
              Ver mis cursos
            </button>
          </div>
        )}

        {/* ── Diplomas disponibles ── */}
        {diplomasListos.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-green-500" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Disponibles para descargar
              </h3>
            </div>

            {diplomasListos.map(i => (
              <div key={i.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex items-center gap-5">

                  {/* Ícono */}
                  <div className="w-14 h-14 bg-gradient-to-br from-jc-calipso to-jc-blue rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award size={26} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{i.curso_data?.nombre}</h4>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {nota(i) != null && (
                        <span className={`flex items-center gap-1 text-xs font-semibold ${Number(nota(i)) >= 4 ? 'text-green-600' : 'text-red-500'}`}>
                          <CheckCircle2 size={12} />
                          Nota: {Number(nota(i)).toFixed(1)}
                        </span>
                      )}
                      {i.curso_data?.codigo_sence && (
                        <span className="text-xs text-slate-400 font-mono">
                          SENCE: {i.curso_data.codigo_sence}
                        </span>
                      )}
                    </div>
                    {i.diploma_codigo_validacion && (
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        Código: {i.diploma_codigo_validacion}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={i.diploma_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-600 hover:border-jc-calipso hover:text-jc-calipso rounded-xl text-sm font-medium transition-all"
                    >
                      <ExternalLink size={14} /> Ver
                    </a>
                    <a
                      href={i.diploma_url} download
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-jc-blue text-white hover:bg-jc-calipso rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Download size={14} /> Descargar
                    </a>
                  </div>
                </div>

                {/* Footer validación */}
                {i.diploma_codigo_validacion && (
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Código de validación: <span className="text-slate-600 font-semibold">{i.diploma_codigo_validacion}</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Diploma válido
                    </span>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── Pendiente encuesta ── */}
        {pendienteEncuesta.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Pendiente — encuesta de satisfacción
              </h3>
            </div>

            {pendienteEncuesta.map(i => (
              <div key={i.id} className="bg-white rounded-2xl border border-amber-200 p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{i.curso_data?.nombre}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Completa la encuesta de satisfacción para desbloquear tu diploma
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/student/courses/${i.curso}`)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition flex-shrink-0"
                >
                  Ir al curso
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ── Diploma en proceso ── */}
        {pendienteDiploma.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-jc-calipso" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                En proceso de generación
              </h3>
            </div>

            {pendienteDiploma.map(i => (
              <div key={i.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100">
                  <Clock size={20} className="text-jc-calipso" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{i.curso_data?.nombre}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tu diploma está siendo generado, estará disponible pronto
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}

      </div>
    </MainLayout>
  );
}