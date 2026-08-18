/** RF11: punto de la evolución temporal de los indicadores AIV y CIT de una empresa. */
export interface EvolucionIndicadorPoint {
  codigoPeriodo: string;
  indicadorAiv: number | null;
  numeroRegistrosNoConformes: number | null;
  muestraDefinitiva: number | null;
  indicadorCit: number | null;
}

export interface EvolucionIndicadoresResponse {
  puntos: EvolucionIndicadorPoint[];
  toleranciaAiv: number | null;
  toleranciaCit: number | null;
}

/** RF11: punto del comparativo por empresa de los indicadores AIV y CIT para un periodo. */
export interface ComparativoEmpresaPoint {
  codigoEmpresa: number;
  indicadorAiv: number | null;
  numeroRegistrosNoConformes: number | null;
  indicadorCit: number | null;
}

export interface ComparativoIndicadoresResponse {
  puntos: ComparativoEmpresaPoint[];
  toleranciaAiv: number | null;
  toleranciaCit: number | null;
}
