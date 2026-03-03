import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provincia } from '../models/provincia.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {
  private apiUrl = `${environment.apiUrl}/ubigeo`;

  constructor(private http: HttpClient) { }

  listarTodos(codigoDepartamento: String): Observable<Provincia[]> {
    const params = new HttpParams().set('codigoDepartamento', codigoDepartamento.toString());
    return this.http.get<Provincia[]>(`${this.apiUrl}/listar-provincia`, { params });
  }

}