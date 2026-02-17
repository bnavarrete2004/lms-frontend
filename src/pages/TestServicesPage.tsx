// src/pages/TestServicesPage.tsx
// Página de prueba para los nuevos servicios

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { moduloService, type Modulo } from '@/api/services/moduloService';
import { leccionService, type Leccion } from '@/api/services/leccionService';
import { materialService, type Material } from '@/api/services/materialService';
import { evaluacionService, type Evaluacion } from '@/api/services/evaluacionService';
import { cursoService, type Curso } from '@/api/services/cursoService';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function TestServicesPage() {
  const [selectedCurso, setSelectedCurso] = useState<number | null>(null);
  const [selectedModulo, setSelectedModulo] = useState<number | null>(null);

  // Cargar cursos
  const { 
    data: cursos, 
    loading: loadingCursos, 
    error: errorCursos,
    execute: cargarCursos
  } = useApi<Curso[]>(() => cursoService.getAll());

  // Cargar módulos del curso seleccionado
  const { 
    data: modulos, 
    loading: loadingModulos, 
    error: errorModulos,
    setData: setModulos
  } = useApi<Modulo[]>(() => moduloService.getByCurso(selectedCurso!));

  // Cargar lecciones del módulo seleccionado
  const { 
    data: lecciones, 
    loading: loadingLecciones, 
    error: errorLecciones,
    setData: setLecciones
  } = useApi<Leccion[]>(() => leccionService.getByModulo(selectedModulo!));

  // Cargar materiales
  const { 
    data: materiales, 
    loading: loadingMateriales, 
    error: errorMateriales,
    execute: cargarMateriales
  } = useApi<Material[]>(() => materialService.getAprobados());

  // Cargar evaluaciones del curso seleccionado
  const { 
    data: evaluaciones, 
    loading: loadingEvaluaciones, 
    error: errorEvaluaciones,
    setData: setEvaluaciones
  } = useApi<Evaluacion[]>(() => evaluacionService.getByCurso(selectedCurso!));

  // ============================================
  // EFECTOS: Cargar datos cuando cambian las selecciones
  // ============================================

  // Cuando cambia el curso seleccionado
  useEffect(() => {
    if (selectedCurso) {
      console.log('🔄 Curso seleccionado:', selectedCurso);
      
      // Cargar módulos
      (async () => {
        try {
          console.log('📡 Cargando módulos del curso:', selectedCurso);
          const modulosData = await moduloService.getByCurso(selectedCurso);
          console.log('✅ Módulos recibidos:', modulosData.length, modulosData);
          setModulos(modulosData);
        } catch (error) {
          console.error('❌ Error cargando módulos:', error);
        }
      })();
      
      // Cargar evaluaciones
      (async () => {
        try {
          console.log('📡 Cargando evaluaciones del curso:', selectedCurso);
          const evalData = await evaluacionService.getByCurso(selectedCurso);
          console.log('✅ Evaluaciones recibidas:', evalData.length);
          setEvaluaciones(evalData);
        } catch (error) {
          console.error('❌ Error cargando evaluaciones:', error);
        }
      })();
    } else {
      setModulos(null);
      setEvaluaciones(null);
    }
  }, [selectedCurso]);

  // Cuando cambia el módulo seleccionado
  useEffect(() => {
    if (selectedModulo) {
      console.log('🔄 Módulo seleccionado:', selectedModulo);
      (async () => {
        try {
          console.log('📡 Cargando lecciones del módulo:', selectedModulo);
          const leccionesData = await leccionService.getByModulo(selectedModulo);
          console.log('✅ Lecciones recibidas:', leccionesData.length, leccionesData);
          setLecciones(leccionesData);
        } catch (error) {
          console.error('❌ Error cargando lecciones:', error);
        }
      })();
    } else {
      setLecciones(null);
    }
  }, [selectedModulo]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCargarCursos = () => {
    console.log('📚 Cargando todos los cursos...');
    cargarCursos();
    setSelectedCurso(null);
    setSelectedModulo(null);
  };

  const handleSeleccionarCurso = (cursoId: number) => {
    console.log('👆 Click en curso:', cursoId);
    
    // Si ya está seleccionado, deseleccionar
    if (selectedCurso === cursoId) {
      setSelectedCurso(null);
      setSelectedModulo(null);
    } else {
      // Seleccionar nuevo curso
      setSelectedCurso(cursoId);
      setSelectedModulo(null);
    }
  };

  const handleSeleccionarModulo = (moduloId: number) => {
    console.log('👆 Click en módulo:', moduloId);
    
    // Si ya está seleccionado, deseleccionar
    if (selectedModulo === moduloId) {
      setSelectedModulo(null);
    } else {
      // Seleccionar nuevo módulo
      setSelectedModulo(moduloId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test de Servicios - Backend Integration
          </h1>
          <p className="text-gray-600">
            Prueba de los servicios: moduloService, leccionService, materialService, evaluacionService
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-6">
            
            {/* 1. CURSOS */}
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">📚 Cursos</h2>
                <Button onClick={handleCargarCursos} disabled={loadingCursos}>
                  {loadingCursos ? 'Cargando...' : 'Cargar Cursos'}
                </Button>
              </div>

              {errorCursos && (
                <Alert variant="danger" title="Error al cargar cursos">
                  {errorCursos.message}
                </Alert>
              )}

              {cursos && cursos.length > 0 && (
                <div className="space-y-2">
                  {cursos.map(curso => (
                    <div 
                      key={curso.id}
                      onClick={() => handleSeleccionarCurso(curso.id)}
                      className={`p-4 border rounded cursor-pointer transition-colors ${
                        selectedCurso === curso.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{curso.nombre}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {curso.horas_totales}h • {curso.modalidad}
                          </p>
                        </div>
                        <Badge variant={curso.estado === 'activo' ? 'success' : 'info'}>
                          {curso.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. MÓDULOS */}
            {selectedCurso && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📖 Módulos del Curso #{selectedCurso}
                </h2>

                {loadingModulos && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}

                {errorModulos && (
                  <Alert variant="danger" title="Error al cargar módulos">
                    {errorModulos.message}
                  </Alert>
                )}

                {modulos && modulos.length > 0 && (
                  <div className="space-y-2">
                    {modulos.map(modulo => (
                      <div 
                        key={modulo.id}
                        onClick={() => handleSeleccionarModulo(modulo.id)}
                        className={`p-4 border rounded cursor-pointer transition-colors ${
                          selectedModulo === modulo.id 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="info">{modulo.orden}</Badge>
                              <p className="font-semibold text-gray-900">{modulo.nombre}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {modulo.horas_estimadas}h estimadas • {modulo.codigo_modulo}
                            </p>
                          </div>
                          {modulo.publicado && (
                            <Badge variant="success">Publicado</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {modulos && modulos.length === 0 && !loadingModulos && (
                  <p className="text-gray-500 text-center py-4">
                    No hay módulos para este curso
                  </p>
                )}
              </section>
            )}

            {/* 3. LECCIONES */}
            {selectedModulo && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📝 Lecciones del Módulo #{selectedModulo}
                </h2>

                {loadingLecciones && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                )}

                {errorLecciones && (
                  <Alert variant="danger" title="Error al cargar lecciones">
                    {errorLecciones.message}
                  </Alert>
                )}

                {lecciones && lecciones.length > 0 && (
                  <div className="space-y-2">
                    {lecciones.map(leccion => (
                      <div 
                        key={leccion.id}
                        className="p-4 border border-gray-200 rounded hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="default">{leccion.orden}</Badge>
                              <p className="font-semibold text-gray-900">{leccion.nombre}</p>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {leccion.descripcion}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="info">{leccion.tipo}</Badge>
                              <span className="text-xs text-gray-500">
                                {leccion.duracion_minutos} min
                              </span>
                              {leccion.obligatoria && (
                                <Badge variant="danger" className="text-xs">Obligatoria</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {lecciones && lecciones.length === 0 && !loadingLecciones && (
                  <p className="text-gray-500 text-center py-4">
                    No hay lecciones para este módulo
                  </p>
                )}
              </section>
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-6">
            
            {/* 4. MATERIALES */}
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">📄 Materiales Aprobados</h2>
                <Button onClick={() => cargarMateriales()} disabled={loadingMateriales}>
                  {loadingMateriales ? 'Cargando...' : 'Cargar Materiales'}
                </Button>
              </div>

              {errorMateriales && (
                <Alert variant="danger" title="Error al cargar materiales">
                  {errorMateriales.message}
                </Alert>
              )}

              {materiales && materiales.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {materiales.map(material => (
                    <div 
                      key={material.id}
                      className="p-3 border border-gray-200 rounded hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{material.nombre}</p>
                          <p className="text-xs text-gray-600 mt-1">{material.descripcion}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="success" className="text-xs">{material.tipo}</Badge>
                            <Badge variant="info" className="text-xs">{material.estado}</Badge>
                            {material.reutilizable && (
                              <Badge variant="default" className="text-xs">Reutilizable</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {materiales && materiales.length === 0 && !loadingMateriales && (
                <p className="text-gray-500 text-center py-4">
                  No hay materiales disponibles
                </p>
              )}
            </section>

            {/* 5. EVALUACIONES */}
            {selectedCurso && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📝 Evaluaciones del Curso #{selectedCurso}
                </h2>

                {loadingEvaluaciones && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                )}

                {errorEvaluaciones && (
                  <Alert variant="danger" title="Error al cargar evaluaciones">
                    {errorEvaluaciones.message}
                  </Alert>
                )}

                {evaluaciones && evaluaciones.length > 0 && (
                  <div className="space-y-2">
                    {evaluaciones.map(evaluacion => (
                      <div 
                        key={evaluacion.id}
                        className="p-4 border border-gray-200 rounded hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-900">{evaluacion.nombre}</p>
                          {evaluacion.publicada && (
                            <Badge variant="success">Publicada</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{evaluacion.descripcion}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="info" className="text-xs">{evaluacion.tipo}</Badge>
                          <span className="text-xs text-gray-500">
                            {evaluacion.intentos_permitidos} intentos
                          </span>
                          {evaluacion.tiempo_limite_minutos && (
                            <span className="text-xs text-gray-500">
                              ⏱ {evaluacion.tiempo_limite_minutos} min
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Nota mín: {evaluacion.nota_aprobacion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {evaluaciones && evaluaciones.length === 0 && !loadingEvaluaciones && (
                  <p className="text-gray-500 text-center py-4">
                    No hay evaluaciones para este curso
                  </p>
                )}
              </section>
            )}

            {/* Resumen de Pruebas */}
            <section className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-xl font-bold mb-4">✅ Estado de las Pruebas</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cursos cargados:</span>
                  <span className="font-bold">{cursos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Módulos cargados:</span>
                  <span className="font-bold">{modulos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lecciones cargadas:</span>
                  <span className="font-bold">{lecciones?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materiales disponibles:</span>
                  <span className="font-bold">{materiales?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluaciones:</span>
                  <span className="font-bold">{evaluaciones?.length || 0}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}