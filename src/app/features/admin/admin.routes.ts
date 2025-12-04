import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { AdminLayout } from '../../layouts/admin-layout/admin-layout';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Setting } from './setting/setting';
import { Centers } from './centers/centers';
import { Courses } from './courses/courses';
import { Teachers } from './teachers/teachers';
import { Students } from './students/students';
import { Parents } from './parents/parents';
import { Contacts } from './contacts/contacts';
import { Payments } from './payments/payments';

export const AdminRoutes: Routes = [
  {
    path: 'dashboard/admin',
    component: AdminLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', component: AdminDashboard },
      { path: 'setting', component: Setting },
      { path: 'centers', component: Centers },
      { path: 'courses', component: Courses },
      { path: 'teachers', component: Teachers },
      { path: 'students', component: Students },
      { path: 'parents', component: Parents },
      { path: 'contacts', component: Contacts },
      { path: 'payments', component: Payments },
    ]
  }
];
