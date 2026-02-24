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

export class BaseService<T> {
  protected endpoint: string;
  protected resourceName: string;

  constructor(config: ServiceConfig) {
    this.endpoint = config.endpoint;
    this.resourceName = config.resourceName || config.endpoint.replace(/^\//, '');
  }

  /**
   * Método privado para limpiar la URL base y evitar doble barra //
   * No modifica la variable original this.endpoint
   */
  private getBaseUrl(): string {
    return this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
  }

  // ============================================
  // GET ALL (LIST)
  // ============================================

  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response: AxiosResponse<T[] | PaginatedResponse<T>> = await api.get(
      this.endpoint,
      { params }
    );

    if (this.isPaginatedResponse(response.data)) {
      return response.data.results;
    }

    return response.data;
  }

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

  async getById(id: number | string): Promise<T> {
    const base = this.getBaseUrl();
    const response: AxiosResponse<T> = await api.get(`${base}/${id}/`);
    return response.data;
  }

  // ============================================
  // CREATE
  // ============================================

  async create(data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await api.post(this.endpoint, data);
    return response.data;
  }

  // ============================================
  // UPDATE (PUT - completo)
  // ============================================

  async update(id: number | string, data: Partial<T>): Promise<T> {
    const base = this.getBaseUrl();
    const response: AxiosResponse<T> = await api.put(`${base}/${id}/`, data);
    return response.data;
  }

  // ============================================
  // PATCH (parcial)
  // ============================================

  async patch(id: number | string, data: Partial<T>): Promise<T> {
    const base = this.getBaseUrl();
    const response: AxiosResponse<T> = await api.patch(`${base}/${id}/`, data);
    return response.data;
  }

  // ============================================
  // DELETE
  // ============================================

  async delete(id: number | string): Promise<void> {
    const base = this.getBaseUrl();
    await api.delete(`${base}/${id}/`);
  }

  // ============================================
  // CUSTOM ACTIONS
  // ============================================

  /**
   * Ejecuta una acción POST personalizada (Ej: asignar_estudiantes)
   */
  async customAction<R = T>(
    id: number | string,
    action: string,
    data?: any
  ): Promise<R> {
    const base = this.getBaseUrl();
    const response: AxiosResponse<R> = await api.post(
      `${base}/${id}/${action}/`,
      data
    );
    return response.data;
  }

  /**
   * Ejecuta una acción GET personalizada
   */
  async customGetAction<R = T>(
    id: number | string,
    action: string,
    params?: any
  ): Promise<R> {
    const base = this.getBaseUrl();
    const response: AxiosResponse<R> = await api.get(
      `${base}/${id}/${action}/`,
      { params }
    );
    return response.data;
  }

  // ============================================
  // BÚSQUEDA Y FILTROS
  // ============================================

  async search(query: string, params?: Record<string, any>): Promise<T[]> {
    return this.getAll({ search: query, ...params });
  }

  async filter(filters: Record<string, any>): Promise<T[]> {
    return this.getAll(filters);
  }

  // ============================================
  // HELPERS
  // ============================================

  private isPaginatedResponse(data: any): data is PaginatedResponse<T> {
    return (
      data &&
      typeof data === 'object' &&
      'results' in data &&
      'count' in data
    );
  }
}

export default BaseService;