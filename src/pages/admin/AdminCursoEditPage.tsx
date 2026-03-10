// Ubicación: src/pages/admin/AdminCursoEditPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cursoService, type Curso } from '@/api/services/cursoService';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LayoutDashboard, BookOpen, ChevronLeft, Save } from 'lucide-react';

export function AdminCursoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Curso>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cursoService.getById(id!)
      .then(data => {
        setFormData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los datos del curso");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError(null);
  try {
    const dataToSend = {
      ...formData,
      publicado: formData.estado === 'activo', // ← garantiza sincronía al guardar
    };
    await cursoService.patch(id!, dataToSend);
    navigate(`/admin/cursos/${id}`);
  } catch (err) {
    setError("No se pudieron guardar los cambios. Verifique los datos.");
  } finally {
    setSaving(false);
  }
};

  if (loading) return <div className="p-20 text-center">Cargando formulario...</div>;

  const sidebarSections = [
    {
      title: 'Gestión',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Panel General', href: '/admin/dashboard' },
        { icon: <BookOpen size={20} />, label: 'Gestión Cursos', href: '/admin/cursos', isActive: true },
      ],
    }
  ];

  return (
    <MainLayout
      role="administrador"
      userName="Admin"
      sidebarSections={sidebarSections}
      headerTitle="Editar Curso"
      headerSubtitle={formData.nombre}
    >
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 mb-6">
          <ChevronLeft size={20} /> Volver
        </button>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-4">Información General</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Input 
            label="Nombre del Curso" 
            value={formData.nombre || ''} 
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Input 
    label="Horas Totales" 
    type="number"
    value={formData.horas_totales || ''} 
    onChange={e => setFormData({...formData, horas_totales: Number(e.target.value)})}
    required
  />
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-2">Estado del Curso</label>
    <select 
      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jc-calipso/20 focus:border-jc-calipso outline-none transition"
      value={formData.estado || 'borrador'}
      onChange={e => {
        const nuevoEstado = e.target.value as any;
        setFormData({
          ...formData,
          estado: nuevoEstado,
          publicado: nuevoEstado === 'activo',  // ← sincroniza publicado automáticamente
        });
      }}
    >
      <option value="activo">Activo (Visible)</option>
      <option value="borrador">Borrador (Edición)</option>
      <option value="inactivo">Inactivo (Archivado)</option>
    </select>
  </div>
</div>

  {/* Fechas */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
      <input
        type="date"
        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jc-calipso/20 focus:border-jc-calipso outline-none transition"
        value={formData.fecha_inicio || ''}
        onChange={e => setFormData({...formData, fecha_inicio: e.target.value})}
      />
    </div>
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
      <input
        type="date"
        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jc-calipso/20 focus:border-jc-calipso outline-none transition"
        value={formData.fecha_fin || ''}
        onChange={e => setFormData({...formData, fecha_fin: e.target.value})}
      />
    </div>
  </div>

  {/* Días de gracia */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-2">
      Días de gracia <span className="text-slate-400 font-normal text-xs ml-1">(acceso extra tras la fecha de fin)</span>
    </label>
    <div className="flex items-center gap-4">
      <input
        type="number"
        min={0}
        max={30}
        className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jc-calipso/20 focus:border-jc-calipso outline-none transition"
        value={formData.dias_gracia ?? 0}
        onChange={e => setFormData({...formData, dias_gracia: Math.max(0, Math.min(30, Number(e.target.value) || 0))})}
      />
      <p className="text-sm text-slate-500">
        {!formData.dias_gracia || formData.dias_gracia === 0
          ? 'El curso cierra exactamente en la fecha de fin.'
          : `El curso seguirá accesible ${formData.dias_gracia} día${formData.dias_gracia > 1 ? 's' : ''} después de la fecha de fin.`
        }
      </p>
    </div>
  </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Descripción General</label>
             {/* AGREGAR ESTO ENTRE ESOS DOS DIVS */}
              {/* SENCE */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sincronizado_con_sence"
                  checked={formData.sincronizado_con_sence ?? false}
                  onChange={e => setFormData({...formData, sincronizado_con_sence: e.target.checked})}
                  className="w-4 h-4 accent-jc-calipso cursor-pointer"
                />
                <label htmlFor="sincronizado_con_sence" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Curso con registro SENCE <span className="text-slate-400 font-normal text-xs ml-1">(habilita inicio/cierre de sesión con ClaveÚnica)</span>
                </label>
              </div>
            <textarea 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jc-calipso/20 focus:border-jc-calipso outline-none transition h-40 resize-none"
              value={formData.descripcion || ''}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Escriba aquí los detalles del curso..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving} className="px-8">
              <Save size={18} className="mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}