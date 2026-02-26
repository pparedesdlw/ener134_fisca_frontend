export interface AtencionComercial {
  codigoAtencion: string;
  codigoEmpresa: string;
  codigoAsunto: string;
  fechaRecepcion: Date;
  fechaCreacion: Date;
  canalRecepcion: string;
  tipoDocumentoCliente: string;
  descripcionTipoDocumento: string;
  numeroDocumentoCliente: string;
  nombreCliente: string;
  apellidoCliente: string;
  numeroSuministro: string;
  correoElectronico: string;
  telefonoContacto: string;
  direccion: string;
  ubigeo: string;
  fechaMaxima: Date;
  observacion: string;
  descripcionAsunto: string;
  descripcionCanal: string;
  razonSocial: string;
  estadoAtencion: string;
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
