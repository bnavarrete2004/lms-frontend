// src/hooks/useCursoWizard.ts
// Estado global del wizard de creación de cursos (5 pasos).
// Solo guarda al backend cuando el admin hace click en "Publicar Curso" (paso 5).
// Todo lo anterior es estado local en memoria.

import { useState, useCallback } from 'react';
import { cursoService, type Curso } from '@/api/services/cursoService';
import { moduloService, type CrearModuloPayload } from '@/api/services/moduloService';
import { leccionService, type CrearLeccionPayload } from '@/api/services/leccionService';
import api from '@/api/axios';

// Tipo importado desde el paso 4 para evitar dependencia circular
export interface AsignacionWizard {
  _asignId: string;
  leccionLocalId: string;
  material: { id: number };
  orden: number;
}

// ============================================================
// TIPOS DEL ESTADO DEL WIZARD
// ============================================================

export type PasoWizard = 1 | 2 | 3 | 4 | 5;

// Paso 1 — Información básica del curso
export interface DatosCurso {
  nombre: string;
  descripcion: string;
  codigo_sence: number | null;
  horas_totales: number | '';
  ciudad: string;
  fecha_inicio: string;
  fecha_fin: string;
  relatores: number[];
  imagen_portada: File | null;
  imagen_url?: string;
  dias_gracia: number;
  sincronizado_con_sence: boolean;
}

// Paso 2 — Módulos (en memoria, sin ID de backend aún)
export interface ModuloLocal {
  _localId: string;                  // ID temporal (uuid generado en frontend)
  nombre: string;
  descripcion: string;
  objetivos: string;
  codigo_modulo: string;
  horas_estimadas: number | '';
  orden: number;                     // 1-based, se recalcula en reordenar()
}

// Paso 3 — Lecciones agrupadas por módulo
export interface LeccionLocal {
  _localId: string;
  moduloLocalId: string;             // referencia al ModuloLocal._localId
  nombre: string;
  descripcion: string;
  objetivos: string;
  orden: number;
  duracion_minutos: number | '';
  tipo: 'teorica' | 'practica' | 'evaluacion' | 'mixta';
  obligatoria: boolean;
}

// Estado completo del wizard
export interface WizardState {
  pasoActual: PasoWizard;
  curso: DatosCurso;
  modulos: ModuloLocal[];
  lecciones: LeccionLocal[];         // todas las lecciones de todos los módulos
  guardando: boolean;
  errorGuardado: string | null;
}

// ============================================================
// VALORES INICIALES
// ============================================================

const CURSO_INICIAL: DatosCurso = {
  nombre: '',
  descripcion: '',
  codigo_sence: null,
  horas_totales: '',
  ciudad: '',
  fecha_inicio: '',
  fecha_fin: '',
  relatores: [],
  imagen_portada: null,
  imagen_url: undefined,
  dias_gracia: 0,
  sincronizado_con_sence: false,
};

const ESTADO_INICIAL: WizardState = {
  pasoActual: 1,
  curso: CURSO_INICIAL,
  modulos: [],
  lecciones: [],
  guardando: false,
  errorGuardado: null,
};

// ============================================================
// HELPER: generar ID local único
// ============================================================

function localId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// HOOK
// ============================================================

