import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistoricoAccionResponse, HistoricoPreliminarResponse } from '../models/historicoAiv.model';

@Injectable({ providedIn: 'root' })
export class HistoricoAivService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/historico-aiv`;

  preliminares(idEvaluacion: number): Observable<HistoricoPreliminarResponse[]> {
    return this.http.get<HistoricoPreliminarResponse[]>(`${this.apiUrl}/preliminares/${idEvaluacion}`);
  }

  acciones(idEvaluacion: number): Observable<HistoricoAccionResponse[]> {
    return this.http.get<HistoricoAccionResponse[]>(`${this.apiUrl}/acciones/${idEvaluacion}`);
  }
}
