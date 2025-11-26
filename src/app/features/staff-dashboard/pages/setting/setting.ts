import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  // بيانات المستخدم (dummy دلوقتي)
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Staff Member',
    avatar:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=compress&cs=tinysrgb&w=200',
  };

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
    this.applyTheme();
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
    this.applyLanguage();
  }

  // -------------------------------------
  // تطبيق الثيم فعليًا
  // -------------------------------------
  private applyTheme(): void {
    const root = document.documentElement;
    const theme = this.preferences.theme;

    // شيل أي state قديم
    root.classList.remove('dark');
    root.dataset['theme'] = theme;

    let finalTheme: Theme = theme;

    if (theme === 'system') {
      const prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      finalTheme = prefersDark ? 'dark' : 'light';
    }

    if (finalTheme === 'dark') {
      root.classList.add('dark'); // Tailwind dark: هيشتغل
    }
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
}
