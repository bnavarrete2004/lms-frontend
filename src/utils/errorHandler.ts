// src/utils/errorHandler.ts
// Manejo centralizado de errores HTTP con mensajes amigables

import { AxiosError } from 'axios';

// ============================================
// TIPOS
// ============================================

export interface ErrorResponse {
  message: string;
  details?: string;
  statusCode?: number;
  field?: string; // Para errores de validación de campos específicos
}

// ============================================
// MENSAJES DE ERROR POR CÓDIGO HTTP
// ============================================

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Por favor revisa la información.',
  401: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Ya existe un registro con estos datos.',
  422: 'Los datos enviados contienen errores de validación.',
  500: 'Error en el servidor. Por favor intenta nuevamente más tarde.',
  502: 'El servidor no está disponible en este momento.',
  503: 'El servicio no está disponible. Intenta más tarde.',
  504: 'El servidor tardó demasiado en responder.',
};

// ============================================
// MENSAJES ESPECÍFICOS POR ENDPOINT
// ============================================

const ENDPOINT_ERROR_MESSAGES: Record<string, Record<number, string>> = {
  '/auth/login/': {
    400: 'Usuario o contraseña incorrectos.',
    401: 'Credenciales inválidas. Verifica tu usuario y contraseña.',
  },
  '/auth/register/': {
    400: 'El RUT o email ya está registrado.',
    409: 'Ya existe un usuario con estos datos.',
  },
  '/cursos/': {
    403: 'No tienes permisos para acceder a este curso.',
    404: 'El curso no existe o fue eliminado.',
  },
  '/inscripciones/': {
    400: 'Ya estás inscrito en este curso.',
    403: 'No cumples los requisitos para inscribirte en este curso.',
  },
  '/materiales/': {
    403: 'Solo los relatores pueden subir materiales.',
    413: 'El archivo es demasiado grande. Tamaño máximo: 50MB.',
  },
  '/evaluaciones/': {
    400: 'Ya no tienes intentos disponibles para esta evaluación.',
    403: 'Debes completar las lecciones previas antes de tomar esta evaluación.',
  },
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Extrae un mensaje de error amigable desde una respuesta de Axios
 * 
 * @param error - Error de Axios capturado
 * @returns Objeto con mensaje amigable y detalles
 */
export function handleApiError(error: unknown): ErrorResponse {
  // AÑADE ESTA LÍNEA AQUÍ:
  console.log("DEBUG: El error capturado es:", error);
  // Si no es un error de Axios
  if (!isAxiosError(error)) {
    return {
      message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
      details: error instanceof Error ? error.message : 'Error desconocido',
    };
  }

  const axiosError = error as AxiosError<any>;
  const statusCode = axiosError.response?.status;
  const endpoint = axiosError.config?.url || '';
  const responseData = axiosError.response?.data;

  // ============================================
  // CASO 1: Sin respuesta del servidor (Network Error)
  // ============================================
  if (!axiosError.response) {
    return {
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      details: axiosError.message,
    };
  }

  // ============================================
  // CASO 2: Backend envía mensaje personalizado
  // ============================================
  if (responseData?.message || responseData?.error || responseData?.detail) {
    const backendMessage = 
      responseData.message || 
      responseData.error || 
      responseData.detail;

    return {
      message: backendMessage,
      statusCode,
      details: JSON.stringify(responseData),
    };
  }

  // ============================================
  // CASO 3: Errores de validación de campos (Django)
  // ============================================
  if (responseData && typeof responseData === 'object') {
    // Django REST Framework envía errores así: { field: ["Error message"] }
    const fieldErrors = Object.entries(responseData)
      .filter(([key]) => key !== 'detail' && key !== 'message')
      .map(([field, errors]) => {
        const errorMessages = Array.isArray(errors) ? errors : [errors];
        return `${field}: ${errorMessages.join(', ')}`;
      });

    if (fieldErrors.length > 0) {
      return {
        message: 'Hay errores en los siguientes campos:',
        details: fieldErrors.join('\n'),
        statusCode,
      };
    }
  }

  // ============================================
  // CASO 4: Mensaje específico por endpoint
  // ============================================
  const endpointMatch = Object.keys(ENDPOINT_ERROR_MESSAGES).find(key => 
    endpoint.includes(key)
  );

  if (endpointMatch && statusCode) {
    const specificMessage = ENDPOINT_ERROR_MESSAGES[endpointMatch][statusCode];
    if (specificMessage) {
      return {
        message: specificMessage,
        statusCode,
      };
    }
  }

  // ============================================
  // CASO 5: Mensaje genérico por código HTTP
  // ============================================
  if (statusCode && HTTP_ERROR_MESSAGES[statusCode]) {
    return {
      message: HTTP_ERROR_MESSAGES[statusCode],
      statusCode,
    };
  }

  // ============================================
  // CASO 6: Error desconocido
  // ============================================
  return {
    message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    details: axiosError.message,
    statusCode,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Type guard para verificar si es un AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Extrae mensaje corto para mostrar en toast/snackbar
 */
export function getErrorMessage(error: unknown): string {
  return handleApiError(error).message;
}

/**
 * Extrae detalles técnicos para logging
 */
export function getErrorDetails(error: unknown): string | undefined {
  return handleApiError(error).details;
}

/**
 * Verifica si el error es de autenticación (401)
 */
export function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  return error.response?.status === 401;
}

/**
 * Verifica si el error es de permisos (403)
 */
export function isPermissionError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  return error.response?.status === 403;
}

/**
 * Verifica si el error es de validación (400, 422)
 */
export function isValidationError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 400 || status === 422;
}