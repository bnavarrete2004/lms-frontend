// src/api/services/evaluacionService.ts
// Servicio para gestionar evaluaciones, preguntas y respuestas

import BaseService from './baseService';
import api from '../axios';

export interface Evaluacion {
  id: number;
  curso: number;
  modulo?: number;
  nombre: string;
  descripcion: string;
  instrucciones: string;
  tipo: 'examen' | 'quiz' | 'tarea' | 'proyecto' | 'practica';
  tiempo_limite_minutos?: number;
  intentos_permitidos: number;
  nota_aprobacion: number;
  porcentaje_aprobacion: number;
  nota_minima: number;
  nota_maxima: number;
  peso_porcentaje: number;
  requiere_seb: boolean;
  orden: number;
  disponible_desde?: string;
  disponible_hasta?: string;
  publicada: boolean;
  correccion_automatica: boolean;
  requiere_validacion_relator: boolean;
  creado_por: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pregunta {
  id: number;
  evaluacion: number;
  enunciado: string;
  imagen_url?: string;
  tipo: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank';
  opciones: string; // JSON string con array de opciones
  respuesta_correcta: string; // JSON string con respuesta(s) correcta(s)
  puntaje: number;
  orden: number;
  feedback_correcto?: string;
  feedback_incorrecto?: string;
  created_at?: string;
}

export interface IntentoEvaluacion {
  id: number;
  estudiante: number;
  evaluacion: number;
  evaluacion_data?: Evaluacion;
  intento_numero: number;
  fecha_inicio: string;
  fecha_fin?: string;
  nota_obtenida?: number;
  porcentaje_obtenido?: number;
  aprobado?: boolean;
  tiempo_tomado_segundos?: number;
  ip_address?: string;
  navegador?: string;
  created_at?: string;
}

export interface RespuestaEstudiante {
  id: number;
  intento: number;
  pregunta: number;
  pregunta_data?: Pregunta;
  respuesta_texto: string; // JSON string con respuesta(s) del estudiante
  es_correcta?: boolean;
  puntaje_obtenido?: number;
  tiempo_respuesta_segundos?: number;
  created_at?: string;
}

class EvaluacionService extends BaseService<Evaluacion> {
  constructor() {
    super({ endpoint: '/evaluaciones' });
  }

  /**
   * Obtiene todas las evaluaciones de un curso
   * @param cursoId - ID del curso
   * @returns Promise con array de evaluaciones
   */
  async getByCurso(cursoId: number): Promise<Evaluacion[]> {
    return this.filter({ curso: cursoId });
  }

  /**
   * Obtiene todas las evaluaciones de un módulo
   * @param moduloId - ID del módulo
   * @returns Promise con array de evaluaciones
   */
  async getByModulo(moduloId: number): Promise<Evaluacion[]> {
    return this.filter({ modulo: moduloId });
  }

  /**
   * Obtiene solo evaluaciones publicadas de un curso
   * @param cursoId - ID del curso
   * @returns Promise con array de evaluaciones publicadas
   */
  async getPublicadasByCurso(cursoId: number): Promise<Evaluacion[]> {
    return this.filter({ curso: cursoId, publicada: true });
  }

  /**
   * Obtiene las preguntas de una evaluación
   * @param evaluacionId - ID de la evaluación
   * @returns Promise con array de preguntas
   */
  async getPreguntas(evaluacionId: number): Promise<Pregunta[]> {
    const response = await api.get('/preguntas/', {
      params: { evaluacion: evaluacionId }
    });
    return response.data.results || response.data;
  }

  /**
   * Obtiene los intentos de un estudiante en una evaluación
   * @param evaluacionId - ID de la evaluación
   * @returns Promise con array de intentos
   */
  async getMisIntentos(evaluacionId: number): Promise<IntentoEvaluacion[]> {
    const response = await api.get('/intentos-evaluacion/', {
      params: { evaluacion: evaluacionId }
    });
    return response.data.results || response.data;
  }

  /**
   * Inicia un nuevo intento de evaluación
   * @param evaluacionId - ID de la evaluación
   * @param datos - Datos adicionales del intento (navegador, IP, etc)
   * @returns Promise con intento creado
   */
  async iniciarIntento(
    evaluacionId: number, 
    datos?: { ip_address?: string; navegador?: string }
  ): Promise<IntentoEvaluacion> {
    const response = await api.post('/intentos-evaluacion/', {
      evaluacion: evaluacionId,
      fecha_inicio: new Date().toISOString(),
      ...datos
    });
    return response.data;
  }

  /**
   * Envía las respuestas de un intento
   * @param intentoId - ID del intento
   * @param respuestas - Array de respuestas del estudiante
   * @returns Promise con intento actualizado
   */
  async enviarRespuestas(
    intentoId: number,
    respuestas: Array<{ pregunta: number; respuesta_texto: string; tiempo_respuesta_segundos?: number }>
  ): Promise<IntentoEvaluacion> {
    // Crear cada respuesta
    for (const resp of respuestas) {
      await api.post('/respuestas-estudiante/', {
        intento: intentoId,
        ...resp
      });
    }

    // Finalizar el intento
    const response = await api.patch(`/intentos-evaluacion/${intentoId}/`, {
      fecha_fin: new Date().toISOString()
    });

    return response.data;
  }

  /**
   * Obtiene las respuestas de un intento específico
   * @param intentoId - ID del intento
   * @returns Promise con array de respuestas
   */
  async getRespuestasIntento(intentoId: number): Promise<RespuestaEstudiante[]> {
    const response = await api.get('/respuestas-estudiante/', {
      params: { intento: intentoId }
    });
    return response.data.results || response.data;
  }
}

export const evaluacionService = new EvaluacionService();