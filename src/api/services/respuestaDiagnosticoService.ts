// src/api/services/respuestaDiagnosticoService.ts
import api from '../axios';

export interface RespuestaDiagnostico {
  id: number;
  leccion: number;
  estudiante: number;
  estudiante_nombre: string;
  respuesta_texto: string;
  fecha_envio: string;
  fecha_envio_relativa: string;
}

export interface CrearRespuestaDto {
  leccion: number;
  respuesta_texto: string;
}

const respuestaDiagnosticoService = {

  // Enviar mi respuesta
  async crear(data: CrearRespuestaDto): Promise<RespuestaDiagnostico> {
    const response = await api.post<RespuestaDiagnostico>(
      '/respuestas-diagnostico/',
      data
    );
    return response.data;
  },

  // Obtener respuestas de otros estudiantes de una lección
  async getByLeccion(leccionId: number): Promise<RespuestaDiagnostico[]> {
    const response = await api.get<RespuestaDiagnostico[]>(
      '/respuestas-diagnostico/',
      { params: { leccion: leccionId } }
    );
    // Soporta respuesta paginada o directa
    const data = response.data as any;
    return Array.isArray(data) ? data : data.results ?? [];
  },

};

export { respuestaDiagnosticoService };
export default respuestaDiagnosticoService;