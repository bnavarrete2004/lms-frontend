import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { BrandingPanel } from '@/components/auth/BrandingPanel';
import api from '@/api/axios';

export function PasswordResetPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token');

  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!token) {
      setError('El enlace no es válido. Solicita uno nuevo.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password/', { token, password, password2 });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocurrió un error. El enlace puede haber expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      text: 'Elige una contraseña segura de al menos 8 caracteres.',
    },
  ];

  return (
    <div className="min-h-screen flex">
      <BrandingPanel
        title="Nueva contraseña"
        subtitle="Estás a un paso de recuperar el acceso a tu cuenta."
        features={features}
      />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Restablecer Contraseña</h2>
            <p className="text-gray-600">Ingresa tu nueva contraseña dos veces para confirmarla.</p>
          </div>

          {success ? (
            <div className="space-y-6">
              <Alert variant="success" title="¡Contraseña actualizada!">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión.
              </Alert>
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/login')}>
                Ir al inicio de sesión
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6">
                  <Alert variant="danger" title="Error">{error}</Alert>
                  {!token && (
                    <div className="mt-4">
                      <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/forgot-password')}>
                        Solicitar nuevo enlace
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {token && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder="Repite tu nueva contraseña"
                    required
                    icon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
                    Guardar nueva contraseña
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}