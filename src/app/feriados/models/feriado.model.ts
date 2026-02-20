export interface Feriado {
  id?: number;
  fechaFeriado: string;
  codigoRegion?: string;
  descripcionFeriado?: string;
  tipoFeriado?: string;
  estado?: string;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface FeriadoCreateRequest {
  fechaFeriado: string;
  codigoRegion: string;
  descripcionFeriado: string;
  tipoFeriado: string;
  estado: string;
  usuarioCreacion: string;
}

export interface FeriadoUpdateRequest {
  id: number;
  fechaFeriado: string;
  codigoRegion: string;
  descripcionFeriado: string;
  tipoFeriado: string;
  estado: string;
  usuarioModificacion: string;
}
