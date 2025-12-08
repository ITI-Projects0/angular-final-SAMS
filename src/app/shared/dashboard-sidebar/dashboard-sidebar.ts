import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  highlight?: boolean;
}

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrl: './dashboard-sidebar.css',
})
export class DashboardSidebar {
  @Input() menuType: 'admin' | 'staff' = 'staff';
  @Input() collapsed = false;

  brandName = 'SAMS';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  get menuItems(): MenuItem[] {
    if (this.menuType === 'admin') {
      return this.adminMenuItems;
    }
    return this.staffMenuItems;
  }

  private adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard/admin', icon: 'dashboard', exact: true },
    { label: 'Students', route: '/dashboard/admin/students', icon: 'students', exact: true },
    { label: 'Parents', route: '/dashboard/admin/parents', icon: 'parents', exact: true },
    { label: 'Centers', route: '/dashboard/admin/centers', icon: 'centers', exact: true },
    { label: 'Pending Approvals', route: '/dashboard/admin/pending-centers', icon: 'pending', exact: true, highlight: true },
    { label: 'Courses', route: '/dashboard/admin/courses', icon: 'courses', exact: true },
    { label: 'Teachers', route: '/dashboard/admin/teachers', icon: 'teachers', exact: true },
    { label: 'Contact', route: '/dashboard/admin/contacts', icon: 'contact', exact: true },
  ];

  private staffMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard/staff/overview', icon: 'dashboard', exact: true },
    { label: 'Groups', route: '/dashboard/staff/groups', icon: 'groups', exact: true },
    { label: 'Team', route: '/dashboard/staff/staff', icon: 'team', exact: true },
    { label: 'Students', route: '/dashboard/staff/students', icon: 'students', exact: true },
  ];

  get settingsRoute(): string {
    return this.menuType === 'admin' ? '/dashboard/admin/setting' : '/dashboard/staff/setting';
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
