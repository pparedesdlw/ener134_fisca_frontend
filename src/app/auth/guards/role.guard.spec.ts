import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { roleGuard } from './role.guard';
import { RUTAS_PERMITIDAS_NO_ADMIN } from '../config/rutas-permitidas.config';

describe('roleGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  function setCurrentUser(roles: string[] | null): void {
    if (roles === null) {
      sessionStorage.removeItem('currentUser');
      return;
    }
    sessionStorage.setItem('currentUser', JSON.stringify({
      username: 'admin', rol: 'ADMIN', roles: roles.map((nombre) => ({ nombre }))
    }));
  }

  function ejecutarGuard(url: string): boolean {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => roleGuard(route, state)) as boolean;
  }

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    });
  });

  afterEach(() => {
    sessionStorage.removeItem('currentUser');
  });

  it('debería permitir el acceso a cualquier ruta si el usuario es TISEC-ADMIN', () => {
    setCurrentUser(['TISEC-ADMIN']);
    expect(ejecutarGuard('/roles')).toBe(true);
    expect(ejecutarGuard('/evaluacion-aiv')).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('RF01-RF11 (Fase 2, AIV): debería permitir el acceso a un usuario no-admin, igual que las muestra el menú', () => {
    setCurrentUser(['TISEC-ERE-OR']);
    for (const ruta of RUTAS_PERMITIDAS_NO_ADMIN) {
      expect(ejecutarGuard(ruta)).withContext(`ruta ${ruta}`).toBe(true);
    }
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('debería rechazar y redirigir a /home si el usuario no-admin intenta una ruta fuera de la lista permitida', () => {
    setCurrentUser(['TISEC-ERE-OR']);
    expect(ejecutarGuard('/roles')).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith(
      'No tiene permisos para acceder a la vista solicitada.', 'Cerrar', jasmine.any(Object)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería tratar como no-admin (y aplicar la lista restringida) si no hay usuario en sessionStorage', () => {
    setCurrentUser(null);
    expect(ejecutarGuard('/evaluacion-aiv')).toBe(true);
    expect(ejecutarGuard('/roles')).toBe(false);
  });
});
