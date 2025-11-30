import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { TokenStorageService } from './token-storage.service';
import { tap, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private apiService: ApiService,
        private tokenStorage: TokenStorageService
    ) { }

    login(credentials: any, remember = false): Observable<any> {
        return this.apiService.post<any>('/auth/login', credentials).pipe(
            tap(data => {
                this.tokenStorage.persistAuthResponse(data.token, data.user, remember);
            })
        );
    }

    register(user: any): Observable<any> {
        return this.apiService.post('/auth/register', user);
    }

    logout(): Observable<any> {
        return this.apiService.post('/auth/logout', {}).pipe(
            catchError(() => of(null)),
            finalize(() => {
                this.tokenStorage.signOut();
            })
        );
    }

    isLoggedIn(): boolean {
        return !!this.tokenStorage.getToken();
    }

    sendResetCode(email: string): Observable<any> {
        return this.apiService.post('/auth/send-reset-code', { email });
    }

    resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Observable<any> {
        return this.apiService.post('/auth/reset-password', data);
    }

    loginWithGoogle(token: string, remember = false): Observable<any> {
        this.tokenStorage.seedToken(token, remember);
        // Manually attach header to ensure it's sent immediately after seeding
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.apiService.get<any>('/me', undefined, headers).pipe(
            tap(user => {
                this.tokenStorage.persistAuthResponse(token, user, remember);
            })
        );
    }

    exchangeToken(exchangeToken: string, remember = false): Observable<any> {
        return this.apiService.post<any>('/auth/exchange-token', { exchange_token: exchangeToken }).pipe(
            tap(data => {
                this.tokenStorage.persistAuthResponse(data.token, data.user, remember);
            })
        );
    }

    // New method: verify email activation code
    verifyEmail(code: string): Observable<any> {
        return this.apiService.post('/auth/verify-email', { code });
    }

    // Existing method to send verification email (if needed)
    sendVerificationEmail(): Observable<any> {
        return this.apiService.post('/auth/send-verification-email', {});
    }

    getDashboardUrl(roles: string[]): string {
        if (roles.includes('admin')) {
            return '/dashboard/admin';
        }
        if (roles.some(r => ['center_admin', 'teacher', 'assistant'].includes(r))) {
            return '/dashboard/staff';
        }
        if (roles.some(r => ['student', 'parent'].includes(r))) {
            return '/dashboard';
        }
        return '/';
    }
}