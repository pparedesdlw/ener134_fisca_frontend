export interface Rol {
  id?: number;
  codigoRol: string;
  responsableRol?: string;
  descripcionRol: string;
  estado?: string;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface RolCreateRequest {
  codigoRol: string;
  responsableRol?: string;
  descripcionRol: string;
  estado: string;
  usuarioCreacion: string;
}

export interface RolUpdateRequest {
  id: number;
  codigoRol: string;
  responsableRol?: string;
  descripcionRol: string;
  estado: string;
  usuarioModificacion: string;
}