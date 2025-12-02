import { Component, inject } from '@angular/core';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CommonModule } from '@angular/common';
import { ParentOverview } from '../../parent-pages/overview/overview';
import { StudentService } from '../../../core/services/student.service';

@Component({
    selector: 'app-student-overview',
    standalone: true,
    imports: [CommonModule, ParentOverview],
    templateUrl: './overview.html',
    styleUrl: './overview.css'
})
export class StudentOverview {
    private tokenService = inject(TokenStorageService);
    private studentService = inject(StudentService);

    summary$ = this.studentService.getDashboardSummary();
    upcomingClasses$ = this.studentService.getUpcomingClasses();
    upcomingExams$ = this.studentService.getUpcomingExams();
    notifications$ = this.studentService.getNotifications();
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
