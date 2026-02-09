import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parametro, ParametroCreateRequest, ParametroUpdateRequest } from '../models/parametro.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {
  private apiUrl = `${environment.apiUrl}/parametro`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Parametro[]> {
    return this.http.get<Parametro[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Parametro[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Parametro[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<Parametro> {
    return this.http.get<Parametro>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoParametro: string): Observable<Parametro> {
    return this.http.get<Parametro>(`${this.apiUrl}/codigo/${codigoParametro}`);
  }

  crear(request: ParametroCreateRequest): Observable<Parametro> {
    return this.http.post<Parametro>(`${this.apiUrl}/crear`, request);
  }

  editar(request: ParametroUpdateRequest): Observable<Parametro> {
    return this.http.put<Parametro>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}