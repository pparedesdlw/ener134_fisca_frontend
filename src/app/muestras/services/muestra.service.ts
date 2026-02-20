import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Muestra, MuestraCreateRequest, MuestraUpdateRequest } from '../models/muestra.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MuestraService {
  private apiUrl = `${environment.apiUrl}/muestra`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Muestra[]> {
    return this.http.get<Muestra[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Muestra[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Muestra[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<Muestra> {
    return this.http.get<Muestra>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoMuestra: string): Observable<Muestra> {
    return this.http.get<Muestra>(`${this.apiUrl}/codigo/${codigoMuestra}`);
  }

  crear(request: MuestraCreateRequest): Observable<Muestra> {
    return this.http.post<Muestra>(`${this.apiUrl}/crear`, request);
  }

  editar(request: MuestraUpdateRequest): Observable<Muestra> {
    return this.http.put<Muestra>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
