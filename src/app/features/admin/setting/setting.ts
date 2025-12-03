import { Component, OnDestroy, OnInit } from '@angular/core';
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
  // Dummy user data until API is wired
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['Staff Member'],
    avatar:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=compress&cs=tinysrgb&w=200',
  };
  rolesInput = '';

  preferences: {
    theme: Theme;
    use24hTime: boolean;
    compactSidebar: boolean;
  } = {
    theme: 'light',
    use24hTime: true,
    compactSidebar: false,
  };

  notifications = {
    email: true,
    sms: false,
    inApp: true,
    attendanceAlerts: true,
  };

  security = {
    twoFactor: false,
  };

  loading = false;
  private themeSub?: Subscription;

  constructor(
    private themeService: ThemeService,
    private api: ApiService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.rolesInput = this.user.roles.join(', ');
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
    console.log('Saving account data', this.user);
  }

  savePreferences() {
    console.log('Saving preferences', this.preferences);
  }

  saveNotifications() {
    console.log('Saving notifications', this.notifications);
  }

  saveSecurity() {
    console.log('Saving security', this.security);
  }

  changePassword() {
    console.log('Open change password flow');
  }

  onRolesInputChange(value: string): void {
    this.rolesInput = value;
    this.user.roles = value
      .split(',')
      .map((role) => role.trim())
      .filter((role) => role.length > 0);
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
      },
      error: () => {
        const cached = this.tokenStorage.getUser();
        if (cached) {
          this.hydrateUser(cached);
        }
      },
      complete: () => {
        this.loading = false;
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
      name,
      email: payload?.email ?? this.user.email,
      roles,
      avatar: payload?.avatar ?? payload?.photo ?? this.user.avatar,
    };

    this.rolesInput = this.user.roles.join(', ');
  }
}
