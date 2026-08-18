import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EvaluacionCitService } from './evaluacionCit.service';
import { EvaluacionCitResponse, FinalizarEvaluacionCitRequest } from '../models/evaluacionCit.model';
import { environment } from '../../../environments/environment';

describe('EvaluacionCitService', () => {
  let service: EvaluacionCitService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/evaluacion-cit`;

  const mockEvaluacion: EvaluacionCitResponse = {
    id: 1,
    codigoPeriodo: 'PER-2025-01',
    codigoEmpresa: 'ELUC',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-03-31',
    motivo: null,
    nta: 4,
    nmd: 100,
    nrn: 6,
    indicadorCit: 1.5,
    incumplimientosItem1: 2,
    incumplimientosItem3: 1,
    incumplimientosItem4: 3,
    detalleItem4: { sinDetalleTh3: 1, sinDetalleTh4: 0, sinDetalleTh5: 1, sinDetalleTh6: 0, sinDetalleTh7: 1, sinDetalleTh8: 0 },
    tipoConsolidacion: 'CONSOLIDADO_TOTAL',
    fechaConsolidado: '31/07/2026 10:00:00',
    usuario: 'admin'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvaluacionCitService]
    });
    service = TestBed.inject(EvaluacionCitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('finalizar debería hacer POST a /finalizar', () => {
    const req: FinalizarEvaluacionCitRequest = {
      codigoPeriodo: 'PER-2025-01', codigoEmpresa: 'ELUC', fechaInicio: '2025-01-01', fechaFin: '2025-03-31', usuario: 'admin'
    };
    service.finalizar(req).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(`${apiUrl}/finalizar`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(req);
    httpReq.flush(mockEvaluacion);
  });

  it('vigente debería hacer GET a /vigente con params', () => {
    service.vigente('PER-2025-01', 'ELUC').subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/vigente`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.params.get('codigoPeriodo')).toBe('PER-2025-01');
    expect(httpReq.request.params.get('codigoEmpresa')).toBe('ELUC');
    httpReq.flush(mockEvaluacion);
  });

  it('historico debería hacer GET a /historico con params', () => {
    service.historico('PER-2025-01', 'ELUC').subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/historico`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.params.get('codigoPeriodo')).toBe('PER-2025-01');
    expect(httpReq.request.params.get('codigoEmpresa')).toBe('ELUC');
    httpReq.flush(mockEvaluacion);
  });
});
