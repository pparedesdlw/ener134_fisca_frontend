export interface Muestra {
  id?: number;
  codigoMuestra: string;
  muestra?: string;
  confianza?: string;
  error?: string;
  estado?: boolean;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface MuestraCreateRequest {
  codigoMuestra: string;
  muestra: string;
  confianza: string;
  error: string;
  usuarioCreacion: string;
}

export interface MuestraUpdateRequest {
  id: number;
  codigoMuestra: string;
  muestra: string;
  confianza: string;
  error: string;
  usuarioModificacion: string;
}
