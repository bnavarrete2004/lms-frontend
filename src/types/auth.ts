export type RolUsuario = 'administrador' | 'relator' | 'estudiante';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre_completo?: string;
  nombre: string;
  apellido: string;
  rut: string;
  rol: RolUsuario;
  avatar?: string;
  avatar_url?: string;
  biografia?: string;
  telefono?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  activo: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: Usuario;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
