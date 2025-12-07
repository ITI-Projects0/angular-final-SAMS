import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-parent-ai-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-ai-panel.component.html'
})
export class ParentAiPanelComponent implements OnChanges {
  @Input({ required: true }) studentId!: number;
  @Input() studentName = '';

  summary = '';
  summaryData: any = null;
  summaryError = '';
  loadingSummary = false;

  explainText = '';
  explainReply = '';
  explainError = '';
  loadingExplain = false;

  constructor(private ai: AiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentId'] && this.studentId) {
      this.loadSummary();
    }
  }

  loadSummary(): void {
    if (!this.studentId) return;
    this.summaryError = '';
    this.loadingSummary = true;
    this.ai.parentWeeklySummary(this.studentId).subscribe({
      next: (res) => {
        this.summary = res.summary || '';
        this.summaryData = res.data ?? null;
        this.loadingSummary = false;
      },
      error: () => {
        this.summaryError = 'Could not load the AI weekly summary.';
        this.loadingSummary = false;
      }
    });
  }

  askExplain(): void {
    const text = this.explainText.trim();
    if (!this.studentId || !text || this.loadingExplain) {
      return;
    }
    this.explainError = '';
    this.explainReply = '';
    this.loadingExplain = true;
    this.ai.parentExplain(this.studentId, text).subscribe({
      next: (res) => {
        this.explainReply = res.summary || '';
        this.loadingExplain = false;
      },
      error: () => {
        this.explainError = 'Request failed. Try again with a shorter note.';
        this.loadingExplain = false;
      }
    });
  }

  formatPercent(value?: number): string {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return '0';
    }
    const numeric = Number(value);
    const percent = numeric <= 1 ? numeric * 100 : numeric;
    return Math.round(percent * 10) / 10 + '';
  }
}
