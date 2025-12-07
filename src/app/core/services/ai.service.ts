import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

type ChatPayload = { role: 'teacher' | 'parent'; message: string; user_id?: number };
type InsightsParams = { class_id?: number; from?: string; to?: string };

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
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<{ insights: string }>(`${this.baseUrl}/insights`, { params: httpParams });
  }
}
