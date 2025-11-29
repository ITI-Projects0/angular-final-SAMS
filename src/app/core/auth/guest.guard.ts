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
    const hasAdminRole = Array.isArray(user?.roles) && user.roles.includes('admin');
    const hasStaffRole =
      Array.isArray(user?.roles) &&
      user.roles.some((role) => ['center_admin', 'teacher', 'assistant'].includes(role));
    const needsProfile = !hasAdminRole && user?.is_data_complete === false;

    if (needsProfile) {
      return router.createUrlTree(['/complete-profile']);
    }
    if (hasAdminRole) {
      return router.createUrlTree(['/dashboard/admin']);
    }
    if (hasStaffRole) {
      return router.createUrlTree(['/dashboard/staff']);
    }
    return router.createUrlTree(['/']);
  }

  return true;
};
