// src/api/services/empresaService.ts
// Servicio para gestionar empresas clientes de la OTEC

import api from '../axios';

export interface EmpresaCliente {
  id: number;
  nombre: string;
  rut_empresa: string;
  codigo_empresa: string;
  contacto_nombre: string;
  contacto_email: string;
  contacto_telefono: string;
  activa: boolean;
  total_empleados?: number;
  created_at?: string;
}

export interface CrearEmpresaPayload {
  nombre: string;
  rut_empresa: string;
  codigo_empresa: string;
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  activa?: boolean;
}

class EmpresaService {
  private endpoint = '/empresas-cliente';

  async listar(): Promise<EmpresaCliente[]> {
    const res = await api.get(`${this.endpoint}/`);
    return res.data?.results ?? res.data ?? [];
  }

  async listarActivas(): Promise<EmpresaCliente[]> {
    const res = await api.get(`${this.endpoint}/`, { params: { activa: true } });
    return res.data?.results ?? res.data ?? [];
  }

  async crear(payload: CrearEmpresaPayload): Promise<EmpresaCliente> {
    const res = await api.post(`${this.endpoint}/`, payload);
    return res.data;
  }

  async actualizar(id: number, payload: Partial<CrearEmpresaPayload>): Promise<EmpresaCliente> {
    const res = await api.patch(`${this.endpoint}/${id}/`, payload);
    return res.data;
  }

  async inscribirEnCurso(empresaId: number, cursoId: number): Promise<{
    inscritos: number;
    ya_inscritos: number;
    total_empleados: number;
    mensaje: string;
  }> {
    const res = await api.post(`${this.endpoint}/${empresaId}/inscribir_en_curso/`, {
      curso_id: cursoId,
    });
    return res.data;
  }
}

export const empresaService = new EmpresaService();