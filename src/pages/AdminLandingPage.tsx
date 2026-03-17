// src/pages/AdminLandingPage.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, X, Save, Eye, RotateCcw, ArrowLeft, AlertTriangle,
  Upload, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { CoursesSection } from '@/components/landing/CoursesSection';
import { MethodologySection } from '@/components/landing/MethodologySection';
import { ClientsSection } from '@/components/landing/ClientsSection';
import { NewsSection } from '@/components/landing/NewsSection';
import { useLandingContent } from '@/hooks/useLandingContent';
import type { CursoDestacado, LogoCliente, NoticiaContent } from '@/hooks/useLandingContent';
import { Logo } from '@/components/ui/Logo';

const BANNER_H = 56;

// ── Navbar de edición (repinado bajo el banner) ───────────────────────────────
function EditNavbar() {
  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm" style={{ top: BANNER_H }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center space-x-3">
          <Logo variant="color" size="md" />
          <div>
            <div className="text-lg font-bold text-jc-blue">J&C Digital Training</div>
            <div className="text-xs text-gray-600 hidden sm:block">Capacitaciones</div>
          </div>
        </div>
        <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-400">
          {['Inicio', 'Quiénes Somos', 'Cursos', 'Metodología', 'Clientes', 'Noticias', 'Contacto'].map(l => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <span className="hidden lg:block px-4 py-2 rounded-lg bg-gradient-to-r from-jc-calipso to-jc-cyan text-white text-sm font-semibold opacity-50 cursor-default">
          Iniciar Sesión
        </span>
      </div>
    </nav>
  );
}

// ── Wrapper editable ──────────────────────────────────────────────────────────
function EditableSection({ children, label, onEdit, vistaPrevia }: {
  children: React.ReactNode; label: string; onEdit: () => void; vistaPrevia: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  if (vistaPrevia) return <>{children}</>;
  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
      {hovered && (
        <>
          <div className="absolute inset-0 border-2 border-amber-400/60 pointer-events-none z-30" />
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 z-40 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all text-xs font-bold uppercase tracking-wider"
          >
            <Pencil size={13} /> Editar {label}
          </button>
        </>
      )}
    </div>
  );
}

// ── Modal texto genérico ──────────────────────────────────────────────────────
interface FieldDef { key: string; label: string; type?: 'text' | 'textarea'; }

function EditModal({ titulo, fields, values, onClose, onSave }: {
  titulo: string; fields: FieldDef[]; values: Record<string, string>;
  onClose: () => void; onSave: (d: Record<string, string>) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(values);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-amber-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={16} className="text-amber-500" /> Editar: {titulo}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</label>
              {f.type === 'textarea'
                ? <textarea rows={3} className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-400/30 resize-none" value={form[f.key] ?? ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                : <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30" value={form[f.key] ?? ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              }
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)} className="bg-amber-500 hover:bg-amber-600 text-white"><Save size={14} className="mr-2" /> Aplicar</Button>
        </div>
      </div>
    </div>
  );
}

