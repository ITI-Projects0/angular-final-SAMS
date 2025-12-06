import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenStorage = inject(TokenStorageService);
    const router = inject(Router);

    return next(req).pipe(
        catchError(err => {
            if (err.status === 401) {
                // Token is invalid/expired, clear storage and force login
                tokenStorage.signOut();
                router.navigate(['/login']);
            }

            // For 403 (forbidden) we keep the user logged in and just propagate the error
            const error = err.error?.message || err.statusText;
            return throwError(() => error);
        })
    );
};
