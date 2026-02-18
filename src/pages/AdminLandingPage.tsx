// src/pages/AdminLandingPage.tsx
// Vista de edición del landing page para administradores.
// Renderiza el mismo landing con un banner de edición y botones de lápiz
// superpuestos en cada sección. Los cambios se guardan en localStorage.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, X, Save, Eye, RotateCcw, CheckCircle, Clock, Users,
  ArrowLeft, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLandingContent } from '@/hooks/useLandingContent';
import type { LandingContent } from '@/hooks/useLandingContent';

// ── Wrapper de sección editable ───────────────────────────────────────────────

function EditableSection({
  children,
  label,
  onEdit,
}: {
  children: React.ReactNode;
  label: string;
  onEdit: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {/* Overlay al hover */}
      <div className={`absolute inset-0 border-2 border-dashed border-jc-calipso rounded-lg pointer-events-none transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
      {/* Botón lápiz */}
      <button
        onClick={onEdit}
        className={`absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-jc-calipso hover:text-white group ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        title={`Editar: ${label}`}
      >
        <Pencil size={16} className="text-slate-600 group-hover:text-white" />
      </button>
    </div>
  );
}

// ── Modal genérico de edición ─────────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  multiline?: boolean;
}

function EditModal({
  titulo,
  fields,
  values,
  onClose,
  onSave,
}: {
  titulo: string;
  fields: FieldDef[];
  values: Record<string, string>;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(values);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-amber-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Pencil size={18} className="text-amber-500" />
            Editar: {titulo}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {/* Campos */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              {f.multiline ? (
                <textarea
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-amber-400/40 text-sm"
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              ) : (
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-amber-400/40 text-sm"
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Save size={15} className="mr-2" /> Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Tipos de modal activo ─────────────────────────────────────────────────────

type ModalType =
  | 'hero' | 'nosotros' | 'mision' | 'vision' | 'valores'
  | 'metodologia' | 'paso1' | 'paso2' | 'paso3' | 'paso4'
  | 'clientes' | 'testimonio1' | 'testimonio2'
  | 'noticias' | 'noticia1' | 'noticia2' | 'noticia3'
  | 'footer' | null;

// ── Componente principal ──────────────────────────────────────────────────────

export function AdminLandingPage() {
  const navigate = useNavigate();
  const { content, isDraft, lastSaved, updateSection, saveContent, discardChanges } = useLandingContent();
  const [modalActivo, setModalActivo] = useState<ModalType>(null);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  const handleSave = () => {
    saveContent();
  };

  const handleDiscard = () => {
    if (isDraft && !confirm('¿Descartar todos los cambios no guardados?')) return;
    discardChanges();
  };

  const handleExit = () => {
    if (isDraft && !confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) return;
    navigate('/admin/dashboard');
  };

  // ── Definiciones de modales ─────────────────────────────────────────────────

  const modals: Record<NonNullable<ModalType>, {
    titulo: string;
    fields: FieldDef[];
    values: Record<string, string>;
    onSave: (d: Record<string, string>) => void;
  }> = {
    hero: {
      titulo: 'Sección Principal (Hero)',
      fields: [
        { key: 'titulo', label: 'Título principal', multiline: true },
        { key: 'subtitulo', label: 'Subtítulo / descripción', multiline: true },
        { key: 'feature1_titulo', label: 'Característica 1 — Título' },
        { key: 'feature1_subtitulo', label: 'Característica 1 — Descripción' },
        { key: 'feature2_titulo', label: 'Característica 2 — Título' },
        { key: 'feature2_subtitulo', label: 'Característica 2 — Descripción' },
        { key: 'feature3_titulo', label: 'Característica 3 — Título' },
        { key: 'feature3_subtitulo', label: 'Característica 3 — Descripción' },
      ],
      values: content.hero as unknown as Record<string, string>,
      onSave: d => updateSection('hero', d as any),
    },
    nosotros: {
      titulo: 'Quiénes Somos — Encabezado',
      fields: [
        { key: 'titulo', label: 'Título de sección' },
        { key: 'descripcion', label: 'Descripción general', multiline: true },
      ],
      values: { titulo: content.nosotros.titulo, descripcion: content.nosotros.descripcion },
      onSave: d => updateSection('nosotros', d as any),
    },
    mision: {
      titulo: 'Nuestra Misión',
      fields: [
        { key: 'mision_titulo', label: 'Título' },
        { key: 'mision_texto', label: 'Texto', multiline: true },
      ],
      values: { mision_titulo: content.nosotros.mision_titulo, mision_texto: content.nosotros.mision_texto },
      onSave: d => updateSection('nosotros', d as any),
    },
    vision: {
      titulo: 'Nuestra Visión',
      fields: [
        { key: 'vision_titulo', label: 'Título' },
        { key: 'vision_texto', label: 'Texto', multiline: true },
      ],
      values: { vision_titulo: content.nosotros.vision_titulo, vision_texto: content.nosotros.vision_texto },
      onSave: d => updateSection('nosotros', d as any),
    },
    valores: {
      titulo: 'Nuestros Valores',
      fields: [
        { key: 'valores_titulo', label: 'Título' },
        { key: 'valores_texto', label: 'Texto', multiline: true },
      ],
      values: { valores_titulo: content.nosotros.valores_titulo, valores_texto: content.nosotros.valores_texto },
      onSave: d => updateSection('nosotros', d as any),
    },
    metodologia: {
      titulo: 'Metodología — Encabezado',
      fields: [
        { key: 'titulo', label: 'Título de sección' },
        { key: 'descripcion', label: 'Descripción', multiline: true },
      ],
      values: { titulo: content.metodologia.titulo, descripcion: content.metodologia.descripcion },
      onSave: d => updateSection('metodologia', d as any),
    },
    paso1: {
      titulo: 'Paso 1',
      fields: [{ key: 'paso1_titulo', label: 'Título' }, { key: 'paso1_texto', label: 'Descripción', multiline: true }],
      values: { paso1_titulo: content.metodologia.paso1_titulo, paso1_texto: content.metodologia.paso1_texto },
      onSave: d => updateSection('metodologia', d as any),
    },
    paso2: {
      titulo: 'Paso 2',
      fields: [{ key: 'paso2_titulo', label: 'Título' }, { key: 'paso2_texto', label: 'Descripción', multiline: true }],
      values: { paso2_titulo: content.metodologia.paso2_titulo, paso2_texto: content.metodologia.paso2_texto },
      onSave: d => updateSection('metodologia', d as any),
    },
    paso3: {
      titulo: 'Paso 3',
      fields: [{ key: 'paso3_titulo', label: 'Título' }, { key: 'paso3_texto', label: 'Descripción', multiline: true }],
      values: { paso3_titulo: content.metodologia.paso3_titulo, paso3_texto: content.metodologia.paso3_texto },
      onSave: d => updateSection('metodologia', d as any),
    },
    paso4: {
      titulo: 'Paso 4',
      fields: [{ key: 'paso4_titulo', label: 'Título' }, { key: 'paso4_texto', label: 'Descripción', multiline: true }],
      values: { paso4_titulo: content.metodologia.paso4_titulo, paso4_texto: content.metodologia.paso4_texto },
      onSave: d => updateSection('metodologia', d as any),
    },
    clientes: {
      titulo: 'Clientes — Encabezado',
      fields: [
        { key: 'titulo', label: 'Título de sección' },
        { key: 'descripcion', label: 'Descripción', multiline: true },
      ],
      values: { titulo: content.clientes.titulo, descripcion: content.clientes.descripcion },
      onSave: d => updateSection('clientes', d as any),
    },
    testimonio1: {
      titulo: 'Testimonio 1',
      fields: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'cargo', label: 'Cargo / Empresa' },
        { key: 'texto', label: 'Testimonio', multiline: true },
      ],
      values: content.clientes.testimonio1 as unknown as Record<string, string>,
      onSave: d => updateSection('clientes', { testimonio1: d as any }),
    },
    testimonio2: {
      titulo: 'Testimonio 2',
      fields: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'cargo', label: 'Cargo / Empresa' },
        { key: 'texto', label: 'Testimonio', multiline: true },
      ],
      values: content.clientes.testimonio2 as unknown as Record<string, string>,
      onSave: d => updateSection('clientes', { testimonio2: d as any }),
    },
    noticias: {
      titulo: 'Noticias — Encabezado',
      fields: [
        { key: 'titulo', label: 'Título de sección' },
        { key: 'descripcion', label: 'Descripción', multiline: true },
      ],
      values: { titulo: content.noticias.titulo, descripcion: content.noticias.descripcion },
      onSave: d => updateSection('noticias', d as any),
    },
    noticia1: {
      titulo: 'Noticia 1',
      fields: [
        { key: 'fecha', label: 'Fecha' },
        { key: 'titulo', label: 'Título' },
        { key: 'resumen', label: 'Resumen', multiline: true },
      ],
      values: content.noticias.noticia1 as unknown as Record<string, string>,
      onSave: d => updateSection('noticias', { noticia1: d as any }),
    },
    noticia2: {
      titulo: 'Noticia 2',
      fields: [
        { key: 'fecha', label: 'Fecha' },
        { key: 'titulo', label: 'Título' },
        { key: 'resumen', label: 'Resumen', multiline: true },
      ],
      values: content.noticias.noticia2 as unknown as Record<string, string>,
      onSave: d => updateSection('noticias', { noticia2: d as any }),
    },
    noticia3: {
      titulo: 'Noticia 3',
      fields: [
        { key: 'fecha', label: 'Fecha' },
        { key: 'titulo', label: 'Título' },
        { key: 'resumen', label: 'Resumen', multiline: true },
      ],
      values: content.noticias.noticia3 as unknown as Record<string, string>,
      onSave: d => updateSection('noticias', { noticia3: d as any }),
    },
    footer: {
      titulo: 'Footer / Contacto',
      fields: [
        { key: 'nombre_empresa', label: 'Nombre de la empresa' },
        { key: 'eslogan', label: 'Eslogan', multiline: true },
        { key: 'email', label: 'Email de contacto' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'copyright', label: 'Texto de copyright' },
      ],
      values: content.footer as unknown as Record<string, string>,
      onSave: d => updateSection('footer', d as any),
    },
  };

  const modalDef = modalActivo ? modals[modalActivo] : null;

  // ── Render landing con overlays ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">

      {/* ── BANNER DE MODO EDICIÓN ── */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Pencil size={18} />
            <span className="font-bold text-sm uppercase tracking-wide">Modo Edición — Landing Page</span>
            {isDraft && (
              <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                <AlertTriangle size={12} /> Cambios sin guardar
              </span>
            )}
            {!isDraft && lastSaved && (
              <span className="text-xs text-amber-100">
                Guardado {lastSaved.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVistaPrevia(v => !v)}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
            >
              <Eye size={15} /> {vistaPrevia ? 'Salir vista previa' : 'Vista previa'}
            </button>
            <button
              onClick={handleDiscard}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
            >
              <RotateCcw size={15} /> Descartar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-white text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-bold transition flex items-center gap-1.5"
            >
              <Save size={15} /> Guardar
            </button>
            <button
              onClick={handleExit}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft size={15} /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* Espaciador para el banner fijo */}
      <div className="h-14" />

      {/* ── LANDING CON OVERLAYS ── */}
      <div className={vistaPrevia ? 'pointer-events-none' : ''}>

        {/* NAVBAR (no editable, solo visual) */}
        <nav className="sticky top-14 z-50 bg-white/95 backdrop-blur shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-jc-blue">{content.footer.nombre_empresa}</div>
            <div className="hidden md:flex space-x-8 text-sm text-slate-700">
              {['Inicio', 'Quiénes Somos', 'Cursos', 'Metodología', 'Clientes', 'Noticias', 'Contacto'].map(l => (
                <span key={l} className="cursor-default">{l}</span>
              ))}
            </div>
            <button className="bg-jc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold opacity-60 cursor-default">
              Iniciar Sesión
            </button>
          </div>
        </nav>

        {/* HERO */}
        <EditableSection label="Sección principal" onEdit={() => !vistaPrevia && setModalActivo('hero')}>
          <section id="inicio" className="pt-16 pb-20 bg-gradient-to-br from-jc-blue via-jc-blue-dark to-jc-calipso text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">{content.hero.titulo}</h1>
                  <p className="text-xl mb-8 text-blue-100">{content.hero.subtitulo}</p>
                  <div className="flex gap-4">
                    <span className="px-6 py-3 bg-white text-jc-blue rounded-lg font-semibold text-sm">Ver Cursos</span>
                    <span className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold text-sm">Contáctanos</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-5">
                    {[
                      { icon: <CheckCircle size={22} />, t: content.hero.feature1_titulo, s: content.hero.feature1_subtitulo },
                      { icon: <Clock       size={22} />, t: content.hero.feature2_titulo, s: content.hero.feature2_subtitulo },
                      { icon: <Users       size={22} />, t: content.hero.feature3_titulo, s: content.hero.feature3_subtitulo },
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">{f.icon}</div>
                        <div><p className="font-semibold">{f.t}</p><p className="text-sm text-blue-200">{f.s}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </EditableSection>

        {/* QUIÉNES SOMOS */}
        <section id="nosotros" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EditableSection label="Quiénes Somos — encabezado" onEdit={() => !vistaPrevia && setModalActivo('nosotros')}>
              <div className="text-center mb-16 py-4">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">{content.nosotros.titulo}</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">{content.nosotros.descripcion}</p>
              </div>
            </EditableSection>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { key: 'mision' as const, titulo: content.nosotros.mision_titulo, texto: content.nosotros.mision_texto },
                { key: 'vision' as const, titulo: content.nosotros.vision_titulo, texto: content.nosotros.vision_texto },
                { key: 'valores' as const, titulo: content.nosotros.valores_titulo, texto: content.nosotros.valores_texto },
              ].map(card => (
                <EditableSection key={card.key} label={card.titulo} onEdit={() => !vistaPrevia && setModalActivo(card.key)}>
                  <div className="text-center p-8 bg-slate-50 rounded-xl">
                    <div className="bg-jc-calipso/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-jc-blue">✦</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{card.titulo}</h3>
                    <p className="text-slate-600 text-sm">{card.texto}</p>
                  </div>
                </EditableSection>
              ))}
            </div>
          </div>
        </section>

        {/* METODOLOGÍA */}
        <section id="metodologia" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EditableSection label="Metodología — encabezado" onEdit={() => !vistaPrevia && setModalActivo('metodologia')}>
              <div className="text-center mb-16 py-4">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">{content.metodologia.titulo}</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">{content.metodologia.descripcion}</p>
              </div>
            </EditableSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { key: 'paso1' as const, n: 1, titulo: content.metodologia.paso1_titulo, texto: content.metodologia.paso1_texto },
                { key: 'paso2' as const, n: 2, titulo: content.metodologia.paso2_titulo, texto: content.metodologia.paso2_texto },
                { key: 'paso3' as const, n: 3, titulo: content.metodologia.paso3_titulo, texto: content.metodologia.paso3_texto },
                { key: 'paso4' as const, n: 4, titulo: content.metodologia.paso4_titulo, texto: content.metodologia.paso4_texto },
              ].map(paso => (
                <EditableSection key={paso.key} label={`Paso ${paso.n}`} onEdit={() => !vistaPrevia && setModalActivo(paso.key)}>
                  <div className="text-center p-6">
                    <div className="bg-jc-calipso/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-jc-blue">{paso.n}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{paso.titulo}</h3>
                    <p className="text-slate-600 text-sm">{paso.texto}</p>
                  </div>
                </EditableSection>
              ))}
            </div>
          </div>
        </section>

        {/* CLIENTES */}
        <section id="clientes" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EditableSection label="Clientes — encabezado" onEdit={() => !vistaPrevia && setModalActivo('clientes')}>
              <div className="text-center mb-16 py-4">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">{content.clientes.titulo}</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">{content.clientes.descripcion}</p>
              </div>
            </EditableSection>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {[
                { key: 'testimonio1' as const, data: content.clientes.testimonio1 },
                { key: 'testimonio2' as const, data: content.clientes.testimonio2 },
              ].map(t => (
                <EditableSection key={t.key} label={`Testimonio`} onEdit={() => !vistaPrevia && setModalActivo(t.key)}>
                  <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-jc-calipso">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-jc-calipso/20 rounded-full mr-4 flex items-center justify-center font-bold text-jc-blue">
                        {t.data.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{t.data.nombre}</p>
                        <p className="text-sm text-slate-500">{t.data.cargo}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{t.data.texto}"</p>
                    <div className="mt-3 text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>
                  </div>
                </EditableSection>
              ))}
            </div>
          </div>
        </section>

        {/* NOTICIAS */}
        <section id="noticias" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EditableSection label="Noticias — encabezado" onEdit={() => !vistaPrevia && setModalActivo('noticias')}>
              <div className="text-center mb-16 py-4">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">{content.noticias.titulo}</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">{content.noticias.descripcion}</p>
              </div>
            </EditableSection>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { key: 'noticia1' as const, data: content.noticias.noticia1 },
                { key: 'noticia2' as const, data: content.noticias.noticia2 },
                { key: 'noticia3' as const, data: content.noticias.noticia3 },
              ].map(n => (
                <EditableSection key={n.key} label="Noticia" onEdit={() => !vistaPrevia && setModalActivo(n.key)}>
                  <article className="bg-white rounded-xl overflow-hidden shadow-md">
                    <div className="h-40 bg-gradient-to-br from-jc-blue to-jc-calipso" />
                    <div className="p-6">
                      <span className="text-xs text-slate-500">{n.data.fecha}</span>
                      <h3 className="text-lg font-bold mt-1 mb-2">{n.data.titulo}</h3>
                      <p className="text-slate-600 text-sm mb-3">{n.data.resumen}</p>
                      <span className="text-jc-blue font-semibold text-sm">Leer más →</span>
                    </div>
                  </article>
                </EditableSection>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <EditableSection label="Footer / Contacto" onEdit={() => !vistaPrevia && setModalActivo('footer')}>
          <footer id="contacto" className="bg-slate-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="text-2xl font-bold mb-3 text-jc-calipso">{content.footer.nombre_empresa}</div>
              <p className="text-slate-400 mb-6">{content.footer.eslogan}</p>
              <div className="flex justify-center gap-8 mb-6">
                <span className="text-slate-400">✉ {content.footer.email}</span>
                <span className="text-slate-400">☎ {content.footer.telefono}</span>
              </div>
              <div className="border-t border-slate-800 pt-6 text-sm text-slate-500">
                {content.footer.copyright}
              </div>
            </div>
          </footer>
        </EditableSection>

      </div>

      {/* ── MODAL ACTIVO ── */}
      {modalActivo && modalDef && (
        <EditModal
          titulo={modalDef.titulo}
          fields={modalDef.fields}
          values={modalDef.values}
          onClose={() => setModalActivo(null)}
          onSave={data => {
            modalDef.onSave(data);
            setModalActivo(null);
          }}
        />
      )}
    </div>
  );
}