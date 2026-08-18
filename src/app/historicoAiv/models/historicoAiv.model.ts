export interface HistoricoPreliminarResponse {
  id: number;
  version: number;
  estadoSnapshot: string;
  indicadorAiv: number;
  numeroRegistrosNoConformes: number;
  muestraDefinitiva: number;
  motivo: string;
  fechaSnapshot: string;
  usuario: string;
}

export interface HistoricoAccionResponse {
  id: number;
  version: number;
  accion: string;
  detalle: string;
  usuario: string;
  fechaAccion: string;
}
