import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../../shared/loader/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  // Evitamos que active el loader si es una petición pública que debe ser invisible
  const isSilent = req.headers.get('X-Silent-Request') === 'true' || req.url.includes('/public/auth/refresh');

  if (!isSilent) {
    loaderService.showLoader();
  }

  return next(req).pipe(
    finalize(() => {
      if (!isSilent) {
        loaderService.hideLoader();
      }
    })
  );
};
