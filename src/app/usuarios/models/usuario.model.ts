export interface Usuario {
  id?: number;
  codigoUsuario: string;
  nombreUsuario?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  perfil: string;
  nombrePerfil: string;
  estado?: boolean;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface UsuarioCreateRequest {
  codigoUsuario: string;
  nombreUsuario?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  perfil: string;
  usuarioCreacion: string;
}

export interface UsuarioUpdateRequest {
  id: number;
  codigoUsuario: string;
  nombreUsuario?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  perfil: string;
  usuarioModificacion: string;
}