import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DistritoService } from './distrito.service';
import { Distrito } from '../models/distrito.model';
import { environment } from '../../../environments/environment';

describe('DistritoService', () => {
  let service: DistritoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/ubigeo`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DistritoService]
    });
    service = TestBed.inject(DistritoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener los distritos de un departamento y provincia', () => {
      const mockDistritos: Distrito[] = [
        { codigoDistrito: '01', descripcionDistrito: 'LIMA CERCADO' }
      ];

      service.listarTodos('15', '01').subscribe(distritos => {
        expect(distritos).toEqual(mockDistritos);
      });

      const req = httpMock.expectOne(r => r.url === `${apiUrl}/listar-distrito`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('codigoDepartamento')).toBe('15');
      expect(req.request.params.get('codigoProvincia')).toBe('01');
      req.flush(mockDistritos);
    });
  });
});
