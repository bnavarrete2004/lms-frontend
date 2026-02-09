// src/components/landing/AboutSection.tsx
import { Zap, Eye, Award } from 'lucide-react';

export function AboutSection() {
  const values = [
    {
      icon: Zap,
      title: 'Nuestra Misión',
      description: 'Proporcionar capacitación de calidad accesible y flexible que impulse el crecimiento profesional y empresarial.',
      color: 'text-jc-calipso',
      bgColor: 'bg-jc-calipso/10',
    },
    {
      icon: Eye,
      title: 'Nuestra Visión',
      description: 'Ser la plataforma de referencia en capacitación empresarial, reconocidos por nuestra excelencia e innovación.',
      color: 'text-jc-blue',
      bgColor: 'bg-jc-blue/10',
    },
    {
      icon: Award,
      title: 'Nuestros Valores',
      description: 'Calidad, compromiso, innovación y el desarrollo continuo de nuestros estudiantes y clientes.',
      color: 'text-jc-cyan',
      bgColor: 'bg-jc-cyan/10',
    },
  ];

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Quiénes Somos
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
            Somos un OTEC certificado especializado en capacitación empresarial online, comprometidos con el desarrollo profesional y el crecimiento de las organizaciones.
          </p>
        </div>

        {/* Value Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="text-center p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className={`${value.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <value.icon className={`w-8 h-8 ${value.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}