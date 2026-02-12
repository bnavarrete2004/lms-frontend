import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { cursoService, type Curso } from '../api/services/cursoService';
import { inscripcionService, type Inscripcion } from '../api/services/inscripcionService';

export function TestApiPage() {
  const { 
    data: cursos, 
    loading: loadingCursos, 
    error: errorCursos, 
    execute: cargarCursos 
  } = useApi<Curso[]>(() => cursoService.getAll());

  const {
    data: inscripciones,
    loading: loadingInscripciones,
    error: errorInscripciones,
    execute: cargarInscripciones
    } = useApi<Inscripcion[]>(() => inscripcionService.getAll());

  useEffect(() => {
    cargarCursos();
    cargarInscripciones();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test de API</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cursos</h2>
        {loadingCursos && <p>Cargando cursos...</p>}
        {errorCursos && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-600">{errorCursos.message}</p>
          </div>
        )}
        {cursos && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cursos.map(curso => (
              <div key={curso.id} className="border p-4 rounded">
                <h3 className="font-semibold">{curso.nombre}</h3>
                <p className="text-sm text-gray-600">{curso.descripcion}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {curso.horas_totales}h · {curso.nivel}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Mis Inscripciones</h2>
        {loadingInscripciones && <p>Cargando inscripciones...</p>}
        {errorInscripciones && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-600">{errorInscripciones.message}</p>
          </div>
        )}
        {inscripciones && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(inscripciones, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}