import { CommonModule } from '@angular/common';
import { ChangeDetectorRef,Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AiChatWidgetComponent } from '../../ai-chat-widget/ai-chat-widget.component';
import { AiInsightsCardComponent } from '../../ai-insights-card';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AiChatWidgetComponent, AiInsightsCardComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  stats = {
    centers: 0,
    paidCenters: 0,
    unpaidCenters: 0,
    courses: 0,
    activeCourses: 0,
    teachers: 0,
    onlineTeachers: 0,
    students: 0,
    attendanceToday: 0,
  };

  recent: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats() {
    this.loading = true;
    this.api.get<any>('/admin/stats').subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.stats = { ...this.stats, ...(payload?.stats ?? {}) };
        this.recent = (payload?.recent ?? []).map((item: any) => ({
          title: item.name || item.titleKey || 'Activity',
          titleKey: item.titleKey,
          time: item.created_at
            ? new Date(item.created_at).toLocaleString()
            : item.time || '',
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
