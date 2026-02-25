export interface Empresa {
  id?: number;
  codigoEmpresa: string;
  razonSocial?: string;
  descripcion?: string;
  tipo?: string;
  deTipo?: string;
  ruc?: string;
  estado?: string;
  deEstado?: string;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}

export interface EmpresaCreateRequest {
  codigoEmpresa: string;
  razonSocial: string;
  descripcion: string;
  tipo: string;
  ruc: string;
  estado: string;
  usuarioCreacion: string;
}

export interface EmpresaUpdateRequest {
  id: number;
  codigoEmpresa: string;
  razonSocial: string;
  razonSocialAnt: string;
  descripcion: string;
  tipo: string;
  ruc: string;
  estado: string;
  usuarioModificacion: string;
}
