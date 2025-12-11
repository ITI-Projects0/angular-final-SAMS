import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { approvalGuard } from '../../core/auth/approval.guard';
import { UnifiedDashboard } from '../../layouts/unified-dashboard/unified-dashboard';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Setting } from '../shared-dashboard-pages/setting/setting';
import { Centers } from './centers/centers';
import { PendingCenters } from './pending-centers/pending-centers';
import { Courses } from './courses/courses';
import { Teachers } from './teachers/teachers';
import { Students } from './students/students';
import { Parents } from './parents/parents';
import { Contacts } from './contacts/contacts';
import { Payments } from './payments/payments';

export const AdminRoutes: Routes = [
  {
    path: 'dashboard/admin',
    component: UnifiedDashboard,
    canActivate: [authGuard, approvalGuard, roleGuard],
    data: { roles: ['admin'], dashboardType: 'admin' },
    children: [
      { path: '', component: AdminDashboard, data: { breadcrumb: 'Overview' } },
      { path: 'settings', component: Setting, data: { breadcrumb: 'Settings' } },
      { path: 'centers', component: Centers, data: { breadcrumb: 'Centers' } },
      { path: 'pending-centers', component: PendingCenters, data: { breadcrumb: 'Pending Centers' } },
      { path: 'courses', component: Courses, data: { breadcrumb: 'Courses' } },
      { path: 'teachers', component: Teachers, data: { breadcrumb: 'Teachers' } },
      { path: 'students', component: Students, data: { breadcrumb: 'Students' } },
      { path: 'parents', component: Parents, data: { breadcrumb: 'Parents' } },
      { path: 'contacts', component: Contacts, data: { breadcrumb: 'Contacts' } },
      { path: 'payments', component: Payments, data: { breadcrumb: 'Payments' } },
    ]
  }
];
