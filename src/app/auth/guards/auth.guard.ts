import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('access_token');
  const user = sessionStorage.getItem('currentUser');

  if (!token || !user) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
