// src/api/services/moduloService.ts
// Servicio para gestionar módulos de cursos

import BaseService from './baseService';

export interface Modulo {
  id: number;
  curso: number;
  curso_nombre?: string;
  nombre: string;
  descripcion: string;
  objetivos: string;
  orden: number;
  codigo_modulo: string;
  horas_estimadas: number;
  publicado: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Payloads tipados para el wizard ────────────────────────────────────────

export interface CrearModuloPayload {
  curso: number;
  nombre: string;
  descripcion?: string;
  objetivos?: string;
  orden: number;
  codigo_modulo?: string;
  horas_estimadas: number;
  publicado?: boolean;
}

export interface ActualizarModuloPayload extends Partial<Omit<CrearModuloPayload, 'curso'>> {}

// ───────────────────────────────────────────────────────────────────────────

class ModuloService extends BaseService<Modulo> {
  constructor() {
    super({ endpoint: '/modulos/' });
  }

  async getByCurso(cursoId: number): Promise<Modulo[]> {
    return this.filter({ curso: cursoId });
  }

  async getPublicadosByCurso(cursoId: number): Promise<Modulo[]> {
    return this.filter({ curso: cursoId, publicado: true });
  }

  async crear(payload: CrearModuloPayload): Promise<Modulo> {
    return this.create(payload);
  }

  async actualizar(id: number, payload: ActualizarModuloPayload): Promise<Modulo> {
    return this.update(id, payload);
  }

  async eliminar(id: number): Promise<void> {
    return this.delete(id);
  }

  async reordenar(modulos: Pick<Modulo, 'id' | 'orden'>[]): Promise<void> {
    await Promise.all(
      modulos.map(({ id, orden }) => this.actualizar(id, { orden }))
    );
  }
}

export const moduloService = new ModuloService();