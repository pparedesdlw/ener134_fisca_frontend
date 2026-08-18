import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { Usuario, UsuarioCreateRequest, UsuarioUpdateRequest } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/usuario`;

  const mockUsuario: Usuario = {
    id: 1,
    codigoUsuario: 'USU001',
    nombreUsuario: 'jperez',
    nombres: 'Juan',
    apellidos: 'Pérez García',
    email: 'jperez@osinergmin.gob.pe',
    telefono: '999999999',
    perfil: 'ADMIN',
    nombrePerfil: 'Administrador',
    estado: true,
    deEstado: 'Activo',
    usuarioCreacion: 'admin',
    fechaCreacion: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService]
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('listarTodos', () => {
    it('debería obtener todos los usuarios', () => {
      const mockUsuarios: Usuario[] = [mockUsuario];

      service.listarTodos().subscribe(usuarios => {
        expect(usuarios).toEqual(mockUsuarios);
        expect(usuarios.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);
    });

    it('debería manejar error al listar usuarios', () => {
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
    it('debería obtener usuarios activos', () => {
      const mockUsuarios: Usuario[] = [mockUsuario];

      service.listarPorEstado('1').subscribe(usuarios => {
        expect(usuarios).toEqual(mockUsuarios);
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('estado')).toBe('1');
      req.flush(mockUsuarios);
    });

    it('debería obtener usuarios inactivos', () => {
      service.listarPorEstado('0').subscribe(usuarios => {
        expect(usuarios).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/listar-por-estado?estado=0`);
      expect(req.request.params.get('estado')).toBe('0');
      req.flush([]);
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener un usuario por ID', () => {
      service.obtenerPorId(1).subscribe(usuario => {
        expect(usuario).toEqual(mockUsuario);
        expect(usuario.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuario);
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debería obtener un usuario por código', () => {
      service.obtenerPorCodigo('USU001').subscribe(usuario => {
        expect(usuario).toEqual(mockUsuario);
        expect(usuario.codigoUsuario).toBe('USU001');
      });

      const req = httpMock.expectOne(`${apiUrl}/codigo/USU001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuario);
    });
  });

  describe('crear', () => {
    it('debería crear un nuevo usuario', () => {
      const request: UsuarioCreateRequest = {
        codigoUsuario: 'USU002',
        nombreUsuario: 'mlopez',
        nombres: 'María',
        apellidos: 'López Hernández',
        email: 'mlopez@osinergmin.gob.pe',
        telefono: '988888888',
        perfil: 'ERE-OR',
        usuarioCreacion: 'admin'
      };

      service.crear(request).subscribe(usuario => {
        expect(usuario).toEqual(mockUsuario);
      });

      const req = httpMock.expectOne(`${apiUrl}/crear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockUsuario);
    });
  });

  describe('editar', () => {
    it('debería editar un usuario existente', () => {
      const request: UsuarioUpdateRequest = {
        id: 1,
        codigoUsuario: 'USU001',
        nombreUsuario: 'jperez',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'jcperez@osinergmin.gob.pe',
        telefono: '999999999',
        perfil: 'ADMIN',
        usuarioModificacion: 'admin'
      };

      const mockActualizado = { ...mockUsuario, nombres: 'Juan Carlos', email: 'jcperez@osinergmin.gob.pe' };

      service.editar(request).subscribe(usuario => {
        expect(usuario.nombres).toBe('Juan Carlos');
        expect(usuario.email).toBe('jcperez@osinergmin.gob.pe');
      });

      const req = httpMock.expectOne(`${apiUrl}/editar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockActualizado);
    });
  });

  describe('eliminar', () => {
    it('debería eliminar un usuario por ID', () => {
      service.eliminar(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
