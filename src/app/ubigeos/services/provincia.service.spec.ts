import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProvinciaService } from './provincia.service';
import { Provincia } from '../models/provincia.model';
import { environment } from '../../../environments/environment';

describe('ProvinciaService', () => {
  let service: ProvinciaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/ubigeo`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProvinciaService]
    });
    service = TestBed.inject(ProvinciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener las provincias de un departamento', () => {
      const mockProvincias: Provincia[] = [
        { codigoProvincia: '01', descripcionProvincia: 'LIMA' }
      ];

      service.listarTodos('15').subscribe(provincias => {
        expect(provincias).toEqual(mockProvincias);
      });

      const req = httpMock.expectOne(r => r.url === `${apiUrl}/listar-provincia`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('codigoDepartamento')).toBe('15');
      req.flush(mockProvincias);
    });
  });
});
