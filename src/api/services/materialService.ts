// src/api/services/materialService.ts
// Servicio para gestionar materiales educativos

import BaseService from './baseService';
import api from '../axios';

export interface Material {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'video' | 'documento' | 'presentacion' | 'imagen' | 'audio' | 'codigo' | 'enlace' | 'otro';
  archivo_url: string;
  archivo_size?: number;
  archivo_hash?: string;
  duracion_segundos?: number;
  total_paginas?: number;
  subido_por: number;
  relator_autor?: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  revisado_por?: number;
  fecha_revision?: string;
  comentarios_revision?: string;
  tags?: string;
  categoria?: string;
  reutilizable: boolean;
  total_usos?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LeccionMaterial {
  id: number;
  leccion: number;
  material: number;
  material_data?: Material;
  orden: number;
  proposito?: string;
  obligatorio: boolean;
  asignado_at?: string;
}

class MaterialService extends BaseService<Material> {
  constructor() {
    super({ endpoint: '/materiales' });
  }

  /**
   * Obtiene los materiales asignados a una lección específica
   * Nota: Esto devuelve objetos LeccionMaterial, no Material directamente
   * @param leccionId - ID de la lección
   * @returns Promise con array de materiales
   */
  async getByLeccion(leccionId: number): Promise<LeccionMaterial[]> {
    const response = await api.get('/leccion-material/', {
      params: { leccion: leccionId }
    });
    return response.data.results || response.data;
  }

  /**
   * Obtiene solo materiales aprobados
   * @returns Promise con array de materiales aprobados
   */
  async getAprobados(): Promise<Material[]> {
    return this.filter({ estado: 'aprobado' });
  }

  /**
   * Obtiene materiales por categoría
   * @param categoria - Categoría del material
   * @returns Promise con array de materiales
   */
  async getByCategoria(categoria: string): Promise<Material[]> {
    return this.filter({ categoria });
  }

  /**
   * Aprobar un material (acción custom)
   * @param id - ID del material
   * @param comentarios - Comentarios opcionales
   * @returns Promise con material aprobado
   */
  async aprobar(id: number, comentarios?: string): Promise<Material> {
    const response = await api.post(`${this.endpoint}/${id}/aprobar/`, {
      comentarios_revision: comentarios
    });
    return response.data;
  }

  /**
   * Rechazar un material (acción custom)
   * @param id - ID del material
   * @param comentarios - Comentarios obligatorios
   * @returns Promise con material rechazado
   */
  async rechazar(id: number, comentarios: string): Promise<Material> {
    const response = await api.post(`${this.endpoint}/${id}/rechazar/`, {
      comentarios_revision: comentarios
    });
    return response.data;
  }
}

export const materialService = new MaterialService();