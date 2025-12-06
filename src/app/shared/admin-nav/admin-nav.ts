import { AuthService } from './../../core/auth/auth.service';
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { TokenStorageService } from '../../core/auth/token-storage.service';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule, NotificationBellComponent, RouterLink],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.css',
})
export class AdminNav {
  dropdown = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  constructor(public theme: ThemeService) { }

  get userName(): string {
    const user = this.tokenStorage.getUser();
    const firstName = user?.firstName ?? (user as any)?.first_name;
    const lastName = user?.lastName ?? (user as any)?.last_name;
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return user?.name || fullName || 'Admin';
  }

  get userEmail(): string {
    return this.tokenStorage.getUser()?.email || 'admin@example.com';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
