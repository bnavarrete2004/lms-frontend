// src/api/axios.ts
// Configuración principal de Axios con interceptors JWT para el LMS

import axios, { AxiosError } from 'axios';

// ============================================
// CONFIGURACIÓN BASE
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
// Agrega automáticamente el token JWT a cada request

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log útil para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
// Maneja errores y refresca el token automáticamente

api.interceptors.response.use(
  (response) => {
    // Log útil para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // ============================================
    // CASO 1: Token expirado (401)
    // ============================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }

        console.log('🔄 Token expirado, refrescando...');

        // ⚠️ BUG CORREGIDO: Faltaban los acentos graves ` `
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;

        // Guardar el nuevo token
        localStorage.setItem('access_token', access);
        
        // Actualizar el header del request original
        originalRequest.headers.Authorization = `Bearer ${access}`;

        console.log('✅ Token refrescado exitosamente');

        // Reintentar el request original
        return api(originalRequest);

      } catch (refreshError) {
        console.error('❌ Error al refrescar token:', refreshError);

        // Limpiar tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Redirigir al login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // ============================================
    // CASO 2: Otros errores
    // ============================================
    
    // Log del error (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.error('❌ Error en response:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

/**
 * Obtiene el token de acceso actual
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Limpia todos los datos de autenticación
 */
export const clearAuth = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// ============================================
// EXPORT
// ============================================

export default api;