import { Routes } from '@angular/router';
import { StaffRoutes } from './features/staff-dashboard/staff.routes';
import { AdminRoutes } from './features/admin/admin.routes';
export const routes: Routes = [


      ...StaffRoutes,
      ...AdminRoutes


];
