import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MuestraService } from './muestra.service';
import { Muestra, MuestraCreateRequest, MuestraUpdateRequest } from '../models/muestra.model';
import { environment } from '../../../environments/environment';

describe('MuestraService', () => {
  let service: MuestraService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/muestra`;

  const mockMuestra: Muestra = {
    id: 1,
    codigoMuestra: 'MUE001',
    muestra: '100',
    confianza: '95',
    error: '5',
    estado: '1',
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    fechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MuestraService]
    });
    service = TestBed.inject(MuestraService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todas las muestras', () => {
      const mockMuestras: Muestra[] = [mockMuestra];

      service.listarTodos().subscribe(muestras => {
        expect(muestras).toEqual(mockMuestras);
        expect(muestras.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMuestras);
    });

    it('debería manejar error al listar muestras', () => {
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
    it('debería obtener muestras activas', () => {
      const mockMuestras: Muestra[] = [mockMuestra];

      service.listarPorEstado('1').subscribe(muestras => {
        expect(muestras).toEqual(mockMuestras);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockMuestras);
    });

    it('debería obtener muestras inactivas', () => {
      service.listarPorEstado('0').subscribe(muestras => {
        expect(muestras).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener una muestra por ID', () => {
      service.obtenerPorId(1).subscribe(muestra => {
        expect(muestra).toEqual(mockMuestra);
        expect(muestra.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMuestra);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener una muestra por código', () => {
      service.obtenerPorCodigo('MUE001').subscribe(muestra => {
        expect(muestra).toEqual(mockMuestra);
        expect(muestra.codigoMuestra).toBe('MUE001');
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/MUE001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMuestra);
    });
  });

  describe('crear', () => {
    it('debería crear una nueva muestra', () => {
      const request: MuestraCreateRequest = {
        codigoMuestra: 'MUE002',
        muestra: '200',
        confianza: '99',
        error: '1',
        estado: '1',
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(muestra => {
        expect(muestra).toEqual(mockMuestra);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockMuestra);
    });
  });

  describe('editar', () => {
    it('debería editar una muestra existente', () => {
      const request: MuestraUpdateRequest = {
        id: 1,
        codigoMuestra: 'MUE001',
        muestra: '150',
        confianza: '97',
        error: '3',
        estado: '1',
        usuarioModificacion: 'admin'
      };

      const mockActualizado = { ...mockMuestra, muestra: '150', confianza: '97' };

      service.editar(request).subscribe(muestra => {
        expect(muestra.muestra).toBe('150');
        expect(muestra.confianza).toBe('97');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockActualizado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar una muestra por ID', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
