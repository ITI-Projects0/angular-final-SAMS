import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemePreference, ThemeService } from '../../../core/services/theme.service';
import { ApiService } from '../../../core/services/api.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { User } from '../../../core/models/user.model';

type Theme = ThemePreference;

@Component({
  selector: 'app-staff-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.html',
  styleUrl: './setting.css',
})
export class Setting implements OnInit, OnDestroy {
  @ViewChild('avatarInput') avatarInputRef!: ElementRef<HTMLInputElement>;
  user = {
    id: 0,
    name: 'Staff Member',
    email: '',
    roles: [] as string[],
    avatar: ''
  };
  avatarPreview: string | null = null;
  avatarFile: File | null = null;

  preferences: {
    theme: Theme;
  } = {
      theme: 'light',
    };

  loading = false;
  private themeSub?: Subscription;
  password = { current: '', new: '', confirm: '' };
  passwordVisibility = { current: false, new: false, confirm: false };

  constructor(
    private themeService: ThemeService,
    private api: ApiService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!this.user.avatar) {
      this.user.avatar = this.generateInitialsAvatar(this.user.name);
    }
    this.preferences.theme = this.themeService.currentPreference;
    this.applyTheme();
    this.themeSub = this.themeService.theme$.subscribe(() => {
      this.preferences.theme = this.themeService.currentPreference;
    });
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  // -------------------------------------
  // Handlers
  // -------------------------------------
  onThemeChange(value: Theme): void {
    this.preferences.theme = value;
    this.applyTheme();
  }

  // -------------------------------------
  // Theme helper
  // -------------------------------------
  private applyTheme(): void {
    this.themeService.setThemePreference(this.preferences.theme);
    document.documentElement.dataset['theme'] = this.preferences.theme;
  }

  // -------------------------------------
  // Actions
  // -------------------------------------
  saveAccount() {
    const hasAvatar = !!this.avatarFile;
    const body = new FormData();
    body.append('name', this.user.name);
    if (hasAvatar) {
      body.append('avatar', this.avatarFile as File);
    }

    this.loading = true;
    this.api.put('/me', body).subscribe({
      next: (res: any) => {
        const payload = (res as any)?.data ?? res;
        const cached = this.tokenStorage.getUser();
        const avatar = this.normalizeAvatar(payload?.avatar, payload?.name || this.user.name);
        this.user.avatar = this.avatarPreview || avatar || this.user.avatar;
        this.avatarFile = null;
        const updatedUser = {
          ...(cached ?? {}),
          id: payload?.id ?? this.user.id,
          name: payload?.name ?? this.user.name,
          avatar: this.user.avatar,
          roles: payload?.roles ?? this.user.roles,
          email: payload?.email ?? this.user.email
        };
        this.tokenStorage.updateStoredUser(updatedUser as any);
      },
      error: () => { },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePassword() {
    if (!this.password.current || !this.password.new || this.password.new !== this.password.confirm) return;

    const payload = {
      current_password: this.password.current,
      password: this.password.new,
      password_confirmation: this.password.confirm
    };

    this.loading = true;
    this.api.put('/me/password', payload).subscribe({
      next: () => {
        this.password = { current: '', new: '', confirm: '' };
        this.passwordVisibility = { current: false, new: false, confirm: false };
        alert('Password updated successfully.');
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update password.');
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  onAvatarSelected(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;
    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
      this.user.avatar = this.avatarPreview;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  triggerAvatarUpload(): void {
    this.avatarInputRef?.nativeElement?.click();
  }

  // -------------------------------------
  // Data loading
  // -------------------------------------
  private loadUser(): void {
    this.loading = true;
    this.api.get<any>('/me').subscribe({
      next: (res) => {
        const payload = (res as any)?.data ?? res;
        this.hydrateUser(payload);
        this.cdr.detectChanges();
      },
      error: () => {
        const cached = this.tokenStorage.getUser();
        if (cached) {
          this.hydrateUser(cached);
          this.cdr.detectChanges();
        }
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private hydrateUser(payload: any | User): void {
    const name =
      payload?.name ||
      [payload?.first_name, payload?.last_name].filter(Boolean).join(' ').trim() ||
      this.user.name;

    const roles =
      Array.isArray(payload?.roles)
        ? payload.roles
          .map((r: any) => (typeof r === 'string' ? r : r?.name))
          .filter((r: any) => !!r && typeof r === 'string')
        : payload?.role
          ? [payload.role]
          : this.user.roles;

    this.user = {
      ...this.user,
      id: payload?.id ?? this.user.id,
      name,
      email: payload?.email ?? this.user.email,
      roles,
      avatar: this.normalizeAvatar(payload?.avatar ?? payload?.photo, name),
    };

    if (!this.user.avatar) {
      this.user.avatar = this.generateInitialsAvatar(name);
    }
  }

  private normalizeAvatar(value: string | undefined | null, fallbackName?: string): string {
    if (!value) return this.generateInitialsAvatar(fallbackName ?? this.user.name);
    if (value.startsWith('http')) return value;
    return `${window.location.origin}/storage/${value}`;
  }

  private generateInitialsAvatar(name: string): string {
    const initials = (name || 'S')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'S';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
      <rect width="100%" height="100%" fill="#334155"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="38" fill="#f8fafc" font-family="Inter, Arial, sans-serif">${initials}</text>
    </svg>`;
    const encoder =
      (typeof window !== 'undefined' && window.btoa
        ? (value: string) => window.btoa(unescape(encodeURIComponent(value)))
        : (typeof btoa !== 'undefined'
          ? (value: string) => btoa(unescape(encodeURIComponent(value)))
          : null));

    if (!encoder) {
      return '';
    }

    return `data:image/svg+xml;base64,${encoder(svg)}`;
  }
}
