import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { UnifiedDashboard } from '../../layouts/unified-dashboard/unified-dashboard';
import { Overview } from './overview/overview';
import { StaffGroups } from './courses/courses';
import { StaffGroupDetail } from './courses/group-detail/group-detail';
import { LessonDetailComponent } from './courses/lesson-detail/lesson-detail';
import { Teachers as StaffTeamPage } from './center-admin-only/teachers/teachers';
import { Students as StaffStudentsPage } from './center-admin-only/students/students';
import { Setting as StaffSettingPage } from './setting/setting';
import { OutletComponent } from '../../shared/ui/outlet/outlet.component';

export const StaffRoutes: Routes = [
  {
    path: 'dashboard/staff',
    component: UnifiedDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher', 'assistant', 'center_admin'], dashboardType: 'staff' },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: Overview, data: { breadcrumb: 'Overview' } },
      {
        path: 'groups',
        component: OutletComponent,
        data: { breadcrumb: 'Groups' },
        children: [
          { path: '', component: StaffGroups },
          {
            path: ':id',
            children: [
              { path: '', component: StaffGroupDetail, data: { breadcrumb: 'Group Details' } },
              {
                path: 'lessons/:lessonId',
                children: [
                  { path: '', component: LessonDetailComponent, data: { breadcrumb: 'Lesson Details' } },
                  {
                    path: 'assessments/:assessmentId',
                    loadComponent: () => import('./courses/assessment-detail/assessment-detail').then(m => m.AssessmentDetailComponent),
                    data: { breadcrumb: 'Assessment Details' }
                  }
                ]
              }
            ]
          }
        ]
      },
      { path: 'staff', component: StaffTeamPage, data: { breadcrumb: 'Staff' } },
      { path: 'students', component: StaffStudentsPage, data: { breadcrumb: 'Students' } },
      { path: 'setting', component: StaffSettingPage, data: { breadcrumb: 'Settings' } }
    ]
  }
];
