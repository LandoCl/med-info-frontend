export interface Usuario {
  id: string;
  email: string;
  password_hash: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  fecha_nacimiento: string | Date;
  sexo: 'masculino' | 'femenino' | 'otro';
  curp?: string | null;
  telefono?: string | null;
  foto_url?: string | null;
  qr_token: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export type UsuarioClean = Omit<Usuario, 'password_hash'>;

export interface UserSession {
  user: UsuarioClean;
  token: string;
}
