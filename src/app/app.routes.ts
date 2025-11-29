import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest.guard';
import { authGuard } from './core/auth/auth.guard';
import { StaffRoutes } from './features/staff-dashboard/staff.routes';
import { AdminRoutes } from './features/admin/admin.routes';

export const routes: Routes = [
  // Public pages with Layout (home at root)
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home').then(m => m.Home),
      },
      {
        path: 'home',
        redirectTo: '',
        pathMatch: 'full',
      },
      // Add more public pages here if needed
    ],
  },

  // Auth Pages (Guest Only)
  {
    path: 'register',
    loadComponent: () => import('./features/auth/auth/auth').then(m => m.Auth),
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth/auth').then(m => m.Auth),
    canActivate: [guestGuard],
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/auth/auth').then(m => m.Auth),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/auth/auth').then(m => m.Auth),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/auth/auth').then(m => m.Auth),
    canActivate: [guestGuard],
  },

  // Complete Profile (Auth Only)
  {
    path: 'complete-profile',
    loadComponent: () =>
      import('./features/auth/data-complete/data-complete').then(m => m.DataComplete),
    canActivate: [authGuard],
  },

      ...StaffRoutes,
      ...AdminRoutes

  // 404 Page
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound),
  },
];
