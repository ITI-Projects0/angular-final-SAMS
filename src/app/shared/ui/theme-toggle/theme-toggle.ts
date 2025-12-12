import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * A reusable theme toggle button component for switching between light and dark modes.
 * Can be used in headers, sidebars, and auth pages.
 */
@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button (click)="toggle()"
      class="p-2.5 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      [ngClass]="isDark ? 'text-gray-300' : 'text-gray-700'"
      [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      title="{{ isDark ? 'Switch to light mode' : 'Switch to dark mode' }}">
      @if(isDark) {
        <!-- Sun icon for dark mode (click to go light) -->
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      } @else {
        <!-- Moon icon for light mode (click to go dark) -->
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      }
    </button>
  `,
    styles: [`
    :host {
      display: inline-flex;
    }
  `]
})
export class ThemeToggleComponent {
    private readonly themeService = inject(ThemeService);

    get isDark(): boolean {
        return this.themeService.darkMode();
    }

    toggle(): void {
        this.themeService.toggle();
    }
}
