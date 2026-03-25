import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaConcesionaria, EmpresaConcesionariaCreateRequest, EmpresaConcesionariaUpdateRequest } from '../models/empresa-concesionaria.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaConcesionariaService {
  private apiUrl = `${environment.apiUrl}/empresa-concesionaria`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<EmpresaConcesionaria[]> {
    return this.http.get<EmpresaConcesionaria[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<EmpresaConcesionaria[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<EmpresaConcesionaria[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<EmpresaConcesionaria> {
    return this.http.get<EmpresaConcesionaria>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoEmpresa: string): Observable<EmpresaConcesionaria> {
    return this.http.get<EmpresaConcesionaria>(`${this.apiUrl}/codigo/${codigoEmpresa}`);
  }

  crear(request: EmpresaConcesionariaCreateRequest): Observable<EmpresaConcesionaria> {
    return this.http.post<EmpresaConcesionaria>(`${this.apiUrl}/crear`, request);
  }

  editar(request: EmpresaConcesionariaUpdateRequest): Observable<EmpresaConcesionaria> {
    return this.http.put<EmpresaConcesionaria>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {});
  }
}
