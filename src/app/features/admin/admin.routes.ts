import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { approvalGuard } from '../../core/auth/approval.guard';
import { UnifiedDashboard } from '../../layouts/unified-dashboard/unified-dashboard';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Setting } from './setting/setting';
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
      { path: '', component: AdminDashboard },
      { path: 'setting', component: Setting },
      { path: 'centers', component: Centers },
      { path: 'pending-centers', component: PendingCenters },
      { path: 'courses', component: Courses },
      { path: 'teachers', component: Teachers },
      { path: 'students', component: Students },
      { path: 'parents', component: Parents },
      { path: 'contacts', component: Contacts },
      { path: 'payments', component: Payments },
    ]
  }
];
