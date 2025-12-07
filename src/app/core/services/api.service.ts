import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:8000/api';
    private inflight = new Map<string, Observable<any>>();

    constructor(private http: HttpClient) { }

    get<T>(path: string, params: HttpParams = new HttpParams(), headers?: HttpHeaders, options?: { dedupe?: boolean }): Observable<T> {
        const dedupe = options?.dedupe !== false;
        const key = dedupe ? `${path}|${params.toString()}` : '';

        if (dedupe && this.inflight.has(key)) {
            return this.inflight.get(key) as Observable<T>;
        }

        const request$ = this.http.get<T>(`${this.baseUrl}${path}`, { params, headers }).pipe(
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

    post<T>(path: string, body: Object = {}, options: { headers?: HttpHeaders } = {}): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${path}`, body, options);
    }

    put<T>(path: string, body: Object = {}, options: { headers?: HttpHeaders } = {}): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${path}`, body, options);
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${path}`);
    }

    patch<T>(path: string, body: Object = {}): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}${path}`, body);
    }
}
