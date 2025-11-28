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
            if (err.status === 401 || err.status === 403) {
                // Auto logout if 401/403 response returned from api
                tokenStorage.signOut();
                // location.reload();
                router.navigate(['/login']);
            }

            const error = err.error?.message || err.statusText;
            return throwError(() => error);
        })
    );
};
