import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseOrigin = 'http://localhost:8000';
  private baseUrl = `${this.baseOrigin}/api`;
  private inflight = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  get<T>(
    path: string,
    params: HttpParams | undefined = new HttpParams(),
    headers?: HttpHeaders,
    options?: { dedupe?: boolean; withCredentials?: boolean }
  ): Observable<T> {
    const dedupe = options?.dedupe !== false;
    const resolvedParams = params ?? new HttpParams();
    const key = dedupe ? `${path}|${resolvedParams.toString()}` : '';

    if (dedupe && this.inflight.has(key)) {
      return this.inflight.get(key) as Observable<T>;
    }

    const request$ = this.http
      .get<T>(`${this.baseUrl}${path}`, {
        params: resolvedParams,
        headers,
        withCredentials: options?.withCredentials !== false,
      })
      .pipe(
        shareReplay(1),
        finalize(() => {
          if (dedupe) {
            this.inflight.delete(key);
          }
        })
      );

    if (dedupe) {
      this.inflight.set(key, request$);
    }

    return request$;
  }

  post<T>(
    path: string,
    body: Object = {},
    options: { headers?: HttpHeaders; withCredentials?: boolean } = {}
  ): Observable<T> {
    const { headers, withCredentials } = options;
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      headers,
      withCredentials: withCredentials !== false,
    });
  }

  put<T>(
    path: string,
    body: Object = {},
    options: { headers?: HttpHeaders; withCredentials?: boolean } = {}
  ): Observable<T> {
    const { headers, withCredentials } = options;
    return this.http.put<T>(`${this.baseUrl}${path}`, body, {
      headers,
      withCredentials: withCredentials !== false,
    });
  }

  delete<T>(path: string, options: { withCredentials?: boolean } = {}): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, {
      withCredentials: options.withCredentials !== false,
    });
  }

  patch<T>(
    path: string,
    body: Object = {},
    options: { headers?: HttpHeaders; withCredentials?: boolean } = {}
  ): Observable<T> {
    const { headers, withCredentials } = options;
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, {
      headers,
      withCredentials: withCredentials !== false,
    });
  }

  getCsrfCookie(): Observable<void> {
    return this.http.get<void>(`${this.baseOrigin}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  }
}
