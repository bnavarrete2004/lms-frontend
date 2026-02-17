// src/api/services/leccionService.ts
// Servicio para gestionar lecciones de módulos

import BaseService from './baseService';

// ── CORRECCIÓN: tipos reales del backend (models.py TIPO_CHOICES) ───────────
export type TipoLeccion = 'teorica' | 'practica' | 'evaluacion' | 'mixta';

export interface Leccion {
  id: number;
  modulo: number;
  modulo_nombre?: string;
  nombre: string;
  descripcion: string;
  objetivos: string;
  orden: number;
  duracion_minutos: number;
  tipo: TipoLeccion;          // ← corregido desde la versión anterior
  publicado: boolean;
  obligatoria: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Payloads tipados para el wizard ────────────────────────────────────────

export interface CrearLeccionPayload {
  modulo: number;
  nombre: string;
  descripcion?: string;
  objetivos?: string;
  orden: number;
  duracion_minutos: number;
  tipo: TipoLeccion;
  publicado?: boolean;
  obligatoria?: boolean;
}

export interface ActualizarLeccionPayload extends Partial<Omit<CrearLeccionPayload, 'modulo'>> {}

// ───────────────────────────────────────────────────────────────────────────

class LeccionService extends BaseService<Leccion> {
  constructor() {
    super({ endpoint: '/lecciones' });
  }

  async getByModulo(moduloId: number): Promise<Leccion[]> {
    return this.filter({ modulo: moduloId });
  }

  async getPublicadasByModulo(moduloId: number): Promise<Leccion[]> {
    return this.filter({ modulo: moduloId, publicado: true });
  }

  async getByCurso(cursoId: number): Promise<Leccion[]> {
    return this.filter({ modulo__curso: cursoId });
  }

  async crear(payload: CrearLeccionPayload): Promise<Leccion> {
    return this.create(payload);
  }

  async actualizar(id: number, payload: ActualizarLeccionPayload): Promise<Leccion> {
    return this.update(id, payload);
  }

  async eliminar(id: number): Promise<void> {
    return this.delete(id);
  }

  async reordenar(lecciones: Pick<Leccion, 'id' | 'orden'>[]): Promise<void> {
    await Promise.all(
      lecciones.map(({ id, orden }) => this.actualizar(id, { orden }))
    );
  }
}

export const leccionService = new LeccionService();