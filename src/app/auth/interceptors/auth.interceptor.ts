import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const currentUser = authService.currentUserValue;

  if (req.url.includes('/public/')) {
    return next(req);
  }

  const token = sessionStorage.getItem('access_token');
  let headers = req.headers;

  if (currentUser) {
    headers = headers.set('X-Usuario', currentUser.username).set('X-Usuario-Rol', currentUser.rol);
  }

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  req = req.clone({ headers });

  return next(req);
};
