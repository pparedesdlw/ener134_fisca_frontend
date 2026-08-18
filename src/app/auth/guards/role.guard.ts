import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RUTAS_PERMITIDAS_NO_ADMIN } from '../config/rutas-permitidas.config';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const currentUserStr = sessionStorage.getItem('currentUser');
  let isTisecAdmin = false;

  if (currentUserStr) {
    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser && currentUser.roles && Array.isArray(currentUser.roles)) {
        isTisecAdmin = currentUser.roles.some((role: any) => role.nombre === 'TISEC-ADMIN');
      }
    } catch (e) {
      console.error('Error al hacer parse del usuario actual en sessionStorage:', e);
    }
  }

  if (isTisecAdmin) {
    return true;
  }

  const currentPath = state.url;

  const isAllowed = RUTAS_PERMITIDAS_NO_ADMIN.some(path => currentPath.startsWith(path) || currentPath === path);

  if (isAllowed) {
    return true;
  } else {
    snackBar.open('No tiene permisos para acceder a la vista solicitada.', 'Cerrar', {
      duration: 3500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    router.navigate(['/home']);
    return false;
  }
};
