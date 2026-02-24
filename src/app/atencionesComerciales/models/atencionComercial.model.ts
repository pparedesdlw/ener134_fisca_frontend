export interface AtencionComercial {
  codigoAtencion: string;
  codigoEmpresa: string;
  codigoAsunto: string;
  fechaRecepcion: Date;
  fechaCreacion: Date;
  canalRecepcion: string;
  tipoDocumentoCliente: string;
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
}
