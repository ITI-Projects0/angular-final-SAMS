import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';
import { TokenStorageService } from '../../core/auth/token-storage.service';

@Component({
  selector: 'app-student-ai-lab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-ai-lab.component.html'
})
export class StudentAiLabComponent implements OnInit {
  lessonTitle = '';
  questionCount = 5;
  quiz: any[] = [];
  quizError = '';
  loadingQuiz = false;

  summaryText = '';
  summaryResult = '';
  summaryError = '';
  loadingSummary = false;

  studyPlan = '';
  planError = '';
  loadingPlan = false;

  private studentId: number | null = null;

  constructor(private ai: AiService, private tokenStorage: TokenStorageService) {}

  ngOnInit(): void {
    this.studentId = this.tokenStorage.getUser()?.id ?? null;
  }

  generateQuiz(): void {
    const title = this.lessonTitle.trim();
    if (!title || this.loadingQuiz) {
      return;
    }
    this.quizError = '';
    this.quiz = [];
    this.loadingQuiz = true;
    const count = this.clampQuestions(this.questionCount);
    this.questionCount = count;
    this.ai.studentGenerateQuiz(title, count).subscribe({
      next: (res) => {
        this.quiz = res.quiz || [];
        this.loadingQuiz = false;
      },
      error: () => {
        this.quizError = 'Could not generate questions. Try a shorter title.';
        this.loadingQuiz = false;
      }
    });
  }

  summarizeLesson(): void {
    const text = this.summaryText.trim();
    if (!text || this.loadingSummary) {
      return;
    }
    this.summaryError = '';
    this.summaryResult = '';
    this.loadingSummary = true;
    this.ai.studentSummary(text).subscribe({
      next: (res) => {
        this.summaryResult = res.summary || '';
        this.loadingSummary = false;
      },
      error: () => {
        this.summaryError = 'Summary failed. Please try again.';
        this.loadingSummary = false;
      }
    });
  }

  fetchStudyPlan(): void {
    if (!this.studentId || this.loadingPlan) {
      this.planError = this.studentId ? '' : 'Missing student id.';
      return;
    }
    this.planError = '';
    this.studyPlan = '';
    this.loadingPlan = true;
    this.ai.studentStudyPlan(this.studentId).subscribe({
      next: (res) => {
        this.studyPlan = res.plan || '';
        this.loadingPlan = false;
      },
      error: () => {
        this.planError = 'Could not build a study plan.';
        this.loadingPlan = false;
      }
    });
  }

  private clampQuestions(value: number): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 5;
    return Math.min(10, Math.max(1, Math.round(numeric)));
  }
}
