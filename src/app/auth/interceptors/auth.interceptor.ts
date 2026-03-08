import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
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

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newHeaders = req.headers.set('Authorization', `Bearer ${res.access_token}`);
            const cloneReq = req.clone({ headers: newHeaders });
            return next(cloneReq);
          }),
          catchError((refreshError) => {
            authService.clearSession();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
