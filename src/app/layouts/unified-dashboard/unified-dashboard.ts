import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DashboardSidebar } from '../../shared/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../shared/dashboard-navbar/dashboard-navbar';
import { ThemeService } from '../../core/services/theme.service';

@Component({
    selector: 'app-unified-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, DashboardSidebar, DashboardNavbar],
    templateUrl: './unified-dashboard.html',
    styleUrl: './unified-dashboard.css',
})
export class UnifiedDashboard implements OnInit {
    dashboardType: 'admin' | 'staff' = 'staff';
    isSidebarCollapsed = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

    constructor(
        private route: ActivatedRoute,
        public theme: ThemeService
    ) {
        this.theme.init();
    }

    ngOnInit(): void {
        // Get dashboard type from route data
        this.route.data.subscribe(data => {
            if (data['dashboardType']) {
                this.dashboardType = data['dashboardType'];
            }
        });
        this.onResize();
    }

    @HostListener('window:resize')
    onResize(): void {
        if (typeof window === 'undefined') return;
        this.isSidebarCollapsed = window.innerWidth < 1024;
    }

    toggleSidebar(): void {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
}
