export interface Responsable {
  id?: number;
  codigoResponsable: string;
  nombreResponsable?: string;
  codigoEmpresa?: string;
  estado?: string;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface ResponsableCreateRequest {
  codigoResponsable: string;
  nombreResponsable: string;
  codigoEmpresa: string;
  estado: string;
  usuarioCreacion: string;
}

export interface ResponsableUpdateRequest {
  id: number;
  codigoResponsable: string;
  nombreResponsable: string;
  codigoEmpresa: string;
  estado: string;
  usuarioModificacion: string;
}