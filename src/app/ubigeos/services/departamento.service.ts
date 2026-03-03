import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento } from '../models/departamento.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {
  private apiUrl = `${environment.apiUrl}/ubigeo`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/listar-departamento`);
  }

}