// ── Helper: leer archivo como base64 ─────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── Input de imagen reutilizable ──────────────────────────────────────────────
function ImageUploader({ label, value, onChange }: {
  label: string; value: string; onChange: (base64: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    onChange(b64);
  };
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-amber-400 transition-colors"
        onClick={() => ref.current?.click()}
      >
        {value
          ? <img src={value} alt="preview" className="max-h-28 object-contain rounded" />
          : <><ImageIcon size={32} className="text-slate-300" /><p className="text-xs text-slate-400">Haz click para subir imagen</p></>
        }
        {value && <p className="text-[10px] text-slate-400">Haz click para cambiar</p>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Modal cursos destacados ───────────────────────────────────────────────────
function ModalCursos({ destacados, onClose, onSave }: {
  destacados: [CursoDestacado, CursoDestacado, CursoDestacado];
  onClose: () => void;
  onSave: (d: [CursoDestacado, CursoDestacado, CursoDestacado]) => void;
}) {
  const [form, setForm] = useState<[CursoDestacado, CursoDestacado, CursoDestacado]>(
    JSON.parse(JSON.stringify(destacados))
  );
  const update = (i: number, field: keyof CursoDestacado, value: string | number) => {
    const copy = [...form] as typeof form;
    (copy[i] as any)[field] = value;
    setForm(copy);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-amber-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={16} className="text-amber-500" /> Editar Cursos Destacados</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {form.map((curso, i) => (
            <div key={i} className="border rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-slate-700">Curso {i + 1}</h4>
              <ImageUploader
                label="Imagen de portada (reemplaza gradiente)"
                value={curso.imageUrl}
                onChange={v => update(i, 'imageUrl', v)}
              />
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Título</label>
                <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30" value={curso.titulo} onChange={e => update(i, 'titulo', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</label>
                <textarea rows={2} className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-400/30 resize-none" value={curso.descripcion} onChange={e => update(i, 'descripcion', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duración</label>
                  <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30" value={curso.duracion} onChange={e => update(i, 'duracion', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating (1-5)</label>
                  <input type="number" min={1} max={5} step={0.1} className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30" value={curso.rating} onChange={e => update(i, 'rating', parseFloat(e.target.value))} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)} className="bg-amber-500 hover:bg-amber-600 text-white"><Save size={14} className="mr-2" /> Aplicar</Button>
        </div>
      </div>
    </div>
  );
}

// ── Modal logos de clientes ───────────────────────────────────────────────────
function ModalLogos({ logos, onClose, onSave }: {
  logos: [LogoCliente, LogoCliente, LogoCliente, LogoCliente];
  onClose: () => void;
  onSave: (d: [LogoCliente, LogoCliente, LogoCliente, LogoCliente]) => void;
}) {
  const [form, setForm] = useState<[LogoCliente, LogoCliente, LogoCliente, LogoCliente]>(
    JSON.parse(JSON.stringify(logos))
  );
  const update = (i: number, field: keyof LogoCliente, value: string) => {
    const copy = [...form] as typeof form;
    copy[i] = { ...copy[i], [field]: value };
    setForm(copy);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-amber-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><ImageIcon size={16} className="text-amber-500" /> Logos de Clientes</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {form.map((logo, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-600 text-sm">Logo {i + 1}</h4>
              <ImageUploader
                label="Imagen del logo"
                value={logo.imageUrl}
                onChange={v => update(i, 'imageUrl', v)}
              />
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre empresa (alt text)</label>
                <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30" value={logo.nombre} onChange={e => update(i, 'nombre', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)} className="bg-amber-500 hover:bg-amber-600 text-white"><Save size={14} className="mr-2" /> Aplicar</Button>
        </div>
      </div>
    </div>
  );
}

// ── Modal noticias con imagen y contenido completo ────────────────────────────
function ModalNoticias({ noticias, titulo, descripcion, onClose, onSave }: {
  noticias: [NoticiaContent, NoticiaContent, NoticiaContent];
  titulo: string; descripcion: string;
  onClose: () => void;
  onSave: (d: { titulo: string; descripcion: string; noticias: [NoticiaContent, NoticiaContent, NoticiaContent] }) => void;
}) {
  const [tit, setTit] = useState(titulo);
  const [desc, setDesc] = useState(descripcion);
  const [form, setForm] = useState<[NoticiaContent, NoticiaContent, NoticiaContent]>(
    JSON.parse(JSON.stringify(noticias))
  );

  const update = (i: number, field: keyof NoticiaContent, value: string) => {
    const copy = [...form] as typeof form;
    copy[i] = { ...copy[i], [field]: value };
    setForm(copy);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-amber-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Pencil size={16} className="text-amber-500" /> Editar Noticias
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Encabezado sección */}
          <div className="border rounded-xl p-4 space-y-3 bg-slate-50">
            <h4 className="font-bold text-slate-600 text-sm">Encabezado de sección</h4>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Título</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
                value={tit}
                onChange={e => setTit(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</label>
              <textarea
                rows={2}
                className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-400/30 resize-none"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
          </div>

          {/* Noticias */}
          {form.map((n, i) => (
            <div key={i} className="border rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-slate-700">Noticia {i + 1}</h4>

              <ImageUploader
                label="Imagen de portada"
                value={n.imageUrl}
                onChange={v => update(i, 'imageUrl', v)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
                    value={n.fecha}
                    onChange={e => update(i, 'fecha', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Título</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
                    value={n.titulo}
                    onChange={e => update(i, 'titulo', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Resumen{' '}
                  <span className="text-slate-300 normal-case font-normal">(se muestra en la tarjeta)</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-400/30 resize-none"
                  value={n.resumen}
                  onChange={e => update(i, 'resumen', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Contenido completo{' '}
                  <span className="text-slate-300 normal-case font-normal">(se muestra al hacer clic en "Leer más")</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Escribe aquí el texto completo de la noticia..."
                  className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-400/30 resize-y"
                  value={n.contenido_completo}
                  onChange={e => update(i, 'contenido_completo', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => onSave({ titulo: tit, descripcion: desc, noticias: form })}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Save size={14} className="mr-2" /> Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
type ModalType = 'hero' | 'nosotros' | 'metodologia' | 'clientes_texto' | 'clientes_logos' | 'noticias' | 'footer' | 'cursos' | null;

export function AdminLandingPage() {
  const navigate = useNavigate();
  const { content, isDraft, lastSaved, updateSection, saveContent, discardChanges } = useLandingContent();
  const [modal, setModal] = useState<ModalType>(null);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  const abrir = (m: ModalType) => { if (!vistaPrevia) setModal(m); };
  const cerrar = () => setModal(null);

  return (
    <div className="min-h-screen bg-white">

      {/* Banner z-[200] — siempre encima del navbar (z-50) */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-slate-900 text-white h-14 border-b border-amber-500/30 shadow-xl">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500 rounded text-slate-900"><Pencil size={15} /></div>
            <div>
              <span className="font-black text-xs uppercase tracking-widest">Editor Landing</span>
              {isDraft
                ? <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5"><AlertTriangle size={9} /> Cambios sin guardar</p>
                : lastSaved
                  ? <p className="text-[10px] text-slate-400 mt-0.5">Guardado {lastSaved.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                  : null
              }
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setVistaPrevia(v => !v)} className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${vistaPrevia ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
              {vistaPrevia ? <Pencil size={13} /> : <Eye size={13} />} {vistaPrevia ? 'Editar' : 'Vista Previa'}
            </button>
            <button onClick={() => { if (confirm('¿Descartar cambios?')) discardChanges(); }} disabled={!isDraft} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed" title="Descartar">
              <RotateCcw size={17} />
            </button>
            <button onClick={saveContent} disabled={!isDraft} className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 px-4 py-1.5 rounded font-black text-xs flex items-center gap-1.5 transition-all">
              <Save size={13} /> Guardar
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1" />
            <button onClick={() => { if (!isDraft || confirm('Tienes cambios sin guardar. ¿Salir?')) navigate('/admin/dashboard'); }} className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="pt-14">
        <EditNavbar />
        <div className="h-16" />

        <EditableSection label="Hero" onEdit={() => abrir('hero')} vistaPrevia={vistaPrevia}>
          <HeroSection content={content.hero} />
        </EditableSection>

        <EditableSection label="Quiénes Somos" onEdit={() => abrir('nosotros')} vistaPrevia={vistaPrevia}>
          <AboutSection content={content.nosotros} />
        </EditableSection>

        <EditableSection label="Cursos Destacados" onEdit={() => abrir('cursos')} vistaPrevia={vistaPrevia}>
          <CoursesSection content={content.cursos} />
        </EditableSection>

        <EditableSection label="Metodología" onEdit={() => abrir('metodologia')} vistaPrevia={vistaPrevia}>
          <MethodologySection content={content.metodologia} />
        </EditableSection>

        {/* Clientes tiene dos botones: texto y logos */}
        <div className="relative">
          {!vistaPrevia && (
            <div className="absolute top-4 right-4 z-40 flex gap-2">
              <button onClick={() => abrir('clientes_logos')} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wider">
                <Upload size={13} /> Logos
              </button>
              <button onClick={() => abrir('clientes_texto')} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wider">
                <Pencil size={13} /> Textos
              </button>
            </div>
          )}
          <ClientsSection content={content.clientes} />
        </div>

        <EditableSection label="Noticias" onEdit={() => abrir('noticias')} vistaPrevia={vistaPrevia}>
          <NewsSection content={content.noticias} />
        </EditableSection>

        <EditableSection label="Footer" onEdit={() => abrir('footer')} vistaPrevia={vistaPrevia}>
          <LandingFooter content={content.footer} />
        </EditableSection>
      </div>

      {/* ── Modales ── */}

      {modal === 'hero' && (
        <EditModal titulo="Sección Principal" fields={[
          { key: 'titulo', label: 'Título principal', type: 'textarea' },
          { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
          { key: 'feature1_titulo', label: 'Característica 1 — Título' },
          { key: 'feature1_subtitulo', label: 'Característica 1 — Descripción' },
          { key: 'feature2_titulo', label: 'Característica 2 — Título' },
          { key: 'feature2_subtitulo', label: 'Característica 2 — Descripción' },
          { key: 'feature3_titulo', label: 'Característica 3 — Título' },
          { key: 'feature3_subtitulo', label: 'Característica 3 — Descripción' },
        ]} values={content.hero as any} onClose={cerrar} onSave={d => { updateSection('hero', d as any); cerrar(); }} />
      )}

      {modal === 'nosotros' && (
        <EditModal titulo="Quiénes Somos" fields={[
          { key: 'titulo', label: 'Título sección' },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
          { key: 'mision_titulo', label: 'Misión — Título' },
          { key: 'mision_texto', label: 'Misión — Texto', type: 'textarea' },
          { key: 'vision_titulo', label: 'Visión — Título' },
          { key: 'vision_texto', label: 'Visión — Texto', type: 'textarea' },
          { key: 'valores_titulo', label: 'Valores — Título' },
          { key: 'valores_texto', label: 'Valores — Texto', type: 'textarea' },
        ]} values={content.nosotros as any} onClose={cerrar} onSave={d => { updateSection('nosotros', d as any); cerrar(); }} />
      )}

      {modal === 'cursos' && (
        <ModalCursos destacados={content.cursos.destacados} onClose={cerrar}
          onSave={d => { updateSection('cursos', { destacados: d }); cerrar(); }} />
      )}

      {modal === 'metodologia' && (
        <EditModal titulo="Metodología" fields={[
          { key: 'titulo', label: 'Título sección' },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
          { key: 'paso1_titulo', label: 'Paso 1 — Título' }, { key: 'paso1_texto', label: 'Paso 1 — Texto', type: 'textarea' },
          { key: 'paso2_titulo', label: 'Paso 2 — Título' }, { key: 'paso2_texto', label: 'Paso 2 — Texto', type: 'textarea' },
          { key: 'paso3_titulo', label: 'Paso 3 — Título' }, { key: 'paso3_texto', label: 'Paso 3 — Texto', type: 'textarea' },
          { key: 'paso4_titulo', label: 'Paso 4 — Título' }, { key: 'paso4_texto', label: 'Paso 4 — Texto', type: 'textarea' },
        ]} values={content.metodologia as any} onClose={cerrar} onSave={d => { updateSection('metodologia', d as any); cerrar(); }} />
      )}

      {modal === 'clientes_texto' && (
        <EditModal titulo="Clientes — Textos" fields={[
          { key: 'titulo', label: 'Título sección' },
          { key: 'descripcion', label: 'Descripción', type: 'textarea' },
          { key: 'testimonio1.nombre', label: 'Testimonio 1 — Nombre' },
          { key: 'testimonio1.cargo', label: 'Testimonio 1 — Cargo - Empresa' },
          { key: 'testimonio1.texto', label: 'Testimonio 1 — Texto', type: 'textarea' },
          { key: 'testimonio2.nombre', label: 'Testimonio 2 — Nombre' },
          { key: 'testimonio2.cargo', label: 'Testimonio 2 — Cargo - Empresa' },
          { key: 'testimonio2.texto', label: 'Testimonio 2 — Texto', type: 'textarea' },
        ]} values={{
          titulo: content.clientes.titulo,
          descripcion: content.clientes.descripcion,
          'testimonio1.nombre': content.clientes.testimonio1.nombre,
          'testimonio1.cargo': content.clientes.testimonio1.cargo,
          'testimonio1.texto': content.clientes.testimonio1.texto,
          'testimonio2.nombre': content.clientes.testimonio2.nombre,
          'testimonio2.cargo': content.clientes.testimonio2.cargo,
          'testimonio2.texto': content.clientes.testimonio2.texto,
        }} onClose={cerrar} onSave={d => {
          updateSection('clientes', {
            titulo: d.titulo, descripcion: d.descripcion,
            testimonio1: { nombre: d['testimonio1.nombre'], cargo: d['testimonio1.cargo'], texto: d['testimonio1.texto'] },
            testimonio2: { nombre: d['testimonio2.nombre'], cargo: d['testimonio2.cargo'], texto: d['testimonio2.texto'] },
          });
          cerrar();
        }} />
      )}

      {modal === 'clientes_logos' && (
        <ModalLogos logos={content.clientes.logos} onClose={cerrar}
          onSave={d => { updateSection('clientes', { logos: d }); cerrar(); }} />
      )}

      {modal === 'noticias' && (
        <ModalNoticias
          titulo={content.noticias.titulo}
          descripcion={content.noticias.descripcion}
          noticias={[content.noticias.noticia1, content.noticias.noticia2, content.noticias.noticia3]}
          onClose={cerrar}
          onSave={({ titulo, descripcion, noticias }) => {
            updateSection('noticias', {
              titulo,
              descripcion,
              noticia1: noticias[0],
              noticia2: noticias[1],
              noticia3: noticias[2],
            });
            cerrar();
          }}
        />
      )}

      {modal === 'footer' && (
        <EditModal titulo="Footer / Contacto" fields={[
          { key: 'nombre_empresa', label: 'Nombre empresa' },
          { key: 'eslogan', label: 'Eslogan', type: 'textarea' },
          { key: 'email', label: 'Email' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'copyright', label: 'Copyright' },
        ]} values={content.footer as any} onClose={cerrar} onSave={d => { updateSection('footer', d as any); cerrar(); }} />
      )}
    </div>
  );
}