// src/pages/admin/wizard/CrearCursoWizard.tsx
// Contenedor del wizard de 5 pasos para crear un curso.
// No usa MainLayout — tiene su propio layout con WizardSidebar.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { WizardStep1_InfoBasica } from './WizardStep1_InfoBasica';
import { useCursoWizard, type ModuloLocal } from '@/hooks/useCursoWizard';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { WizardStep2_Modulos }     from './WizardStep2_Modulos';
import { WizardStep3_Lecciones }   from './WizardStep3_Lecciones';
import { WizardStep4_Actividades, type AsignacionLocal } from './WizardStep4_Actividades';
import { WizardStep5_Resumen }     from './WizardStep5_Resumen';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface PasoConfig {
  numero: number;
  label: string;
}

const PASOS: PasoConfig[] = [
  { numero: 1, label: 'Información Básica' },
  { numero: 2, label: 'Crear Módulos' },
  { numero: 3, label: 'Crear Lecciones' },
  { numero: 4, label: 'Asignar Actividades' },
  { numero: 5, label: 'Revisar y Publicar' },
];

// ── Stepper ────────────────────────────────────────────────────────────────────

function Stepper({ pasoActual }: { pasoActual: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {PASOS.map((paso, idx) => {
          const completado = pasoActual > paso.numero;
          const activo     = pasoActual === paso.numero;
          const pendiente  = pasoActual < paso.numero;
          const esUltimo   = idx === PASOS.length - 1;

          return (
            <div key={paso.numero} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all
                    ${completado ? 'bg-emerald-500 text-white'  : ''}
                    ${activo     ? 'bg-jc-blue text-white shadow-lg scale-110' : ''}
                    ${pendiente  ? 'bg-slate-200 text-slate-500' : ''}
                  `}
                >
                  {completado
                    ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    : paso.numero
                  }
                </div>
                <p className={`text-xs font-semibold whitespace-nowrap
                  ${activo     ? 'text-jc-blue'    : ''}
                  ${completado ? 'text-emerald-600' : ''}
                  ${pendiente  ? 'text-slate-400'   : ''}
                `}>
                  {paso.label}
                </p>
              </div>

              {!esUltimo && (
                <div className={`flex-1 h-1 mx-3 mt-[-24px] rounded-full transition-all
                  ${pasoActual > paso.numero ? 'bg-emerald-400' : 'bg-slate-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sidebar del wizard ────────────────────────────────────────────────────────

function WizardSidebar({
  curso,
  modulos,
  userName,
  userSubtitle,
  userAvatar,
  onLogout,
  onCancelar,
}: {
  curso: any;
  modulos: ModuloLocal[];
  userName: string;
  userSubtitle?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onCancelar: () => void;
}) {
  return (
    <aside className="w-72 bg-gradient-to-b from-jc-calipso via-jc-cyan to-jc-blue text-white flex flex-col z-20 shadow-2xl flex-shrink-0">

      <div className="p-8">
        <Logo variant="white" size="sm" withText className="mb-2" />
        <div className="inline-flex items-center bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
          <span className="text-[10px] uppercase font-semibold tracking-widest text-blue-100">
            Creando Curso
          </span>
        </div>
      </div>

      <div className="flex-1 px-6 overflow-y-auto">
        <h3 className="text-[10px] font-semibold text-blue-300/50 uppercase tracking-widest mb-4">
          Resumen de Estructura
        </h3>

        <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-4">
          <p className="text-[10px] font-bold text-blue-200 uppercase mb-2">Información Base</p>
          {curso.nombre ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white truncate">{curso.nombre}</p>
              <p className="text-xs text-white/70">
                {curso.horas_totales ? `${curso.horas_totales} horas totales` : 'Horas no definidas'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-white/40 italic">Esperando datos del curso...</p>
          )}
        </div>

        {modulos.length > 0 && (
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-[10px] font-bold text-blue-200 uppercase mb-3">
              Módulos ({modulos.length})
            </p>
            <div className="space-y-2">
              {modulos.map((m: ModuloLocal, idx: number) => (
                <div key={m._localId} className="flex items-center space-x-2">
                  <span className="w-5 h-5 bg-jc-calipso text-white rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-white/80 truncate">
                    {m.nombre || <span className="italic opacity-50">Sin nombre</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-black/20 m-4 rounded-xl">
        <div className="flex items-center mb-3">
          <Avatar
            src={userAvatar}
            name={userName}
            size="md"
            className="mr-3"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            {userSubtitle && (
              <p className="text-[10px] text-blue-200 truncate">{userSubtitle}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="block w-full py-2 bg-red-500/20 border border-red-400/30 text-red-100 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-colors text-center"
            >
              Cerrar Sesión
            </button>
          )}
          <button
            onClick={onCancelar}
            className="block w-full py-2 bg-white/5 border border-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-tighter hover:bg-white/10 transition-colors text-center"
          >
            Cancelar Creación
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Contenedor principal ──────────────────────────────────────────────────────

export function CrearCursoWizard() {
  const navigate     = useNavigate();
  const { user, logout } = useAuth();
  const wizard       = useCursoWizard();

  // ── Estado de asignaciones (paso 4) ──
  // Vive aquí para persistir al navegar entre pasos
  const [asignaciones, setAsignaciones] = useState<AsignacionLocal[]>([]);

  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de cancelar? Se perderá todo el progreso.')) {
      wizard.resetWizard();
      setAsignaciones([]);
      navigate('/admin/cursos');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePublicar = async (estado: 'activo' | 'borrador' | 'inactivo') => {
    const curso = await wizard.publicarCurso(estado, asignaciones);
    if (curso) {
      navigate('/admin/cursos');
    }
  };

  const renderPaso = () => {
    switch (wizard.pasoActual) {
      case 1:
        return (
          <WizardStep1_InfoBasica
            datos={wizard.curso}
            onChange={wizard.actualizarCurso}
            onSiguiente={wizard.siguientePaso}
            onCancelar={handleCancelar}
          />
        );
      case 2:
        return (
          <WizardStep2_Modulos
            modulos={wizard.modulos}
            horasMeta={Number(wizard.curso.horas_totales)}
            onAgregar={wizard.agregarModulo}
            onActualizar={wizard.actualizarModulo}
            onEliminar={wizard.eliminarModulo}
            onReordenar={wizard.reordenarModulos}
            onSiguiente={wizard.siguientePaso}
            onAnterior={wizard.pasoAnterior}
          />
        );
      case 3:
        return (
          <WizardStep3_Lecciones
            modulos={wizard.modulos}
            lecciones={wizard.lecciones}
            onAgregarLeccion={wizard.agregarLeccion}
            onActualizarLeccion={wizard.actualizarLeccion}
            onEliminarLeccion={wizard.eliminarLeccion}
            onSiguiente={wizard.siguientePaso}
            onAnterior={wizard.pasoAnterior}
            leccionesPorModulo={wizard.leccionesPorModulo}
          />
        );
      case 4:
        return (
          <WizardStep4_Actividades
            modulos={wizard.modulos}
            lecciones={wizard.lecciones}
            leccionesPorModulo={wizard.leccionesPorModulo}
            asignaciones={asignaciones}
            onAsignacionesChange={setAsignaciones}
            onSiguiente={wizard.siguientePaso}
            onAnterior={wizard.pasoAnterior}
          />
        );
      case 5:
        return (
          <WizardStep5_Resumen
            curso={wizard.curso}
            modulos={wizard.modulos}
            lecciones={wizard.lecciones}
            asignaciones={asignaciones}
            guardando={wizard.guardando}
            leccionesPorModulo={wizard.leccionesPorModulo}
            onPublicar={handlePublicar}
            onAnterior={wizard.pasoAnterior}
            onIrAPaso={wizard.irAPaso}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      <WizardSidebar
        curso={wizard.curso}
        modulos={wizard.modulos}
        userName={
          user?.nombre_completo ||
          (user?.nombre ? `${user.nombre} ${user.apellido}` : '') ||
          user?.username ||
          'Administrador'
        }
        userSubtitle="Superusuario"
        userAvatar={user?.avatar}
        onLogout={handleLogout}
        onCancelar={handleCancelar}
      />

      <main className="flex-1 overflow-y-auto">

        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-10 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Crear Nuevo Curso</h1>
              <p className="text-slate-500 text-sm">
                Paso {wizard.pasoActual} de {PASOS.length} — {PASOS[wizard.pasoActual - 1]?.label}
              </p>
            </div>
            <button
              onClick={handleCancelar}
              className="text-slate-400 hover:text-slate-600 transition"
              title="Cancelar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="px-10 py-8">
          <Stepper pasoActual={wizard.pasoActual} />

          {wizard.errorGuardado && (
            <div className="max-w-4xl mx-auto mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {wizard.errorGuardado}
            </div>
          )}

          {renderPaso()}
        </div>
      </main>

      <div className="hidden max-[1365px]:fixed max-[1365px]:inset-0 max-[1365px]:bg-jc-blue max-[1365px]:flex flex-col items-center justify-center p-8 text-center z-[100]">
        <h2 className="text-3xl font-bold text-white mb-4">Computador Requerido</h2>
        <p className="text-blue-100">La creación de cursos requiere pantalla de escritorio.</p>
      </div>
    </div>
  );
}