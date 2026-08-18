export interface CalculoCitRequest {
  fechaInicio: string;
  fechaFin: string;
  codigoEmpresa: string;
  codigoPeriodo: string;
  descripcionMotivo?: string | null;
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

export interface Motivo {
  descripcionMotivo: string;
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

export interface AtencionResponse {
  codigoEmpresa: string;
  codigoAtencion: string;
  codigoAsunto: string;
  descripcionAsunto: string;
  fechaCreacion: string;
  fechaRecepcion: string;
  estadoAtencion: string;
  tieneCierre: boolean;
}

export interface AccionResponse {
  codigoAccion: string;
  codigoPeriodo: string;
  fechaRegistroAccion: string;
  descripcionAccionRealizada: string;
  codigoEstadoAtencion: number;
  descripcionEstadoAtencion: string;
  fechaNotificacionRespuesta: string;
  codigoDocReclamo: string;
  esCerrado: boolean;
}

export interface InfoTecnicaCierreResponse {
  tipoTh: number;
  nombreTabla: string;
  existeRegistro: boolean;
  estadoCerrado: boolean;
  codigoAsunto: string;
  descripcionAsunto: string;
  codigoEmpresa: string;
  codigoAtencion: string;
  datosTh3: Th3Data[] | null;
  datosTh4: Th4Data[] | null;
  datosTh5: Th5Data[] | null;
  datosTh6: Th6Data[] | null;
  datosTh7: Th7Data[] | null;
  datosTh8: Th8Data[] | null;
}

export interface Th3Data {
  codigoPeriodo: string;
  codigoAccion: string;
  codigoInterrupcionElectrica: string;
  fechaInterrupcionInicio: string;
  fechaInterrupcionFin: string;
  numeroSuministrosAfectados: number;
  codigoFaseInterrupcion: string;
  numeroPotenciaInterrumpida: number;
  numeroEnergiaNoSuministrada: number;
  numeroMotivoFalla: string;
  descripcionMotivoFalla: string;
  descripcionLocalizacionFalla: string;
  descripcionSustentacionTecnicaA: string;
  descripcionSustentacionTecnicaB: string;
  descripcionSustentacionTecnicaC: string;
  descripcionAccionInterrupcionSubestacion: string;
  descripcionCaracteristicasPuntoOperacion: string;
  codigoActaInspeccion: string;
  numeroAtenciones12Meses: number;
  fechaCreacion: string;
}

export interface Th4Data {
  codigoPeriodo: string;
  codigoAccion: string;
  codigoAlimentador: string;
  codigoSed: string;
  numeroTipoConexion: number;
  numeroUsuariosAfectados: number;
  descripcionSuministrosAfectadosTension: string;
  numeroCausaTension: number;
  descripcionSustentacionTecnicaCausa: string;
  numeroMedidaAtencion: number;
  fechaUltimaMedidaAtencion: string;
  descripcionSustentacionTecnicaNoSobrepasar: string;
  numeroUtmX: number;
  numeroUtmY: number;
  numeroAtenciones12Meses: number;
  fechaCreacion: string;
}

export interface Th5Data {
  codigoPeriodo: string;
  codigoAccion: string;
  codigoSed: string;
  numeroIrregularidad: number;
  numeroZonaFacturacion: number;
  numeroSuministrosAfectadosIrregularidad: number;
  codigoMesFacturacion: string;
  descripcionMedidaCorrectiva: string;
  descripcionSustentacionFacturacionNoIrregular: string;
  numeroAtenciones12MesesIrregularidad: number;
  fechaCreacion: string;
}

export interface Th6Data {
  codigoPeriodo: string;
  codigoAccion: string;
  codigoSistemaElectrico: string;
  codigoSed: string;
  numeroSectorDistribucion: number;
  fechaVerificacionCampo: string;
  numeroDeficienciaTipica: number;
  codigoUap: string;
  fechaSubsanacionDeficiencia: string;
  codigoOrdenTrabajo: string;
  fechaSolicitudAmpliacion: string;
  numeroAtenciones12Meses: number;
  fechaCreacion: string;
}

export interface Th7Data {
  codigoPeriodo: string;
  codigoAccion: string;
  codigoSistemaElectrico: string;
  codigoAlimentador: string;
  codigoSed: string;
  numeroTipoRiesgo: number;
  codigoElementoRiesgo: string;
  descripcionEvaluacionRiesgo: string;
  descripcionCausaRiesgo: string;
  descripcionMedidasRiesgo: string;
  numeroCumplimientoSubsanacion: number;
  descripcionCausaNoSubsanacion: string;
  numeroUtmX: number;
  numeroUtmY: number;
  numeroAtenciones12Meses: number;
  fechaCreacion: string;
}

export interface Th8Data {
  codigoPeriodo: string;
  codigoAccion: string;
  codigoCentroAtencion: string;
  codigoPresupuesto: string;
  descripcionTipoConexion: string;
  descripcionTipoAcometida: string;
  numeroOpcionTarifaInicio: number;
  numeroOpcionTarifaFin: number;
  numeroPotenciaKw: number;
  fechaCreacion: string;
}
