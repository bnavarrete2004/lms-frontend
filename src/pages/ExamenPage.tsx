// src/pages/ExamenPage.tsx
// Página de rendición de examen con cronómetro, anti-cheat y control de intentos
// LMS J&C Digital Training

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Opcion {
  id: number;
  texto: string;
}

interface Pregunta {
  id: number;
  enunciado: string;
  imagen_url?: string;
  tipo: 'seleccion_multiple' | 'verdadero_falso' | 'completar' | 'desarrollo';
  opciones: Opcion[] | Record<string, string>; // JSONField del backend
  puntaje: number;
  orden: number;
}

interface Evaluacion {
  id: number;
  nombre: string;
  instrucciones: string;
  tiempo_limite_minutos: number;
  intentos_permitidos: number;
  preguntas: Pregunta[];
  porcentaje_aprobacion: number;
}

interface IntentoActivo {
  id: number;
  numero_intento: number;
  fecha_inicio: string;
}

// Respuesta local mientras el estudiante completa el examen
type RespuestasLocales = Record<number, number | string>; // preguntaId → opcionId o texto

// ─── Estados de la página ────────────────────────────────────────────────────

type Fase =
  | 'cargando'
  | 'instrucciones'   // Antes de empezar
  | 'en_curso'        // Examen activo
  | 'enviando'        // Enviando al backend
  | 'entregado'       // Entregado correctamente
  | 'sin_intentos'    // Agotó los intentos
  | 'error';

// ─── Componente ──────────────────────────────────────────────────────────────

