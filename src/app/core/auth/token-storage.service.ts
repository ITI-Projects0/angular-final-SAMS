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

    seedToken(token: string, remember = false): void {
        const target = this.getStorage(remember ? 'local' : 'session');
        const secondary = this.getStorage(remember ? 'session' : 'local');
        this.clearStorage(secondary);
        target?.setItem(TOKEN_KEY, token);
    }

    persistAuthResponse(token: string, user: User, remember: boolean): void {
        this.seedToken(token, remember);
        const target = this.getStorage(remember ? 'local' : 'session');
        target?.setItem(USER_KEY, JSON.stringify(user));
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
        if (session?.getItem(TOKEN_KEY)) {
            return session;
        }
        const local = this.getStorage('local');
        if (local?.getItem(TOKEN_KEY)) {
            return local;
        }
        return session ?? local;
    }
}
