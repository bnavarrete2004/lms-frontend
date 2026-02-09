// src/components/landing/MethodologySection.tsx

export function MethodologySection() {
  const steps = [
    {
      number: '1',
      title: 'Diagnóstico Inicial',
      description: 'Evaluamos el nivel de conocimientos de cada estudiante para personalizar el aprendizaje.',
    },
    {
      number: '2',
      title: 'Contenido Interactivo',
      description: 'Material multimedia, videos explicativos y guías descargables para facilitar el aprendizaje.',
    },
    {
      number: '3',
      title: 'Evaluación Continua',
      description: 'Cuestionarios y exámenes que miden el progreso y aseguran la comprensión de conceptos.',
    },
    {
      number: '4',
      title: 'Certificación',
      description: 'Diploma certificado por SENCE que valida las competencias adquiridas.',
    },
  ];

  return (
    <section id="metodologia" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Nuestra Metodología
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-jc-calipso rounded-full -mb-2"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
            Un enfoque estructurado y flexible que garantiza el aprendizaje efectivo.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Number Circle */}
              <div className="bg-gradient-to-br from-jc-calipso to-jc-cyan w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">{step.number}</span>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              
              {/* Description */}
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}