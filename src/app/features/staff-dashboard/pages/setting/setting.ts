import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/theme.service';

type Theme = 'light' | 'dark' | 'system';
type LanguageCode = 'en' | 'ar';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.html',
  styleUrl: './setting.css',
}) 
export class Setting implements OnInit {
  private readonly theme = inject(ThemeService);

  // بيانات المستخدم (dummy دلوقتي)
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['Staff Member'],
    avatar:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=compress&cs=tinysrgb&w=200',
  };
  rolesInput = '';

  // تفضيلات عامة
  preferences: {
    theme: Theme;
    language: LanguageCode;
    use24hTime: boolean;
    compactSidebar: boolean;
  } = {
    theme: 'light',
    language: 'en',
    use24hTime: true,
    compactSidebar: false,
  };

  // إشعارات
  notifications = {
    email: true,
    sms: false,
    inApp: true,
    attendanceAlerts: true,
  };

  // أمان
  security = {
    twoFactor: false,
  };

  ngOnInit(): void {
    this.rolesInput = this.user.roles.join(', ');
    this.theme.init();
    // load persisted theme if available
    const persisted = localStorage.getItem('theme') as Theme | null;
    if (persisted === 'dark' || persisted === 'light' || persisted === 'system') {
      this.preferences.theme = persisted;
    } else if (document.documentElement.classList.contains('dark')) {
      this.preferences.theme = 'dark';
    }
    this.applyTheme();
    // load language preference
    const lang = (localStorage.getItem('lang') as LanguageCode | null) ?? null;
    if (lang) this.preferences.language = lang;
    this.applyLanguage();
  }

  // -------------------------------------
  // Handlers
  // -------------------------------------
  onThemeChange(value: Theme): void {
    this.preferences.theme = value;
    this.applyTheme();
  }

  onLanguageChange(value: LanguageCode): void {
    this.preferences.language = value;
    localStorage.setItem('lang', value);
    this.applyLanguage();
  }

  // -------------------------------------
  // تطبيق الثيم فعليًا
  // -------------------------------------
  private applyTheme(): void {
    const root = document.documentElement;
    const theme = this.preferences.theme;

    // شيل أي state قديم
    root.dataset['theme'] = theme;

    let finalTheme: Theme = theme;

    if (theme === 'system') {
      const prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      finalTheme = prefersDark ? 'dark' : 'light';
    }

    this.theme.init();
    this.theme.darkMode.set(finalTheme === 'dark');
    localStorage.setItem('theme', finalTheme);
    root.classList.toggle('dark', finalTheme === 'dark'); // Tailwind dark: U?USO'O?O?U,
  }

  // -------------------------------------
  // تطبيق اللغة / الاتجاه
  // -------------------------------------
  private applyLanguage(): void {
    const root = document.documentElement;
    const lang = this.preferences.language;

    if (lang === 'ar') {
      root.lang = 'ar';
      root.dir = 'rtl';
      root.classList.add('rtl');
    } else {
      root.lang = 'en';
      root.dir = 'ltr';
      root.classList.remove('rtl');
    }
  }

  // -------------------------------------
  // Actions (placeholder لحد ما توصّل API)
  // -------------------------------------
  saveAccount() {
    console.log('Saving account data', this.user);
  }

  savePreferences() {
    console.log('Saving preferences', this.preferences);
    // هنا ممكن برضه تحفظ في localStorage
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
}

