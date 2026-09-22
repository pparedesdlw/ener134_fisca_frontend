import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearToleranciaVigenciaRequest, ToleranciaVigencia } from '../models/toleranciaVigencia.model';

@Injectable({
  providedIn: 'root'
})
export class ToleranciaVigenciaService {
  private apiUrl = `${environment.apiUrl}/tolerancia-vigencia`;

  constructor(private http: HttpClient) { }

  listarHistorico(codigoIndicador: 'AIV' | 'CIT'): Observable<ToleranciaVigencia[]> {
    return this.http.get<ToleranciaVigencia[]>(`${this.apiUrl}/${codigoIndicador}`);
  }

  crear(request: CrearToleranciaVigenciaRequest): Observable<ToleranciaVigencia> {
    return this.http.post<ToleranciaVigencia>(this.apiUrl, request);
  }
}
