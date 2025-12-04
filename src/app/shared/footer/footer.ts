import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { APP_CONFIG } from '../../core/config/app.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private readonly themeService = inject(ThemeService);

  readonly currentYear = new Date().getFullYear();
  readonly appName = APP_CONFIG.name;
  readonly appTagline = APP_CONFIG.tagline;
  readonly appDescription = APP_CONFIG.description;

  get isDark(): boolean {
    return this.themeService.darkMode();
  }
}
