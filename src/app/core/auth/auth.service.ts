import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { TokenStorageService } from './token-storage.service';
import { tap } from 'rxjs/operators';

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

    logout(): void {
        this.tokenStorage.signOut();
        // Optional: Call backend to invalidate token
    }

    isLoggedIn(): boolean {
        return !!this.tokenStorage.getToken();
    }

    sendResetCode(email: string): Observable<any> {
        return this.apiService.post('/auth/send-reset-code', { email });
    }

    validateResetCode(code: string): Observable<any> {
        return this.apiService.post('/auth/validate-reset-code', { code });
    }

    resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Observable<any> {
        return this.apiService.post('/auth/reset-password', data);
    }

    exchangeToken(code: string): Observable<any> {
        return this.apiService.post<any>('/auth/exchange-token', { code }).pipe(
            tap(response => {
                if (response.token && response.user) {
                    this.tokenStorage.persistAuthResponse(response.token, response.user, false);
                }
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

    completeProfile(profileData: any): Observable<any> {
        return this.apiService.post('/auth/complete-profile', profileData).pipe(
            tap((response: any) => {
                if (response?.user) {
                    this.tokenStorage.updateStoredUser(response.user);
                }
            })
        );
    }
}
