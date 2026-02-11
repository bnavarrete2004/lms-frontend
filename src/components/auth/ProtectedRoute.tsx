// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { RolUsuario } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RolUsuario[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 🔍 DEBUG
  console.log('🔒 ProtectedRoute ejecutándose:', {
    isLoading,
    isAuthenticated,
    user: user,
    userRol: user?.rol,
    allowedRoles,
    includes: allowedRoles && user ? allowedRoles.includes(user.rol) : null
  });

  if (isLoading) {
    console.log('⏳ Aún cargando...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    console.log('❌ Rol no permitido. User rol:', user.rol, 'Allowed:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Acceso permitido a:', allowedRoles);
  return <>{children}</>;
}