import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TeacherService } from '../../../core/services/teacher.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CenterAiPanelComponent } from '../../ai-center-panel/center-ai-panel.component';

interface CenterSummaryStats {
  teachers_count: number;
  assistants_count: number;
  students_count: number;
  parents_count: number;
  groups_count: number;
  active_groups: number;
  lessons_count: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, CenterAiPanelComponent],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class Overview implements OnInit {
  constructor(
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  stats = {
    groups: 0,
    students: 0,
    attendanceToday: 0,
    lessons: 0
  };

  centerStats: CenterSummaryStats | null = null;
  recent: any[] = [];
  loading = false;
  private roles: string[] = [];
  private centerStatsAttempted = false;

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.loadTeacherStats();
    if (this.hasRole('center_admin')) {
      this.loadCenterStats();
    }
  }

  private hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  private loadTeacherStats(): void {
    this.loading = true;
    this.staffService.getStats().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.stats = { ...this.stats, ...(payload?.stats ?? {}) };
        this.recent = (payload?.recent ?? []).map((item: any) => ({
          title: item.title || item.titleKey || 'Activity',
          created_at: item.created_at,
          time: item.created_at ? new Date(item.created_at).toLocaleString() : item.time || ''
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

  private loadCenterStats(): void {
    if (this.centerStatsAttempted) {
      return;
    }

    this.centerStatsAttempted = true;
    this.staffService.getCenterStats().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.centerStats = payload;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err?.status === 404) {
          this.centerStats = null;
        }
        this.centerStats = null;
        this.cdr.detectChanges();
      }
    });
  }

  get isCenterAdmin(): boolean {
    return this.hasRole('center_admin');
  }
}
