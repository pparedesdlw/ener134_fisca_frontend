import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const currentUser = authService.currentUserValue;

  if (currentUser) {
    // Agregar usuario y rol en las cabeceras
    req = req.clone({
      setHeaders: {
        'X-Usuario': currentUser.username,
        'X-Usuario-Rol': currentUser.rol
      }
    });
  }

  return next(req);
};
