// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RelatorDashboardPage } from '@/pages/RelatorDashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/StudentDashboardPage'; 
import { TestApiPage } from './pages/TestApiPage';

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
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Relator */}
          <Route
            path="/relator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/test-api" element={<TestApiPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;