import { Injectable, signal, effect } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  darkMode = signal<boolean>(false);
  theme$ = toObservable(this.darkMode).pipe(map(isDark => isDark ? 'dark' : 'light'));
  private initialized = false;

  constructor() { }

  init(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    const savedTheme = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkMode.set(savedTheme ? savedTheme === 'dark' : prefersDark);

    effect(() => {
      if (this.darkMode()) {
        document.documentElement.classList.add('dark');
        window.localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        window.localStorage.setItem('theme', 'light');
      }
    });

    this.initialized = true;
  }

  toggle() {
    this.init();
    this.darkMode.update(v => !v);
  }
}
