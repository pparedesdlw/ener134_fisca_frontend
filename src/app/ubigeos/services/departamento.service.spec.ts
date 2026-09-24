import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DepartamentoService } from './departamento.service';
import { Departamento } from '../models/departamento.model';
import { environment } from '../../../environments/environment';

describe('DepartamentoService', () => {
  let service: DepartamentoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/ubigeo`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DepartamentoService]
    });
    service = TestBed.inject(DepartamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los departamentos', () => {
      const mockDepartamentos: Departamento[] = [
        { codigoDepartamento: '15', descripcionDepartamento: 'LIMA' }
      ];

      service.listarTodos().subscribe(departamentos => {
        expect(departamentos).toEqual(mockDepartamentos);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-departamento`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDepartamentos);
    });
  });
});
