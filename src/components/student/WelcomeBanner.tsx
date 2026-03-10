// src/components/student/WelcomeBanner.tsx
import { useEffect, useState } from 'react';
import type { Inscripcion } from '@/api/services/inscripcionService';

const FRASES = [
  "El aprendizaje no es un destino, es el camino.",
  "Cada hora de estudio es una inversión en tu futuro.",
  "El conocimiento es el único activo que nadie te puede quitar.",
  "Pequeños pasos constantes generan grandes cambios.",
  "Aprender algo nuevo hoy te hace mejor que ayer.",
  "La disciplina es el puente entre las metas y los logros.",
  "Tu progreso de hoy es la base de tu éxito de mañana.",
  "No dejes de aprender — el mundo no deja de cambiar.",
];

function getSaludo(nombre: string): { saludo: string; emoji: string } {
  const hora = new Date().getHours();
  const primerNombre = nombre.split(' ')[0];
  if (hora >= 5 && hora < 12) return { saludo: `Buenos días, ${primerNombre}`, emoji: '🌤️' };
  if (hora >= 12 && hora < 20) return { saludo: `Buenas tardes, ${primerNombre}`, emoji: '☀️' };
  return { saludo: `Buenas noches, ${primerNombre}`, emoji: '🌙' };
}

const IconoLibro = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const IconoLuz = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const IconoEstrella = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const IconoRayo = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const IconoTrofeo = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

const IconoGraduacion = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
  </svg>
);

const IconoLupa = ({ size }: { size: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const PARTICULAS = [
  { Icono: IconoLibro,      x: 10, y: 12, size: 28, duration: 7,   delay: 0,   opacity: 0.20 },
  { Icono: IconoLuz,        x: 50, y:  6, size: 22, duration: 9,   delay: 1.5, opacity: 0.15 },
  { Icono: IconoEstrella,   x: 76, y: 28, size: 26, duration: 8,   delay: 0.8, opacity: 0.18 },
  { Icono: IconoRayo,       x: 26, y: 60, size: 20, duration: 10,  delay: 2.5, opacity: 0.13 },
  { Icono: IconoTrofeo,     x: 66, y: 65, size: 24, duration: 6,   delay: 1.0, opacity: 0.16 },
  { Icono: IconoGraduacion, x:  6, y: 72, size: 22, duration: 11,  delay: 3.0, opacity: 0.14 },
  { Icono: IconoLupa,       x: 84, y: 10, size: 24, duration: 8.5, delay: 0.3, opacity: 0.17 },
];

function ParticulasFlotantes() {
  return (
    <div className="relative w-48 h-40 flex-shrink-0 hidden md:block">
      <style>{`
        @keyframes flotar {
          0%,  100% { transform: translateY(0px)  rotate(0deg);  }
          33%        { transform: translateY(-9px) rotate(5deg);  }
          66%        { transform: translateY(5px)  rotate(-4deg); }
        }
      `}</style>
      {PARTICULAS.map((p, i) => (
        <div
          key={i}
          className="absolute text-white pointer-events-none"
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            opacity: p.opacity,
            animation: `flotar ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <p.Icono size={p.size} />
        </div>
      ))}
    </div>
  );
}

interface WelcomeBannerProps {
  nombreCompleto: string;
  inscripciones: Inscripcion[];
}

export function WelcomeBanner({ nombreCompleto, inscripciones }: WelcomeBannerProps) {
  const [fraseIdx, setFraseIdx] = useState(() => Math.floor(Math.random() * FRASES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFraseIdx(prev => (prev + 1) % FRASES.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(intervalo);
  }, []);

  const totalCursos       = inscripciones.length;
  const cursosActivos     = inscripciones.filter(i => i.estado === 'en_curso' || i.estado === 'inscrito').length;
  const cursosCompletados = inscripciones.filter(i => i.estado === 'aprobado' || i.estado === 'completado').length;
  const { saludo, emoji } = getSaludo(nombreCompleto || 'Estudiante');

  return (
    <section className="relative overflow-hidden rounded-2xl h-56 shadow-xl">

      {/* Fondo original */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #064D91 0%, #0a7a8a 50%, #088395 100%)' }}
      />

      {/* Orbes */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #52A9B7 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
      <div className="absolute -bottom-8 left-1/3 w-36 h-36 rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #88D8E0 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite 2s' }} />

      {/* Patrón de puntos */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center px-8 md:px-12 gap-8">

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{emoji}</span>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              {saludo}
            </h2>
          </div>

          <p
            className="text-white/70 text-sm md:text-base italic leading-relaxed max-w-lg"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            "{FRASES[fraseIdx]}"
          </p>

          <div className="flex items-center gap-5 mt-5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                {cursosActivos} activo{cursosActivos !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                {cursosCompletados} completado{cursosCompletados !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                {totalCursos} en total
              </span>
            </div>
          </div>
        </div>

        <ParticulasFlotantes />

      </div>
    </section>
  );
}