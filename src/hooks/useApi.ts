// src/hooks/useApi.ts
// Custom hook para manejar estados de loading y errores en llamadas a API

import { useState, useCallback } from 'react';
import { handleApiError, type ErrorResponse } from '../utils/errorHandler';

// ============================================
// TIPOS
// ============================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ErrorResponse | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook para manejar llamadas a API con loading y error states automáticos
 * 
 * @param apiFunction - Función que hace la llamada a la API
 * @returns Estados y funciones para ejecutar la llamada
 * 
 * @example
 * ```typescript
 * const { data, loading, error, execute } = useApi(cursoService.getById);
 * 
 * useEffect(() => {
 *   execute(1); // Obtener curso con ID 1
 * }, []);
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Alert>{error.message}</Alert>;
 * if (data) return <CursoCard curso={data} />;
 * ```
 */
export function useApi<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Ejecuta la función de API y maneja los estados automáticamente
   */
  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const errorResponse = handleApiError(err);
        setState({ data: null, loading: false, error: errorResponse });
        return null;
      }
    },
    [apiFunction]
  );

  /**
   * Resetea todos los estados a su valor inicial
   */
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  /**
   * Permite setear data manualmente (útil para optimistic updates)
   */
  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

// ============================================
// VARIANTE: useApiMutation
// ============================================

/**
 * Hook especializado para mutaciones (POST, PUT, PATCH, DELETE)
 * No guarda `data` automáticamente, solo retorna el resultado
 * 
 * @example
 * ```typescript
 * const { loading, error, execute: crearCurso } = useApiMutation(cursoService.create);
 * 
 * const handleSubmit = async (formData) => {
 *   const nuevoCurso = await crearCurso(formData);
 *   if (nuevoCurso) {
 *     toast.success('Curso creado exitosamente');
 *     navigate('/cursos');
 *   }
 * };
 * ```
 */
export function useApiMutation<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setLoading(false);
        return result;
      } catch (err) {
        const errorResponse = handleApiError(err);
        setError(errorResponse);
        setLoading(false);
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
}

// ============================================
// VARIANTE: useApiLazy
// ============================================

/**
 * Hook para llamadas lazy (no se ejecutan automáticamente)
 * Similar a useApi pero sin ejecutar al montar el componente
 * 
 * @example
 * ```typescript
 * const { data, loading, error, execute } = useApiLazy(cursoService.search);
 * 
 * const handleSearch = (query: string) => {
 *   execute(query);
 * };
 * ```
 */
export function useApiLazy<T, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiReturn<T> {
  return useApi(apiFunction);
}

// ============================================
// HELPERS
// ============================================

/**
 * Hook para verificar si alguna de las operaciones está cargando
 * 
 * @example
 * ```typescript
 * const loading = useLoadingState(
 *   cursosQuery.loading,
 *   materialesQuery.loading
 * );
 * ```
 */
export function useLoadingState(...loadingStates: boolean[]): boolean {
  return loadingStates.some(state => state);
}

/**
 * Hook para combinar múltiples errores
 * 
 * @example
 * ```typescript
 * const error = useCombinedErrors(
 *   cursosQuery.error,
 *   materialesQuery.error
 * );
 * ```
 */
export function useCombinedErrors(
  ...errors: (ErrorResponse | null)[]
): ErrorResponse | null {
  return errors.find(err => err !== null) || null;
}