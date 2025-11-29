import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { TokenStorageService } from './token-storage.service';
import { finalize, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: any;
    meta?: any;
}

interface AuthPayload {
    token?: string;
    user?: User;
}

interface ResetPayload {
    email: string;
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private apiService: ApiService,
        private tokenStorage: TokenStorageService
    ) { }

    private unwrap<T>(response: ApiResponse<T> | T): T {
        return (response as ApiResponse<T>)?.data ?? response as T;
    }

    private persistIfPresent(payload?: AuthPayload, remember = false): void {
        if (!payload?.token || !payload?.user) {
            console.warn('AuthService: Missing token or user in response payload', payload);
            return;
        }
        this.tokenStorage.persistAuthResponse(payload.token, payload.user, remember);
    }

    login(credentials: any, remember = false): Observable<AuthPayload> {
        return this.apiService.post<ApiResponse<AuthPayload>>('/auth/login', credentials).pipe(
            map((response) => this.unwrap<AuthPayload>(response)),
            tap((payload) => this.persistIfPresent(payload, remember))
        );
    }

    register(user: any): Observable<any> {
        return this.apiService.post('/auth/register', user);
    }

    logout(): Observable<void> {
        const token = this.tokenStorage.getToken();
        const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

        return this.apiService.post<ApiResponse<null>>('/auth/logout', {}, headers ? { headers } : {}).pipe(
            map(() => undefined),
            finalize(() => this.tokenStorage.signOut())
        );
    }

    isLoggedIn(): boolean {
        return !!this.tokenStorage.getToken();
    }

    sendResetCode(email: string): Observable<any> {
        return this.apiService.post('/auth/send-reset-code', { email });
    }

    validateResetCode(code: string): Observable<ResetPayload> {
        return this.apiService.post<ApiResponse<ResetPayload>>('/auth/validate-reset-code', { code }).pipe(
            map((response) => this.unwrap<ResetPayload>(response))
        );
    }

    resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Observable<any> {
        return this.apiService.post('/auth/reset-password', data);
    }

    exchangeToken(code: string): Observable<AuthPayload> {
        return this.apiService.post<ApiResponse<AuthPayload>>('/auth/exchange-token', { code }).pipe(
            map((response) => this.unwrap<AuthPayload>(response)),
            tap((payload) => this.persistIfPresent(payload, false))
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

    completeProfile(profileData: any): Observable<User> {
        return this.apiService.post<ApiResponse<{ user: User }>>('/auth/complete-profile', profileData).pipe(
            map((response) => this.unwrap<{ user: User }>(response)),
            tap((payload) => {
                if (payload?.user) {
                    this.tokenStorage.updateStoredUser(payload.user);
                }
            }),
            map((payload) => payload.user)
        );
    }
}
