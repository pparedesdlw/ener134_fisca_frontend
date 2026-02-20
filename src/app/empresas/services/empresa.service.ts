import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa, EmpresaCreateRequest, EmpresaUpdateRequest } from '../models/empresa.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = `${environment.apiUrl}/empresa`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Empresa[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Empresa[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoEmpresa: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/codigo/${codigoEmpresa}`);
  }

  crear(request: EmpresaCreateRequest): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}/crear`, request);
  }

  editar(request: EmpresaUpdateRequest): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
