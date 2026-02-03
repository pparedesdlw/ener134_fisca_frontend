export interface Periodo {
  id?: number;
  codigoPeriodo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  estadoActivo: boolean;
  deEstado?: string;
  diasRestantes?: number;
  sustentoAmpliacion?: string;
  fechaAmpliacion?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface PeriodoCreateRequest {
  codigoPeriodo: string;
  fechaInicio: string;
  fechaFin: string;
  estadoActivo: boolean;
  usuarioCreacion: string;
}

export interface PeriodoUpdateRequest {
  id: number;
  codigoPeriodo: string;
  fechaInicio: string;
  fechaFin: string;
  estadoActivo: boolean;
  usuarioModificacion: string;
}

export interface AmpliacionVigenciaRequest {
  id: number;
  nuevaFechaFin: string;
  sustentoAmpliacion: string;
  usuarioModificacion: string;
}
