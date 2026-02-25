// src/api/services/materialService.ts
// Servicio para gestionar materiales educativos - ACTUALIZADO CON FLUJO DE DISEÑO

import BaseService from './baseService';
import api from '../axios';

export interface Material {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'video' | 'pdf' | 'documento' | 'presentacion' | 'imagen' | 'audio' | 'codigo' | 'enlace' | 'scorm' | 'otro';
  preguntas?: any[];
  archivo_url: string;
  archivo_size?: number;
  archivo_hash?: string;
  duracion_segundos?: number;
  total_paginas?: number;
  subido_por: number;
  subido_por_nombre?: string;    // <-- Nuevo: Nombre real del usuario que subió
  relator_autor?: number;
  relator_autor_nombre?: string; // <-- Nuevo: Nombre real del relator autor
  // Agregado el estado 'en_diseno'
  estado: 'pendiente' | 'en_diseno' | 'aprobado' | 'rechazado' | 'cambios_solicitados';
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
   */
  async getByLeccion(leccionId: number): Promise<LeccionMaterial[]> {
    const response = await api.get('/leccion-material/', {
      params: { leccion: leccionId }
    });
    return response.data.results || response.data;
  }

  /**
   * Obtiene solo materiales OFICIALES (ya maquetados y aprobados)
   * Útil para el paso 4 del Wizard de cursos.
   */
  async getAprobados(): Promise<Material[]> {
    return this.filter({ estado: 'aprobado' });
  }

  /**
   * Obtiene materiales pendientes de maquetación/diseño (Solo para Admin)
   */
  async getEnDiseno(): Promise<Material[]> {
    return this.filter({ estado: 'en_diseno' });
  }

  /**
   * Aprobar un material (El backend decidirá si pasa a 'aprobado' o 'en_diseno')
   */
  async aprobar(id: number, comentarios?: string): Promise<Material> {
    const response = await api.post(`${this.endpoint}/${id}/aprobar/`, {
      comentarios: comentarios // Enviamos como 'comentarios' para que coincida con el backend
    });
    return response.data;
  }

  /**
   * Subir versión final maquetada (Acción exclusiva del Admin)
   * @param id - ID del material original
   * @param url - URL del nuevo archivo en Cloudinary (con diseño)
   * @param size - Tamaño del nuevo archivo
   */
  async subirVersionFinal(id: number, url: string, size?: number): Promise<Material> {
    const response = await api.post(`${this.endpoint}/${id}/subir_version_final/`, {
      archivo_url: url,
      archivo_size: size
    });
    return response.data;
  }

  /**
   * Rechazar un material
   */
  async rechazar(id: number, comentarios: string): Promise<Material> {
    const response = await api.post(`${this.endpoint}/${id}/rechazar/`, {
      comentarios: comentarios
    });
    return response.data;
  }
}

export const materialService = new MaterialService();