import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';
import { TeacherService } from '../../core/services/teacher.service';
import { TokenStorageService } from '../../core/auth/token-storage.service';

type GroupOption = { id: number; name: string };

@Component({
  selector: 'app-center-ai-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './center-ai-panel.component.html'
})
export class CenterAiPanelComponent implements OnInit {
  groups: GroupOption[] = [];
  scope: { class_id?: number | null; group_id?: number | null } = { class_id: null, group_id: null };

  insights = '';
  forecast = '';

  loadingInsights = false;
  loadingForecast = false;
  insightsError = '';
  forecastError = '';

  constructor(
    private ai: AiService,
    private teacherService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  get isCenterAdmin(): boolean {
    return this.tokenStorage.getUser()?.roles?.includes('center_admin') ?? false;
  }

  loadGroups(): void {
    const source$ = this.isCenterAdmin
      ? this.teacherService.getCenterGroups(1)
      : this.teacherService.getGroups(1);

    source$.subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.groups = Array.isArray(items)
          ? items.map((g: any) => ({
              id: g.id,
              name: g.name || g.title || `Group #${g.id}`
            }))
          : [];
        this.safeDetectChanges();
      },
      error: () => {
        this.groups = [];
        this.safeDetectChanges();
      }
    });
  }

  fetchInsights(): void {
    this.insightsError = '';
    this.loadingInsights = true;
    this.safeDetectChanges();
    this.ai.centerInsights(this.cleanScope()).subscribe({
      next: (res) => {
        this.insights = res.insights || '';
        this.loadingInsights = false;
        this.safeDetectChanges();
      },
      error: () => {
        this.insightsError = 'Failed to fetch insights. Try adjusting the filters.';
        this.loadingInsights = false;
        this.safeDetectChanges();
      }
    });
  }

  fetchForecast(): void {
    this.forecastError = '';
    this.loadingForecast = true;
    this.safeDetectChanges();
    this.ai.attendanceForecast(this.cleanScope()).subscribe({
      next: (res) => {
        this.forecast = res.forecast || '';
        this.loadingForecast = false;
        this.safeDetectChanges();
      },
      error: () => {
        this.forecastError = 'Failed to generate forecast. Try again.';
        this.loadingForecast = false;
        this.safeDetectChanges();
      }
    });
  }

  private cleanScope(): { class_id?: number; group_id?: number } {
    const { class_id, group_id } = this.scope;
    return {
      class_id: class_id || undefined,
      group_id: group_id || undefined
    };
  }

  private safeDetectChanges(): void {
    try {
      this.cdr.detectChanges();
    } catch {
      // view might be destroyed; ignore
    }
  }
}
