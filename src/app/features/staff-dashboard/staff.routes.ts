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

export const StaffRoutes: Routes = [
  {
    path: 'dashboard/staff',
    component: UnifiedDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher', 'assistant', 'center_admin'], dashboardType: 'staff' },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: Overview },
      { path: 'groups', component: StaffGroups },
      { path: 'groups/:id', component: StaffGroupDetail },
      { path: 'groups/:groupId/lessons/:lessonId', component: LessonDetailComponent },
      { path: 'groups/:groupId/lessons/:lessonId/assessments/:assessmentId', loadComponent: () => import('./courses/assessment-detail/assessment-detail').then(m => m.AssessmentDetailComponent) },
      { path: 'staff', component: StaffTeamPage },
      { path: 'students', component: StaffStudentsPage },
      { path: 'setting', component: StaffSettingPage }
    ]
  }
];
