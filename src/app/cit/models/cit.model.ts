export interface CalculoCitRequest {
  fechaInicio: string;
  fechaFin: string;
  codigoEmpresa: string;
  codigoAsunto?: string | null;
}

export interface DetalleItem4 {
  sinDetalleTh3: number;
  sinDetalleTh4: number;
  sinDetalleTh5: number;
  sinDetalleTh6: number;
  sinDetalleTh7: number;
  sinDetalleTh8: number;
}

export interface CitResultadoResponse {
  nmd: number;
  nta: number;
  incumplimientosItem1: number;
  incumplimientosItem2: number;
  incumplimientosItem3: number;
  incumplimientosItem4: number;
  detalleItem4: DetalleItem4;
  nrn: number;
  cit: number;
  tolerancia: number;
  superaTolerancia: boolean;
}

export interface TmAsunto {
  codigoAsunto: number;
  descripcionAsunto: string;
  codigoTablaComp?: string;
  estado?: string;
}

export interface IndicadorCit {
  codigoIndicadorCit?: string;
  codigoPeriodo: string;
  codigoEmpresa: string;
  codigoAtencion: string;
  cumpleItem1: string;
  cumpleItem3: string;
  cumpleItem4: string;
  numeroNrn: number;
  fechaRegistro?: string;
}

export interface AuditoriaCalculoCit {
  codigoAuditoriaCit?: string;
  codigoPeriodo: string;
  fechaInicioCalculo: string;
  fechaFinCalculo?: string;
  numeroTotalAtenciones: number;
  numeroAtencionesProcesadas: number;
  numeroAtencionesError: number;
  estado: string;
  porcentajeProgreso: number;
}

export interface IndisponibilidadSistema {
  codigoIndisponibilidad?: string;
  fechaInicioIndisponibilidad: string;
  fechaFinIndisponibilidad: string;
  motivo?: string;
  estado: string;
  fechaRegistro?: string;
}

export interface ResumenCit {
  codigoPeriodo: string;
  totalAtenciones: number;
  atencionesCumplen: number;
  atencionesNoCumplen: number;
  porcentajeCumplimiento: number;
  distribucionNrn: { [key: number]: number };
}

export interface ResumenCitEmpresa {
  codigoPeriodo: string;
  codigoEmpresa: string;
  totalAtenciones: number;
  atencionesCumplen: number;
  cumpleItem1: number;
  cumpleItem3: number;
  cumpleItem4: number;
  porcentajeCumplimientoItem1: number;
  porcentajeCumplimientoItem3: number;
  porcentajeCumplimientoItem4: number;
}
