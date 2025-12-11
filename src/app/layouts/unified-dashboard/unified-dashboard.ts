import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DashboardSidebar } from '../../shared/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../shared/dashboard-navbar/dashboard-navbar';
import { ThemeService } from '../../core/services/theme.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/ui/breadcrumb/breadcrumb.component';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-unified-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, DashboardSidebar, DashboardNavbar, BreadcrumbComponent],
    templateUrl: './unified-dashboard.html',
    styleUrl: './unified-dashboard.css',
    encapsulation: ViewEncapsulation.None,
})
export class UnifiedDashboard implements OnInit {
    dashboardType: 'admin' | 'staff' = 'staff';
    isSidebarCollapsed = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
    breadcrumbs: BreadcrumbItem[] = [];
    homeLink: string | any[] = '/';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public theme: ThemeService
    ) {
        this.theme.init();
    }

    ngOnInit(): void {
        // Get dashboard type from route data
        this.route.data.subscribe(data => {
            if (data['dashboardType']) {
                this.dashboardType = data['dashboardType'];
                this.homeLink = this.dashboardType === 'admin' ? ['/dashboard/admin'] : ['/dashboard/staff/overview'];
            }
        });

        // Generate initial breadcrumbs
        this.breadcrumbs = this.createBreadcrumbs(this.route.root);

        // Listen for route changes to update breadcrumbs
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.breadcrumbs = this.createBreadcrumbs(this.route.root);
        });

        this.onResize();
    }

    private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            if (routeURL !== '') {
                url += `/${routeURL}`;
            }

            const label = child.snapshot.data['breadcrumb'];
            if (label) {
                breadcrumbs.push({ label, url });
            }

            return this.createBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
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
