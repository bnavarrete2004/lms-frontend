import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta raíz - redirige al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Ruta de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Ruta 404 */}
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

