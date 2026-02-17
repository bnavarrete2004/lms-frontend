// src/api/services/progresoService.ts
// BASADO EN BACKEND REAL (ProgresoModuloSerializer)

import BaseService from './baseService';
import type { Modulo } from './cursoService';

// ============================================
// TIPOS BASADOS EN SERIALIZER REAL
// ============================================

export interface ProgresoModulo {
  id: number;
  modulo: number;
  modulo_data?: Modulo;
  inscripcion: number;
  estudiante_nombre?: string;
  completado: boolean;
  porcentaje_avance: number;
  fecha_inicio?: string;
  fecha_completado?: string;
  updated_at?: string;
}

export interface ProgresoLeccion {
  id: number;
  leccion: number;
  leccion_data?: any;
  inscripcion: number;
  estudiante_nombre?: string;
  completada: boolean;
  fecha_inicio?: string;
  fecha_completado?: string;
  tiempo_dedicado_minutos?: number;
  updated_at?: string;
}

// ============================================
// SERVICIO PROGRESO MÓDULOS
// ============================================

class ProgresoModuloService extends BaseService<ProgresoModulo> {
  constructor() {
    super({
      endpoint: '/progreso-modulos',
      resourceName: 'progreso-modulo',
    });
  }

  async getProgresoInscripcion(inscripcionId: number): Promise<ProgresoModulo[]> {
    return this.filter({ inscripcion: inscripcionId });
  }
}

// ============================================
// SERVICIO PROGRESO LECCIONES
// ============================================

class ProgresoLeccionService extends BaseService<ProgresoLeccion> {
  constructor() {
    super({
      endpoint: '/progreso-lecciones',
      resourceName: 'progreso-leccion',
    });
  }

  async getProgresoInscripcion(inscripcionId: number): Promise<ProgresoLeccion[]> {
    return this.filter({ inscripcion: inscripcionId });
  }

  async completar(progresoId: number): Promise<ProgresoLeccion> {
    return this.customAction(progresoId, 'completar');
  }
}

// ============================================
// EXPORTS
// ============================================

export const progresoModuloService = new ProgresoModuloService();
export const progresoLeccionService = new ProgresoLeccionService();

// progresoService = alias para compatibilidad con CourseDetailPage
export const progresoService = progresoModuloService;
export default progresoModuloService;