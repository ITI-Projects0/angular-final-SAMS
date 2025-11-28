import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface UiToast {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
  timeout?: number;
}

export interface UiModal {
  icon?: ToastTone;
  title: string;
  message: string;
  primaryText?: string;
  secondaryText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private _toasts = signal<UiToast[]>([]);
  public readonly toasts = this._toasts.asReadonly();

  private _modal = signal<UiModal | null>(null);
  public readonly modal = this._modal.asReadonly();

  showToast(toast: Omit<UiToast, 'id'>) {
    const id = this.generateId();
    const payload: UiToast = { id, timeout: 5000, ...toast };
    this._toasts.update((prev) => [payload, ...prev].slice(0, 4));

    if (payload.timeout && payload.timeout > 0 && typeof window !== 'undefined') {
      window.setTimeout(() => this.dismissToast(id), payload.timeout);
    }
  }

  dismissToast(id: string) {
    this._toasts.update((prev) => prev.filter((toast) => toast.id !== id));
  }

  openModal(modal: UiModal) {
    this._modal.set({
      dismissible: true,
      primaryText: 'Okay',
      ...modal
    });
  }

  closeModal() {
    this._modal.set(null);
  }

  private generateId(): string {
    const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return rand;
  }
}

