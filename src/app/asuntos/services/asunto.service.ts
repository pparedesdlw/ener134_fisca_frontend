import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asunto } from '../models/asunto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsuntoService {
  private apiUrl = `${environment.apiUrl}/asunto`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Asunto[]> {
    return this.http.get<Asunto[]>(`${this.apiUrl}/listar`);
  }

  listarPorEstado(estado: String): Observable<Asunto[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<Asunto[]>(`${this.apiUrl}/listar-por-estado`, { params });
    }

}
