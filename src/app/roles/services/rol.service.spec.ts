import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RolService } from './rol.service';
import { Rol, RolCreateRequest, RolUpdateRequest } from '../models/rol.model';
import { environment } from '../../../environments/environment';

describe('RolService', () => {
  let service: RolService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/rol`;

  const mockRol: Rol = {
    id: 1,
    codigoRol: 'ROL001',
    responsableRol: 'Juan Pérez',
    descripcionRol: 'Administrador del sistema',
    estado: true,
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    fechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RolService]
    });
    service = TestBed.inject(RolService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los roles', () => {
      const mockRoles: Rol[] = [mockRol];

      service.listarTodos().subscribe(roles => {
        expect(roles).toEqual(mockRoles);
        expect(roles.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoles);
    });

    it('debería manejar error al listar roles', () => {
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
    it('debería obtener roles activos', () => {
      const mockRoles: Rol[] = [mockRol];

      service.listarPorEstado('1').subscribe(roles => {
        expect(roles).toEqual(mockRoles);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockRoles);
    });

    it('debería obtener roles inactivos', () => {
      service.listarPorEstado('0').subscribe(roles => {
        expect(roles).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener un rol por ID', () => {
      service.obtenerPorId(1).subscribe(rol => {
        expect(rol).toEqual(mockRol);
        expect(rol.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRol);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener un rol por código', () => {
      service.obtenerPorCodigo('ROL001').subscribe(rol => {
        expect(rol).toEqual(mockRol);
        expect(rol.codigoRol).toBe('ROL001');
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/ROL001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRol);
    });
  });

  describe('crear', () => {
    it('debería crear un nuevo rol', () => {
      const request: RolCreateRequest = {
        codigoRol: 'ROL002',
        responsableRol: 'María López',
        descripcionRol: 'Supervisor',
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(rol => {
        expect(rol).toEqual(mockRol);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockRol);
    });
  });

  describe('editar', () => {
    it('debería editar un rol existente', () => {
      const request: RolUpdateRequest = {
        id: 1,
        codigoRol: 'ROL001',
        responsableRol: 'Juan Pérez',
        descripcionRol: 'Administrador modificado',
        usuarioModificacion: 'admin'
      };

      const mockActualizado = { ...mockRol, descripcionRol: 'Administrador modificado' };

      service.editar(request).subscribe(rol => {
        expect(rol.descripcionRol).toBe('Administrador modificado');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockActualizado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un rol por ID', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
