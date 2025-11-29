import { Routes } from '@angular/router';
import { AdminLayout } from '../../layout/admin-layout/admin-layout';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Setting } from './setting/setting';
import { Centers } from './centers/centers';
import { Courses } from './courses/courses';
import { Teachers } from './teachers/teachers';
import { Students } from './students/students';
import { Contacts } from './contacts/contacts';
import { Payments } from './payments/payments';

export const AdminRoutes: Routes = [
  {
    path: 'dashboard/admin',
    component: AdminLayout,
    children: [
      { path: '', component: AdminDashboard },
      { path: 'setting', component: Setting },
      { path: 'centers', component: Centers },
      { path: 'courses', component: Courses },
      { path: 'teachers', component: Teachers },
      { path: 'students', component: Students },
      { path: 'contacts', component: Contacts },
      { path: 'payments', component: Payments },
    ],
  },
];
