import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { BrandingPanel } from '@/components/auth/BrandingPanel';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de envío (aquí iría la llamada al backend)
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 2000);
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      text: 'Revisa tu correo - Te enviaremos un enlace de un solo uso válido por 60 minutos.',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Usando BrandingPanel */}
      <BrandingPanel
        title="¿Problemas para ingresar?"
        subtitle="No te preocupes. Ingresa tus datos y te enviaremos las instrucciones necesarias para restablecer tu acceso de forma segura."
        features={features}
      />
      
      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Volver atrás */}
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

          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Recuperar Contraseña</h2>
            <p className="text-gray-600">
              Introduce tu correo electrónico o RUT asociado a tu cuenta para recibir el enlace de recuperación.
            </p>
          </div>
          
          {/* Mensaje de éxito */}
          {emailSent ? (
            <div className="space-y-6">
              <Alert variant="success" title="¡Correo enviado!">
                Si el usuario existe en nuestro sistema, recibirás un correo con instrucciones en breve.
              </Alert>
              
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <>
              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Correo Electrónico o RUT"
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="ejemplo@correo.cl o 12.345.678-9"
                  required
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Enviar Instrucciones
                </Button>
              </form>
              
              {/* Ayuda adicional - Usando Alert */}
              <div className="mt-12">
                <Alert variant="info" title="¿No recibes el correo?">
                  Revisa tu carpeta de SPAM o correo no deseado. Si el problema persiste, contacta al administrador de capacitación de tu empresa.
                </Alert>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
