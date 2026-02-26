import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AsuntoService } from './asunto.service';
import { Asunto } from '../models/asunto.model';
import { environment } from '../../../environments/environment';

describe('AsuntoService', () => {
  let service: AsuntoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/asunto`;

  const mockAsunto: Asunto = {
    codigoAsunto: 'ASU001',
    descripcion: 'Interrupción del suministro eléctrico',
    estado: '1',
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    FechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AsuntoService]
    });
    service = TestBed.inject(AsuntoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los asuntos', () => {
      const mockAsuntos: Asunto[] = [mockAsunto];

      service.listarTodos().subscribe(asuntos => {
        expect(asuntos).toEqual(mockAsuntos);
        expect(asuntos.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAsuntos);
    });

    it('debería retornar lista vacía si no hay asuntos', () => {
      service.listarTodos().subscribe(asuntos => {
        expect(asuntos).toEqual([]);
        expect(asuntos.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      req.flush([]);
    });

    it('debería manejar error al listar asuntos', () => {
      service.listarTodos().subscribe({
        next: () => fail('debería fallar'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('listarPorEstado', () => {
    it('debería obtener asuntos activos', () => {
      const mockAsuntos: Asunto[] = [mockAsunto];

      service.listarPorEstado('1').subscribe(asuntos => {
        expect(asuntos).toEqual(mockAsuntos);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockAsuntos);
    });

    it('debería obtener asuntos inactivos', () => {
      service.listarPorEstado('0').subscribe(asuntos => {
        expect(asuntos).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });

    it('debería manejar error al listar por estado', () => {
      service.listarPorEstado('1').subscribe({
        next: () => fail('debería fallar'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      req.flush('No encontrado', { status: 404, statusText: 'Not Found' });
    });
  });
});
