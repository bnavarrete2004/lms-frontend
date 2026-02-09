// src/components/landing/LandingNavbar.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Quiénes Somos', href: '#nosotros' },
    { label: 'Cursos', href: '#cursos' },
    { label: 'Metodología', href: '#metodologia' },
    { label: 'Clientes', href: '#clientes' },
    { label: 'Noticias', href: '#noticias' },
    { label: 'Contacto', href: '#contacto' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Logo variant="color" size="md" />
            <div>
              <div className="text-lg font-bold text-jc-blue">J&C Digital Training</div>
              <div className="text-xs text-gray-600 hidden sm:block">Capacitaciones</div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-jc-calipso transition-colors font-medium text-sm"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Login Button */}
          <div className="hidden lg:block">
            <Button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-jc-calipso to-jc-cyan hover:opacity-90"
            >
              Iniciar Sesión
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-700 hover:text-jc-calipso transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-gray-100">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-jc-calipso/10 hover:text-jc-calipso transition-colors rounded-md"
              >
                {item.label}
              </button>
            ))}
            <div className="px-4 pt-2">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-jc-calipso to-jc-cyan"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}