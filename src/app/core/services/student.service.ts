import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
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

  getDashboardSummary(): Observable<any> {
    // Placeholder: Replace with actual API call
    // return this.api.get('/student/summary');
    return of({
      classesCount: 5,
      assignmentsCount: 3,
      attendanceRate: 95
    });
  }

  getClasses(): Observable<Class[]> {
    // Placeholder
    // return this.api.get<Class[]>('/student/classes');
    return of([
      { id: 1, name: 'Mathematics', teacherName: 'Mr. Smith', schedule: 'Mon-Wed-Fri 09:00-10:30', progress: 75 },
      { id: 2, name: 'Science', teacherName: 'Mrs. Johnson', schedule: 'Tue-Thu 11:00-12:30', progress: 60 },
      { id: 3, name: 'History', teacherName: 'Mr. Brown', schedule: 'Mon-Wed 14:00-15:30', progress: 80 }
    ]);
  }

  getAssignments(): Observable<Assignment[]> {
    return this.api.get<Assignment[]>('/dashboard/student/assessments');
  }

  getAttendance(): Observable<AttendanceRecord[]> {
    // Placeholder
    // return this.api.get<AttendanceRecord[]>('/student/attendance');
    return of([
      { date: '2023-12-01', subject: 'Mathematics', status: 'present' },
      { date: '2023-11-29', subject: 'Science', status: 'present' },
      { date: '2023-11-27', subject: 'History', status: 'late' },
      { date: '2023-11-24', subject: 'Mathematics', status: 'absent' }
    ]);
  }

  getProfile(): Observable<any> {
    // Placeholder
    // return this.api.get('/student/profile');
    return of({
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Student',
      studentId: 'STU-2023-001',
      grade: '10th Grade',
      phone: '+1 234 567 890',
      address: '123 School Lane, Education City'
    });
  }

  getClassDetails(id: number): Observable<any> {
    return this.api.get<any>(`/dashboard/student/groups/${id}`);
  }

  getUpcomingClasses(): Observable<any[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return of([
      { id: 1, name: 'Mathematics', teacherName: 'Mr. Smith', scheduledAt: today.toISOString(), location: 'Room 101' },
      { id: 2, name: 'Science', teacherName: 'Mrs. Johnson', scheduledAt: tomorrow.toISOString(), location: 'Lab 2' }
    ]);
  }

  getUpcomingExams(): Observable<any[]> {
    return of([
      { id: 1, title: 'Final Exam - Mathematics', subject: 'Mathematics', date: '2023-12-20', time: '09:00 AM' },
      { id: 2, title: 'Biology Quiz', subject: 'Science', date: '2023-12-15', time: '11:00 AM' }
    ]);
  }

  getNotifications(): Observable<any[]> {
    return of([
      { id: 1, title: 'New Assignment Posted', message: 'Algebra homework is now available', timestamp: '2023-12-01T10:30:00', read: false },
      { id: 2, title: 'Exam Reminder', message: 'Final exam in 3 days', timestamp: '2023-12-01T08:00:00', read: false },
      { id: 3, title: 'Grade Posted', message: 'Your History essay has been graded', timestamp: '2023-11-30T15:00:00', read: true }
    ]);
  }

  getClassSchedule(classId: number): Observable<any[]> {
    return of([
      { day: 'Monday', time: '09:00 AM - 10:30 AM', location: 'Room 101' },
      { day: 'Wednesday', time: '09:00 AM - 10:30 AM', location: 'Room 101' },
      { day: 'Friday', time: '09:00 AM - 10:30 AM', location: 'Room 101' }
    ]);
  }

  getGroups(): Observable<any[]> {
    return this.api.get<any[]>('/dashboard/student/groups');
  }
}
