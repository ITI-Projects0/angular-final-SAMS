import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Class } from '../models/class.model';
import { Assignment } from '../models/assignment.model';
import { AttendanceRecord } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private api = inject(ApiService);

  getHomeDashboard(): Observable<any> {
    return this.api.get('/dashboard/student/home');
  }

  getClasses(): Observable<Class[]> {
    return this.api.get<Class[]>('/dashboard/student/classes');
  }

  getAssignments(): Observable<Assignment[]> {
    return this.api.get<Assignment[]>('/dashboard/student/assessments');
  }

  getAttendance(): Observable<AttendanceRecord[]> {
    return this.api.get<any>('/dashboard/student/attendance').pipe(
      map((res) => {
        // Accept shapes like { data: { data: [...] } } or { data: [...] } or direct arrays
        const root = res?.data?.data ?? res?.data ?? res ?? {};
        const collection = Array.isArray(root)
          ? root
          : Array.isArray(root.data)
            ? root.data
            : Array.isArray(root.items)
              ? root.items
              : Array.isArray(root.attendance)
                ? root.attendance
                : Array.isArray(root.records)
                  ? root.records
                  : [];

        const normalizeDate = (value: any) => {
          if (!value) return null;
          const parsed = new Date(value);
          return isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
        };

        return collection.map((record: any) => ({
          id: record.id ?? record._id ?? record.uuid ?? record.key ?? undefined,
          date: normalizeDate(record.date ?? record.attended_at ?? record.recorded_at ?? record.created_at ?? record.day),
          subject: record.subject ?? record.subject_name ?? record.course ?? record.group?.name ?? record.group_name ?? '—',
          status: String(record.status ?? record.attendance ?? record.state ?? 'unknown').toLowerCase()
        }));
      }),
      catchError(() => of([]))
    );
  }

  getProfile(): Observable<any> {
    return this.api.get('/dashboard/student/profile');
  }

  getClassDetails(id: number): Observable<any> {
    return this.api.get<any>(`/dashboard/student/groups/${id}`);
  }

  getUpcomingClasses(): Observable<any[]> {
    return this.api.get<any[]>('/dashboard/student/upcoming-classes');
  }

  getUpcomingExams(): Observable<any[]> {
    return this.api.get<any[]>('/dashboard/student/upcoming-exams');
  }

  getNotifications(): Observable<any[]> {
    return this.api.get<any[]>('/dashboard/student/notifications');
  }

  getClassSchedule(classId: number): Observable<any[]> {
    return this.api.get<any[]>(`/dashboard/student/classes/${classId}/schedule`);
  }

  getGroups(): Observable<any[]> {
    return this.api.get<any[]>('/dashboard/student/groups');
  }
}
