import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

type ChatPayload = { role: 'teacher' | 'parent'; message: string; user_id?: number };
type InsightsParams = { class_id?: number; from?: string; to?: string };
type CenterScope = { class_id?: number; group_id?: number };

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  // Match the same API base used elsewhere (see ApiService)
  private baseUrl = 'http://localhost:8000/api/ai';

  chat(payload: ChatPayload): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.baseUrl}/chat`, payload);
  }

  getInsights(params: InsightsParams = {}): Observable<{ insights: string }> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !(typeof value === 'string' && value === '')) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<{ insights: string }>(`${this.baseUrl}/insights`, { params: httpParams });
  }

  // Center admin / staff AI
  centerInsights(scope: CenterScope = {}): Observable<{ insights: string }> {
    let params = new HttpParams();
    Object.entries(scope).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !(typeof value === 'string' && value === '')) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<{ insights: string }>(`${this.baseUrl}/center/insights`, { params });
  }

  attendanceForecast(scope: CenterScope = {}): Observable<{ forecast: string }> {
    let params = new HttpParams();
    Object.entries(scope).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !(typeof value === 'string' && value === '')) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<{ forecast: string }>(`${this.baseUrl}/center/attendance-forecast`, { params });
  }

  // Parent AI helpers
  parentWeeklySummary(studentId: number): Observable<{ summary: string; data: any }> {
    const params = new HttpParams().set('student_id', String(studentId));
    return this.http.get<{ summary: string; data: any }>(`${this.baseUrl}/parent/weekly-summary`, { params });
  }

  parentExplain(studentId: number, text: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.baseUrl}/parent/explain`, {
      student_id: studentId,
      text
    });
  }

  // Student AI helpers
  studentGenerateQuiz(lessonTitle: string, numberOfQuestions?: number): Observable<{ quiz: any[] }> {
    return this.http.post<{ quiz: any[] }>(`${this.baseUrl}/student/generate-quiz`, {
      lesson_title: lessonTitle,
      number_of_questions: numberOfQuestions
    });
  }

  studentSummary(lessonText: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.baseUrl}/student/summary`, { lesson_text: lessonText });
  }

  studentStudyPlan(studentId: number): Observable<{ plan: string }> {
    return this.http.post<{ plan: string }>(`${this.baseUrl}/student/study-plan`, { student_id: studentId });
  }
}
