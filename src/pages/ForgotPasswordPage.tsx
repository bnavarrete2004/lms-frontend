import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { BrandingPanel } from '@/components/auth/BrandingPanel';
import api from '@/api/axios';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password/', { email });
      setEmailSent(true);
    } catch {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      text: 'Revisa tu correo — Te enviaremos un enlace válido por 60 minutos.',
    },
  ];

  return (
    <div className="min-h-screen flex">
      <BrandingPanel
        title="¿Problemas para ingresar?"
        subtitle="No te preocupes. Ingresa tu correo y te enviaremos las instrucciones para restablecer tu acceso."
        features={features}
      />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-jc-blue flex items-center transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio de sesión
            </button>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Recuperar Contraseña</h2>
            <p className="text-gray-600">
              Introduce tu correo electrónico asociado a tu cuenta para recibir el enlace de recuperación.
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-6">
              <Alert variant="success" title="¡Correo enviado!">
                Si el correo existe en nuestro sistema, recibirás las instrucciones en breve. Revisa también tu carpeta de spam.
              </Alert>
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/login')}>
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <>
              <Alert variant="danger" title="Error">{error}</Alert>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.cl"
                  required
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
                  Enviar Instrucciones
                </Button>
              </form>

              <div className="mt-12">
                <Alert variant="info" title="¿No recibes el correo?">
                  Revisa tu carpeta de spam. Si el problema persiste, contacta al administrador.
                </Alert>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}