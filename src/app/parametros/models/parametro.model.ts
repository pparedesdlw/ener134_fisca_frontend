export interface Parametro {
  id?: number;
  codigoParametro: string;
  descripcionParametro?: string;
  valor?: string;
  tipoParametro?: string;
  estado?: string;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface ParametroCreateRequest {
  codigoParametro: string;
  descripcionParametro: string;
  valor: string;
  tipoParametro: string;
  estado: string;
  usuarioCreacion: string;
}

export interface ParametroUpdateRequest {
  id: number;
  codigoParametro: string;
  descripcionParametro: string;
  valor: string;
  tipoParametro: string;
  estado: string;
  usuarioModificacion: string;
}
