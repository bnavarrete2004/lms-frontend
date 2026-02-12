import BaseService from './baseService';

export interface ProgresoModulo {
  id: number;
  modulo: number;
  modulo_nombre: string;
  inscripcion: number;
  completado: boolean;
  porcentaje_progreso: number;
  fecha_inicio?: string;
  fecha_completado?: string;
}

class ProgresoService extends BaseService<ProgresoModulo> {
  constructor() {
    super({
      endpoint: '/progreso-modulos',
      resourceName: 'progreso',
    });
  }

  async getProgresoInscripcion(inscripcionId: number) {
    return this.filter({ inscripcion: inscripcionId });
  }
}

export const progresoService = new ProgresoService();