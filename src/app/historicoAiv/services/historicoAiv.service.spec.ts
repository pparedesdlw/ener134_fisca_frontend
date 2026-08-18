import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HistoricoAivService } from './historicoAiv.service';
import { HistoricoPreliminarResponse, HistoricoAccionResponse } from '../models/historicoAiv.model';
import { environment } from '../../../environments/environment';

describe('HistoricoAivService', () => {
  let service: HistoricoAivService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/historico-aiv`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HistoricoAivService]
    });
    service = TestBed.inject(HistoricoAivService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('preliminares debería hacer GET a /preliminares/{id}', () => {
    const mockPreliminares: HistoricoPreliminarResponse[] = [
      { id: 1, version: 1, estadoSnapshot: 'CONSOLIDADO_PARCIAL', indicadorAiv: 2.5, numeroRegistrosNoConformes: 2, muestraDefinitiva: 10, motivo: 'REAPERTURA', fechaSnapshot: '2025-01-01', usuario: 'admin' }
    ];
    service.preliminares(1).subscribe(l => expect(l).toEqual(mockPreliminares));
    const httpReq = httpMock.expectOne(`${apiUrl}/preliminares/1`);
    expect(httpReq.request.method).toBe('GET');
    httpReq.flush(mockPreliminares);
  });

  it('acciones debería hacer GET a /acciones/{id}', () => {
    const mockAcciones: HistoricoAccionResponse[] = [
      { id: 1, version: 1, accion: 'INICIO', detalle: 'Evaluación iniciada', usuario: 'admin', fechaAccion: '2025-01-01' }
    ];
    service.acciones(1).subscribe(l => expect(l).toEqual(mockAcciones));
    const httpReq = httpMock.expectOne(`${apiUrl}/acciones/1`);
    expect(httpReq.request.method).toBe('GET');
    httpReq.flush(mockAcciones);
  });
});
