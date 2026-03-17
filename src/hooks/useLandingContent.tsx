// src/hooks/useLandingContent.ts
import { useState, useEffect } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

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

export interface LogoCliente {
  nombre: string;   // nombre de la empresa (para alt text)
  imageUrl: string; // base64 o URL
}

export interface ClientesContent {
  titulo: string;
  descripcion: string;
  logos: [LogoCliente, LogoCliente, LogoCliente, LogoCliente];
  testimonio1: TestimonioContent;
  testimonio2: TestimonioContent;
}

export interface NoticiaContent {
  fecha: string;
  titulo: string;
  resumen: string;
  contenido_completo: string; // ← campo nuevo: texto completo de la noticia
  imageUrl: string;
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

export interface CursoDestacado {
  // Si viene de API: solo se guarda el id
  // Si es manual: se guarda título, descripción, duración e imagen
  tipo: 'api' | 'manual';
  api_id?: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  rating: number;
  imageUrl: string; // base64 o URL — vacío = usa gradiente
  gradient: string;
}

export interface CursosContent {
  titulo: string;
  descripcion: string;
  destacados: [CursoDestacado, CursoDestacado, CursoDestacado];
}

export interface LandingContent {
  hero: HeroContent;
  nosotros: NosotrosContent;
  metodologia: MetodologiaContent;
  clientes: ClientesContent;
  noticias: NoticiasContent;
  footer: FooterContent;
  cursos: CursosContent;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const logoVacio: LogoCliente = { nombre: '', imageUrl: '' };

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
    logos: [
      { ...logoVacio },
      { ...logoVacio },
      { ...logoVacio },
      { ...logoVacio },
    ],
    testimonio1: {
      nombre: 'María González',
      cargo: 'Gerente de RRHH - Empresa ABC',
      texto: 'La plataforma es muy intuitiva y nuestros colaboradores han podido capacitarse sin problemas.',
    },
    testimonio2: {
      nombre: 'Carlos Rodríguez',
      cargo: 'Director General - Empresa XYZ',
      texto: 'Los cursos están muy bien estructurados y el material es de excelente calidad.',
    },
  },
  noticias: {
  titulo: 'Últimas Noticias',
  descripcion: 'Mantente informado sobre novedades, nuevos cursos y actualizaciones.',
  noticia1: {
    fecha: '05 Enero 2026',
    titulo: 'Nuevos cursos de Transformación Digital',
    resumen: 'Lanzamos una nueva línea de cursos enfocados en la transformación digital de las empresas.',
    contenido_completo: '',
    imageUrl: '',
  },
  noticia2: {
    fecha: '28 Diciembre 2025',
    titulo: 'Certificación SENCE renovada para 2026',
    resumen: 'Hemos renovado nuestra certificación SENCE, garantizando la calidad de nuestros programas.',
    contenido_completo: '',
    imageUrl: '',
  },
  noticia3: {
    fecha: '15 Diciembre 2025',
    titulo: 'Tips para Capacitación Online Efectiva',
    resumen: 'Descubre cómo sacar el máximo provecho a nuestra plataforma asincrónica con estos consejos.',
    contenido_completo: '',
    imageUrl: '',
  },
},
  footer: {
    nombre_empresa: 'J&C Digital Training',
    eslogan: 'Potenciando el talento humano a través de la educación digital.',
    email: 'contacto@jcdigitaltraining.cl',
    telefono: '+56 9 1234 5678',
    copyright: '© 2026 J&C Digital Training. Todos los derechos reservados.',
  },
  cursos: {
    titulo: 'Nuestros Cursos',
    descripcion: 'Explora nuestra amplia variedad de cursos diseñados para potenciar las habilidades de tu equipo.',
    destacados: [
      { tipo: 'manual', titulo: 'Liderazgo y Gestión de Equipos', descripcion: 'Desarrolla habilidades de liderazgo efectivo para gestionar equipos de alto rendimiento.', duracion: '40 horas', rating: 4.8, imageUrl: '', gradient: 'bg-gradient-to-br from-jc-blue-dark to-jc-blue' },
      { tipo: 'manual', titulo: 'Excel Avanzado para Negocios', descripcion: 'Domina herramientas avanzadas de Excel para análisis de datos y toma de decisiones.', duracion: '30 horas', rating: 4.9, imageUrl: '', gradient: 'bg-gradient-to-br from-jc-calipso to-jc-blue' },
      { tipo: 'manual', titulo: 'Marketing Digital Estratégico', descripcion: 'Aprende estrategias de marketing digital para impulsar tu negocio en el entorno online.', duracion: '50 horas', rating: 4.7, imageUrl: '', gradient: 'bg-gradient-to-br from-jc-blue-dark to-jc-calipso' },
    ],
  },
};

const STORAGE_KEY = 'jc_landing_content';

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(LANDING_DEFAULTS);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setContent(deepMerge(LANDING_DEFAULTS, parsed.content ?? parsed));
        if (parsed.lastSaved) setLastSaved(new Date(parsed.lastSaved));
      }
    } catch { /* usa defaults */ }
  }, []);

  const updateSection = <K extends keyof LandingContent>(
    section: K,
    data: Partial<LandingContent[K]>
  ) => {
    setContent(prev => ({ ...prev, [section]: { ...prev[section], ...data } }));
    setIsDraft(true);
  };

  const saveContent = () => {
    const now = new Date();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ content, lastSaved: now.toISOString() }));
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
    } catch { setContent(LANDING_DEFAULTS); }
    setIsDraft(false);
  };

  const resetToDefaults = () => { setContent(LANDING_DEFAULTS); setIsDraft(true); };

  return { content, isDraft, lastSaved, updateSection, saveContent, discardChanges, resetToDefaults };
}

// ── Deep merge ────────────────────────────────────────────────────────────────

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