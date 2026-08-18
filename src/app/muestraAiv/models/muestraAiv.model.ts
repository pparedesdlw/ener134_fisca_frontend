export interface MuestraAivDetalleResponse {
  id: number;
  idRegistroCerrado: number;
  codigoTipoAtencion: string;
  codigoClasificacion: string;
  orden: number;
  titular: boolean;
  adicional: boolean;
  reemplazado: boolean;
}

export interface DistribucionTipoResponse {
  tipoRequerimiento: string;
  universo: number;
  porcentaje: number;
  muestraPrincipal: number;
  muestraAdicional: number;
}

export interface MuestraAivResponse {
  id: number;
  codigoPeriodo: string;
  codigoEmpresa: number;
  poblacion: number;
  tamanioBase: number;
  porcentajeAdicional: number;
  tamanioFinal: number;
  estadoMuestra: string;
  seedAleatorio: number;
  fechaGeneracion: string;
  detalle: MuestraAivDetalleResponse[];
  distribucion: DistribucionTipoResponse[];
}

export interface GenerarMuestraAivRequest {
  codigoPeriodo: string;
  fechaInicio: string;
  fechaFin: string;
  codigoEmpresa: string;
  codigosAsunto?: string[];
  codigosUbigeo?: string[];
  nivelConfianza?: number;
  valorZ?: number;
  margenError?: number;
  probabilidad?: number;
  porcentajeAdicional?: number;
  usuario: string;
}

export interface ReemplazoMuestraRequest {
  idMuestraDetalle: number;
  motivo: string;
  usuario: string;
}
