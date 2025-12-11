import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { Router } from '@angular/router';

// URLs that should not trigger logout on 401
const SKIP_LOGOUT_URLS = [
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/sanctum/csrf-cookie',
    '/broadcasting/auth',
    '/notifications',
    '/me'
];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenStorage = inject(TokenStorageService);
    const router = inject(Router);

    return next(req).pipe(
        catchError(err => {
            if (err.status === 401) {
                // Don't logout if it's a skipped request or on auth pages
                const shouldSkipLogout = SKIP_LOGOUT_URLS.some(url => req.url.includes(url));
                const isOnAuthPage = router.url.includes('/login') ||
                                     router.url.includes('/register') ||
                                     router.url.includes('/forgot-password') ||
                                     router.url.includes('/reset-password');

                if (!shouldSkipLogout && !isOnAuthPage) {
                    // Token is invalid/expired, clear storage and force login
                    tokenStorage.signOut();
                    router.navigate(['/login']);
                }
            }

            // For 403 (forbidden) we keep the user logged in and just propagate the error
            const error = err.error?.message || err.statusText;
            return throwError(() => error);
        })
    );
};
