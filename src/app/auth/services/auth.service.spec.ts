import { TestBed } from '@angular/core/testing';
import { AuthService, Usuario } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: Usuario = {
    username: 'admin',
    rol: 'ADMIN',
    nombre: 'Administrador'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('debería inicializar con null si no hay usuario en localStorage', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('debería inicializar con el usuario almacenado en localStorage', () => {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const newService = new AuthService();
      expect(newService.currentUserValue).toEqual(mockUser);
    });
  });

  describe('currentUserValue', () => {
    it('debería retornar null cuando no hay usuario', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('debería retornar el usuario actual después de login', () => {
      service.login('admin', 'password').subscribe();
      expect(service.currentUserValue).toBeTruthy();
      expect(service.currentUserValue?.username).toBe('admin');
    });
  });

  describe('currentUsername', () => {
    it('debería retornar "admin" por defecto cuando no hay usuario', () => {
      expect(service.currentUsername).toBe('admin');
    });

    it('debería retornar el username del usuario logueado', () => {
      service.login('testuser', 'password').subscribe();
      expect(service.currentUsername).toBe('testuser');
    });
  });

  describe('currentUserRole', () => {
    it('debería retornar "ADMIN" por defecto cuando no hay usuario', () => {
      expect(service.currentUserRole).toBe('ADMIN');
    });

    it('debería retornar el rol del usuario logueado', () => {
      service.login('admin', 'password').subscribe();
      expect(service.currentUserRole).toBe('ADMIN');
    });
  });

  describe('login', () => {
    it('debería autenticar al usuario y emitir el usuario', (done) => {
      service.login('admin', 'password').subscribe(user => {
        expect(user).toBeTruthy();
        expect(user.username).toBe('admin');
        expect(user.rol).toBe('ADMIN');
        expect(user.nombre).toBe('Administrador');
        done();
      });
    });

    it('debería almacenar el usuario en localStorage', () => {
      service.login('admin', 'password').subscribe();
      const stored = localStorage.getItem('currentUser');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.username).toBe('admin');
    });

    it('debería actualizar el currentUserValue', () => {
      service.login('admin', 'password').subscribe();
      expect(service.currentUserValue?.username).toBe('admin');
    });

    it('debería emitir el usuario a través del observable currentUser', (done) => {
      service.currentUser.subscribe(user => {
        if (user) {
          expect(user.username).toBe('admin');
          done();
        }
      });
      service.login('admin', 'password').subscribe();
    });
  });

  describe('logout', () => {
    it('debería eliminar el usuario de localStorage', () => {
      service.login('admin', 'password').subscribe();
      service.logout();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('debería establecer currentUserValue a null', () => {
      service.login('admin', 'password').subscribe();
      service.logout();
      expect(service.currentUserValue).toBeNull();
    });

    it('debería emitir null a través del observable currentUser', (done) => {
      service.login('admin', 'password').subscribe();
      let emissions = 0;
      service.currentUser.subscribe(user => {
        emissions++;
        if (emissions === 1 && user === null) {
          done();
        }
      });
      service.logout();
    });
  });

  describe('setUser', () => {
    it('debería establecer el usuario en localStorage', () => {
      service.setUser(mockUser);
      const stored = JSON.parse(localStorage.getItem('currentUser')!);
      expect(stored).toEqual(mockUser);
    });

    it('debería actualizar el currentUserValue', () => {
      service.setUser(mockUser);
      expect(service.currentUserValue).toEqual(mockUser);
    });

    it('debería permitir cambiar el rol del usuario', () => {
      const ereUser: Usuario = { username: 'ereuser', rol: 'ERE-OR', nombre: 'Usuario ERE' };
      service.setUser(ereUser);
      expect(service.currentUserRole).toBe('ERE-OR');
    });
  });
});
