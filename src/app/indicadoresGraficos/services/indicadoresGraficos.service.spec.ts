import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IndicadoresGraficosService } from './indicadoresGraficos.service';
import { EvolucionIndicadoresResponse, ComparativoIndicadoresResponse } from '../models/indicadores.model';
import { environment } from '../../../environments/environment';

describe('IndicadoresGraficosService', () => {
  let service: IndicadoresGraficosService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/indicadores-graficos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IndicadoresGraficosService]
    });
    service = TestBed.inject(IndicadoresGraficosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('evolucion debería hacer GET a /evolucion con el codigoEmpresa', () => {
    const mockResponse: EvolucionIndicadoresResponse = {
      puntos: [{ codigoPeriodo: 'PER-2025-01', indicadorAiv: 3.5, numeroRegistrosNoConformes: 3, muestraDefinitiva: 10, indicadorCit: 2.1 }],
      toleranciaAiv: 5, toleranciaCit: 5
    };
    service.evolucion(1).subscribe(r => expect(r).toEqual(mockResponse));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/evolucion`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.params.get('codigoEmpresa')).toBe('1');
    httpReq.flush(mockResponse);
  });

  it('comparativo debería hacer GET a /comparativo con el codigoPeriodo', () => {
    const mockResponse: ComparativoIndicadoresResponse = {
      puntos: [{ codigoEmpresa: 1, indicadorAiv: 3.5, numeroRegistrosNoConformes: 3, indicadorCit: 2.1 }],
      toleranciaAiv: 5, toleranciaCit: 5
    };
    service.comparativo('PER-2025-01').subscribe(r => expect(r).toEqual(mockResponse));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/comparativo`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.params.get('codigoPeriodo')).toBe('PER-2025-01');
    httpReq.flush(mockResponse);
  });
});
