import { Routes } from '@angular/router';
import { DashboardLayout } from '../../layouts/dashboard-layout/dashboard-layout';
import { StaffDashboard } from './pages/staff-dashboard/staff-dashboard';
import { Staff } from './pages/staff/staff';
import { GroupInfo } from './pages/groups/group-info/group-info';
// import { Attendance} from './pages/attendance/attendance.component';
import { Groups } from './pages/groups/groups';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { Students } from './pages/students/students';
import { Setting } from './pages/setting/setting';
import { StudentInfo } from './pages/students/student-info/student-info';
export const StaffRoutes: Routes = [
  {
    path: 'dashboard/staff',
    component: DashboardLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher', 'assistant', 'center_admin'] },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: StaffDashboard },
      { path: 'groups', component: Groups },
      { path: 'groups/:id', component: GroupInfo },
      { path: 'staff', component: Staff },
      { path: 'students', component: Students },
      { path: 'students/:id', component: StudentInfo },
      { path: 'setting', component: Setting },

    ]
  }
];
