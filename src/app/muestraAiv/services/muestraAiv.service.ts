import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GenerarMuestraAivRequest,
  MuestraAivResponse,
  ReemplazoMuestraRequest
} from '../models/muestraAiv.model';

@Injectable({ providedIn: 'root' })
export class MuestraAivService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/muestra-aiv`;

  generar(request: GenerarMuestraAivRequest): Observable<MuestraAivResponse> {
    return this.http.post<MuestraAivResponse>(`${this.apiUrl}/generar`, request);
  }

  vigente(codigoPeriodo: string, codigoEmpresa: number): Observable<MuestraAivResponse> {
    return this.http.get<MuestraAivResponse>(`${this.apiUrl}/vigente`, {
      params: { codigoPeriodo, codigoEmpresa: String(codigoEmpresa) }
    });
  }

  obtenerPorId(id: number): Observable<MuestraAivResponse> {
    return this.http.get<MuestraAivResponse>(`${this.apiUrl}/${id}`);
  }

  reemplazar(request: ReemplazoMuestraRequest): Observable<MuestraAivResponse> {
    return this.http.post<MuestraAivResponse>(`${this.apiUrl}/reemplazar`, request);
  }
}
