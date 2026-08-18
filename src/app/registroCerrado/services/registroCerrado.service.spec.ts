import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RegistroCerradoService } from './registroCerrado.service';
import { RegistroCerradoFilterRequest, RegistroCerradoPageResponse } from '../models/registroCerrado.model';
import { environment } from '../../../environments/environment';

describe('RegistroCerradoService', () => {
  let service: RegistroCerradoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/registro-cerrado`;

  const mockRequest: RegistroCerradoFilterRequest = {
    codigoPeriodo: 'PER-2025-01',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-03-31',
    codigoAsunto: '174',
    codigoEmpresa: 'ELUC'
  };

  const mockPage: RegistroCerradoPageResponse = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistroCerradoService]
    });
    service = TestBed.inject(RegistroCerradoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('buscar debería hacer POST a /buscar', () => {
    service.buscar(mockRequest).subscribe(p => expect(p).toEqual(mockPage));
    const httpReq = httpMock.expectOne(`${apiUrl}/buscar`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(mockRequest);
    httpReq.flush(mockPage);
  });

  it('contar debería hacer POST a /contar', () => {
    service.contar(mockRequest).subscribe(n => expect(n).toBe(5));
    const httpReq = httpMock.expectOne(`${apiUrl}/contar`);
    expect(httpReq.request.method).toBe('POST');
    httpReq.flush(5);
  });

  it('exportar debería hacer POST con responseType blob', () => {
    const mockBlob = new Blob(['data']);
    service.exportar(mockRequest).subscribe(b => expect(b).toEqual(mockBlob));
    const httpReq = httpMock.expectOne(`${apiUrl}/exportar`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.responseType).toBe('blob');
    httpReq.flush(mockBlob);
  });
});
