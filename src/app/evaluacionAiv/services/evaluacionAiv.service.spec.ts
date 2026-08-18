import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EvaluacionAivService } from './evaluacionAiv.service';
import {
  EvaluacionAivResponse,
  EvaluacionAivResumenResponse,
  EvaluacionAivConsolidadaResponse,
  IniciarEvaluacionRequest,
  EvaluarRegistroRequest,
  ConsolidarEvaluacionRequest,
  ReabrirEvaluacionRequest,
  ReemplazarRegistroEvaluacionRequest
} from '../models/evaluacionAiv.model';
import { environment } from '../../../environments/environment';

describe('EvaluacionAivService', () => {
  let service: EvaluacionAivService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/evaluacion-aiv`;

  const mockEvaluacion: EvaluacionAivResponse = {
    id: 1,
    codigoPeriodo: 'PER-2025-01',
    codigoEmpresa: 1,
    idMuestraAiv: 1,
    fechaInicio: '2025-01-01',
    fechaFin: '2025-03-31',
    estadoEvaluacion: 'EN_PROCESO',
    totalAtenciones: 100,
    muestraDefinitiva: 10,
    numeroRegistrosNoConformes: 2,
    indicadorAiv: 2.0,
    fechaConsolidado: null,
    toleranciaAplicable: 5,
    superaTolerancia: false,
    itemsResumen: [],
    registros: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EvaluacionAivService]
    });
    service = TestBed.inject(EvaluacionAivService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('iniciar debería hacer POST a /iniciar', () => {
    const req: IniciarEvaluacionRequest = { codigoPeriodo: 'PER-2025-01', codigoEmpresa: 1, idMuestraAiv: 1, usuario: 'admin' };
    service.iniciar(req).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(`${apiUrl}/iniciar`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(req);
    httpReq.flush(mockEvaluacion);
  });

  it('evaluarRegistro debería hacer PUT a /evaluar-registro', () => {
    const req: EvaluarRegistroRequest = { idEvaluacionRegistro: 1, usuario: 'admin', items: [] };
    service.evaluarRegistro(req).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(`${apiUrl}/evaluar-registro`);
    expect(httpReq.request.method).toBe('PUT');
    httpReq.flush(mockEvaluacion);
  });

  it('consolidar debería hacer POST a /consolidar', () => {
    const req: ConsolidarEvaluacionRequest = { idEvaluacionAiv: 1, usuario: 'admin' };
    service.consolidar(req).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(`${apiUrl}/consolidar`);
    expect(httpReq.request.method).toBe('POST');
    httpReq.flush(mockEvaluacion);
  });

  it('reabrir debería hacer POST a /reabrir', () => {
    const req: ReabrirEvaluacionRequest = {
      idEvaluacionAiv: 1, motivo: 'Corrección', tipoReapertura: 'Corrección de evaluación',
      nombreArchivoSustento: 'a.pdf', tipoMimeSustento: 'application/pdf', contenidoSustentoBase64: 'YWJj', usuario: 'admin'
    };
    service.reabrir(req).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(`${apiUrl}/reabrir`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(req);
    httpReq.flush(mockEvaluacion);
  });

  it('reemplazarRegistro debería hacer POST a /reemplazar-registro', () => {
    const req: ReemplazarRegistroEvaluacionRequest = { idEvaluacionRegistroPrincipal: 1, idEvaluacionRegistroAdicional: 2, usuario: 'admin' };
    service.reemplazarRegistro(req).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(`${apiUrl}/reemplazar-registro`);
    expect(httpReq.request.method).toBe('POST');
    httpReq.flush(mockEvaluacion);
  });

  it('obtenerPorId debería hacer GET a /{id}', () => {
    service.obtenerPorId(1).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(`${apiUrl}/1`);
    expect(httpReq.request.method).toBe('GET');
    httpReq.flush(mockEvaluacion);
  });

  it('obtenerVigente debería hacer GET a /vigente con params', () => {
    service.obtenerVigente('PER-2025-01', 1).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/vigente`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.params.get('codigoPeriodo')).toBe('PER-2025-01');
    expect(httpReq.request.params.get('codigoEmpresa')).toBe('1');
    httpReq.flush(mockEvaluacion);
  });

  it('obtenerHistoricoPreliminar debería hacer GET a /historico-preliminar', () => {
    service.obtenerHistoricoPreliminar('PER-2025-01', 1).subscribe(e => expect(e).toEqual(mockEvaluacion));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/historico-preliminar`);
    expect(httpReq.request.method).toBe('GET');
    httpReq.flush(mockEvaluacion);
  });

  it('listarEnProcesoOReabiertas debería omitir params no provistos', () => {
    const mockLista: EvaluacionAivResumenResponse[] = [];
    service.listarEnProcesoOReabiertas().subscribe(l => expect(l).toEqual(mockLista));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/en-proceso`);
    expect(httpReq.request.params.keys().length).toBe(0);
    httpReq.flush(mockLista);
  });

  it('listarEnProcesoOReabiertas debería incluir los params provistos', () => {
    service.listarEnProcesoOReabiertas('PER-2025-01', 1, '2025-02-01').subscribe();
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/en-proceso`);
    expect(httpReq.request.params.get('codigoPeriodo')).toBe('PER-2025-01');
    expect(httpReq.request.params.get('codigoEmpresa')).toBe('1');
    expect(httpReq.request.params.get('fechaEvaluada')).toBe('2025-02-01');
    httpReq.flush([]);
  });

  it('listarConsolidadas debería incluir tipoConsolidacion cuando se provee', () => {
    const mockLista: EvaluacionAivConsolidadaResponse[] = [];
    service.listarConsolidadas('PER-2025-01', 1, undefined, 'CONSOLIDADO_TOTAL').subscribe(l => expect(l).toEqual(mockLista));
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/consolidadas`);
    expect(httpReq.request.params.get('tipoConsolidacion')).toBe('CONSOLIDADO_TOTAL');
    httpReq.flush(mockLista);
  });

  it('exportar debería hacer GET con responseType blob', () => {
    const mockBlob = new Blob(['data']);
    service.exportar(1).subscribe(b => expect(b).toEqual(mockBlob));
    const httpReq = httpMock.expectOne(`${apiUrl}/1/exportar`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.responseType).toBe('blob');
    httpReq.flush(mockBlob);
  });
});
