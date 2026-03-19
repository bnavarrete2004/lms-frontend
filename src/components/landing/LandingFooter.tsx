import { Mail, Phone, MapPin } from 'lucide-react';
import type { FooterContent } from '@/hooks/useLandingContent';
import { LANDING_DEFAULTS } from '@/hooks/useLandingContent';
import logoSence from '@/assets/images/logo_sence_white.png';
import logoIram from '@/assets/images/logo_blanco-iram_300x163.png';

interface LandingFooterProps {
  content?: FooterContent;
}

export function LandingFooter({ content = LANDING_DEFAULTS.footer }: LandingFooterProps) {
  return (
    <footer id="contacto" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-jc-calipso mb-4">{content.nombre_empresa}</h3>
            <p className="text-gray-400 mb-4">{content.eslogan}</p>
            <p className="text-sm text-gray-500">OTEC Certificado por SENCE</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {['Quiénes Somos', 'Cursos', 'Metodología', 'Noticias'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/\s/g, '')}`} className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail size={18} className="text-jc-calipso flex-shrink-0" />
                <span className="text-sm">{content.email}</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone size={18} className="text-jc-calipso flex-shrink-0" />
                <span className="text-sm">{content.telefono}</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin size={18} className="text-jc-calipso flex-shrink-0" />
                <span className="text-sm">Pucón, Chile</span>
              </li>
            </ul>
          </div>

          {/* Certification Logos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Certificaciones</h4>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg flex items-center justify-center">
                <img
                  src={logoSence}
                  alt="SENCE"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg flex items-center justify-center">
                <img
                  src={logoIram}
                  alt="IRAM"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500">{content.copyright}</p>
        </div>
      </div>
    </footer>
  );
}