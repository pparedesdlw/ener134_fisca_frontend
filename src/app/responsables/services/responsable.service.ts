import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Responsable, ResponsableCreateRequest, ResponsableUpdateRequest } from '../models/responsable.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResponsableService {
  private apiUrl = `${environment.apiUrl}/responsable`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Responsable[]> {
    return this.http.get<Responsable[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Responsable[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Responsable[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<Responsable> {
    return this.http.get<Responsable>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoResponsable: string): Observable<Responsable> {
    return this.http.get<Responsable>(`${this.apiUrl}/codigo/${codigoResponsable}`);
  }

  crear(request: ResponsableCreateRequest): Observable<Responsable> {
    return this.http.post<Responsable>(`${this.apiUrl}/crear`, request);
  }

  editar(request: ResponsableUpdateRequest): Observable<Responsable> {
    return this.http.put<Responsable>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}