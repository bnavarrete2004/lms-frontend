import api from './axios';
import type { LoginCredentials, AuthResponse, Usuario } from '@/types/auth';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    
    // Guardar tokens en localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser(): Usuario | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // Obtener perfil actualizado
  async getProfile(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/profile/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  // Actualizar perfil
  async updateProfile(data: Partial<Usuario>): Promise<Usuario> {
    const response = await api.patch<Usuario>('/auth/profile/', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
};

