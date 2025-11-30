import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const user = tokenStorage.getUser();
    const redirectUrl = authService.getDashboardUrl(user?.roles || []);
    return router.createUrlTree([redirectUrl]);
  }

  return true;
};
