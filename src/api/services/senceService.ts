// src/api/services/senceService.ts
import api from '@/api/axios';

export interface DatosFormSence {
  RutOtec: string;
  Token: string;
  CodSence: string;
  CodigoCurso: string;
  LineaCapacitacion: number;
  RunAlumno: string;
  IdSesionAlumno: string;
  UrlRetoma: string;
  UrlError: string;
}

export interface RespuestaPreparacion {
  success: boolean;
  url_sence: string;
  metodo: string;
  datos_formulario: DatosFormSence;
  id_sesion: string;
}

export interface SesionActiva {
  tiene_sesion_activa: boolean;
  sesion?: {
    id: number;
    fecha_inicio: string;
    duracion_actual_minutos: number;
  };
}

const senceService = {
  /**
   * Prepara los datos para iniciar sesión SENCE.
   * Devuelve la URL y el form data para el POST oculto.
   */
  async prepararInicio(inscripcionId: number): Promise<RespuestaPreparacion> {
    const res = await api.post(`/sence/iniciar-sesion/${inscripcionId}/`);
    return res.data;
  },

  /**
   * Prepara los datos para cerrar sesión SENCE.
   */
  async prepararCierre(sesionId: number): Promise<RespuestaPreparacion> {
    const res = await api.post(`/sence/cerrar-sesion/${sesionId}/`);
    return res.data;
  },

  /**
   * Consulta si hay una sesión SENCE activa para una inscripción.
   */
  async getSesionActiva(inscripcionId: number): Promise<SesionActiva> {
    const res = await api.get(`/sence/sesion-activa/${inscripcionId}/`);
    return res.data;
  },

  /**
   * Crea y hace submit de un form POST oculto hacia SENCE.
   * Esta es la técnica estándar porque SENCE requiere HTTP POST, no un link.
   */
  redirigirASence(urlAccion: string, datos: DatosFormSence): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = urlAccion;

    Object.entries(datos).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  },
};

export default senceService;