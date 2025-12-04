import { Component, inject } from '@angular/core';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CommonModule } from '@angular/common';
import { ParentOverview } from '../../parent-pages/overview/overview';
import { StudentService } from '../../../core/services/student.service';
import { ThemeService } from '../../../core/services/theme.service';
import { map, shareReplay, tap } from 'rxjs';
import { LoaderComponent } from '../../../shared/loader/loader';

@Component({
    selector: 'app-student-overview',
    standalone: true,
    imports: [CommonModule, ParentOverview, LoaderComponent],
    templateUrl: './overview.html',
    styleUrl: './overview.css'
})
export class StudentOverview {
    private tokenService = inject(TokenStorageService);
    private studentService = inject(StudentService);
    private themeService = inject(ThemeService);

    get isDarkMode(): boolean {
        return this.themeService.darkMode();
    }

    home$ = this.studentService.getHomeDashboard().pipe(
        tap((res) => console.log('Student home dashboard', res)),
        shareReplay(1)
    );

    private pickSummary(res: any) {
        const root = res?.data ?? res ?? {};
        const summary = root.summary ?? root;
        console.log(summary);

        return {
            classesCount: Number(summary.classesCount ?? summary.classes ?? summary.enrolledClasses ?? summary.enrolled_courses ?? 0),
            assignmentsCount: Number(summary.assignmentsCount ?? summary.pendingAssignments ?? summary.assignments?.length ?? 0),
            attendanceRate: Number(summary.attendanceRate ?? summary.attendance_rate ?? summary.attendance ?? summary.attendanceRatePercentage ?? 0),
        };
    }

    private pickArray(res: any, keyCandidates: string[]): any[] {
        const root = res?.data ?? res ?? {};
        for (const key of keyCandidates) {
            if (Array.isArray((root as any)[key])) {
                return (root as any)[key];
            }
        }
        return [];
    }

    summary$ = this.home$.pipe(map(res => this.pickSummary(res)));
    upcomingClasses$ = this.home$.pipe(map(res => this.pickArray(res, ['upcomingLessons', 'upcoming_lessons', 'upcomingClasses', 'classes', 'upcoming_classes'])));
    upcomingAssignments$ = this.home$.pipe(map(res => this.pickArray(res, ['upcomingAssignments', 'upcoming_assignments', 'assignments'])));
    notifications$ = this.home$.pipe(map(res => this.pickArray(res, ['notifications', 'alerts', 'messages'])));
    user = this.tokenService.getUser();

    get isParent(): boolean {
        return this.tokenService.getUser()?.roles.includes('parent') ?? false;
    }

    markAsRead(notificationId: number) {
        console.log('Mark notification as read:', notificationId);
        // Will call API: this.studentService.markNotificationAsRead(notificationId).subscribe()
    }

    markAllAsRead() {
        console.log('Mark all notifications as read');
        // Will call API: this.studentService.markAllNotificationsAsRead().subscribe()
    }
}
