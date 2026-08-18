export interface DetalleItem4Response {
  sinDetalleTh3: number;
  sinDetalleTh4: number;
  sinDetalleTh5: number;
  sinDetalleTh6: number;
  sinDetalleTh7: number;
  sinDetalleTh8: number;
}

/** RF13/RF14: evaluación consolidada del indicador CIT. */
export interface EvaluacionCitResponse {
  id: number;
  codigoPeriodo: string;
  codigoEmpresa: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string | null;
  nta: number;
  nmd: number;
  nrn: number;
  indicadorCit: number;
  incumplimientosItem1: number;
  incumplimientosItem3: number;
  incumplimientosItem4: number;
  detalleItem4: DetalleItem4Response;
  tipoConsolidacion: 'CONSOLIDADO_PARCIAL' | 'CONSOLIDADO_TOTAL';
  fechaConsolidado: string;
  usuario: string;
}

/** RF13: solicitud para el botón "Eval. Finalizada". */
export interface FinalizarEvaluacionCitRequest {
  codigoPeriodo: string;
  codigoEmpresa: string;
  fechaInicio: string;
  fechaFin: string;
  descripcionMotivo?: string | null;
  usuario: string;
}
