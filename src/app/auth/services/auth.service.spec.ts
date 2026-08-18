import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, Usuario } from './auth.service';
import { LoginResponse, UserInfoResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const mockUser: Usuario = {
    username: 'admin',
    rol: 'ADMIN',
    nombre: 'Administrador'
  };

  const mockLoginResponse: LoginResponse = {
    access_token: 'token-abc',
    expires_in: 300,
    refresh_expires_in: 1800,
    refresh_token: 'refresh-abc',
    token_type: 'Bearer'
  };

  const mockUserInfo: UserInfoResponse = {
    profile: { perfiles: [], roles: [{ nombre: 'TISEC-ADMIN' }] },
    user: {
      email: 'admin@osinergmin.gob.pe',
      email_verified: true,
      family_name: 'Admin',
      given_name: 'Super',
      name: 'Super Admin',
      preferred_username: 'admin',
      sub: 'uuid-1'
    }
  };

  beforeEach(() => {
    sessionStorage.clear();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('debería inicializar con null si no hay usuario en sessionStorage', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('debería retornar valores por defecto cuando no hay usuario', () => {
      expect(service.currentUsername).toBe('admin');
      expect(service.currentUserRole).toBe('ADMIN');
      expect(service.isTisecAdmin).toBeFalse();
    });
  });

  describe('login', () => {
    it('debería autenticar, guardar tokens y obtener el perfil del usuario', (done) => {
      service.login({ username: 'admin', password: 'secret' }).subscribe((info) => {
        expect(info).toEqual(mockUserInfo);
        expect(sessionStorage.getItem('access_token')).toBe('token-abc');
        expect(sessionStorage.getItem('refresh_token')).toBe('refresh-abc');
        expect(service.currentUserValue?.username).toBe('admin');
        expect(service.isTisecAdmin).toBeTrue();
        done();
      });

      const loginReq = httpMock.expectOne(`${environment.urlbase}public/auth/login`);
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush(mockLoginResponse);

      const meReq = httpMock.expectOne(`${environment.urlbase}api/v1/user/me`);
      expect(meReq.request.method).toBe('GET');
      meReq.flush(mockUserInfo);
    });
  });

  describe('setUser', () => {
    it('debería guardar el usuario en sessionStorage y actualizar currentUserValue', () => {
      service.setUser(mockUser);
      expect(service.currentUserValue).toEqual(mockUser);
      expect(JSON.parse(sessionStorage.getItem('currentUser')!)).toEqual(mockUser);
    });

    it('debería permitir cambiar el rol del usuario', () => {
      const ereUser: Usuario = { username: 'ereuser', rol: 'ERE-OR', nombre: 'Usuario ERE' };
      service.setUser(ereUser);
      expect(service.currentUserRole).toBe('ERE-OR');
    });

    it('isTisecAdmin debería ser falso si el usuario no tiene el rol TISEC-ADMIN', () => {
      service.setUser({ ...mockUser, roles: [{ nombre: 'OTRO-ROL' }] });
      expect(service.isTisecAdmin).toBeFalse();
    });

    it('isTisecAdmin debería ser verdadero si el usuario tiene el rol TISEC-ADMIN', () => {
      service.setUser({ ...mockUser, roles: [{ nombre: 'TISEC-ADMIN' }] });
      expect(service.isTisecAdmin).toBeTrue();
    });
  });

  describe('refreshToken', () => {
    it('debería fallar si no hay refresh token almacenado', (done) => {
      service.refreshToken().subscribe({
        error: (err) => {
          expect(err.message).toContain('No hay refresh token');
          done();
        }
      });
    });

    it('debería renovar el access token', (done) => {
      sessionStorage.setItem('refresh_token', 'refresh-abc');

      service.refreshToken().subscribe((response) => {
        expect(response.access_token).toBe('token-nuevo');
        expect(sessionStorage.getItem('access_token')).toBe('token-nuevo');
        done();
      });

      const req = httpMock.expectOne(`${environment.urlbase}public/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-abc' });
      req.flush({ ...mockLoginResponse, access_token: 'token-nuevo' });
    });
  });

  describe('logout', () => {
    it('debería limpiar la sesión sin llamar al backend si no hay refresh token', () => {
      service.logout();
      httpMock.expectNone(`${environment.urlbase}public/auth/logout`);
      expect(sessionStorage.length).toBe(0);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería notificar al backend y limpiar la sesión si hay refresh token', () => {
      sessionStorage.setItem('refresh_token', 'refresh-abc');
      service.setUser(mockUser);

      service.logout();

      const req = httpMock.expectOne(`${environment.urlbase}public/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(service.currentUserValue).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('clearSession', () => {
    it('debería limpiar sessionStorage, currentUserValue y navegar a /login', () => {
      service.setUser(mockUser);

      service.clearSession();

      expect(sessionStorage.length).toBe(0);
      expect(service.currentUserValue).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