export function ExamenPage() {
  const { id: cursoId, evaluacionId } = useParams<{ id: string; evaluacionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estado principal
  const [fase, setFase] = useState<Fase>('cargando');
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [intentoActivo, setIntentoActivo] = useState<IntentoActivo | null>(null);
  const [intentosUsados, setIntentosUsados] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestasLocales>({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Cronómetro
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const entregaAutomaticaRef = useRef(false); // evitar doble entrega

  // Anti-cheat: contador de cambios de pestaña
  const cambiosPestanaRef = useRef(0);
  const MAX_CAMBIOS_PESTANA = 3;

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    cargarEvaluacion();
  }, [evaluacionId]);

  const cargarEvaluacion = async () => {
    try {
      setFase('cargando');
      const [evalRes, intentosRes] = await Promise.all([
        api.get(`/evaluaciones/${evaluacionId}/`),
        api.get('/intentos-evaluacion/', { params: { evaluacion: evaluacionId } }),
      ]);

      const eval_data: Evaluacion = evalRes.data;
      const intentos: any[] = intentosRes.data?.results || intentosRes.data || [];

      // Contar solo intentos que realmente "consumen" un intento:
      // completado y tiempo_excedido sí cuentan. 'abandonado' NO cuenta
      // (el backend lo crea al iniciar y puede abandonarlo sin que el estudiante rinda nada).
      const completados = intentos.filter(
        i => i.estado === 'completado' || i.estado === 'tiempo_excedido'
      );
      setIntentosUsados(completados.length);

      // Verificar si agotó intentos
      if (completados.length >= eval_data.intentos_permitidos) {
        setEvaluacion(eval_data);
        setFase('sin_intentos');
        return;
      }

      // Verificar si hay intento en progreso (sesión interrumpida)
      const enProgreso = intentos.find(i => i.estado === 'en_progreso');
      if (enProgreso) {
        // Retomar el intento existente
        setIntentoActivo({ id: enProgreso.id, numero_intento: enProgreso.numero_intento, fecha_inicio: enProgreso.fecha_inicio });
        const tiempoUsado = Math.floor((Date.now() - new Date(enProgreso.fecha_inicio).getTime()) / 1000);
        const tiempoTotal = eval_data.tiempo_limite_minutos * 60;
        const restante = Math.max(0, tiempoTotal - tiempoUsado);
        setSegundosRestantes(restante);
      }

      setEvaluacion(eval_data);
      setFase(enProgreso ? 'en_curso' : 'instrucciones');

      // Si retomó, arrancar cronómetro inmediatamente
      if (enProgreso) iniciarCronometro();

    } catch (err: any) {
      console.error('Error cargando evaluación:', err);
      setErrorMsg(err?.response?.data?.detail || 'No se pudo cargar el examen.');
      setFase('error');
    }
  };

  // ── Cronómetro ─────────────────────────────────────────────────────────────
  const iniciarCronometro = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);

    intervaloRef.current = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          // Tiempo agotado → entregar automáticamente
          clearInterval(intervaloRef.current!);
          if (!entregaAutomaticaRef.current) {
            entregaAutomaticaRef.current = true;
            // Usamos setTimeout para salir del setState antes de llamar a entregarExamen
            setTimeout(() => entregarExamen(true), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  // ── Anti-cheat: detectar cambio de pestaña ─────────────────────────────────
  useEffect(() => {
    if (fase !== 'en_curso') return;

    const handleBlur = () => {
      cambiosPestanaRef.current += 1;
      if (cambiosPestanaRef.current >= MAX_CAMBIOS_PESTANA) {
        // Cerrar el examen por trampa
        if (!entregaAutomaticaRef.current) {
          entregaAutomaticaRef.current = true;
          clearInterval(intervaloRef.current!);
          entregarExamen(true, 'trampa');
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [fase]);

  // ── Iniciar examen ─────────────────────────────────────────────────────────
  const iniciarExamen = async () => {
    if (!evaluacion) return;
    try {
      setFase('cargando');

      // Crear el intento en el backend
      const res = await api.post('/intentos-evaluacion/', {
        evaluacion: evaluacion.id,
        inscripcion: await obtenerInscripcionId(),
        numero_intento: intentosUsados + 1,
        fecha_inicio: new Date().toISOString(),
        estado: 'en_progreso',
      });

      setIntentoActivo({ id: res.data.id, numero_intento: res.data.numero_intento, fecha_inicio: res.data.fecha_inicio });
      setSegundosRestantes(evaluacion.tiempo_limite_minutos * 60);
      setRespuestas({});
      setPreguntaActual(0);
      entregaAutomaticaRef.current = false;
      cambiosPestanaRef.current = 0;
      setFase('en_curso');
      iniciarCronometro();
    } catch (err: any) {
      console.error('Error al iniciar examen:', err);
      setErrorMsg(err?.response?.data?.detail || 'No se pudo iniciar el examen.');
      setFase('error');
    }
  };

  // Helper: obtener inscripción del estudiante en este curso
  const obtenerInscripcionId = async (): Promise<number> => {
    const res = await api.get('/inscripciones/', { params: { curso: cursoId } });
    const inscripciones = res.data?.results || res.data || [];
    if (inscripciones.length === 0) throw new Error('No tienes inscripción en este curso.');
    return inscripciones[0].id;
  };

  // ── Entregar examen ────────────────────────────────────────────────────────
  const entregarExamen = useCallback(async (automatico = false, motivo?: string) => {
    if (!intentoActivo || !evaluacion) return;
    if (intervaloRef.current) clearInterval(intervaloRef.current);

    setFase('enviando');

    try {
      // 1. Guardar respuestas una por una
      const preguntasOrdenadas = [...evaluacion.preguntas].sort((a, b) => a.orden - b.orden);

      for (const pregunta of preguntasOrdenadas) {
        const respuesta = respuestas[pregunta.id];
        if (respuesta === undefined) continue;

        const payload: Record<string, any> = {
          intento: intentoActivo.id,
          pregunta: pregunta.id,
        };

        if (pregunta.tipo === 'seleccion_multiple' || pregunta.tipo === 'verdadero_falso') {
          payload.respuesta_seleccionada = Number(respuesta);
        } else {
          payload.respuesta_texto = String(respuesta);
        }

        await api.post('/respuestas-estudiante/', payload).catch(() => {
          // Si la respuesta ya existía (PATCH), ignorar el error 400
        });
      }

      // 2. Calcular puntaje en el backend y cerrar el intento
      const estado = motivo === 'trampa' ? 'abandonado' : (automatico ? 'tiempo_excedido' : 'completado');
      await api.patch(`/intentos-evaluacion/${intentoActivo.id}/`, {
        estado,
        fecha_fin: new Date().toISOString(),
        duracion_minutos: Math.round((evaluacion.tiempo_limite_minutos * 60 - segundosRestantes) / 60),
      });

      // 3. Disparar cálculo de nota en el backend
      await api.post(`/intentos-evaluacion/${intentoActivo.id}/calcular-nota/`).catch(() => {});

      setFase('entregado');
    } catch (err: any) {
      console.error('Error al entregar examen:', err);
      setErrorMsg(err?.response?.data?.detail || 'Error al entregar el examen. Contacta a tu institución.');
      setFase('error');
    }
  }, [intentoActivo, evaluacion, respuestas, segundosRestantes]);

  // ── Helpers UI ─────────────────────────────────────────────────────────────
  const formatTiempo = (segundos: number) => {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const colorCronometro = () => {
    if (segundosRestantes > 300) return 'text-slate-800'; // > 5 min: normal
    if (segundosRestantes > 60) return 'text-amber-600';  // 1-5 min: advertencia
    return 'text-red-600 animate-pulse';                   // < 1 min: peligro
  };

  const preguntasOrdenadas = evaluacion
    ? [...evaluacion.preguntas].sort((a, b) => a.orden - b.orden)
    : [];

  const respuestasContestadas = Object.keys(respuestas).length;
  const totalPreguntas = preguntasOrdenadas.length;
  const porcentajeAvance = totalPreguntas > 0 ? Math.round((respuestasContestadas / totalPreguntas) * 100) : 0;

  // ── Normalizar opciones del backend (JSONField puede venir en distintos formatos)
  const normalizarOpciones = (pregunta: Pregunta): Opcion[] => {
    const raw = pregunta.opciones;
    if (Array.isArray(raw)) {
      // Ya viene como array: [{ id: 1, texto: '...' }] o ['opcion a', 'opcion b']
      return raw.map((item: any, idx: number) =>
        typeof item === 'object' && item.id !== undefined
          ? item
          : { id: idx, texto: String(item) }
      );
    }
    if (typeof raw === 'object') {
      // Viene como dict: { "0": "texto", "1": "texto" }
      return Object.entries(raw).map(([k, v]) => ({ id: Number(k), texto: String(v) }));
    }
    return [];
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────

  // ── Pantalla de carga ──
  if (fase === 'cargando') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#064D91] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Preparando tu examen...</p>
        </div>
      </div>
    );
  }

  // ── Sin intentos ──
  if (fase === 'sin_intentos') {
    return (
      <PantallaFin
        titulo="Intentos agotados"
        subtitulo={`Has utilizado los ${evaluacion?.intentos_permitidos ?? 2} intentos permitidos para este examen.`}
        variante="advertencia"
        accion={{ label: 'Volver al curso', onClick: () => navigate(`/student/courses/${cursoId}`) }}
        extra={
          <p className="text-sm text-slate-500 mt-4">
            Si crees que hay un error, contacta a tu relator para solicitar un intento adicional.
          </p>
        }
      />
    );
  }

  // ── Error ──
  if (fase === 'error') {
    return (
      <PantallaFin
        titulo="Ocurrió un error"
        subtitulo={errorMsg}
        variante="error"
        accion={{ label: 'Volver al curso', onClick: () => navigate(`/student/courses/${cursoId}`) }}
      />
    );
  }

  // ── Examen entregado ──
  if (fase === 'entregado' || fase === 'enviando') {
    return (
      <PantallaFin
        titulo={fase === 'enviando' ? 'Entregando examen...' : '¡Examen entregado!'}
        subtitulo={
          fase === 'enviando'
            ? 'Por favor no cierres esta ventana.'
            : 'Tu examen fue recibido correctamente. El relator revisará tu intento y pronto recibirás tu resultado.'
        }
        variante={fase === 'enviando' ? 'cargando' : 'exito'}
        accion={
          fase === 'entregado'
            ? { label: 'Volver al curso', onClick: () => navigate(`/student/courses/${cursoId}`) }
            : undefined
        }
      />
    );
  }

  // ── Instrucciones ──
  if (fase === 'instrucciones' && evaluacion) {
    const intentosRestantes = evaluacion.intentos_permitidos - intentosUsados;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-2xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#064D91] to-[#088395] rounded-t-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-white/70 text-sm uppercase tracking-wider font-semibold">Examen Final</p>
                <h1 className="text-2xl font-bold">{evaluacion.nombre}</h1>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-100">
            <InfoCard
              icono={<svg className="w-5 h-5 text-[#064D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Tiempo límite"
              valor={`${evaluacion.tiempo_limite_minutos} min`}
            />
            <InfoCard
              icono={<svg className="w-5 h-5 text-[#064D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Preguntas"
              valor={`${totalPreguntas}`}
            />
            <InfoCard
              icono={<svg className="w-5 h-5 text-[#064D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
              label="Intentos restantes"
              valor={`${intentosRestantes} de ${evaluacion.intentos_permitidos}`}
            />
          </div>

          {/* Instrucciones */}
          {evaluacion.instrucciones && (
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">Instrucciones</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {evaluacion.instrucciones}
              </p>
            </div>
          )}

          {/* Advertencias anti-cheat */}
          <div className="p-6 bg-amber-50 border-b border-amber-100">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-amber-800 text-sm mb-1">Condiciones del examen</p>
                <ul className="text-amber-700 text-xs space-y-1">
                  <li>• El cronómetro no se detiene una vez iniciado.</li>
                  <li>• Cambiar de pestaña o ventana más de {MAX_CAMBIOS_PESTANA} veces cerrará el examen automáticamente.</li>
                  <li>• Si el tiempo se acaba, el examen se entrega con las respuestas registradas hasta ese momento.</li>
                  <li>• Tienes <strong>{intentosRestantes}</strong> {intentosRestantes === 1 ? 'intento' : 'intentos'} disponibles.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="p-6 flex gap-4">
            <button
              onClick={() => navigate(`/student/courses/${cursoId}`)}
              className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={iniciarExamen}
              className="flex-1 py-3 bg-gradient-to-r from-[#064D91] to-[#088395] text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              Iniciar Examen →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── EN CURSO ──────────────────────────────────────────────────────────────
  if (fase === 'en_curso' && evaluacion) {
    const pregunta = preguntasOrdenadas[preguntaActual];
    const opciones = pregunta ? normalizarOpciones(pregunta) : [];
    const esUltima = preguntaActual === totalPreguntas - 1;

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">

        {/* ── Barra superior fija ── */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

            {/* Info del examen */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-[#064D91] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{evaluacion.nombre}</p>
                <p className="text-xs text-slate-400">{user?.nombre || 'Estudiante'}</p>
              </div>
            </div>

            {/* Progreso */}
            <div className="flex-1 max-w-xs hidden sm:block">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{respuestasContestadas}/{totalPreguntas} respondidas</span>
                <span className="text-xs font-bold text-[#064D91]">{porcentajeAvance}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#064D91] to-[#06B6D4] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeAvance}%` }}
                />
              </div>
            </div>

            {/* Cronómetro */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <svg className={`w-5 h-5 ${colorCronometro()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-mono font-bold text-xl tabular-nums ${colorCronometro()}`}>
                {formatTiempo(segundosRestantes)}
              </span>
            </div>
          </div>
        </header>

        {/* ── Contenido del examen ── */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Panel izquierdo: navegador de preguntas */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-20">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Preguntas</p>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
                  {preguntasOrdenadas.map((p, idx) => {
                    const contestada = respuestas[p.id] !== undefined;
                    const actual = idx === preguntaActual;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPreguntaActual(idx)}
                        className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                          actual
                            ? 'bg-[#064D91] text-white shadow-md scale-105'
                            : contestada
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
                    <span>Respondida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#064D91]" />
                    <span>Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-100" />
                    <span>Sin responder</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Panel derecho: pregunta actual */}
            <div className="lg:col-span-9">
              {pregunta && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

                  {/* Header de la pregunta */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-[#064D91] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {preguntaActual + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold uppercase">
                        Pregunta {preguntaActual + 1} de {totalPreguntas}
                        {' · '}
                        <span className="text-[#064D91]">{pregunta.puntaje} {pregunta.puntaje === 1 ? 'punto' : 'puntos'}</span>
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium text-base leading-relaxed">
                      {pregunta.enunciado}
                    </p>
                    {pregunta.imagen_url && (
                      <img
                        src={pregunta.imagen_url}
                        alt="Imagen de la pregunta"
                        className="mt-4 rounded-lg max-h-64 object-contain border border-slate-200"
                      />
                    )}
                  </div>

                  {/* Opciones de respuesta */}
                  <div className="p-6 space-y-3">
                    {(pregunta.tipo === 'seleccion_multiple' || pregunta.tipo === 'verdadero_falso') && (
                      <>
                        {opciones.map((opcion) => {
                          const seleccionada = respuestas[pregunta.id] === opcion.id;
                          return (
                            <button
                              key={opcion.id}
                              onClick={() => setRespuestas(prev => ({ ...prev, [pregunta.id]: opcion.id }))}
                              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm ${
                                seleccionada
                                  ? 'border-[#064D91] bg-blue-50 text-[#064D91] shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                  seleccionada ? 'border-[#064D91] bg-[#064D91]' : 'border-slate-300'
                                }`}>
                                  {seleccionada && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <span>{opcion.texto}</span>
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}

                    {(pregunta.tipo === 'completar' || pregunta.tipo === 'desarrollo') && (
                      <textarea
                        value={String(respuestas[pregunta.id] ?? '')}
                        onChange={(e) => setRespuestas(prev => ({ ...prev, [pregunta.id]: e.target.value }))}
                        placeholder={pregunta.tipo === 'desarrollo' ? 'Escribe tu respuesta aquí...' : 'Completa la oración...'}
                        rows={pregunta.tipo === 'desarrollo' ? 6 : 3}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#064D91] resize-none transition-colors"
                      />
                    )}
                  </div>

                  {/* Navegación entre preguntas */}
                  <div className="px-6 pb-6 flex items-center justify-between gap-4">
                    <button
                      onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))}
                      disabled={preguntaActual === 0}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>

                    {!esUltima ? (
                      <button
                        onClick={() => setPreguntaActual(prev => Math.min(totalPreguntas - 1, prev + 1))}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#064D91] text-white text-sm font-semibold hover:bg-[#053d73] transition-colors"
                      >
                        Siguiente →
                      </button>
                    ) : (
                      <EntregarExamenButton
                        respuestasContestadas={respuestasContestadas}
                        totalPreguntas={totalPreguntas}
                        onEntregar={() => entregarExamen(false)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function InfoCard({ icono, label, valor }: { icono: React.ReactNode; label: string; valor: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 p-3 bg-slate-50 rounded-xl">
      {icono}
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>
      <span className="text-lg font-bold text-slate-800">{valor}</span>
    </div>
  );
}

function EntregarExamenButton({
  respuestasContestadas,
  totalPreguntas,
  onEntregar,
}: {
  respuestasContestadas: number;
  totalPreguntas: number;
  onEntregar: () => void;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const sinResponder = totalPreguntas - respuestasContestadas;

  if (!confirmar) {
    return (
      <button
        onClick={() => setConfirmar(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors"
      >
        Entregar examen ✓
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
      {sinResponder > 0 && (
        <span className="text-xs text-amber-700 font-medium">
          ⚠ {sinResponder} sin responder
        </span>
      )}
      <button
        onClick={() => setConfirmar(false)}
        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
      >
        Cancelar
      </button>
      <button
        onClick={onEntregar}
        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700"
      >
        Sí, entregar
      </button>
    </div>
  );
}

function PantallaFin({
  titulo,
  subtitulo,
  variante,
  accion,
  extra,
}: {
  titulo: string;
  subtitulo: string;
  variante: 'exito' | 'advertencia' | 'error' | 'cargando';
  accion?: { label: string; onClick: () => void };
  extra?: React.ReactNode;
}) {
  const colores = {
    exito:      { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',  titulo: 'text-green-800' },
    advertencia:{ bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  titulo: 'text-amber-800' },
    error:      { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',      titulo: 'text-red-800'   },
    cargando:   { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-600',  titulo: 'text-slate-800' },
  };
  const c = colores[variante];

  const iconos = {
    exito: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
    advertencia: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3C6.477 3 2 7.477 2 13s4.477 10 10 10 10-4.477 10-10S17.523 3 12 3z" />
      </svg>
    ),
    error: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    cargando: (
      <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
  };

  return (
    <div className={`min-h-screen ${c.bg} flex items-center justify-center p-6`}>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-md p-10 text-center">
        <div className={`w-20 h-20 rounded-full ${c.icon} flex items-center justify-center mx-auto mb-6`}>
          {iconos[variante]}
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${c.titulo}`}>{titulo}</h2>
        <p className="text-slate-600 text-sm leading-relaxed">{subtitulo}</p>
        {extra}
        {accion && (
          <button
            onClick={accion.onClick}
            className="mt-8 px-8 py-3 bg-[#064D91] text-white rounded-xl font-bold hover:bg-[#053d73] transition-colors"
          >
            {accion.label}
          </button>
        )}
      </div>
    </div>
  );
}