import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmpresaConcesionariaService } from './empresa-concesionaria.service';
import { Empresa, EmpresaCreateRequest, EmpresaUpdateRequest } from '../models/empresa-concesionaria.model';
import { environment } from '../../../environments/environment';

describe('EmpresaConcesionariaService', () => {
  let service: EmpresaConcesionariaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/empresa`;

  const mockEmpresa: EmpresaConcesionaria = {
    id: 1,
    codigoEmpresa: 'EMP001',
    razonSocial: 'Luz del Sur S.A.A.',
    descripcion: 'Empresa distribuidora de energía eléctrica',
    tipo: 'DISTRIBUCION',
    deTipo: 'Distribución',
    ruc: '20345678901',
    estado: '1',
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    fechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmpresaConcesionariaService]
    });
    service = TestBed.inject(EmpresaConcesionariaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todas las empresas', () => {
      const mockEmpresas: EmpresaConcesionaria[] = [mockEmpresa];

      service.listarTodos().subscribe(empresas => {
        expect(empresas).toEqual(mockEmpresas);
        expect(empresas.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmpresas);
    });

    it('debería manejar error al listar empresas', () => {
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
    it('debería obtener empresas activas', () => {
      const mockEmpresas: EmpresaConcesionaria[] = [mockEmpresa];

      service.listarPorEstado('1').subscribe(empresas => {
        expect(empresas).toEqual(mockEmpresas);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockEmpresas);
    });

    it('debería obtener empresas inactivas', () => {
      service.listarPorEstado('0').subscribe(empresas => {
        expect(empresas).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener una empresa por ID', () => {
      service.obtenerPorId(1).subscribe(empresa => {
        expect(empresa).toEqual(mockEmpresa);
        expect(empresa.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmpresa);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener una empresa por código', () => {
      service.obtenerPorCodigo('EMP001').subscribe(empresa => {
        expect(empresa).toEqual(mockEmpresa);
        expect(empresa.codigoEmpresa).toBe('EMP001');
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/EMP001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmpresa);
    });
  });

  describe('crear', () => {
    it('debería crear una nueva empresa', () => {
      const request: EmpresaCreateRequest = {
        codigoEmpresa: 'EMP002',
        razonSocial: 'Enel Distribución Perú',
        descripcion: 'Empresa distribuidora',
        tipo: 'DISTRIBUCION',
        ruc: '20456789012',
        estado: '1',
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(empresa => {
        expect(empresa).toEqual(mockEmpresa);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockEmpresa);
    });
  });

  describe('editar', () => {
    it('debería editar una empresa existente', () => {
      const request: EmpresaUpdateRequest = {
        id: 1,
        codigoEmpresa: 'EMP001',
        razonSocial: 'Luz del Sur S.A.A. Modificado',
        razonSocialAnt: 'Luz del Sur S.A.A.',
        descripcion: 'Empresa distribuidora de energía eléctrica actualizada',
        tipo: 'DISTRIBUCION',
        ruc: '20345678901',
        estado: '1',
        usuarioModificacion: 'admin'
      };

      const mockActualizado = { ...mockEmpresa, razonSocial: 'Luz del Sur S.A.A. Modificado' };

      service.editar(request).subscribe(empresa => {
        expect(empresa.razonSocial).toBe('Luz del Sur S.A.A. Modificado');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockActualizado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar una empresa por ID', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
