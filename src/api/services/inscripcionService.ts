// src/api/services/inscripcionService.ts
// BASADO EN BACKEND REAL

import BaseService from './baseService';
import type { Curso } from './cursoService';

export interface Inscripcion {
  id: number;
  estudiante: number;
  estudiante_data?: any;  // ← Backend incluye UsuarioSerializer completo
  curso: number;
  curso_data?: Curso;  // ← Backend incluye CursoSerializer completo
  fecha_inscripcion: string;
  estado: 'inscrito' | 'en_curso' | 'completado' | 'aprobado' | 'reprobado';
  porcentaje_avance: number;  // ← Porcentaje 0-100
  nota_final?: number;
  puede_generar_diploma?: boolean;  // ← Campo calculado del serializer
  updated_at?: string;
}

class InscripcionService extends BaseService<Inscripcion> {
  constructor() {
    super({ endpoint: '/inscripciones' });
  }

  /**
   * Obtiene las inscripciones del estudiante actual
   * El backend filtra automáticamente por usuario logueado
   */
  async getMisInscripciones(): Promise<Inscripcion[]> {
    return this.getAll();
  }
}

export const inscripcionService = new InscripcionService();