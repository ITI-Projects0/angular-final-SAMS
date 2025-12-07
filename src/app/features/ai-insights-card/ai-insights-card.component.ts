import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-ai-insights-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-insights-card.component.html',
  styleUrls: ['./ai-insights-card.component.scss'],
})
export class AiInsightsCardComponent implements OnInit {
  loading = false;
  error = '';
  insights = '';

  constructor(private ai: AiService) {}

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(): void {
    this.loading = true;
    this.error = '';
    this.ai.getInsights().subscribe({
      next: (res) => {
        this.insights = res.insights || '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to fetch AI insights. Please try again.';
        this.loading = false;
      }
    });
  }
}
