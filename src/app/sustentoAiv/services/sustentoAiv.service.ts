import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SustentoAivResponse,
  SustentoMasivoRequest,
  SustentoMasivoResultado,
  SustentoUploadRequest
} from '../models/sustentoAiv.model';

@Injectable({ providedIn: 'root' })
export class SustentoAivService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sustento-aiv`;

  cargarIndividual(req: SustentoUploadRequest): Observable<SustentoAivResponse> {
    return this.http.post<SustentoAivResponse>(`${this.apiUrl}/individual`, req);
  }

  cargarMasivo(req: SustentoMasivoRequest): Observable<SustentoMasivoResultado> {
    return this.http.post<SustentoMasivoResultado>(`${this.apiUrl}/masivo`, req);
  }

  listarPorRegistro(idEvaluacionRegistro: number): Observable<SustentoAivResponse[]> {
    return this.http.get<SustentoAivResponse[]>(`${this.apiUrl}/por-registro/${idEvaluacionRegistro}`);
  }

  descargar(idSustento: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idSustento}/descargar`, { responseType: 'blob' });
  }

  eliminar(idSustento: number, usuario: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idSustento}`, { params: { usuario } });
  }
}
