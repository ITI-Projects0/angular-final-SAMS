import { Routes } from '@angular/router';
import { DashboardLayout } from '../../layout/dashboard-layout/dashboard-layout';
import { StaffOverview } from './pages/staff-overview/staff-overview';
import { Staff } from './pages/staff/staff';
import { GroupInfo } from './pages/groups/group-info/group-info';
// import { Attendance} from './pages/attendance/attendance.component';
import { Groups } from './pages/groups/groups';

export const StaffRoutes: Routes = [
  {
    path: 'dashboard/staff',
    component: DashboardLayout,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: StaffOverview },
      { path: 'groups', component: Groups },
      { path: 'groups/:id', component: GroupInfo },
      { path: 'staff', component: Staff },
    //   { path: 'attendance', component: AttendanceComponent },
    //   { path: 'groups', component: GroupsComponent },
      // other staff pages...
    ]
  }
];
