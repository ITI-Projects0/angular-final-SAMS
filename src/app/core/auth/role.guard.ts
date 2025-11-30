import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const tokenStorage = inject(TokenStorageService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    const user = tokenStorage.getUser();
    if (!user) {
        return router.createUrlTree(['/login']);
    }

    const expectedRoles = route.data['roles'] as Array<string>;

    if (!expectedRoles || expectedRoles.length === 0) {
        return true; // No specific roles required
    }

    // Check if user has ANY of the expected roles
    const hasRole = user.roles.some(role => expectedRoles.includes(role));

    if (hasRole) {
        return true;
    }

    // Role mismatch, redirect to correct dashboard
    const correctDashboard = authService.getDashboardUrl(user.roles);
    return router.createUrlTree([correctDashboard]);
};
