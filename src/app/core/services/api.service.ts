import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    get<T>(path: string, params: HttpParams = new HttpParams(), headers?: HttpHeaders): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${path}`, { params, headers });
    }

    post<T>(path: string, body: Object = {}, options: { headers?: HttpHeaders } = {}): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${path}`, body, options);
    }

    put<T>(path: string, body: Object = {}): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${path}`, body);
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}${path}`);
    }
}
