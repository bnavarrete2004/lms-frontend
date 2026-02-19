// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// --- PÁGINAS PÚBLICAS ---
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

// --- PÁGINAS ESTUDIANTE ---
import { DashboardPage } from '@/pages/StudentDashboardPage'; 
import { CourseDetailPage } from '@/pages/CourseDetailPage';
import { LessonPage } from '@/pages/LessonPage';

// --- PÁGINAS RELATOR ---
import { RelatorDashboardPage } from '@/pages/RelatorDashboardPage';
import { RelatorMaterialesPage } from '@/pages/RelatorMaterialesPage';
import { RelatorUploadPage } from '@/pages/RelatorUploadPage';
import { RelatorCursosPage } from '@/pages/RelatorCursosPage';
import { RelatorEstudiantesPage } from '@/pages/RelatorEstudiantesPage';
import { RelatorStatsPage } from '@/pages/RelatorStatsPage';
import { RelatorNotificationsPage } from '@/pages/RelatorNotificationsPage';
import { RelatorProfilePage } from '@/pages/RelatorProfilePage';

// --- PÁGINAS ADMINISTRADOR ---
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminStatsPage } from '@/pages/AdminStatsPage';
import { AdminCursosPage } from '@/pages/AdminCursosPage';
import { CrearCursoWizard } from '@/pages/admin/wizard/CrearCursoWizard';
import { AdminCursoDetailPage } from '@/pages/admin/AdminCursoDetailPage';
import { AdminCursoEditPage } from '@/pages/admin/AdminCursoEditPage';
import { AdminUsuariosPage } from '@/pages/AdminUsuariosPage';
import { AdminRepoPage } from './pages/AdminRepoPage';
import { AdminRevisionPage } from '@/pages/AdminRevisionPage';
import { AdminLandingPage } from '@/pages/AdminLandingPage';
import { AdminConfigPage } from '@/pages/AdminConfigPage';
import { AdminReportesSencePage } from '@/pages/AdminReportesSencePage';

// --- PÁGINAS DE TEST/DESARROLLO ---
import { TestApiPage } from './pages/TestApiPage';
import { TestServicesPage } from '@/pages/TestServicesPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==========================================
              RUTAS PÚBLICAS
          ========================================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ==========================================
              RUTAS ESTUDIANTE
          ========================================== */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:id"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:cursoId/modules/:moduloId/lessons/:leccionId"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <LessonPage />
              </ProtectedRoute>
            }
          />

          {/* ==========================================
              RUTAS RELATOR
          ========================================== */}
          <Route
            path="/relator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relator/materiales"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorMaterialesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relator/subir"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relator/cursos"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorCursosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relator/estudiantes"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorEstudiantesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relator/stats"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorStatsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relator/notificaciones"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorNotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relator/perfil"
            element={
              <ProtectedRoute allowedRoles={['relator']}>
                <RelatorProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ==========================================
              RUTAS ADMINISTRADOR
          ========================================== */}
          {/* Dashboard y Estadísticas */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminStatsPage />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Cursos */}
          <Route
            path="/admin/cursos"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminCursosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cursos/crear"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <CrearCursoWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cursos/:id"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminCursoDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cursos/:id/editar"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminCursoEditPage />
              </ProtectedRoute>
            }
          />

          {/* Gestión de Contenido y Usuarios */}
          <Route
            path="/admin/revision"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminRevisionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/repositorio"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminRepoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminUsuariosPage />
              </ProtectedRoute>
            }
          />

          {/* Configuración y Reportes */}
          <Route
            path="/admin/landing"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminLandingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reportes"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminReportesSencePage />
              </ProtectedRoute>
            }
          />

          {/* ==========================================
              RUTAS DE DESARROLLO (BORRAR EN PRODUCCIÓN)
          ========================================== */}
          <Route path="/test-api" element={<TestApiPage />} />
          <Route path="/test-services" element={<TestServicesPage />} />

          {/* Fallback - Redirigir cualquier otra ruta a la Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;