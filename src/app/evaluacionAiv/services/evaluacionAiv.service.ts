import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConsolidarEvaluacionRequest,
  EstadoEvaluacionAiv,
  EvaluacionAivConsolidadaResponse,
  EvaluacionAivResponse,
  EvaluacionAivResumenResponse,
  EvaluarRegistroRequest,
  IniciarEvaluacionRequest,
  ReabrirEvaluacionRequest,
  ReemplazarRegistroEvaluacionRequest
} from '../models/evaluacionAiv.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionAivService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/evaluacion-aiv`;

  iniciar(req: IniciarEvaluacionRequest): Observable<EvaluacionAivResponse> {
    return this.http.post<EvaluacionAivResponse>(`${this.apiUrl}/iniciar`, req);
  }

  evaluarRegistro(req: EvaluarRegistroRequest): Observable<EvaluacionAivResponse> {
    return this.http.put<EvaluacionAivResponse>(`${this.apiUrl}/evaluar-registro`, req);
  }

  consolidar(req: ConsolidarEvaluacionRequest): Observable<EvaluacionAivResponse> {
    return this.http.post<EvaluacionAivResponse>(`${this.apiUrl}/consolidar`, req);
  }

  reabrir(req: ReabrirEvaluacionRequest): Observable<EvaluacionAivResponse> {
    return this.http.post<EvaluacionAivResponse>(`${this.apiUrl}/reabrir`, req);
  }

  reemplazarRegistro(req: ReemplazarRegistroEvaluacionRequest): Observable<EvaluacionAivResponse> {
    return this.http.post<EvaluacionAivResponse>(`${this.apiUrl}/reemplazar-registro`, req);
  }

  obtenerPorId(id: number): Observable<EvaluacionAivResponse> {
    return this.http.get<EvaluacionAivResponse>(`${this.apiUrl}/${id}`);
  }

  obtenerVigente(codigoPeriodo: string, codigoEmpresa: number): Observable<EvaluacionAivResponse> {
    return this.http.get<EvaluacionAivResponse>(`${this.apiUrl}/vigente`, {
      params: { codigoPeriodo, codigoEmpresa: String(codigoEmpresa) }
    });
  }

  obtenerHistoricoPreliminar(codigoPeriodo: string, codigoEmpresa: number): Observable<EvaluacionAivResponse> {
    return this.http.get<EvaluacionAivResponse>(`${this.apiUrl}/historico-preliminar`, {
      params: { codigoPeriodo, codigoEmpresa: String(codigoEmpresa) }
    });
  }

  listarEnProcesoOReabiertas(codigoPeriodo?: string, codigoEmpresa?: number, fechaEvaluada?: string): Observable<EvaluacionAivResumenResponse[]> {
    const params: Record<string, string> = {};
    if (codigoPeriodo) params['codigoPeriodo'] = codigoPeriodo;
    if (codigoEmpresa != null) params['codigoEmpresa'] = String(codigoEmpresa);
    if (fechaEvaluada) params['fechaEvaluada'] = fechaEvaluada;
    return this.http.get<EvaluacionAivResumenResponse[]>(`${this.apiUrl}/en-proceso`, { params });
  }

  /** RF09: evaluaciones consolidadas (parcial o total) para la pantalla de reapertura, con filtros opcionales. */
  listarConsolidadas(
    codigoPeriodo?: string, codigoEmpresa?: number, fechaEvaluada?: string, tipoConsolidacion?: EstadoEvaluacionAiv
  ): Observable<EvaluacionAivConsolidadaResponse[]> {
    const params: Record<string, string> = {};
    if (codigoPeriodo) params['codigoPeriodo'] = codigoPeriodo;
    if (codigoEmpresa != null) params['codigoEmpresa'] = String(codigoEmpresa);
    if (fechaEvaluada) params['fechaEvaluada'] = fechaEvaluada;
    if (tipoConsolidacion) params['tipoConsolidacion'] = tipoConsolidacion;
    return this.http.get<EvaluacionAivConsolidadaResponse[]>(`${this.apiUrl}/consolidadas`, { params });
  }

  exportar(idEvaluacionAiv: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idEvaluacionAiv}/exportar`, { responseType: 'blob' });
  }
}
