import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private _loading = signal<boolean>(false);

    public readonly loading = this._loading.asReadonly();

    constructor() { }

    show(): void {
        this._loading.set(true);
    }

    hide(): void {
        this._loading.set(false);
    }
}
