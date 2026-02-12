// src/api/services/inscripcionService.ts
// BASADO EN BACKEND REAL

import BaseService from './baseService';

export interface Inscripcion {
  id: number;
  estudiante: number;
  curso: number;
  fecha_inscripcion: string;
  estado: 'inscrito' | 'en_curso' | 'completado' | 'aprobado' | 'reprobado';
  progreso: number;
  nota_final?: number;
}

class InscripcionService extends BaseService<Inscripcion> {
  constructor() {
    super({ endpoint: '/inscripciones' });
  }
}

export const inscripcionService = new InscripcionService();