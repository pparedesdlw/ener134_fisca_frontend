export type EstadoEvaluacionAiv = 'EN_PROCESO' | 'REABIERTO' | 'CONSOLIDADO_PARCIAL' | 'CONSOLIDADO_TOTAL';

export interface EvaluacionItemResponse {
  codigoItem: string;
  cumple: boolean | null;
  autoIncumple: boolean | null;
  observacion: string | null;
}

export interface EvaluacionRegistroResponse {
  id: number;
  idMuestraDetalle: number;
  codigoUnico: string | null;
  codigoEmpresa: string | null;
  codigoAtencion: string | null;
  codigoUbigeo: string | null;
  codigoAsunto: string | null;
  descripcionAsunto: string | null;
  grupoAsunto: string | null;
  usuario: string | null;
  adicional: boolean | null;
  reemplazado: boolean | null;
  estadoRegistro: string;
  cumple: 'S' | 'N' | 'P' | null;
  itemsCumplidos: number;
  itemsTotal: number;
  fechaEvaluacion: string | null;
  observacion: string | null;
  items: EvaluacionItemResponse[];
}

export interface ItemResumenResponse {
  codigoItem: string;
  descripcion: string;
  existentes: number;
  fiscalizados: number;
  incumplimientos: number;
}

export interface EvaluacionAivResponse {
  id: number;
  codigoPeriodo: string;
  codigoEmpresa: number;
  idMuestraAiv: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  estadoEvaluacion: EstadoEvaluacionAiv;
  totalAtenciones: number;
  muestraDefinitiva: number;
  numeroRegistrosNoConformes: number;
  indicadorAiv: number;
  fechaConsolidado: string | null;
  toleranciaAplicable: number | null;
  superaTolerancia: boolean | null;
  itemsResumen: ItemResumenResponse[];
  registros: EvaluacionRegistroResponse[];
}

export interface IniciarEvaluacionRequest {
  codigoPeriodo: string;
  codigoEmpresa: number;
  idMuestraAiv: number;
  usuario: string;
}

export interface ItemEvaluadoRequest {
  codigoItem: string;
  cumple: boolean;
  observacion?: string;
}

export interface EvaluarRegistroRequest {
  idEvaluacionRegistro: number;
  usuario: string;
  observacion?: string;
  items: ItemEvaluadoRequest[];
}

export interface ConsolidarEvaluacionRequest {
  idEvaluacionAiv: number;
  usuario: string;
}

export interface ReabrirEvaluacionRequest {
  idEvaluacionAiv: number;
  motivo: string;
  tipoReapertura: string;
  nombreArchivoSustento: string;
  tipoMimeSustento: string;
  contenidoSustentoBase64: string;
  usuario: string;
}

/** RF09: fila de la grilla de evaluaciones consolidadas (pantalla de reapertura). */
export interface EvaluacionAivConsolidadaResponse {
  id: number;
  codigoPeriodo: string;
  codigoEmpresa: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  indicadorAiv: number;
  tipoMuestra: string | null;
  tipoConsolidacion: EstadoEvaluacionAiv;
  fechaConsolidado: string | null;
  usuarioConsolido: string | null;
  numeroRegistrosEvaluados: number;
}

export interface ReemplazarRegistroEvaluacionRequest {
  idEvaluacionRegistroPrincipal: number;
  idEvaluacionRegistroAdicional: number;
  usuario: string;
}

export interface EvaluacionAivResumenResponse {
  id: number;
  codigoPeriodo: string;
  codigoEmpresa: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  estadoEvaluacion: EstadoEvaluacionAiv;
  fechaModificacion: string | null;
  usuarioResponsable: string | null;
  avancePorcentaje: number;
}
