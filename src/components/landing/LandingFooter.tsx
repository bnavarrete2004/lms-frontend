// src/components/landing/LandingFooter.tsx
import { Mail, Phone, MapPin } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer id="contacto" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-jc-calipso mb-4">J&C Digital Training</h3>
            <p className="text-gray-400 mb-4">
              Potenciando el talento humano a través de la educación digital.
            </p>
            <p className="text-sm text-gray-500">
              OTEC Certificado por SENCE
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#nosotros" className="text-gray-400 hover:text-white transition-colors">
                  Quiénes Somos
                </a>
              </li>
              <li>
                <a href="#cursos" className="text-gray-400 hover:text-white transition-colors">
                  Cursos
                </a>
              </li>
              <li>
                <a href="#metodologia" className="text-gray-400 hover:text-white transition-colors">
                  Metodología
                </a>
              </li>
              <li>
                <a href="#noticias" className="text-gray-400 hover:text-white transition-colors">
                  Noticias
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail size={18} className="text-jc-calipso" />
                <span>contacto@jcdigitaltraining.cl</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone size={18} className="text-jc-calipso" />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin size={18} className="text-jc-calipso" />
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2026 J&C Digital Training. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}