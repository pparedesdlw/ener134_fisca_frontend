import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResponsableService } from './responsable.service';
import { Responsable, ResponsableCreateRequest, ResponsableUpdateRequest } from '../models/responsable.model';
import { environment } from '../../../environments/environment';

describe('ResponsableService', () => {
  let service: ResponsableService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/responsable`;

  const mockResponsable: Responsable = {
    id: 1,
    codigoResponsable: 'RES001',
    nombreResponsable: 'Carlos Mendoza',
    codigoEmpresa: 'EMP001',
    estado: '1',
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    fechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResponsableService]
    });
    service = TestBed.inject(ResponsableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los responsables', () => {
      const mockResponsables: Responsable[] = [mockResponsable];

      service.listarTodos().subscribe(responsables => {
        expect(responsables).toEqual(mockResponsables);
        expect(responsables.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponsables);
    });

    it('debería manejar error al listar responsables', () => {
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
    it('debería obtener responsables activos', () => {
      const mockResponsables: Responsable[] = [mockResponsable];

      service.listarPorEstado('1').subscribe(responsables => {
        expect(responsables).toEqual(mockResponsables);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockResponsables);
    });

    it('debería obtener responsables inactivos', () => {
      service.listarPorEstado('0').subscribe(responsables => {
        expect(responsables).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener un responsable por ID', () => {
      service.obtenerPorId(1).subscribe(responsable => {
        expect(responsable).toEqual(mockResponsable);
        expect(responsable.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponsable);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener un responsable por código', () => {
      service.obtenerPorCodigo('RES001').subscribe(responsable => {
        expect(responsable).toEqual(mockResponsable);
        expect(responsable.codigoResponsable).toBe('RES001');
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/RES001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponsable);
    });
  });

  describe('crear', () => {
    it('debería crear un nuevo responsable', () => {
      const request: ResponsableCreateRequest = {
        codigoResponsable: 'RES002',
        nombreResponsable: 'Ana Torres',
        codigoEmpresa: 'EMP002',
        estado: '1',
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(responsable => {
        expect(responsable).toEqual(mockResponsable);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponsable);
    });
  });

  describe('editar', () => {
    it('debería editar un responsable existente', () => {
      const request: ResponsableUpdateRequest = {
        id: 1,
        codigoResponsable: 'RES001',
        nombreResponsable: 'Carlos Mendoza López',
        codigoEmpresa: 'EMP001',
        estado: '1',
        usuarioModificacion: 'admin'
      };

      const mockActualizado = { ...mockResponsable, nombreResponsable: 'Carlos Mendoza López' };

      service.editar(request).subscribe(responsable => {
        expect(responsable.nombreResponsable).toBe('Carlos Mendoza López');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockActualizado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un responsable por ID', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
