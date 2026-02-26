import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeriadoService } from './feriado.service';
import { Feriado, FeriadoCreateRequest, FeriadoUpdateRequest } from '../models/feriado.model';
import { environment } from '../../../environments/environment';

describe('FeriadoService', () => {
  let service: FeriadoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/feriado`;

  const mockFeriado: Feriado = {
    id: 1,
    fechaFeriadoIni: '2024-01-01',
    fechaFeriadoFin: '2024-01-01',
    codigoRegion: 'NAC',
    descripcionFeriado: 'Año Nuevo',
    tipoFeriado: 'NACIONAL',
    estado: '1',
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    fechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeriadoService]
    });
    service = TestBed.inject(FeriadoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los feriados', () => {
      const mockFeriados: Feriado[] = [mockFeriado];

      service.listarTodos().subscribe(feriados => {
        expect(feriados).toEqual(mockFeriados);
        expect(feriados.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFeriados);
    });

    it('debería manejar error al listar feriados', () => {
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
    it('debería obtener feriados por estado', () => {
      const mockFeriados: Feriado[] = [mockFeriado];

      service.listarPorEstado('1').subscribe(feriados => {
        expect(feriados).toEqual(mockFeriados);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockFeriados);
    });

    it('debería obtener feriados inactivos', () => {
      service.listarPorEstado('0').subscribe(feriados => {
        expect(feriados).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener un feriado por ID', () => {
      service.obtenerPorId(1).subscribe(feriado => {
        expect(feriado).toEqual(mockFeriado);
        expect(feriado.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFeriado);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener un feriado por código', () => {
      service.obtenerPorCodigo('FER001').subscribe(feriado => {
        expect(feriado).toEqual(mockFeriado);
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/FER001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFeriado);
    });
  });

  describe('crear', () => {
    it('debería crear un nuevo feriado', () => {
      const request: FeriadoCreateRequest = {
        fechaFeriadoIni: '2024-07-28',
        fechaFeriadoFin: '2024-07-29',
        codigoRegion: 'NAC',
        descripcionFeriado: 'Fiestas Patrias',
        tipoFeriado: 'NACIONAL',
        estado: '1',
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(feriado => {
        expect(feriado).toEqual(mockFeriado);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockFeriado);
    });
  });

  describe('editar', () => {
    it('debería editar un feriado existente', () => {
      const request: FeriadoUpdateRequest = {
        id: 1,
        fechaFeriadoIni: '2024-01-01',
        fechaFeriadoFin: '2024-01-01',
        codigoRegion: 'NAC',
        descripcionFeriado: 'Año Nuevo Modificado',
        tipoFeriado: 'NACIONAL',
        estado: '1',
        usuarioModificacion: 'admin'
      };

      const mockActualizado = { ...mockFeriado, descripcionFeriado: 'Año Nuevo Modificado' };

      service.editar(request).subscribe(feriado => {
        expect(feriado.descripcionFeriado).toBe('Año Nuevo Modificado');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockActualizado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un feriado por ID', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
