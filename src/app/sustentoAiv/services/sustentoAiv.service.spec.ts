import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SustentoAivService } from './sustentoAiv.service';
import { SustentoAivResponse, SustentoUploadRequest, SustentoMasivoRequest, SustentoMasivoResultado } from '../models/sustentoAiv.model';
import { environment } from '../../../environments/environment';

describe('SustentoAivService', () => {
  let service: SustentoAivService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/sustento-aiv`;

  const mockSustento: SustentoAivResponse = {
    id: 1, idEvaluacionRegistro: 1, codigoUnicoAtencion: 'CU-0001', nombreArchivo: 'a.pdf',
    tipoMime: 'application/pdf', tamanioBytes: 1024, hashSha256: 'abc', origen: 'INDIVIDUAL',
    fechaCarga: '2025-01-01', usuarioCarga: 'admin'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SustentoAivService]
    });
    service = TestBed.inject(SustentoAivService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('cargarIndividual debería hacer POST a /individual', () => {
    const req: SustentoUploadRequest = { idEvaluacionRegistro: 1, codigoUnicoAtencion: 'CU-0001', nombreArchivo: 'a.pdf', tipoMime: 'application/pdf', contenidoBase64: 'YWJj', usuario: 'admin' };
    service.cargarIndividual(req).subscribe(s => expect(s).toEqual(mockSustento));
    const httpReq = httpMock.expectOne(`${apiUrl}/individual`);
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.body).toEqual(req);
    httpReq.flush(mockSustento);
  });

  it('cargarMasivo debería hacer POST a /masivo', () => {
    const req: SustentoMasivoRequest = { idEvaluacionAiv: 1, nombreArchivoZip: 'z.zip', contenidoZipBase64: 'YWJj', usuario: 'admin' };
    const mockResultado: SustentoMasivoResultado = { cargados: [mockSustento], rechazados: [] };
    service.cargarMasivo(req).subscribe(r => expect(r).toEqual(mockResultado));
    const httpReq = httpMock.expectOne(`${apiUrl}/masivo`);
    expect(httpReq.request.method).toBe('POST');
    httpReq.flush(mockResultado);
  });

  it('listarPorRegistro debería hacer GET a /por-registro/{id}', () => {
    service.listarPorRegistro(1).subscribe(l => expect(l).toEqual([mockSustento]));
    const httpReq = httpMock.expectOne(`${apiUrl}/por-registro/1`);
    expect(httpReq.request.method).toBe('GET');
    httpReq.flush([mockSustento]);
  });

  it('descargar debería hacer GET con responseType blob', () => {
    const mockBlob = new Blob(['data']);
    service.descargar(1).subscribe(b => expect(b).toEqual(mockBlob));
    const httpReq = httpMock.expectOne(`${apiUrl}/1/descargar`);
    expect(httpReq.request.method).toBe('GET');
    expect(httpReq.request.responseType).toBe('blob');
    httpReq.flush(mockBlob);
  });

  it('eliminar debería hacer DELETE con param usuario', () => {
    service.eliminar(1, 'admin').subscribe();
    const httpReq = httpMock.expectOne(r => r.url === `${apiUrl}/1`);
    expect(httpReq.request.method).toBe('DELETE');
    expect(httpReq.request.params.get('usuario')).toBe('admin');
    httpReq.flush(null);
  });
});
