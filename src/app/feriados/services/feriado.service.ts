import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feriado, FeriadoCreateRequest, FeriadoUpdateRequest } from '../models/feriado.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeriadoService {
  private apiUrl = `${environment.apiUrl}/feriado`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Feriado[]> {
    return this.http.get<Feriado[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Feriado[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Feriado[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

  obtenerPorId(id: number): Observable<Feriado> {
    return this.http.get<Feriado>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoFeriado: string): Observable<Feriado> {
    return this.http.get<Feriado>(`${this.apiUrl}/codigo/${codigoFeriado}`);
  }

  crear(request: FeriadoCreateRequest): Observable<Feriado> {
    return this.http.post<Feriado>(`${this.apiUrl}/crear`, request);
  }

  editar(request: FeriadoUpdateRequest): Observable<Feriado> {
    return this.http.put<Feriado>(`${this.apiUrl}/editar`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}