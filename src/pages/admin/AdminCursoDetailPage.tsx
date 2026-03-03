// src/pages/admin/AdminCursoDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { cursoService } from '@/api/services/cursoService';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
import {
  ChevronLeft, Pencil, Users, Clock, FileText,
  LayoutDashboard, BookOpen as BookIcon,
  ClipboardCheck, ClipboardList, CheckCircle2,
  AlertCircle, Globe, GlobeLock,
} from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Evaluacion {
  id: number;
  nombre: string;
  tipo: 'sumativa' | 'final';
  tiempo_limite_minutos: number;
  intentos_permitidos: number;
  modulo?: number;
  curso?: number;
}

interface ModuloConExamen {
  id: number;
  nombre: string;
  orden: number;
  examen?: Evaluacion | null;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function AdminCursoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: curso, loading, execute: fetchCurso } = useApi(() => cursoService.getById(id!));

  const [modulos, setModulos]                 = useState<ModuloConExamen[]>([]);
  const [examenFinal, setExamenFinal]         = useState<Evaluacion | null>(null);
  const [loadingExamenes, setLoadingExamenes] = useState(true);
  const [publicando, setPublicando]           = useState(false);
  const [msgPublicacion, setMsgPublicacion]   = useState('');

  useEffect(() => { fetchCurso(); }, [id]);
  useEffect(() => { if (id) cargarExamenes(); }, [id]);

  const cargarExamenes = async () => {
    setLoadingExamenes(true);
    try {
      const [modRes, evalCursoRes, evalModRes] = await Promise.all([
        api.get('/modulos/', { params: { curso: id } }),
        api.get('/evaluaciones/', { params: { curso: id } }),
        api.get('/evaluaciones/', { params: { modulo__curso: id } }),
      ]);

      const modulosData = (modRes.data?.results || modRes.data || [])
        .sort((a: any, b: any) => a.orden - b.orden);

      const evalCurso: Evaluacion[] = evalCursoRes.data?.results || evalCursoRes.data || [];
      const evalMod: Evaluacion[]   = evalModRes.data?.results   || evalModRes.data   || [];

      setExamenFinal(evalCurso.find(e => e.tipo === 'final') || null);

      setModulos(modulosData.map((m: any) => ({
        id: m.id,
        nombre: m.nombre,
        orden: m.orden,
        examen: evalMod.find(e => e.modulo === m.id && e.tipo === 'sumativa') || null,
      })));
    } catch (err) {
      console.error('Error cargando exámenes:', err);
    } finally {
      setLoadingExamenes(false);
    }
  };

  const handlePublicar = async () => {
    if (!examenFinal) {
      setMsgPublicacion('El curso necesita un examen final asignado antes de publicarse.');
      return;
    }
    setPublicando(true);
    setMsgPublicacion('');
    try {
      await api.patch(`/cursos/${id}/`, { estado: 'activo', publicado: true });
      fetchCurso();
      setMsgPublicacion('✓ Curso publicado correctamente.');
    } catch (err: any) {
      setMsgPublicacion(err?.response?.data?.detail || 'Error al publicar el curso.');
    } finally {
      setPublicando(false);
    }
  };

  const sidebarSections = [
    {
      title: 'Gestión Operativa',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General',  href: '/admin/dashboard' },
        { icon: <BookIcon size={20} />,        label: 'Gestión Cursos', href: '/admin/cursos', isActive: true },
      ],
    },
  ];

  if (loading || !curso) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jc-blue" />
      </div>
    );
  }

  const tieneExamenFinal = !!examenFinal;
  const estaPublicado    = curso.estado === 'activo';

  return (
    <MainLayout
      role="administrador"
      userName={user?.nombre_completo || 'Admin'}
      sidebarSections={sidebarSections}
      onLogout={() => { logout(); navigate('/login'); }}
      headerTitle="Detalle del Curso"
      headerSubtitle={curso.nombre}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        <button onClick={() => navigate('/admin/cursos')}
          className="flex items-center text-slate-500 hover:text-jc-blue transition-colors">
          <ChevronLeft size={20} />
          <span>Volver a la lista de cursos</span>
        </button>

        {/* ── Cabecera del curso ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-start gap-4">
            <div>
              <Badge variant={estaPublicado ? 'success' : 'warning'} className="mb-3">
                {estaPublicado ? 'PUBLICADO' : (curso.estado || 'BORRADOR').toUpperCase()}
              </Badge>
              <h1 className="text-3xl font-bold text-slate-800">{curso.nombre}</h1>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" onClick={() => navigate(`/admin/cursos/${id}/editar`)}>
                <Pencil size={16} className="mr-2" /> Editar
              </Button>
              {!estaPublicado && (
                <button
                  onClick={handlePublicar}
                  disabled={!tieneExamenFinal || publicando}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    tieneExamenFinal
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  title={!tieneExamenFinal ? 'Asigna un examen final antes de publicar' : ''}
                >
                  <Globe size={16} />
                  {publicando ? 'Publicando...' : 'Publicar curso'}
                </button>
              )}
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<Users className="text-jc-blue" size={24} />}
              valor={curso.total_inscritos || 0} label="Estudiantes Inscritos" />
            <StatCard icon={<Clock className="text-jc-calipso" size={24} />}
              valor={`${curso.horas_totales}h`} label="Duración" />
            <StatCard icon={<FileText className="text-jc-cyan" size={24} />}
              valor={curso.codigo_sence_data?.codigo || '—'} label="Código SENCE" />
          </div>

          <div className="px-8 pb-8 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 mb-3 uppercase text-xs tracking-widest">Descripción</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {curso.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>
        </div>

        {/* ── Sección Exámenes ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <ClipboardCheck size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Exámenes del curso</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Se asignan automáticamente al aprobar el material en Revisión
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">

            {/* Examen Final */}
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Examen Final del Curso
              </p>
              {loadingExamenes ? (
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ) : tieneExamenFinal ? (
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-2xl flex-shrink-0">🎓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{examenFinal!.nombre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {examenFinal!.tiempo_limite_minutos} min · {examenFinal!.intentos_permitidos} intentos
                    </p>
                  </div>
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Sin examen final asignado</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      El relator debe crear y subir un examen final para este curso.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Exámenes Intermedios */}
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Exámenes Intermedios por Módulo
              </p>
              {loadingExamenes ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : modulos.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No hay módulos creados.</p>
              ) : (
                <div className="space-y-2">
                  {modulos.map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-600">{m.orden}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 flex-1 min-w-0 truncate">{m.nombre}</p>
                      {m.examen ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span className="text-xs font-medium text-green-700 max-w-[200px] truncate">
                            {m.examen.nombre}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ClipboardList size={16} className="text-slate-300" />
                          <span className="text-xs text-slate-400 italic">Sin examen intermedio</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloqueo publicación */}
            {!tieneExamenFinal && !loadingExamenes && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <GlobeLock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  <span className="font-bold">El curso no puede publicarse</span> sin examen final.
                  El relator lo crea en "Subir Material" → el admin lo aprueba en "Revisión de Material"
                  → se asigna automáticamente.
                </p>
              </div>
            )}

            {/* Feedback publicación */}
            {msgPublicacion && (
              <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
                msgPublicacion.startsWith('✓')
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {msgPublicacion.startsWith('✓')
                  ? <CheckCircle2 size={16} className="flex-shrink-0" />
                  : <AlertCircle  size={16} className="flex-shrink-0" />
                }
                {msgPublicacion}
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({ icon, valor, label }: { icon: React.ReactNode; valor: string | number; label: string }) {
  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
      <div className="mb-2">{icon}</div>
      <p className="text-3xl font-bold text-slate-800">{valor}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}