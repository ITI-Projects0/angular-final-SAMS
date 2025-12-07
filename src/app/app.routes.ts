import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest.guard';
import { authGuard } from './core/auth/auth.guard';
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
      { path: 'about', loadComponent: () => import('./features/public/about/about').then(m => m.About) },
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

  // Test Notifications (Development Only)
  {
    path: 'test-notifications',
    loadComponent: () => import('./test-notifications/test-notifications.component').then(m => m.TestNotificationsComponent),
    canActivate: [authGuard],
  },

  // Student & Parent Pages
  {
    path: 'dashboard',
    loadComponent: () => import('./layouts/student-dashboard/student-dashboard').then(m => m.StudentDashboard),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/student-pages/overview/overview').then(m => m.StudentOverview) },
      { path: 'classes', loadComponent: () => import('./features/student-pages/classes/classes').then(m => m.StudentClasses) },
      { path: 'classes/:id', loadComponent: () => import('./features/student-pages/class-details/class-details').then(m => m.StudentClassDetails) },
      { path: 'assignments', loadComponent: () => import('./features/student-pages/assignments/assignments').then(m => m.StudentAssignments) },
      { path: 'attendance', loadComponent: () => import('./features/student-pages/attendance/attendance').then(m => m.StudentAttendance) },
      { path: 'profile', loadComponent: () => import('./features/student-pages/profile/profile').then(m => m.StudentProfile) },
      { path: 'video', loadComponent: () => import('./features/student-pages/video-viewer/video-viewer').then(m => m.VideoViewer) },
      { path: 'children', loadComponent: () => import('./features/parent-pages/children/children').then(m => m.ParentChildren) },
      { path: 'children/:id', loadComponent: () => import('./features/parent-pages/child-details/child-details').then(m => m.ParentChildDetails) },
      { path: 'children/:childId/classes/:classId', loadComponent: () => import('./features/parent-pages/child-class-details/child-class-details').then(m => m.ChildClassDetails) },
      { path: 'parent-profile', loadComponent: () => import('./features/parent-pages/profile/profile').then(m => m.ParentProfile) },
    ]
  },
  // 404 Page
  { path: '**', loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound) }
];
