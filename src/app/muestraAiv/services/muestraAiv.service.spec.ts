import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MuestraAivService } from './muestraAiv.service';
import { MuestraAivResponse, GenerarMuestraAivRequest, ReemplazoMuestraRequest } from '../models/muestraAiv.model';
import { environment } from '../../../environments/environment';

describe('MuestraAivService', () => {
  let service: MuestraAivService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/muestra-aiv`;

  const mockMuestra: MuestraAivResponse = {
    id: 1,
    codigoPeriodo: 'PER-2025-01',
    codigoEmpresa: 1,
    poblacion: 1000,
    tamanioBase: 100,
    porcentajeAdicional: 10,
    tamanioFinal: 110,
    estadoMuestra: 'GENERADA',
    seedAleatorio: 12345,
    fechaGeneracion: '2025-01-01',
    detalle: [],
    distribucion: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MuestraAivService]
    });
    service = TestBed.inject(MuestraAivService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('generar debería hacer POST a /generar', () => {
    const req: GenerarMuestraAivRequest = { codigoPeriodo: 'PER-2025-01', fechaInicio: '2025-01-01', fechaFin: '2025-03-31', codigoEmpresa: 'ELUC', usuario: 'admin' };
    service.generar(req).subscribe(m => expect(m).toEqual(mockMuestra));
    const httpReq = httpMock.expectOne(`${apiUrl}/generar`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(req);
    httpReq.flush(mockMuestra);
  });

  it('vigente debería hacer GET a /vigente con params', () => {
    service.vigente('PER-2025-01', 1).subscribe(m => expect(m).toEqual(mockMuestra));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/vigente`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.params.get('codigoPeriodo')).toBe('PER-2025-01');
    expect(httpReq.request.params.get('codigoEmpresa')).toBe('1');
    httpReq.flush(mockMuestra);
  });

  it('obtenerPorId debería hacer GET a /{id}', () => {
    service.obtenerPorId(1).subscribe(m => expect(m).toEqual(mockMuestra));
    const httpReq = httpMock.expectOne(`${apiUrl}/1`);
    expect(httpReq.request.method).toBe('GET');
    httpReq.flush(mockMuestra);
  });

  it('reemplazar debería hacer POST a /reemplazar', () => {
    const req: ReemplazoMuestraRequest = { idMuestraDetalle: 1, motivo: 'No ubicado', usuario: 'admin' };
    service.reemplazar(req).subscribe(m => expect(m).toEqual(mockMuestra));
    const httpReq = httpMock.expectOne(`${apiUrl}/reemplazar`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(req);
    httpReq.flush(mockMuestra);
  });
});