export function useCursoWizard() {
  const [state, setState] = useState<WizardState>(ESTADO_INICIAL);

  // ── Navegación entre pasos ────────────────────────────────

  const irAPaso = useCallback((paso: PasoWizard) => {
    setState(s => ({ ...s, pasoActual: paso }));
  }, []);

  const siguientePaso = useCallback(() => {
    setState(s => ({
      ...s,
      pasoActual: Math.min(s.pasoActual + 1, 5) as PasoWizard,
    }));
  }, []);

  const pasoAnterior = useCallback(() => {
    setState(s => ({
      ...s,
      pasoActual: Math.max(s.pasoActual - 1, 1) as PasoWizard,
    }));
  }, []);

  // ── Paso 1: Datos del curso ───────────────────────────────

  const actualizarCurso = useCallback((campos: Partial<DatosCurso>) => {
    setState(s => ({
      ...s,
      curso: { ...s.curso, ...campos },
    }));
  }, []);

  // ── Paso 2: Módulos ───────────────────────────────────────

  const agregarModulo = useCallback(() => {
    setState(s => {
      const nuevoOrden = s.modulos.length + 1;
      const nuevoModulo: ModuloLocal = {
        _localId: localId(),
        nombre: '',
        descripcion: '',
        objetivos: '',
        codigo_modulo: '',
        horas_estimadas: '',
        orden: nuevoOrden,
      };
      return { ...s, modulos: [...s.modulos, nuevoModulo] };
    });
  }, []);

  const actualizarModulo = useCallback((localId: string, campos: Partial<Omit<ModuloLocal, '_localId'>>) => {
    setState(s => ({
      ...s,
      modulos: s.modulos.map(m =>
        m._localId === localId ? { ...m, ...campos } : m
      ),
    }));
  }, []);

  const eliminarModulo = useCallback((localId: string) => {
    setState(s => {
      // También eliminar todas las lecciones de ese módulo
      const modulos = s.modulos
        .filter(m => m._localId !== localId)
        .map((m, i) => ({ ...m, orden: i + 1 })); // recalcular orden
      const lecciones = s.lecciones.filter(l => l.moduloLocalId !== localId);
      return { ...s, modulos, lecciones };
    });
  }, []);

  /**
   * Reordena módulos tras drag & drop.
   * Recibe el array completo ya reordenado y recalcula el campo `orden`.
   */
  const reordenarModulos = useCallback((modulosReordenados: ModuloLocal[]) => {
    setState(s => ({
      ...s,
      modulos: modulosReordenados.map((m, i) => ({ ...m, orden: i + 1 })),
    }));
  }, []);

  // ── Paso 3: Lecciones ─────────────────────────────────────

  const agregarLeccion = useCallback((moduloLocalId: string) => {
    setState(s => {
      const leccionesDelModulo = s.lecciones.filter(l => l.moduloLocalId === moduloLocalId);
      const nuevaLeccion: LeccionLocal = {
        _localId: localId(),
        moduloLocalId,
        nombre: '',
        descripcion: '',
        objetivos: '',
        orden: leccionesDelModulo.length + 1,
        duracion_minutos: '',
        tipo: 'teorica',
        obligatoria: true,
      };
      return { ...s, lecciones: [...s.lecciones, nuevaLeccion] };
    });
  }, []);

  const actualizarLeccion = useCallback((localId: string, campos: Partial<Omit<LeccionLocal, '_localId' | 'moduloLocalId'>>) => {
    setState(s => ({
      ...s,
      lecciones: s.lecciones.map(l =>
        l._localId === localId ? { ...l, ...campos } : l
      ),
    }));
  }, []);

  const eliminarLeccion = useCallback((localId: string) => {
    setState(s => {
      const leccionElim = s.lecciones.find(l => l._localId === localId);
      if (!leccionElim) return s;

      const lecciones = s.lecciones
        .filter(l => l._localId !== localId)
        .map(l => {
          // Recalcular orden solo dentro del mismo módulo
          if (l.moduloLocalId !== leccionElim.moduloLocalId) return l;
          return l; // se recalcula abajo
        });

      // Recalcular orden por módulo
      const recalculadas = lecciones.map(l => {
        if (l.moduloLocalId !== leccionElim.moduloLocalId) return l;
        const idx = lecciones
          .filter(x => x.moduloLocalId === l.moduloLocalId)
          .indexOf(l);
        return { ...l, orden: idx + 1 };
      });

      return { ...s, lecciones: recalculadas };
    });
  }, []);

  const reordenarLecciones = useCallback((moduloLocalId: string, leccionesReordenadas: LeccionLocal[]) => {
    setState(s => {
      const otras = s.lecciones.filter(l => l.moduloLocalId !== moduloLocalId);
      const recalculadas = leccionesReordenadas.map((l, i) => ({ ...l, orden: i + 1 }));
      return { ...s, lecciones: [...otras, ...recalculadas] };
    });
  }, []);

  // ── Selectores derivados ──────────────────────────────────

  const leccionesPorModulo = useCallback((moduloLocalId: string): LeccionLocal[] => {
    return state.lecciones
      .filter(l => l.moduloLocalId === moduloLocalId)
      .sort((a, b) => a.orden - b.orden);
  }, [state.lecciones]);

  const totalHorasModulos = (): number => {
    return state.modulos.reduce((acc, m) => acc + (Number(m.horas_estimadas) || 0), 0);
  };

  // ── Paso 5: Publicar (único momento en que toca el backend) ──

  const publicarCurso = useCallback(async (
    estadoSeleccionado: 'activo' | 'borrador' | 'inactivo',
    asignaciones: AsignacionWizard[] = []
  ): Promise<Curso | null> => {
    setState(s => ({ ...s, guardando: true, errorGuardado: null }));

    try {
      const { curso, modulos, lecciones } = state;

      // 1. Crear el curso
      const cursoCreadoPayload: any = {
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        horas_totales: Number(curso.horas_totales),
        estado: estadoSeleccionado,
        codigo_sence_curso: curso.codigo_sence
          ? `SENCE-${curso.codigo_sence}`
          : `CURSO-${Date.now()}`,
        ...(curso.codigo_sence ? { codigo_sence: curso.codigo_sence } : {}),
        ...(curso.fecha_inicio ? { fecha_inicio: curso.fecha_inicio } : {}),
       ...(curso.fecha_fin    ? { fecha_fin: curso.fecha_fin }       : {}),
          dias_gracia: curso.dias_gracia ?? 0,
          sincronizado_con_sence: curso.sincronizado_con_sence ?? false,
        
      };

      // Nota: imagen_portada se subiría por separado con FormData si el backend lo requiere.
      // Por ahora se envía sin imagen — agregar soporte multipart en iteración siguiente.
      const cursoCreado: Curso = await cursoService.create(cursoCreadoPayload);

      // 1b. Asignar relatores al curso
      if (curso.relatores && curso.relatores.length > 0) {
        for (const relatorId of curso.relatores) {
          try {
            await api.post('/curso-relator/', {
              curso: cursoCreado.id,
              relator: relatorId,  // ← este es el ID correcto
              activo: true,
            });
          } catch (err) {
            console.warn(`No se pudo asignar relator ${relatorId}:`, err);
          }
        }
      }

      // 1c. Subir imagen de portada si existe
      if (curso.imagen_portada instanceof File) {
        try {
          const formData = new FormData();
          formData.append('file', curso.imagen_portada);
          
          // CAMBIO: Ahora usamos el endpoint dedicado a portadas para no crear un "Material" innecesario
          const uploadResp = await api.post('/upload/course-cover/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          
          const imageUrl = uploadResp.data?.url;
          
          if (imageUrl) {
            await api.patch(`/cursos/${cursoCreado.id}/`, { imagen_portada: imageUrl });
          }
        } catch (err) {
          console.warn('No se pudo subir la imagen de portada:', err);
        }
      }

      // 2. Crear módulos en orden y guardar mapa localId → id real
      const mapaModulos: Record<string, number> = {};

      for (const modulo of [...modulos].sort((a, b) => a.orden - b.orden)) {
        const payload: CrearModuloPayload = {
          curso: cursoCreado.id,
          nombre: modulo.nombre,
          descripcion: modulo.descripcion,
          objetivos: modulo.objetivos,
          orden: modulo.orden,
          codigo_modulo: modulo.codigo_modulo,
          horas_estimadas: Number(modulo.horas_estimadas),
          publicado: true,
        };
        const moduloCreado = await moduloService.crear(payload);
        mapaModulos[modulo._localId] = moduloCreado.id;
      }

      // 3. Crear lecciones usando los IDs reales de módulo
      // Guardamos mapa localId → id real para las asignaciones del paso 4
      const mapaLecciones: Record<string, number> = {};

      for (const leccion of [...lecciones].sort((a, b) => a.orden - b.orden)) {
        const moduloRealId = mapaModulos[leccion.moduloLocalId];
        if (!moduloRealId) continue;

        const payload: CrearLeccionPayload = {
          modulo: moduloRealId,
          nombre: leccion.nombre,
          descripcion: leccion.descripcion,
          objetivos: leccion.objetivos,
          orden: leccion.orden,
          duracion_minutos: Number(leccion.duracion_minutos),
          tipo: leccion.tipo as CrearLeccionPayload['tipo'],
          publicado: true,
          obligatoria: leccion.obligatoria,
        };
        const leccionCreada = await leccionService.crear(payload);
        mapaLecciones[leccion._localId] = leccionCreada.id;
      }

      // 4. Crear asignaciones leccion-material (paso 4 del wizard)
      if (asignaciones.length > 0) {
        for (const asign of asignaciones) {
          const leccionRealId = mapaLecciones[asign.leccionLocalId];
          if (!leccionRealId) continue;

          try {
            await api.post('/leccion-material/', {
              leccion: leccionRealId,
              material: asign.material.id,
              orden: asign.orden,
              obligatorio: true,
            });
          } catch (err) {
            // No bloquear la publicación si falla una asignación individual
            console.warn(`No se pudo asignar material ${asign.material.id} a lección ${leccionRealId}:`, err);
          }
        }
      }

      setState(s => ({ ...s, guardando: false }));
      return cursoCreado;

    } catch (error: any) {
      const mensaje = error?.response?.data?.detail
        || error?.message
        || 'Error al publicar el curso. Intenta nuevamente.';
      setState(s => ({ ...s, guardando: false, errorGuardado: mensaje }));
      return null;
    }
  }, [state]);

  // ── Reset (cancelar wizard) ───────────────────────────────

  const resetWizard = useCallback(() => {
    setState(ESTADO_INICIAL);
  }, []);

  // 1. Calcular total de horas asignadas a módulos
  const totalHorasAsignadasModulos = useCallback(() => {
  return state.modulos.reduce((acc, m) => acc + (Number(m.horas_estimadas) || 0), 0);
  }, [state.modulos]);

  // 2. Calcular total de minutos en lecciones de un módulo específico
  const totalMinutosLeccionesModulo = useCallback((moduloLocalId: string) => {
  return state.lecciones
    .filter(l => l.moduloLocalId === moduloLocalId)
    .reduce((acc, l) => acc + (Number(l.duracion_minutos) || 0), 0);
  }, [state.lecciones]);

  // 3. Validar factibilidad de fechas (Horas vs Días disponibles)
  const validarFactibilidadTemporal = useCallback(() => {
    if (!state.curso.fecha_inicio || !state.curso.fecha_fin || !state.curso.horas_totales) return { valida: true };

    const inicio = new Date(state.curso.fecha_inicio);
    const fin = new Date(state.curso.fecha_fin);
    const diferenciaDias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const horasPorDia = Number(state.curso.horas_totales) / diferenciaDias;

    // Si el curso exige más de 12 horas al día, es pedagógicamente imposible o sospechoso
    if (horasPorDia > 12) {
      return { 
        valida: false, 
        mensaje: `Es imposible cumplir ${state.curso.horas_totales} horas en solo ${diferenciaDias} días (${horasPorDia.toFixed(1)}h/día).` 
      };
    }
    return { valida: true };
  }, [state.curso]);

  // ── Return ────────────────────────────────────────────────

  return {
    // Estado
    ...state,

    // Navegación
    irAPaso,
    siguientePaso,
    pasoAnterior,

    // Paso 1
    actualizarCurso,

    // Paso 2
    agregarModulo,
    actualizarModulo,
    eliminarModulo,
    reordenarModulos,

    // Paso 3
    agregarLeccion,
    actualizarLeccion,
    eliminarLeccion,
    reordenarLecciones,

    // Selectores
    leccionesPorModulo,
    totalHorasModulos,

    // Paso 5
    publicarCurso,

    // Validadores
    totalHorasAsignadasModulos,
    totalMinutosLeccionesModulo,
    validarFactibilidadTemporal,

    // Reset
    resetWizard,
  };
}