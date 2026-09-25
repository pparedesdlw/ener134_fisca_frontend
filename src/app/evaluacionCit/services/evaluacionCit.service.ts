import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EvaluacionCitResponse, FinalizarEvaluacionCitRequest, HistoricoPreliminarCitResponse } from '../models/evaluacionCit.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionCitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/evaluacion-cit`;

  /** RF13: botón "Eval. Finalizada" — recalcula y consolida en backend. */
  finalizar(req: FinalizarEvaluacionCitRequest): Observable<EvaluacionCitResponse> {
    return this.http.post<EvaluacionCitResponse>(`${this.apiUrl}/finalizar`, req);
  }

  vigente(codigoPeriodo: string, codigoEmpresa: string): Observable<EvaluacionCitResponse> {
    return this.http.get<EvaluacionCitResponse>(`${this.apiUrl}/vigente`, {
      params: { codigoPeriodo, codigoEmpresa }
    });
  }

  /** RF14: histórico preliminar CIT del trimestre (consolidado vigente + cálculo actual). */
  historico(codigoPeriodo: string, codigoEmpresa: string): Observable<HistoricoPreliminarCitResponse> {
    return this.http.get<HistoricoPreliminarCitResponse>(`${this.apiUrl}/historico`, {
      params: { codigoPeriodo, codigoEmpresa }
    });
  }
}
