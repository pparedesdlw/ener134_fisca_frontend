import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PeriodoService } from './periodo.service';
import { Periodo, PeriodoCreateRequest, PeriodoUpdateRequest, AmpliacionVigenciaRequest } from '../models/periodo.model';
import { environment } from '../../../environments/environment';

describe('PeriodoService', () => {
  let service: PeriodoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/periodo`;

  const mockPeriodo: Periodo = {
    id: 1,
    codigoPeriodo: '2024-T1',
    descripcion: 'Primer trimestre 2024',
    fechaInicio: '01/01/2024',
    fechaFin: '31/03/2024',
    estadoActivo: true,
    deEstado: 'Activo',
    diasRestantes: 30
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PeriodoService]
    });
    service = TestBed.inject(PeriodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los periodos', () => {
      const mockPeriodos: Periodo[] = [mockPeriodo];

      service.listarTodos().subscribe(periodos => {
        expect(periodos).toEqual(mockPeriodos);
        expect(periodos.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPeriodos);
    });

    it('debería manejar error al listar periodos', () => {
      service.listarTodos().subscribe({
        next: () => fail('debería fallar'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      req.flush('Error al listar', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('listarPorEstado', () => {
    it('debería obtener periodos activos', () => {
      const mockPeriodos: Periodo[] = [mockPeriodo];

      service.listarPorEstado(true).subscribe(periodos => {
        expect(periodos).toEqual(mockPeriodos);
        expect(periodos[0].estadoActivo).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estadoActivo=true`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estadoActivo')).toBe('true');
      req.flush(mockPeriodos);
    });

    it('debería obtener periodos inactivos', () => {
      const mockPeriodoInactivo = { ...mockPeriodo, estadoActivo: false };
      const mockPeriodos: Periodo[] = [mockPeriodoInactivo];

      service.listarPorEstado(false).subscribe(periodos => {
        expect(periodos[0].estadoActivo).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estadoActivo=false`);
      expect(req.request.params.get('estadoActivo')).toBe('false');
      req.flush(mockPeriodos);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener un periodo por ID', () => {
      service.obtenerPorId(1).subscribe(periodo => {
        expect(periodo).toEqual(mockPeriodo);
        expect(periodo.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPeriodo);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener un periodo por código', () => {
      service.obtenerPorCodigo('2024-T1').subscribe(periodo => {
        expect(periodo).toEqual(mockPeriodo);
        expect(periodo.codigoPeriodo).toBe('2024-T1');
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/2024-T1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPeriodo);
    });
  });

  describe('crear', () => {
    it('debería crear un nuevo periodo', () => {
      const request: PeriodoCreateRequest = {
        codigoPeriodo: '2024-T1',
        descripcion: 'Primer trimestre 2024',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-03-31',
        estadoActivo: true,
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(periodo => {
        expect(periodo).toEqual(mockPeriodo);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockPeriodo);
    });
  });

  describe('editar', () => {
    it('debería editar un periodo existente', () => {
      const request: PeriodoUpdateRequest = {
        id: 1,
        codigoPeriodo: '2024-T1',
        descripcion: 'Primer trimestre 2024 modificado',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-03-31',
        estadoActivo: true,
        usuarioModificacion: 'admin'
      };

      const mockPeriodoActualizado = { ...mockPeriodo, descripcion: request.descripcion };

      service.editar(request).subscribe(periodo => {
        expect(periodo.descripcion).toBe('Primer trimestre 2024 modificado');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockPeriodoActualizado);
    });
  });

  describe('cambiarEstado', () => {
    it('debería cambiar el estado de un periodo', () => {
      const mockPeriodoInactivo = { ...mockPeriodo, estadoActivo: false };

      service.cambiarEstado(1, false, 'admin').subscribe(periodo => {
        expect(periodo.estadoActivo).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/cambiar-estado?nuevoEstado=false&usuarioModificacion=admin`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.params.get('nuevoEstado')).toBe('false');
      expect(req.request.params.get('usuarioModificacion')).toBe('admin');
      req.flush(mockPeriodoInactivo);
    });

    it('debería activar un periodo', () => {
      service.cambiarEstado(1, true, 'admin').subscribe(periodo => {
        expect(periodo.estadoActivo).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/cambiar-estado?nuevoEstado=true&usuarioModificacion=admin`);
      expect(req.request.params.get('nuevoEstado')).toBe('true');
      req.flush(mockPeriodo);
    });
  });

  describe('ampliarVigencia', () => {
    it('debería ampliar la vigencia de un periodo', () => {
      const request: AmpliacionVigenciaRequest = {
        id: 1,
        nuevaFechaFin: '2024-04-30',
        sustentoAmpliacion: 'Ampliación necesaria por razones operativas que requieren más tiempo',
        usuarioModificacion: 'admin'
      };

      const mockPeriodoAmpliado = {
        ...mockPeriodo,
        fechaFin: '30/04/2024',
        sustentoAmpliacion: request.sustentoAmpliacion
      };

      service.ampliarVigencia(request).subscribe(periodo => {
        expect(periodo.fechaFin).toBe('30/04/2024');
        expect(periodo.sustentoAmpliacion).toBe(request.sustentoAmpliacion);
      });

      const req = httpMock.expectOne(`${apiUrl}/ampliar-vigencia`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(request);
      req.flush(mockPeriodoAmpliado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un periodo', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
