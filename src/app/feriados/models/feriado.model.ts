export interface Feriado {
  id?: number;
  fechaFeriadoIni: string;
  fechaFeriadoFin: string;
  codigoRegion?: string;
  descripcionRegion?: string;
  descripcionFeriado?: string;
  tipoFeriado?: string;
  estado?: boolean;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface FeriadoCreateRequest {
  fechaFeriadoIni: string;
  fechaFeriadoFin: string;
  codigoRegion: string;
  descripcionFeriado: string;
  tipoFeriado: string;
  usuarioCreacion: string;
}

export interface FeriadoUpdateRequest {
  id: number;
  fechaFeriadoIni: string;
  fechaFeriadoFin: string;
  codigoRegion: string;
  descripcionFeriado: string;
  tipoFeriado: string;
  usuarioModificacion: string;
}
