import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentService } from '../../../core/services/parent.service';

@Component({
  selector: 'app-parent-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class ParentOverview {
  private parentService = inject(ParentService);
  childrenSummary$ = this.parentService.getChildrenSummary();
  upcomingClasses$ = this.parentService.getUpcomingClassesForChildren();
  notifications$ = this.parentService.getNotifications();

  getTotalClasses(children: any[]): number {
    return children.reduce((sum, c) => sum + c.classesCount, 0);
  }

  getAvgAttendance(children: any[]): string {
    const total = children.reduce((sum, c) => sum + c.attendanceRate, 0);
    return (total / children.length).toFixed(1);
  }
}
