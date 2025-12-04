import { Component, inject, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { APP_CONFIG } from '../../core/config/app.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() showSidebarToggle = false;
  @Input() menuItems: any[] = [];

  isMenuOpen = false;
  isUserMenuOpen = false;

  readonly appName = APP_CONFIG.name;
  readonly navLinks = [
    { label: 'Home', route: '/home', fragment: 'hero' },
    { label: 'About Us', route: '/home', fragment: 'about' },
    { label: 'Contact Us', route: '/home', fragment: 'contact' },
  ];

  ngOnInit(): void {
    this.setupMenuItems();
  }

  private setupMenuItems(): void {
    const roles = this.user?.roles || [];

    if (roles.includes('parent')) {
      this.menuItems = [
        { label: 'Overview', route: '/dashboard', icon: 'home' },
        { label: 'Children', route: '/dashboard/children', icon: 'users' },
        { label: 'Attendance', route: '/dashboard/attendance', icon: 'calendar' },
        // { label: 'Profile', route: '/dashboard/parent-profile', icon: 'user' }
      ];
    } else {
      // Student menu
      this.menuItems = [
        { label: 'Overview', route: '/dashboard', icon: 'home' },
        { label: 'Classes', route: '/dashboard/classes', icon: 'book' },
        { label: 'Assignments', route: '/dashboard/assignments', icon: 'file-text' },
        { label: 'Attendance', route: '/dashboard/attendance', icon: 'calendar' },
        // { label: 'Profile', route: '/dashboard/profile', icon: 'user' }
      ];
    }
  }

  get isDark(): boolean {
    return this.themeService.darkMode();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get user() {
    return this.tokenStorage.getUser();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  goToDashboard(): void {
    const user = this.tokenStorage.getUser();
    const redirectUrl = this.authService.getDashboardUrl(user?.roles || []);
    this.router.navigate([redirectUrl]);
  }
}
