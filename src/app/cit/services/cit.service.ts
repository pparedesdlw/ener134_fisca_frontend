import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CalculoCitRequest,
  CitResultadoResponse,
  AuditoriaCalculoCit,
  IndicadorCit,
  ResumenCit,
  ResumenCitEmpresa,
  IndisponibilidadSistema,
  TmAsunto,
  InfoTecnicaCierreResponse,
  AtencionResponse,
  AccionResponse
} from '../models/cit.model';

@Injectable({
  providedIn: 'root'
})
export class CitService {
  private apiUrl = `${environment.apiUrl}/cit`;

  constructor(private http: HttpClient) { }

  calcularCit(request: CalculoCitRequest): Observable<CitResultadoResponse> {
    return this.http.post<CitResultadoResponse>(`${this.apiUrl}/calculo/calcular`, request);
  }

  listarAsuntos(): Observable<TmAsunto[]> {
    return this.http.get<TmAsunto[]>(`${this.apiUrl}/resumen/asuntos`);
  }

  obtenerResumenPorPeriodo(codigoPeriodo: string): Observable<ResumenCit> {
    return this.http.get<ResumenCit>(`${this.apiUrl}/resumen/periodo/${codigoPeriodo}`);
  }

  obtenerResumenPorEmpresa(codigoPeriodo: string, codigoEmpresa: string): Observable<ResumenCitEmpresa> {
    return this.http.get<ResumenCitEmpresa>(`${this.apiUrl}/resumen/periodo/${codigoPeriodo}/empresa/${codigoEmpresa}`);
  }

  listarIndicadoresPorPeriodo(codigoPeriodo: string): Observable<IndicadorCit[]> {
    return this.http.get<IndicadorCit[]>(`${this.apiUrl}/resumen/indicadores/${codigoPeriodo}`);
  }

  listarIndisponibilidades(): Observable<IndisponibilidadSistema[]> {
    return this.http.get<IndisponibilidadSistema[]>(`${this.apiUrl}/indisponibilidad/listar`);
  }

  listarIndisponibilidadesActivas(): Observable<IndisponibilidadSistema[]> {
    return this.http.get<IndisponibilidadSistema[]>(`${this.apiUrl}/indisponibilidad/activas`);
  }

  registrarIndisponibilidad(indisponibilidad: Partial<IndisponibilidadSistema>): Observable<IndisponibilidadSistema> {
    return this.http.post<IndisponibilidadSistema>(`${this.apiUrl}/indisponibilidad/registrar`, indisponibilidad);
  }

  desactivarIndisponibilidad(id: string): Observable<IndisponibilidadSistema> {
    return this.http.put<IndisponibilidadSistema>(`${this.apiUrl}/indisponibilidad/${id}/desactivar`, null);
  }

  obtenerInfoTecnica(codigoEmpresa: string, codigoAtencion: string): Observable<InfoTecnicaCierreResponse> {
    return this.http.get<InfoTecnicaCierreResponse>(`${this.apiUrl}/info-tecnica/${codigoEmpresa}/${codigoAtencion}`);
  }

  listarAtenciones(codigoEmpresa: string, fechaInicio: string, fechaFin: string, codigoAsunto?: string): Observable<AtencionResponse[]> {
    let params = `codigoEmpresa=${codigoEmpresa}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    if (codigoAsunto) {
      params += `&codigoAsunto=${codigoAsunto}`;
    }
    return this.http.get<AtencionResponse[]>(`${this.apiUrl}/info-tecnica/atenciones?${params}`);
  }

  listarAcciones(codigoEmpresa: string, codigoAtencion: string): Observable<AccionResponse[]> {
    return this.http.get<AccionResponse[]>(`${this.apiUrl}/info-tecnica/${codigoEmpresa}/${codigoAtencion}/acciones`);
  }
}
