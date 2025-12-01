import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  dropdown = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  constructor() {
    this.theme.init();
  }

  get themeLabel(): string {
    return this.theme.darkMode() ? 'Light mode' : 'Dark mode';
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.dropdown = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.dropdown = false;
        this.router.navigate(['/login']);
      }
    });
  }
}
