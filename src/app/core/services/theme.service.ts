import { Injectable, signal, effect } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private preference: ThemePreference = 'light';
  private initialized = false;
  private mediaQuery: MediaQueryList | null = null;

  darkMode = signal<boolean>(false);
  theme$ = toObservable(this.darkMode).pipe(map(isDark => isDark ? 'dark' : 'light'));

  init(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const savedPreference = window.localStorage.getItem('themePreference') as ThemePreference | null;
    const legacyTheme = window.localStorage.getItem('theme') as ThemePreference | null;
    const prefersDark = this.mediaQuery.matches;

    this.preference = savedPreference ?? legacyTheme ?? (prefersDark ? 'dark' : 'light');

    const initialTheme = this.preference === 'system'
      ? (prefersDark ? 'dark' : 'light')
      : this.preference;

    this.darkMode.set(initialTheme === 'dark');

    const syncSystem = (event: MediaQueryListEvent | MediaQueryList) => {
      if (this.preference === 'system') {
        this.darkMode.set(event.matches);
      }
    };

    if (typeof this.mediaQuery.addEventListener === 'function') {
      this.mediaQuery.addEventListener('change', syncSystem);
    } else {
      // Fallback for older browsers
      // @ts-ignore
      this.mediaQuery.addListener(syncSystem);
    }

    effect(() => {
      document.documentElement.classList.toggle('dark', this.darkMode());
      document.documentElement.dataset['theme'] = this.preference;
      window.localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
      window.localStorage.setItem('themePreference', this.preference);
    });

    this.initialized = true;
  }

  setThemePreference(preference: ThemePreference): void {
    this.init();
    this.preference = preference;
    const nextTheme = preference === 'system' ? this.resolveSystemPreference() : preference;
    this.darkMode.set(nextTheme === 'dark');
  }

  resolveSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') {
      return 'light';
    }

    if (!this.mediaQuery) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }

    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  get currentPreference(): ThemePreference {
    this.init();
    return this.preference;
  }

  get currentTheme(): 'light' | 'dark' {
    this.init();
    return this.darkMode() ? 'dark' : 'light';
  }

  toggle() {
    this.init();
    this.darkMode.update(v => !v);
    this.preference = this.darkMode() ? 'dark' : 'light';
  }
}
