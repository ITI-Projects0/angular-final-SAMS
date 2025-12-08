import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentService } from '../../../core/services/parent.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-parent-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class ParentOverview {
  private parentService = inject(ParentService);
  summary$ = this.parentService.getSummary().pipe(
    map((res: any) => ({
      childrenTotal: Number(res.children_total ?? 0),
      averageAttendanceRate: Number(res.average_attendance_rate ?? 0),
      activeClasses: Number(res.active_classes ?? 0),
      pendingAssignmentsCount: Number(res.pending_assignments_count ?? 0),
      upcomingClassesCount: Number(res.upcoming_classes_count ?? 0)
    }))
  );
  overview$ = this.parentService.getOverview().pipe(
    map((res: any) => {
      const upcoming = res?.upcoming_classes_preview ?? [];
      const notifications = res?.recent_notifications ?? [];
      return {
        childrenTotal: res?.children_total ?? 0,
        unreadNotifications: res?.unread_notifications_count ?? 0,
        upcomingClasses: upcoming.map((cls: any) => ({
          id: cls.id,
          title: cls.title ?? cls.group?.name ?? 'Class',
          subject: cls.group?.subject ?? '—',
          scheduledAt: cls.scheduled_at ?? null,
        })),
        notifications: notifications.map((n: any) => ({
          id: n.id ?? n.type,
          title: n.data?.title ?? n.type ?? 'Notification',
          message: n.data?.message ?? n.data?.body ?? (typeof n.data === 'string' ? n.data : ''),
          timestamp: n.created_at ?? n.read_at,
          read: !!n.read_at
        }))
      };
    })
  );
}
