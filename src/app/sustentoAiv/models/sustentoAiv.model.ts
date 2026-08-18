export interface SustentoAivResponse {
  id: number;
  idEvaluacionRegistro: number;
  codigoUnicoAtencion: string;
  nombreArchivo: string;
  tipoMime: string;
  tamanioBytes: number;
  hashSha256: string;
  origen: string;
  fechaCarga: string;
  usuarioCarga: string;
}

export interface SustentoUploadRequest {
  idEvaluacionRegistro: number;
  codigoUnicoAtencion: string;
  nombreArchivo: string;
  tipoMime: string;
  contenidoBase64: string;
  usuario: string;
}

export interface MapeoArchivoSustento {
  nombreArchivo: string;
  codigoUnicoAtencion: string;
}

export interface SustentoMasivoRequest {
  idEvaluacionAiv: number;
  nombreArchivoZip: string;
  contenidoZipBase64: string;
  usuario: string;
  mapeo?: MapeoArchivoSustento[];
}

export interface ArchivoRechazadoResponse {
  nombreArchivo: string;
  motivo: string;
}

export interface SustentoMasivoResultado {
  cargados: SustentoAivResponse[];
  rechazados: ArchivoRechazadoResponse[];
}
