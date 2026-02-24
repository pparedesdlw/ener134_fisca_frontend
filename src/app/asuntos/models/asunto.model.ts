export interface Asunto {
  codigoAsunto: string;
  descripcion: string;
  estado: string;
  deEstado?: string;
  usuarioCreacion?: string;
  FechaCreacion?: string;
}