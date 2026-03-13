export interface EmpresaConcesionaria {
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

export interface EmpresaConcesionariaCreateRequest {
  codigoEmpresa: string;
  razonSocial: string;
  descripcion: string;
  tipo: string;
  ruc: string;
  estado: string;
  usuarioCreacion: string;
}

export interface EmpresaConcesionariaUpdateRequest {
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
