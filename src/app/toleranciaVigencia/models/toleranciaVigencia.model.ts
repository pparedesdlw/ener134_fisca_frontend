export interface ToleranciaVigencia {
  id: number;
  codigoIndicador: 'AIV' | 'CIT';
  tolerancia: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string | null;
  usuarioCreacion: string;
}

export interface CrearToleranciaVigenciaRequest {
  codigoIndicador: 'AIV' | 'CIT';
  tolerancia: number;
  fechaVigenciaDesde: string;
  usuario: string;
}
