import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { AuthService } from './auth.service';

/**
 * Guard that checks if the user's account is approved.
 * Redirects pending users to the pending-approval page.
 * Redirects rejected users to login.
 */
export const approvalGuard: CanActivateFn = (route, state) => {
    const tokenStorage = inject(TokenStorageService);
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    const user = tokenStorage.getUser();

    if (!user) {
        return router.createUrlTree(['/login']);
    }

    // Only check approval status for center_admin users
    const isCenterAdmin = user.roles?.includes('center_admin');

    if (isCenterAdmin) {
        if (user.approval_status === 'pending') {
            return router.createUrlTree(['/pending-approval']);
        }

        if (user.approval_status === 'rejected') {
            // Clear session and redirect to login
            tokenStorage.signOut();
            return router.createUrlTree(['/login']);
        }
    }

    return true;
};
