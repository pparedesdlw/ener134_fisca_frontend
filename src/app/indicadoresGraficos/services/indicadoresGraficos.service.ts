import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComparativoIndicadoresResponse, EvolucionIndicadoresResponse } from '../models/indicadores.model';

@Injectable({ providedIn: 'root' })
export class IndicadoresGraficosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/indicadores-graficos`;

  evolucion(codigoEmpresa: number): Observable<EvolucionIndicadoresResponse> {
    return this.http.get<EvolucionIndicadoresResponse>(`${this.apiUrl}/evolucion`, {
      params: { codigoEmpresa: String(codigoEmpresa) }
    });
  }

  comparativo(codigoPeriodo: string): Observable<ComparativoIndicadoresResponse> {
    return this.http.get<ComparativoIndicadoresResponse>(`${this.apiUrl}/comparativo`, {
      params: { codigoPeriodo }
    });
  }
}
