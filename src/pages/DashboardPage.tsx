import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">LMS JC Digital Training</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.nombre} {user?.apellido} ({user?.rol})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">
              Bienvenido, {user?.nombre}!
            </h2>
            <p className="text-gray-600 mb-4">
              Rol: <span className="font-semibold">{user?.rol}</span>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                🎉 ¡Frontend configurado exitosamente! 
                <br />
                Este es tu dashboard base. Desde aquí construiremos todas las funcionalidades del LMS.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
