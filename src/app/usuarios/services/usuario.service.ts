import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreateRequest, UsuarioUpdateRequest } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Usuario[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Usuario[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoUsuario: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/codigo/${codigoUsuario}`);
  }

  crear(request: UsuarioCreateRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/crear`, request);
  }

  editar(request: UsuarioUpdateRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}