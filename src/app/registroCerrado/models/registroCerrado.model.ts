export interface RegistroCerradoResponse {
  codigoEmpresa: string;
  codigoAtencion: string;
  codigoAsunto: string;
  fechaRecepcion: string;
  fechaCierre: string;
  codigoUbigeo: string;
  descripcionUbigeo?: string;
  usuarioCreacion: string;
}

export interface RegistroCerradoPageResponse {
  content: RegistroCerradoResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface RegistroCerradoFilterRequest {
  codigoPeriodo: string;
  fechaInicio: string;
  fechaFin: string;
  codigoAsunto: string;
  codigoEmpresa: string;
  page?: number;
  size?: number;
}
