import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { AiChatWidgetComponent } from '../../ai-chat-widget/ai-chat-widget.component';
import { AiInsightsCardComponent } from '../../ai-insights-card';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AiChatWidgetComponent, AiInsightsCardComponent, PaginationComponent],
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

  // Pagination for recent activity
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(page = this.page) {
    this.loading = true;
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage);

    this.api.get<any>('/admin/stats', params).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.stats = { ...this.stats, ...(payload?.stats ?? {}) };
        
        // Handle recent activity with pagination
        const recentData = payload?.recent ?? [];
        this.recent = (Array.isArray(recentData?.data) ? recentData.data : recentData).map((item: any) => ({
          title: item.name || item.titleKey || 'Activity',
          titleKey: item.titleKey,
          time: item.created_at
            ? new Date(item.created_at).toLocaleString()
            : item.time || '',
        }));

        // Update pagination from response
        const pagination = recentData?.meta ?? payload?.recentMeta ?? {};
        this.page = pagination.current_page ?? page;
        this.perPage = pagination.per_page ?? this.perPage;
        this.total = pagination.total ?? this.recent.length;
        this.lastPage = pagination.last_page ?? (Math.ceil(this.total / this.perPage) || 1);


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

  /** Handle page change from pagination component */
  onPageChange(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadStats(page);
  }

  /** Handle per-page change from pagination component */
  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.page = 1;
    this.loadStats(1);
  }
}
