// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

// Protected Pages
import { DashboardPage } from '@/pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes - Student */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Relator (cuando lo creemos) */}
          {/* <Route
            path="/relator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorDashboardPage />
              </ProtectedRoute>
            }
          /> */}

          {/* Protected Routes - Admin (cuando lo creemos) */}
          {/* <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          /> */}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;