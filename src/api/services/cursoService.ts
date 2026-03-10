// src/api/services/cursoService.ts
// BASADO EN BACKEND REAL DE VALERIA

import BaseService from './baseService';

export interface CodigoSence {
  id: number;
  codigo: string;
  nombre_curso: string;
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
  relator_nombre?: string;
  nombre_completo?: string;
  fecha_asignacion?: string;
  es_principal?: boolean;
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
  imagen_portada?: string;
  imagen_banner?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  relatores?: RelatorCurso[];
  total_inscritos?: number;
  cupos_disponibles?: number;
  modulos?: Modulo[];
  created_at?: string;
  updated_at?: string;
  estado_temporal?: 'borrador' | 'programado' | 'en_curso' | 'cerrado';
  sincronizado_con_sence?: boolean;
  dias_gracia?: number;
  publicado?: boolean;
  objetivos?: string;
  requisitos?: string;
  cupo_maximo?: number;
  cupo_minimo?: number;
}

// Respuesta del action inscribirse
export interface InscribirseResponse {
  mensaje: string;
  inscripcion_id: number;
  curso_id: number;
  estado: string;
}

class CursoService extends BaseService<Curso> {
  constructor() {
    super({ endpoint: '/cursos/' });
  }

  async getActivos() {
    return this.filter({ estado: 'activo' });
  }

  async asignarEstudiantes(
    cursoId: number,
    payload: { usuario_id?: number; codigo_empleado?: string }
  ) {
    return this.customAction(cursoId, 'asignar_estudiantes', payload);
  }

  /**
   * Catálogo: cursos publicados y activos en los que el estudiante NO está inscrito.
   * El backend filtra automáticamente por el usuario logueado.
   */
  async getCatalogo(): Promise<Curso[]> {
    return this.filter({ catalogo: 'true' });
  }

  /**
   * Auto-inscripción del estudiante en un curso del catálogo.
   */
  async inscribirse(cursoId: number): Promise<InscribirseResponse> {
    return this.customAction<InscribirseResponse>(cursoId, 'inscribirse');
  }
}

export const cursoService = new CursoService();