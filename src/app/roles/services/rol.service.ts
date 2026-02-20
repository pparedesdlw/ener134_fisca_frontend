import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol, RolCreateRequest, RolUpdateRequest } from '../models/rol.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiUrl}/rol`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Rol[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Rol[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoRol: string): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/codigo/${codigoRol}`);
  }

  crear(request: RolCreateRequest): Observable<Rol> {
    return this.http.post<Rol>(`${this.apiUrl}/crear`, request);
  }

  editar(request: RolUpdateRequest): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
