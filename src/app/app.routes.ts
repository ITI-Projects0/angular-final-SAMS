import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest.guard';
import { StaffRoutes } from './features/staff-dashboard/staff.routes';
import { AdminRoutes } from './features/admin/admin.routes';

export const routes: Routes = [
  // Redirect root to home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public pages with Layout
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      { path: 'home', loadComponent: () => import('./features/public/home/home').then(m => m.Home) },
      // Add more public pages here if needed
    ]
  },

  // Auth Pages (Guest Only) with Auth Layout
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
      { path: 'verify-email', loadComponent: () => import('./features/auth/verify-email/verify-email').then(m => m.VerifyEmail) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword) },
    ]
  },

  // Staff Pages
  ...StaffRoutes,
  ...AdminRoutes,

  // 404 Page
  { path: '**', loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound) }
];
