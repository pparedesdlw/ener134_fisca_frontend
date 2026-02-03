import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Periodo, PeriodoCreateRequest, PeriodoUpdateRequest, AmpliacionVigenciaRequest } from '../models/periodo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {
  private apiUrl = `${environment.apiUrl}/periodo`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estadoActivo: boolean): Observable<Periodo[]> {
    const params = new HttpParams().set('estadoActivo', estadoActivo.toString());
    return this.http.get<Periodo[]>(`${this.apiUrl}/listar-por-estado`, { params });
  }

  obtenerPorId(id: number): Observable<Periodo> {
    return this.http.get<Periodo>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCodigo(codigoPeriodo: string): Observable<Periodo> {
    return this.http.get<Periodo>(`${this.apiUrl}/codigo/${codigoPeriodo}`);
  }

  crear(request: PeriodoCreateRequest): Observable<Periodo> {
    return this.http.post<Periodo>(`${this.apiUrl}/crear`, request);
  }

  editar(request: PeriodoUpdateRequest): Observable<Periodo> {
    return this.http.put<Periodo>(`${this.apiUrl}/editar`, request);
  }

  cambiarEstado(id: number, nuevoEstado: boolean, usuarioModificacion: string): Observable<Periodo> {
    const params = new HttpParams()
      .set('nuevoEstado', nuevoEstado.toString())
      .set('usuarioModificacion', usuarioModificacion);
    return this.http.patch<Periodo>(`${this.apiUrl}/${id}/cambiar-estado`, null, { params });
  }

  ampliarVigencia(request: AmpliacionVigenciaRequest): Observable<Periodo> {
    return this.http.patch<Periodo>(`${this.apiUrl}/ampliar-vigencia`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
