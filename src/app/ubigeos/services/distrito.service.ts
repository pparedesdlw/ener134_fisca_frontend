import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Distrito } from '../models/distrito.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DistritoService {
  private apiUrl = `${environment.apiUrl}/ubigeo`;

  constructor(private http: HttpClient) { }

  listarTodos(codigoDepartamento: String, codigoProvincia: String): Observable<Distrito[]> {
    const params = new HttpParams()
            .set('codigoDepartamento', codigoDepartamento.toString())
            .set('codigoProvincia', codigoProvincia.toString());
    
    return this.http.get<Distrito[]>(`${this.apiUrl}/listar-distrito`, { params });
  }

}