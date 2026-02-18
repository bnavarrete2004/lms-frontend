// src/api/services/baseService.ts
// Servicio base genérico con operaciones CRUD reutilizables

import api from '../axios';
import type { AxiosResponse } from 'axios';

// ============================================
// TIPOS GENÉRICOS
// ============================================

/**
 * Parámetros de paginación estándar
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  ordering?: string;
}

/**
 * Respuesta paginada del backend (Django REST Framework)
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Opciones de configuración para el servicio
 */
export interface ServiceConfig {
  endpoint: string;
  resourceName?: string; // Para mensajes de error más descriptivos
}

// ============================================
// CLASE BASE SERVICE
// ============================================

/**
 * Servicio base genérico para operaciones CRUD
 * 
 * @example
 * ```typescript
 * const cursoService = new BaseService<Curso>({ endpoint: '/cursos' });
 * 
 * // Listar todos
 * const cursos = await cursoService.getAll();
 * 
 * // Obtener uno
 * const curso = await cursoService.getById(1);
 * 
 * // Crear
 * const nuevoCurso = await cursoService.create({ nombre: 'React Avanzado' });
 * 
 * // Actualizar
 * const actualizado = await cursoService.update(1, { nombre: 'React Pro' });
 * 
 * // Eliminar
 * await cursoService.delete(1);
 * ```
 */
export class BaseService<T> {
  protected endpoint: string;
  protected resourceName: string;

  constructor(config: ServiceConfig) {
    this.endpoint = config.endpoint;
    this.resourceName = config.resourceName || config.endpoint.replace(/^\//, '');
  }

  // ============================================
  // GET ALL (LIST)
  // ============================================

  /**
   * Obtiene una lista de recursos
   * 
   * @param params - Parámetros de query (filtros, paginación, ordering)
   * @returns Array de recursos o respuesta paginada
   */
  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response: AxiosResponse<T[] | PaginatedResponse<T>> = await api.get(
      this.endpoint,
      { params }
    );

    // Si el backend usa paginación, extraer los resultados
    if (this.isPaginatedResponse(response.data)) {
      return response.data.results;
    }

    return response.data;
  }

  /**
   * Obtiene una lista paginada de recursos
   * 
   * @param params - Parámetros de paginación
   * @returns Respuesta paginada completa con metadatos
   */
  async getPaginated(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await api.get(
      this.endpoint,
      { params }
    );

    return response.data;
  }

  // ============================================
  // GET BY ID
  // ============================================

  /**
   * Obtiene un recurso específico por ID
   * 
   * @param id - ID del recurso
   * @returns Recurso encontrado
   */
  async getById(id: number | string): Promise<T> {
    const base = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
    const response: AxiosResponse<T> = await api.get(`${base}/${id}/`);
    return response.data;
  }

  // ============================================
  // CREATE
  // ============================================

  /**
   * Crea un nuevo recurso
   * 
   * @param data - Datos del recurso a crear
   * @returns Recurso creado
   */
  async create(data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await api.post(this.endpoint, data);
    return response.data;
  }

  // ============================================
  // UPDATE (PUT - completo)
  // ============================================

  /**
   * Actualiza completamente un recurso (PUT)
   * 
   * @param id - ID del recurso
   * @param data - Datos completos del recurso
   * @returns Recurso actualizado
   */
  async update(id: number | string, data: Partial<T>): Promise<T> {
    const base = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
    const response: AxiosResponse<T> = await api.put(`${base}/${id}/`, data);
    return response.data;
  }

  // ============================================
  // PATCH (parcial)
  // ============================================

  /**
   * Actualiza parcialmente un recurso (PATCH)
   * 
   * @param id - ID del recurso
   * @param data - Datos parciales a actualizar
   * @returns Recurso actualizado
   */
  async patch(id: number | string, data: Partial<T>): Promise<T> {
   const base = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
    const response: AxiosResponse<T> = await api.patch(`${base}/${id}/`, data);
    return response.data;
  }

  // ============================================
  // DELETE
  // ============================================

  /**
   * Elimina un recurso
   * 
   * @param id - ID del recurso a eliminar
   */
  async delete(id: number | string): Promise<void> {
    const base = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
    await api.delete(`${base}/${id}/`);
  }

  // ============================================
  // CUSTOM ACTIONS (para endpoints tipo /recurso/{id}/action/)
  // ============================================

  /**
   * Ejecuta una acción personalizada sobre un recurso
   * 
   * @param id - ID del recurso
   * @param action - Nombre de la acción (ej: 'aprobar', 'rechazar')
   * @param data - Datos opcionales para la acción
   * @returns Respuesta de la acción
   * 
   * @example
   * ```typescript
   * await materialService.customAction(5, 'aprobar', { comentarios: 'Excelente' });
   * // POST /api/materiales/5/aprobar/ { comentarios: 'Excelente' }
   * ```
   */
  async customAction<R = T>(
    id: number | string,
    action: string,
    data?: any
  ): Promise<R> {
    const response: AxiosResponse<R> = await api.post(
      `${this.endpoint}/${id}/${action}/`,
      data
    );
    return response.data;
  }

  /**
   * Ejecuta una acción GET personalizada sobre un recurso
   * 
   * @param id - ID del recurso
   * @param action - Nombre de la acción
   * @param params - Parámetros de query
   * @returns Respuesta de la acción
   */
  async customGetAction<R = T>(
    id: number | string,
    action: string,
    params?: any
  ): Promise<R> {
    const response: AxiosResponse<R> = await api.get(
      `${this.endpoint}/${id}/${action}/`,
      { params }
    );
    return response.data;
  }

  // ============================================
  // BÚSQUEDA Y FILTROS
  // ============================================

  /**
   * Busca recursos por un término
   * 
   * @param query - Término de búsqueda
   * @param params - Parámetros adicionales
   * @returns Array de recursos encontrados
   */
  async search(query: string, params?: Record<string, any>): Promise<T[]> {
    return this.getAll({ search: query, ...params });
  }

  /**
   * Filtra recursos por múltiples criterios
   * 
   * @param filters - Objeto con filtros
   * @returns Array de recursos filtrados
   */
  async filter(filters: Record<string, any>): Promise<T[]> {
    return this.getAll(filters);
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Verifica si la respuesta es paginada
   */
  private isPaginatedResponse(data: any): data is PaginatedResponse<T> {
    return (
      data &&
      typeof data === 'object' &&
      'results' in data &&
      'count' in data
    );
  }
}

// ============================================
// EXPORT
// ============================================

export default BaseService;