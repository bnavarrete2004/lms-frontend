// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario, LoginCredentials } from '@/types/auth';
import { authService } from '@/api/auth'; // ← Importar authService (que ya existe en src/api/auth.ts)

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<Usuario>;
  logout: () => void;
  updateUser: (user: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // ✅ ESTE ES EL CAMBIO: actualizar esta función para que use response.user
  const login = async (credentials: LoginCredentials): Promise<Usuario> => {
    try {
      console.log('🔄 Intentando login con:', credentials.username);
      
      const response = await authService.login(credentials); // ← Esto retorna AuthResponse {access, refresh, user}
      
      console.log('✅ Respuesta del backend:', response);
      console.log('👤 Usuario:', response.user);
      console.log('🎭 Rol del usuario:', response.user.rol);
      
      setUser(response.user); // ← Cambio: ahora es response.user
      return response.user;   // ← Cambio: ahora es response.user
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('📄 Detalles del error:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: Usuario) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}