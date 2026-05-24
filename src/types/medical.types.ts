export interface DatosMedicos {
  id: string;
  usuario_id: string;
  tipo_sangre: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'desconocido';
  peso_kg?: number | null;
  altura_cm?: number | null;
  alergias: string[];
  medicamentos_actuales: string[];
  enfermedades_cronicas: string[];
  cirugias_previas: string[];
  donador_organos: boolean;
  seguro_medico?: string | null;
  numero_poliza?: string | null;
  updated_at: string | Date;
}

export interface CondicionesEspeciales {
  id: string;
  usuario_id: string;
  discapacidades: string[];
  implantes: string[];
  protesis: string[];
  restricciones_medicamento: string[];
  notas_adicionales?: string | null;
  updated_at: string | Date;
}

export interface ContactoEmergencia {
  id: string;
  usuario_id: string;
  nombre: string;
  relacion?: string | null;
  telefono: string;
  telefono_alt?: string | null;
  es_principal: boolean;
  created_at: string | Date;
}

export interface FichaMedicaCompleta {
  paciente: {
    id: string;
    email: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    fecha_nacimiento: string | Date;
    sexo: 'masculino' | 'femenino' | 'otro';
    curp?: string | null;
    telefono?: string | null;
    foto_url?: string | null;
    qr_token: string;
  };
  datos_medicos: DatosMedicos | null;
  condiciones_especiales: CondicionesEspeciales | null;
  contactos_emergencia: ContactoEmergencia[];
}
