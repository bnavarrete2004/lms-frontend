// src/hooks/useLandingContent.ts
import { useState, useEffect } from 'react';

// ── Tipos del contenido editable ──────────────────────────────────────────────

export interface HeroContent {
  titulo: string;
  subtitulo: string;
  feature1_titulo: string;
  feature1_subtitulo: string;
  feature2_titulo: string;
  feature2_subtitulo: string;
  feature3_titulo: string;
  feature3_subtitulo: string;
}

export interface NosotrosContent {
  titulo: string;
  descripcion: string;
  mision_titulo: string;
  mision_texto: string;
  vision_titulo: string;
  vision_texto: string;
  valores_titulo: string;
  valores_texto: string;
}

export interface MetodologiaContent {
  titulo: string;
  descripcion: string;
  paso1_titulo: string;
  paso1_texto: string;
  paso2_titulo: string;
  paso2_texto: string;
  paso3_titulo: string;
  paso3_texto: string;
  paso4_titulo: string;
  paso4_texto: string;
}

export interface TestimonioContent {
  nombre: string;
  cargo: string;
  texto: string;
}

export interface ClientesContent {
  titulo: string;
  descripcion: string;
  testimonio1: TestimonioContent;
  testimonio2: TestimonioContent;
}

export interface NoticiaContent {
  fecha: string;
  titulo: string;
  resumen: string;
}

export interface NoticiasContent {
  titulo: string;
  descripcion: string;
  noticia1: NoticiaContent;
  noticia2: NoticiaContent;
  noticia3: NoticiaContent;
}

export interface FooterContent {
  nombre_empresa: string;
  eslogan: string;
  email: string;
  telefono: string;
  copyright: string;
}

export interface CursosDestacadosContent {
  titulo: string;
  descripcion: string;
  // IDs de cursos de la API que se quieren destacar (máx 3)
  cursos_destacados_ids: number[];
}

export interface LandingContent {
  hero: HeroContent;
  nosotros: NosotrosContent;
  metodologia: MetodologiaContent;
  clientes: ClientesContent;
  noticias: NoticiasContent;
  footer: FooterContent;
  cursos: CursosDestacadosContent;
}

// ── Contenido por defecto ─────────────────────────────────────────────────────

