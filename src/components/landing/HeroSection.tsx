// src/components/landing/HeroSection.tsx
import { CheckCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="pt-24 pb-20 bg-gradient-to-br from-jc-blue via-jc-blue-dark to-jc-calipso text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Capacitación Profesional para el Crecimiento de tu Empresa
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Plataforma de capacitación online certificada por SENCE. Cursos diseñados para potenciar las competencias de tu equipo.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={() => scrollToSection('#cursos')}
                className="bg-white text-jc-blue hover:bg-gray-100"
                size="lg"
              >
                Ver Cursos
              </Button>
              <Button
                onClick={() => scrollToSection('#contacto')}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-jc-blue"
                size="lg"
              >
                Contáctanos
              </Button>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Certificación SENCE</p>
                    <p className="text-sm text-blue-200">Cursos homologados y reconocidos</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Flexible y Asincrónico</p>
                    <p className="text-sm text-blue-200">Aprende a tu ritmo, cuando quieras</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Relatores Expertos</p>
                    <p className="text-sm text-blue-200">Profesionales certificados en cada área</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}