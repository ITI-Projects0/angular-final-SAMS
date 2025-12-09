import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { TokenStorageService } from './token-storage.service';
import { tap, finalize, catchError, switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';

type AuthResponse = {
    user: User;
    token?: string | null;
    roles?: string[];
    approval_status?: string;
    requires_approval?: boolean;
    [key: string]: any;
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private apiService: ApiService,
        private tokenStorage: TokenStorageService
    ) { }

    login(credentials: any, remember = false, includeToken = false): Observable<AuthResponse> {
        return this.runAuthRequest('/auth/login', credentials, remember, includeToken);
    }

    register(user: any, remember = false, includeToken = false): Observable<AuthResponse> {
        return this.runAuthRequest('/auth/register', user, remember, includeToken);
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
        return !!this.tokenStorage.getUser();
    }

    sendResetCode(email: string): Observable<any> {
        return this.apiService.post('/auth/send-reset-code', { email });
    }

    resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Observable<any> {
        return this.apiService.post('/auth/reset-password', data);
    }

    validateResetCode(code: string): Observable<any> {
        return this.apiService.post('/auth/validate-reset-code', { code });
    }

    loginWithGoogle(token: string, remember = false): Observable<any> {
        // Manually attach header so the user request succeeds before persisting the token
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.apiService.get<any>('/me', undefined, headers).pipe(
            tap(user => {
                this.tokenStorage.persistAuthResponse(user, remember, token);
            })
        );
    }

    exchangeToken(exchangeToken: string, remember = false, includeToken = false): Observable<AuthResponse> {
        return this.runAuthRequest('/auth/exchange-token', { exchange_token: exchangeToken }, remember, includeToken);
    }

    // New method: verify email activation code
    verifyEmail(code: string, remember = false): Observable<any> {
        return this.apiService.post('/auth/verify-email', { code }).pipe(
            map(data => this.normalizeAuthResponse(data)),
            tap((data: AuthResponse) => {
                if (data?.user) {
                    this.tokenStorage.persistAuthResponse(data.user, remember, data.token);
                }
            })
        );
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

    user(): Observable<any> {
        return this.apiService.get('/me');
    }
  
    get currentUser(): any {
        return this.tokenStorage.getUser();
    }

    ensureCsrfCookie(): Observable<void> {
        return this.apiService.getCsrfCookie();
    }

    private persistAuthPayload(data: AuthResponse, remember: boolean): void {
        if (data?.user) {
            this.tokenStorage.persistAuthResponse(data.user, remember, data.token);
        }
    }

    private runAuthRequest(
        path: string,
        payload: Record<string, any>,
        remember: boolean,
        includeToken = false
    ): Observable<AuthResponse> {
        return this.ensureCsrfCookie().pipe(
            switchMap(() => this.apiService.post<AuthResponse>(path, {
                ...payload,
                include_token: includeToken
            })),
            map(raw => this.normalizeAuthResponse(raw)),
            tap(data => this.persistAuthPayload(data, remember))
        );
    }

    private normalizeAuthResponse(raw: any): AuthResponse {
        if (!raw) {
            return raw;
        }

        const envelope = raw.data ?? {};
        const user = raw.user ?? envelope.user;
        const token = raw.token ?? envelope.token ?? null;
        const roles = raw.roles ?? envelope.roles ?? user?.roles;
        const approval_status = raw.approval_status ?? envelope.approval_status ?? user?.approval_status;
        const requires_approval = raw.requires_approval ?? envelope.requires_approval;

        return {
            ...raw,
            ...envelope,
            user,
            token,
            roles,
            approval_status,
            requires_approval
        };
    }
}
