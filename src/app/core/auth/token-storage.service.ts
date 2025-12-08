import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {

    constructor() { }

    signOut(): void {
        this.clearStorage(this.getStorage('session'));
        this.clearStorage(this.getStorage('local'));
    }

    persistAuthResponse(user: User, remember: boolean, token?: string | null): void {
        const primary = this.getStorage(remember ? 'local' : 'session');
        const secondary = this.getStorage(remember ? 'session' : 'local');

        this.clearStorage(secondary);
        if (!primary) {
            return;
        }

        this.clearStorage(primary);
        if (token) {
            primary.setItem(TOKEN_KEY, token);
        }
        primary.setItem(USER_KEY, JSON.stringify(user));
    }

    public getToken(): string | null {
        const sessionToken = this.getStorage('session')?.getItem(TOKEN_KEY);
        if (sessionToken) {
            return sessionToken;
        }
        return this.getStorage('local')?.getItem(TOKEN_KEY) ?? null;
    }

    public getUser(): User | null {
        const raw = this.getStorage('session')?.getItem(USER_KEY)
            ?? this.getStorage('local')?.getItem(USER_KEY);
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch {
        return null;
        }
    }

    public updateStoredUser(user: User): void {
        const storage = this.getActiveStorage();
        storage?.setItem(USER_KEY, JSON.stringify(user));
    }

    private getStorage(type: 'session' | 'local'): Storage | null {
        if (typeof window === 'undefined') {
            return null;
        }
        return type === 'local' ? window.localStorage : window.sessionStorage;
    }

    private clearStorage(storage: Storage | null) {
        storage?.removeItem(TOKEN_KEY);
        storage?.removeItem(USER_KEY);
    }

    private getActiveStorage(): Storage | null {
        const session = this.getStorage('session');
        if (session?.getItem(TOKEN_KEY) || session?.getItem(USER_KEY)) {
            return session;
        }
        const local = this.getStorage('local');
        if (local?.getItem(TOKEN_KEY) || local?.getItem(USER_KEY)) {
            return local;
        }
        return session ?? local;
    }
}
