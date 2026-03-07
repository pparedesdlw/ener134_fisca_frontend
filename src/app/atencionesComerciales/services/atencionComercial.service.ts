import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtencionComercial, AccionResponse, InfoTecnicaCierreResponse } from '../models/atencionComercial.model';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AtencionComercialService {
  private apiUrl = `${environment.apiUrl}/atencion-comercial`;
  private apiUrlPeriodo = `${environment.apiUrl}/periodo`;
  private apiUrlCit = `${environment.apiUrl}/cit`;

  constructor(private http: HttpClient) { }

  listarTodos(page: number, size: number): Observable<AtencionComercial[]> {
    const params = new HttpParams().set('page', page.toString())
                                   .set('size', size.toString())
    ;
    return this.http.get<AtencionComercial[]>(`${this.apiUrl}/listar?`, { params });
  }
  

  listarPorEstado(estado: String): Observable<AtencionComercial[]> {
      const params = new HttpParams().set('estado', estado.toString());
      return this.http.get<AtencionComercial[]>(`${this.apiUrl}/listar-por-estado`, { params });
  }

  
  listarPage(fechaIni: String , fechaFin: String, descripcionMotivo: String,
                nombreCliente: String, groupEmpresas: String
  ): Observable<AtencionComercial[]> {
      
      let params = new HttpParams()
        .set('fechaIni', fechaIni.toString())
        .set('fechaFin', fechaFin.toString())
        .set('descripcionMotivo', descripcionMotivo.toString())
        .set('nombreCliente', nombreCliente.toString())
        .set('groupsEmpresa', groupEmpresas.trim());

      return this.  http.get<AtencionComercial[]>(`${this.apiUrl}/listar-page`, { params });
  }

  listarAcciones(codigoEmpresa: string, codigoAtencion: string): Observable<AccionResponse[]> {
    return this.http.get<AccionResponse[]>(`${this.apiUrlCit}/info-tecnica/${codigoEmpresa}/${codigoAtencion}/acciones`);
  }

  obtenerInfoTecnica(codigoEmpresa: string, codigoAtencion: string): Observable<InfoTecnicaCierreResponse> {
    return this.http.get<InfoTecnicaCierreResponse>(`${this.apiUrlCit}/info-tecnica/${codigoEmpresa}/${codigoAtencion}`);
  }
  
}