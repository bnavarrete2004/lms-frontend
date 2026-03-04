// src/pages/StudentDiplomasPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, ExternalLink, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

interface Diploma {
  id: number;
  curso: { id: number; nombre: string; codigo_sence: string | null };
  fecha_termino: string | null;
  nota_final: number | null;
  diploma_url: string;
  codigo_validacion: string;
}

export function StudentDiplomasPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/diplomas/mis-diplomas/');
        setDiplomas(res.data?.diplomas ?? []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar tus diplomas.');
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
        {
          href: '/student/dashboard',
          icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
          label: 'Mi Panel',
        },
        {
          href: '/student/courses',
          icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
          label: 'Mis Cursos',
        },
        {
          href: '/student/diplomas',
          icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          label: 'Mis Diplomas',
          isActive: true,
        },
        {
          href: '/student/progress',
          icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
          label: 'Mi Progreso',
        },
      ],
    },
  ];

  const formatFecha = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <MainLayout
      role="estudiante"
      userName={user?.nombre_completo || user?.username || 'Estudiante'}
      userSubtitle="Mis Diplomas"
      sidebarSections={sidebarSections}
      onLogout={handleLogout}
      headerTitle="Mis Diplomas"
      headerSubtitle="Tus certificados de cursos completados"
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Hero banner */}
        <div className="bg-gradient-to-br from-jc-blue to-[#043360] rounded-2xl p-8 text-white flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Award size={36} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Tus Certificados</h2>
            <p className="text-blue-200 text-sm">
              {loading ? 'Cargando...' : diplomas.length === 0
                ? 'Completa tu primer curso para obtener tu diploma.'
                : `Tienes ${diplomas.length} diploma${diplomas.length !== 1 ? 's' : ''} disponible${diplomas.length !== 1 ? 's' : ''}.`}
            </p>
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-4 bg-slate-200 rounded" />
                    <div className="w-32 h-3 bg-slate-100 rounded" />
                  </div>
                  <div className="w-24 h-9 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && diplomas.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={36} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Sin diplomas aún</h3>
            <p className="text-slate-400 text-sm mb-6">
              Completa un curso, rinde el examen final y llena la encuesta de satisfacción para obtener tu diploma.
            </p>
            <button
              onClick={() => navigate('/student/courses')}
              className="px-6 py-3 bg-jc-blue text-white rounded-xl font-semibold hover:opacity-90 transition text-sm"
            >
              Ver mis cursos
            </button>
          </div>
        )}

        {!loading && !error && diplomas.length > 0 && (
          <div className="space-y-4">
            {diplomas.map(diploma => (
              <div key={diploma.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex items-center gap-5">
                  {/* Icono */}
                  <div className="w-14 h-14 bg-gradient-to-br from-jc-blue to-[#043360] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/20">
                    <Award size={28} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base truncate">{diploma.curso.nombre}</h3>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {diploma.fecha_termino && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={12} /> {formatFecha(diploma.fecha_termino)}
                        </span>
                      )}
                      {diploma.nota_final != null && (
                        <span className={`flex items-center gap-1 text-xs font-semibold ${Number(diploma.nota_final) >= 4 ? 'text-green-600' : 'text-red-500'}`}>
                          <CheckCircle2 size={12} /> Nota: {Number(diploma.nota_final).toFixed(1)}
                        </span>
                      )}
                      {diploma.curso.codigo_sence && (
                        <span className="text-xs text-slate-400 font-mono">SENCE: {diploma.curso.codigo_sence}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Código: {diploma.codigo_validacion}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 flex-shrink-0">
                    <a
                      href={diploma.diploma_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 hover:border-jc-blue hover:text-jc-blue rounded-xl text-sm font-medium transition-all"
                    >
                      <ExternalLink size={15} /> Ver
                    </a>
                    <a
                      href={diploma.diploma_url}
                      download
                      className="flex items-center gap-2 px-4 py-2.5 bg-jc-blue text-white hover:bg-[#043360] rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                      <Download size={15} /> Descargar
                    </a>
                  </div>
                </div>

                {/* Footer con código de validación */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Verifica la autenticidad en{' '}
                    <span className="text-jc-blue font-medium">jcdigital.cl/validar/{diploma.codigo_validacion}</span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Diploma válido
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}