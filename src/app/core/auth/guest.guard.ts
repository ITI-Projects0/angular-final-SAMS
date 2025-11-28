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
        if (user && !user.is_data_complete) {
            return router.createUrlTree(['/complete-profile']);
        }
        return router.createUrlTree(['/dashboard']);
    }

    return true;
};
