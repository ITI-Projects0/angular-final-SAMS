import { Routes } from '@angular/router';
import { AdminLayout } from '../../layout/admin-layout/admin-layout';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Setting } from './setting/setting';

export const AdminRoutes: Routes = [
  {
    path: 'dashboard/admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'setting', component: Setting },
      
        ]
    }
];