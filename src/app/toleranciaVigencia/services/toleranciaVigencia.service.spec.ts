import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToleranciaVigenciaService } from './toleranciaVigencia.service';
import { environment } from '../../../environments/environment';

describe('ToleranciaVigenciaService', () => {
  let service: ToleranciaVigenciaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tolerancia-vigencia`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ToleranciaVigenciaService]
    });
    service = TestBed.inject(ToleranciaVigenciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería listar el histórico del indicador solicitado', () => {
    service.listarHistorico('AIV').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/AIV`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('debería registrar una nueva vigencia con POST', () => {
    const request = { codigoIndicador: 'AIV' as const, tolerancia: 7, fechaVigenciaDesde: '2026-04-01', usuario: 'fdiaz' };
    service.crear(request).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });
});
