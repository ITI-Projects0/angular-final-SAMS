import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Router } from '@angular/router';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
    selector: 'app-dashboard-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule, AsyncPipe, NotificationBellComponent],
    templateUrl: './dashboard-navbar.html',
    styleUrl: './dashboard-navbar.css',
})
export class DashboardNavbar {
    @Output() toggleSidebar = new EventEmitter<void>();

    dropdown = false;

    constructor(
        private authService: AuthService,
        public theme: ThemeService,
        private router: Router
    ) { }

    get userName(): string {
        return this.authService.currentUser?.name || 'User';
    }

    get userEmail(): string {
        return this.authService.currentUser?.email || '';
    }

    get userInitials(): string {
        const name = this.userName;
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    get userRole(): string {
        const roles = this.authService.currentUser?.roles || [];
        if (roles.includes('admin')) return 'Admin';
        if (roles.includes('center_admin')) return 'Center Admin';
        if (roles.includes('teacher')) return 'Teacher';
        if (roles.includes('assistant')) return 'Assistant';
        return 'Staff';
    }

    logout(): void {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: () => {
                this.router.navigate(['/login']);
            }
        });
    }
}
