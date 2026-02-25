// src/api/services/cursoService.ts
// BASADO EN BACKEND REAL DE VALERIA

import BaseService from './baseService';

export interface CodigoSence {
  id: number;
  codigo: string;
  nombre_curso: string;  // ← Corregido
  horas_totales: number;
  horas_disponibles?: number;
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
  estado: string;
}

export interface Modulo {
  id: number;
  curso: number;
  curso_nombre?: string;
  nombre: string;
  descripcion: string;
  orden: number;
  duracion_horas: number;
  created_at?: string;
  updated_at?: string;
}

export interface RelatorCurso {
  id: number;
  relator: number;
  relator_nombre?: string;       // SerializerMethodField del backend
  nombre_completo?: string;      // por si viene con otro nombre
  fecha_asignacion?: string;
  es_principal?: boolean;
}

export interface Curso {
  id: number;
  codigo_sence: number;
  codigo_sence_data?: CodigoSence;
  nombre: string;
  descripcion: string;
  horas_totales: number;  // ← Campo correcto del backend
  modalidad: 'presencial' | 'online' | 'mixto';
  nivel: 'basico' | 'intermedio' | 'avanzado';
  estado: 'activo' | 'inactivo' | 'borrador';
  imagen_portada?: string;  // ← Corregido de imagen_url
  imagen_banner?: string;
  fecha_inicio?: string;         // ← agregado
  fecha_fin?: string;            // ← agregado
  relatores?: RelatorCurso[];    // ← agregado (Many-to-Many via CursoRelator)
  total_inscritos?: number;
  cupos_disponibles?: number;
  modulos?: Modulo[];
  created_at?: string;
  updated_at?: string;
}

class CursoService extends BaseService<Curso> {
  constructor() {
    super({ endpoint: '/cursos/' });
  }

  async getActivos() {
    return this.filter({ estado: 'activo' });
  }
  async asignarEstudiantes(cursoId: number, payload: { usuario_id?: number; codigo_empleado?: string }) {
  return this.customAction(cursoId, 'asignar_estudiantes', payload);
}
}


export const cursoService = new CursoService();