import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RegistroCerradoFilterRequest,
  RegistroCerradoPageResponse
} from '../models/registroCerrado.model';

@Injectable({ providedIn: 'root' })
export class RegistroCerradoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/registro-cerrado`;

  buscar(request: RegistroCerradoFilterRequest): Observable<RegistroCerradoPageResponse> {
    return this.http.post<RegistroCerradoPageResponse>(`${this.apiUrl}/buscar`, request);
  }

  contar(request: RegistroCerradoFilterRequest): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/contar`, request);
  }

  exportar(request: RegistroCerradoFilterRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportar`, request, { responseType: 'blob' });
  }
}
