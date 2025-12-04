import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemePreference, ThemeService } from '../../../core/services/theme.service';
import { ApiService } from '../../../core/services/api.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { User } from '../../../core/models/user.model';

type Theme = ThemePreference;

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.html',
  styleUrl: './setting.css',
})
export class Setting implements OnInit, OnDestroy {
  user = {
    id: 0,
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['Staff Member'],
    avatar:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=compress&cs=tinysrgb&w=200',
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
  password = { new: '', confirm: '' };

  constructor(
    private themeService: ThemeService,
    private api: ApiService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
  // Actions (placeholder until API wiring)
  // -------------------------------------
  saveAccount() {
    if (!this.user.id) return;
    const body: any = this.avatarFile ? new FormData() : {};
    if (this.avatarFile) {
      body.append('avatar', this.avatarFile);
      body.append('name', this.user.name);
    } else {
      body.name = this.user.name;
    }
    this.loading = true;
    this.api.put(`/users/${this.user.id}`, body).subscribe({
      next: (res: any) => {
        const cached = this.tokenStorage.getUser();
        const serverUser = (res as any)?.data ?? res;
        const avatar = this.normalizeAvatar(serverUser?.avatar) || this.user.avatar;
        this.user.avatar = this.avatarPreview || avatar || this.user.avatar;
        this.avatarFile = null;
        if (cached) {
          const updated = { ...cached, name: this.user.name, avatar: this.user.avatar };
          this.tokenStorage.updateStoredUser(updated as any);
        }
      },
      error: () => {},
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePassword() {
    if (!this.user.id || !this.password.new || this.password.new !== this.password.confirm) return;
    this.loading = true;
    this.api.put(`/users/${this.user.id}`, { password: this.password.new }).subscribe({
      next: () => {
        this.password = { new: '', confirm: '' };
      },
      error: () => {},
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
      avatar: this.normalizeAvatar(payload?.avatar ?? payload?.photo ?? this.user.avatar),
    };
  }

  private normalizeAvatar(value: string | undefined | null): string {
    if (!value) return this.user.avatar;
    if (value.startsWith('http')) return value;
    return `${window.location.origin}/storage/${value}`;
  }
}
