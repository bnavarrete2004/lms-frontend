// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 FORMULARIO ENVIADO');
    console.log('📝 Credenciales:', formData);
    
    setError('');
    setIsLoading(true);

    try {
      console.log('⏳ Llamando a login...');
      const user = await login(formData);
      
      console.log('✅ Usuario autenticado:', user);
      console.log('📋 Rol del usuario:', user.rol);
      console.log('📊 Tipo de rol:', typeof user.rol);
      console.log('🔍 Comparación:', {
        'user.rol': user.rol,
        'es estudiante': user.rol === 'estudiante',
        'es relator': user.rol === 'relator',
        'es administrador': user.rol === 'administrador'
      });
      
      // Redirigir según el rol
      if (user.rol === 'estudiante') {
        console.log('🎓 Redirigiendo a /student/dashboard');
        navigate('/student/dashboard');
      } else if (user.rol === 'relator') {
        console.log('👨‍🏫 Redirigiendo a /relator/dashboard');
        navigate('/relator/dashboard');
      } else if (user.rol === 'administrador') {
        console.log('👑 Redirigiendo a /admin/dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('⚠️ Rol no reconocido:', user.rol);
        navigate('/');
      }
      
      console.log('🏁 Después del navigate');
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.response?.data?.detail || 'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.');
    } finally {
      setIsLoading(false);
      console.log('🔚 Finally ejecutado');
    }
  };

  return (  // ← ASEGÚRATE DE QUE ESTO ESTÉ AQUÍ
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-jc-calipso via-jc-cyan to-jc-blue text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <Logo variant="white" size="md" withText className="mb-8" />
          
          <div className="mt-24">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Bienvenido a tu Plataforma de Capacitación
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Accede a tus cursos, revisa tu progreso y continúa tu desarrollo profesional.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm">Acceso 24/7 a tu material de estudio</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm">Seguimiento de tu progreso en tiempo real</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm">Diploma SENCE al completar</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-white/70">
          © 2026 J&C Digital Training. Todos los derechos reservados.
        </div>
      </div>
      
      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-jc-calipso to-jc-blue bg-clip-text text-transparent">
              J&C Digital Training
            </div>
            <p className="text-gray-600 text-sm mt-2">Plataforma de Capacitación</p>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Ingresa tus credenciales para acceder</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Usuario o RUT"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="usuario o 12345678-9"
              required
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-jc-blue focus:ring-jc-calipso border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-jc-blue hover:text-jc-blue-dark font-medium transition"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Problemas para ingresar?{' '}
              <button className="text-jc-blue hover:text-jc-blue-dark font-medium transition">
                Contacta soporte
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );  // ← Y QUE EL PARÉNTESIS CIERRE AQUÍ
}