import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Child } from '../models/child.model';
import { ChildAttendance } from '../models/attendance.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ParentService {
  private api = inject(ApiService);

  getOverview(): Observable<any> {
    return this.api.get('/dashboard/parent/overview').pipe(
      map((res: any) => res?.data ?? res ?? {}),
      catchError(() => of({}))
    );
  }

  getChildren(): Observable<Child[]> {
    return this.api.get<Child[]>('/dashboard/parent/children').pipe(
      map((res: any) => (res?.data ?? res ?? []).map((child: any) => ({
        id: child.id,
        name: child.name,
        email: child.email,
        center: child.center,
        avatar: child.avatar
      }))),
      catchError(() => of([]))
    );
  }

  getChildAttendance(childId: number): Observable<ChildAttendance[]> {
    return this.api.get<ChildAttendance[]>(`/dashboard/parent/children/${childId}/attendance`).pipe(
      map((res: any) => res?.data ?? res ?? []),
      catchError(() => of([]))
    );
  }
  getChildDetails(id: number): Observable<any> {
    return this.api.get(`/dashboard/parent/children/${id}`).pipe(
      map((res: any) => {
        const root = res?.data ?? res ?? {};
        const child = root.child ?? {};
        const stats = root.stats ?? {};
        return {
          id: child.id,
          name: child.name,
          email: child.email,
          avatar: child.avatar,
          center: child.center,
          stats: {
            attendanceRate: Number(stats.overall_attendance_rate ?? 0),
            missedDays: stats.missed_days ?? 0,
            activeClasses: Number(stats.active_classes ?? 0),
            pendingAssignments: Number(stats.pending_assignments_count ?? 0),
            avgGrade: Number(stats.avg_grade ?? 0)
          },
          classes: (root.classes ?? []).map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            subject: cls.subject,
            teacherName: cls.teacher?.name ?? '—'
          })),
          upcomingClasses: root.upcoming_classes ?? [],
          pendingAssignments: root.pending_assignments ?? [],
          recentGrades: root.recent_grades ?? []
        };
      }),
      catchError(() => of({}))
    );
  }

  getUpcomingClassesForChildren(): Observable<any[]> {
    return this.api.get<any[]>('/dashboard/parent/upcoming-classes').pipe(
      map((res: any) => res?.data ?? res ?? []),
      catchError(() => of([]))
    );
  }

  getNotifications(): Observable<any[]> {
    return this.api.get<any[]>('/dashboard/parent/notifications').pipe(
      map((res: any) => res?.data ?? res ?? []),
      catchError(() => of([]))
    );
  }

  getProfile(): Observable<any> {
    return this.api.get('/me').pipe(map((res: any) => res?.data ?? res ?? {}));
  }

  updateProfile(payload: {
    name?: string;
    phone?: string;
    avatar?: string;
    avatarFile?: File | null;
  }): Observable<any> {
    const { avatarFile, name, phone, avatar } = payload;

    if (avatarFile instanceof File) {
      const form = new FormData();
      if (name) form.append('name', name);
      if (phone) form.append('phone', phone);
      if (avatar) form.append('avatar', avatar);
      form.append('avatar', avatarFile);
      form.append('_method', 'PUT');

      return this.api.post('/me', form);
    }

    const body: any = {};
    if (name) body.name = name;
    if (phone) body.phone = phone;
    if (avatar) body.avatar = avatar;

    return this.api.put('/me', body);
  }


  updatePassword(payload: { current_password: string; password: string; password_confirmation: string }): Observable<any> {
    return this.api.put('/me/password', payload).pipe(map((res: any) => res?.data ?? res ?? {}));
  }

  getSummary(): Observable<any> {
    return this.api.get('/dashboard/parent/summary').pipe(
      map((res: any) => res?.data ?? res ?? {}),
      catchError(() => of({}))
    );
  }

  getChildClassDetails(childId: number, classId: number): Observable<any> {
    return this.api.get(`/dashboard/parent/children/${childId}/classes/${classId}`).pipe(
      map((res: any) => res?.data ?? res ?? {}),
      catchError(() => of({}))
    );
  }

  getAttendance(filters?: { childId?: number; status?: string; date?: string; subject?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (filters?.childId) params = params.set('child_id', filters.childId);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.subject) params = params.set('subject', filters.subject);

    return this.api.get<any[]>('/dashboard/parent/attendance', params).pipe(
      map((res: any) => res?.data ?? res ?? []),
      catchError(() => of([]))
    );
  }
}
