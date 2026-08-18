import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ParametroService } from './parametro.service';
import { Parametro, ParametroCreateRequest, ParametroUpdateRequest } from '../models/parametro.model';
import { environment } from '../../../environments/environment';

describe('ParametroService', () => {
  let service: ParametroService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/parametro`;

  const mockParametro: Parametro = {
    id: 1,
    codigoParametro: 'PARAM001',
    descripcionParametro: 'Tolerancia CIT',
    valor: '90',
    tipoParametro: 'NUMERICO',
    estado: true,
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    fechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParametroService]
    });
    service = TestBed.inject(ParametroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los parámetros', () => {
      const mockParametros: Parametro[] = [mockParametro];

      service.listarTodos().subscribe(parametros => {
        expect(parametros).toEqual(mockParametros);
        expect(parametros.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockParametros);
    });

    it('debería manejar error al listar parámetros', () => {
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
    it('debería obtener parámetros activos', () => {
      const mockParametros: Parametro[] = [mockParametro];

      service.listarPorEstado('1').subscribe(parametros => {
        expect(parametros).toEqual(mockParametros);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockParametros);
    });

    it('debería obtener parámetros inactivos', () => {
      service.listarPorEstado('0').subscribe(parametros => {
        expect(parametros).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener un parámetro por ID', () => {
      service.obtenerPorId(1).subscribe(parametro => {
        expect(parametro).toEqual(mockParametro);
        expect(parametro.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockParametro);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener un parámetro por código', () => {
      service.obtenerPorCodigo('PARAM001').subscribe(parametro => {
        expect(parametro).toEqual(mockParametro);
        expect(parametro.codigoParametro).toBe('PARAM001');
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/PARAM001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockParametro);
    });
  });

  describe('crear', () => {
    it('debería crear un nuevo parámetro', () => {
      const request: ParametroCreateRequest = {
        codigoParametro: 'PARAM002',
        descripcionParametro: 'Nuevo Parámetro',
        valor: '100',
        tipoParametro: 'NUMERICO',
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(parametro => {
        expect(parametro).toEqual(mockParametro);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockParametro);
    });
  });

  describe('editar', () => {
    it('debería editar un parámetro existente', () => {
      const request: ParametroUpdateRequest = {
        id: 1,
        codigoParametro: 'PARAM001',
        descripcionParametro: 'Tolerancia CIT Modificada',
        valor: '95',
        tipoParametro: 'NUMERICO',
        usuarioModificacion: 'admin'
      };

      const mockActualizado = { ...mockParametro, descripcionParametro: 'Tolerancia CIT Modificada', valor: '95' };

      service.editar(request).subscribe(parametro => {
        expect(parametro.descripcionParametro).toBe('Tolerancia CIT Modificada');
        expect(parametro.valor).toBe('95');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockActualizado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un parámetro por ID', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
