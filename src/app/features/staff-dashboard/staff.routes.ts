import { Setting } from './pages/setting/setting';
import { StudentInfo } from './pages/students/student-info/student-info';
import { Routes } from '@angular/router';
import { DashboardLayout } from '../../layout/dashboard-layout/dashboard-layout';
import { StaffDashboard } from './pages/staff-dashboard/staff-dashboard';
import { Staff } from './pages/staff/staff';
import { GroupInfo } from './pages/groups/group-info/group-info';
import { Groups } from './pages/groups/groups';
import { Students } from './pages/students/students';

export const StaffRoutes: Routes = [
  {
    path: 'dashboard/staff',
    component: DashboardLayout,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'staff-dashboard', component: StaffDashboard },
      { path: 'groups', component: Groups },
      { path: 'groups/:id', component: GroupInfo },
      { path: 'staff', component: Staff },
      { path: 'students', component: Students},
      { path: 'students/:id', component: StudentInfo},
      { path: 'setting', component: Setting },
    //   { path: 'attendance', component: AttendanceComponent },
    //   { path: 'groups', component: GroupsComponent },
      // other staff pages...
    ]
  }
];
