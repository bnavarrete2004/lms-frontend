// src/api/services/cursoService.ts
// BASADO EN BACKEND REAL DE VALERIA

import BaseService from './baseService';

export interface CodigoSence {
  id: number;
  codigo: string;
  nombre_accion: string;
  horas_totales: number;
  horas_disponibles?: number;
}

export interface Curso {
  id: number;
  codigo_sence: number;
  codigo_sence_data?: CodigoSence;
  nombre: string;
  descripcion: string;
  horas_totales: number;
  modalidad: 'presencial' | 'online' | 'mixto';
  nivel: 'basico' | 'intermedio' | 'avanzado';
  estado: 'activo' | 'inactivo' | 'borrador';
  imagen_url?: string;
  total_inscritos?: number;
  cupos_disponibles?: number;
}

class CursoService extends BaseService<Curso> {
  constructor() {
    super({ endpoint: '/cursos' });
  }

  async getActivos() {
    return this.filter({ estado: 'activo' });
  }
}

export const cursoService = new CursoService();