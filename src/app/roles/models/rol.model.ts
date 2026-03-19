export interface Rol {
  id?: number;
  codigoRol: string;
  responsableRol?: string;
  descripcionRol: string;
  estado?: boolean;
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
  usuarioCreacion: string;
}

export interface RolUpdateRequest {
  id: number;
  codigoRol: string;
  responsableRol?: string;
  descripcionRol: string;
  usuarioModificacion: string;
}
