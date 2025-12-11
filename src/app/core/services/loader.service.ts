import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _isLoading = signal(false);
  private _message = signal('');
  private _loadingCount = 0;

  readonly isLoading = this._isLoading.asReadonly();
  readonly message = this._message.asReadonly();

  show(message: string = ''): void {
    this._loadingCount++;
    this._message.set(message);
    this._isLoading.set(true);
  }

  hide(): void {
    this._loadingCount = Math.max(0, this._loadingCount - 1);
    if (this._loadingCount === 0) {
      this._isLoading.set(false);
      this._message.set('');
    }
  }

  forceHide(): void {
    this._loadingCount = 0;
    this._isLoading.set(false);
    this._message.set('');
  }
}