export const LANDING_DEFAULTS: LandingContent = {
  hero: {
    titulo: 'Capacitación Profesional para el Crecimiento de tu Empresa',
    subtitulo: 'Plataforma de capacitación online certificada por SENCE. Cursos diseñados para potenciar las competencias de tu equipo.',
    feature1_titulo: 'Certificación SENCE',
    feature1_subtitulo: 'Cursos homologados y reconocidos',
    feature2_titulo: 'Flexible y Asincrónico',
    feature2_subtitulo: 'Aprende a tu ritmo, cuando quieras',
    feature3_titulo: 'Relatores Expertos',
    feature3_subtitulo: 'Profesionales certificados en cada área',
  },
  nosotros: {
    titulo: 'Quiénes Somos',
    descripcion: 'Somos un OTEC certificado especializado en capacitación empresarial online, comprometidos con el desarrollo profesional y el crecimiento de las organizaciones.',
    mision_titulo: 'Nuestra Misión',
    mision_texto: 'Proporcionar capacitación de calidad accesible y flexible que impulse el crecimiento profesional y empresarial.',
    vision_titulo: 'Nuestra Visión',
    vision_texto: 'Ser la plataforma de referencia en capacitación empresarial, reconocidos por nuestra excelencia e innovación.',
    valores_titulo: 'Nuestros Valores',
    valores_texto: 'Calidad, compromiso, innovación y el desarrollo continuo de nuestros estudiantes y clientes.',
  },
  metodologia: {
    titulo: 'Nuestra Metodología',
    descripcion: 'Un enfoque estructurado y flexible que garantiza el aprendizaje efectivo.',
    paso1_titulo: 'Diagnóstico Inicial',
    paso1_texto: 'Evaluamos el nivel de conocimientos de cada estudiante para personalizar el aprendizaje.',
    paso2_titulo: 'Contenido Interactivo',
    paso2_texto: 'Material multimedia, videos explicativos y guías descargables para facilitar el aprendizaje.',
    paso3_titulo: 'Evaluación Continua',
    paso3_texto: 'Cuestionarios y exámenes que miden el progreso y aseguran la comprensión de conceptos.',
    paso4_titulo: 'Certificación',
    paso4_texto: 'Diploma certificado por SENCE que valida las competencias adquiridas.',
  },
  clientes: {
    titulo: 'Nuestros Clientes',
    descripcion: 'Empresas que confían en nuestra plataforma para la capacitación de sus equipos.',
    testimonio1: {
      nombre: 'María González',
      cargo: 'Gerente de RRHH - Empresa ABC',
      texto: 'La plataforma es muy intuitiva y nuestros colaboradores han podido capacitarse sin problemas. El seguimiento en tiempo real nos permite ver el progreso de cada uno.',
    },
    testimonio2: {
      nombre: 'Carlos Rodríguez',
      cargo: 'Director General - Empresa XYZ',
      texto: 'Los cursos están muy bien estructurados y el material es de excelente calidad. La certificación SENCE fue un plus importante para nuestra empresa.',
    },
  },
  noticias: {
    titulo: 'Últimas Noticias',
    descripcion: 'Mantente informado sobre novedades, nuevos cursos y actualizaciones.',
    noticia1: {
      fecha: '05 Enero 2026',
      titulo: 'Nuevos cursos de Transformación Digital',
      resumen: 'Lanzamos una nueva línea de cursos enfocados en la transformación digital de las empresas.',
    },
    noticia2: {
      fecha: '28 Diciembre 2025',
      titulo: 'Certificación SENCE renovada para 2026',
      resumen: 'Hemos renovado nuestra certificación SENCE, garantizando la calidad de nuestros programas.',
    },
    noticia3: {
      fecha: '15 Diciembre 2025',
      titulo: 'Tips para Capacitación Online Efectiva',
      resumen: 'Descubre cómo sacar el máximo provecho a nuestra plataforma asincrónica con estos consejos.',
    },
  },
  footer: {
    nombre_empresa: 'JC Digital Training',
    eslogan: 'Potenciando el talento humano a través de la educación digital.',
    email: 'contacto@jcdigital.cl',
    telefono: '+56 9 1234 5678',
    copyright: '© 2026 JC Digital Training. Todos los derechos reservados.',
  },
  cursos: {
    titulo: 'Nuestros Cursos',
    descripcion: 'Explora nuestra amplia variedad de cursos diseñados para potenciar las habilidades de tu equipo.',
    cursos_destacados_ids: [],
  },
};

const STORAGE_KEY = 'jc_landing_content';

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(LANDING_DEFAULTS);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge con defaults para que campos nuevos no rompan
        setContent(prev => deepMerge(prev, parsed.content ?? parsed));
        if (parsed.lastSaved) setLastSaved(new Date(parsed.lastSaved));
      }
    } catch {
      // Si falla el parse, usa defaults silenciosamente
    }
  }, []);

  const updateSection = <K extends keyof LandingContent>(
    section: K,
    data: Partial<LandingContent[K]>
  ) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
    setIsDraft(true);
  };

  const saveContent = () => {
    const now = new Date();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      content,
      lastSaved: now.toISOString(),
    }));
    setLastSaved(now);
    setIsDraft(false);
  };

  const discardChanges = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setContent(deepMerge(LANDING_DEFAULTS, parsed.content ?? parsed));
      } else {
        setContent(LANDING_DEFAULTS);
      }
    } catch {
      setContent(LANDING_DEFAULTS);
    }
    setIsDraft(false);
  };

  const resetToDefaults = () => {
    setContent(LANDING_DEFAULTS);
    setIsDraft(true);
  };

  return {
    content,
    isDraft,
    lastSaved,
    updateSection,
    saveContent,
    discardChanges,
    resetToDefaults,
  };
}

// ── Helper deep merge ─────────────────────────────────────────────────────────

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key in source) {
    const val = source[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = deepMerge(target[key] as object, val as object) as T[typeof key];
    } else if (val !== undefined) {
      result[key] = val as T[typeof key];
    }
  }
  return result;
}