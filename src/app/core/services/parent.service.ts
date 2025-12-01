import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { Child } from '../models/child.model';
import { ChildAttendance } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class ParentService {
  private api = inject(ApiService);

  getChildren(): Observable<Child[]> {
    // Placeholder
    // return this.api.get<Child[]>('/parent/children');
    return of([
      { id: 101, name: 'Alice', className: 'Grade 5A', avatarUrl: 'assets/images/avatar1.png' },
      { id: 102, name: 'Bob', className: 'Grade 3B', avatarUrl: 'assets/images/avatar2.png' }
    ]);
  }

  getChildrenSummary(): Observable<any> {
    // Placeholder
    // return this.api.get('/parent/summary');
    return of([
      { childId: 101, name: 'Alice', classesCount: 6, assignmentsCount: 2, attendanceRate: 98 },
      { childId: 102, name: 'Bob', classesCount: 5, assignmentsCount: 1, attendanceRate: 92 }
    ]);
  }

  getChildAttendance(childId: number): Observable<ChildAttendance[]> {
    // Placeholder
    // return this.api.get<ChildAttendance[]>(`/parent/children/${childId}/attendance`);
    return of([
      { childId: childId, childName: 'Child Name', subject: 'Mathematics', date: '2023-12-01', status: 'present' },
      { childId: childId, childName: 'Child Name', subject: 'Science', date: '2023-11-30', status: 'present' },
      { childId: childId, childName: 'Child Name', subject: 'History', date: '2023-11-28', status: 'late' }
    ]);
  }
  getChildDetails(id: number): Observable<any> {
    // Placeholder
    // return this.api.get(`/parent/children/${id}`);
    return of({
      id: id,
      name: 'Alice',
      className: 'Grade 5A',
      attendanceRate: 98,
      pendingAssignments: 2,
      classes: [
        {
          id: 1,
          name: 'Mathematics',
          teacherName: 'Mr. Smith',
          progress: 75,
          schedule: 'Mon-Wed 09:00 AM',
          exams: [
            { id: 101, title: 'Midterm Exam', date: '2023-10-15', score: 85, total: 100 },
            { id: 102, title: 'Final Exam', date: '2023-12-20', score: null, total: 100 } // Upcoming
          ]
        },
        {
          id: 2,
          name: 'Science',
          teacherName: 'Mrs. Johnson',
          progress: 60,
          schedule: 'Tue-Thu 11:00 AM',
          exams: [
            { id: 201, title: 'Biology Quiz', date: '2023-11-05', score: 92, total: 100 }
          ]
        },
        {
          id: 3,
          name: 'History',
          teacherName: 'Mr. Brown',
          progress: 80,
          schedule: 'Fri 10:00 AM',
          exams: []
        }
      ]
    });
  }

  getUpcomingClassesForChildren(): Observable<any[]> {
    // Get upcoming classes for all children today/tomorrow
    const today = new Date();
    return of([
      { id: 1, childName: 'Alice', className: 'Mathematics', teacherName: 'Mr. Smith', scheduledAt: today.toISOString(), location: 'Room 101' },
      { id: 2, childName: 'Bob', className: 'Science', teacherName: 'Mrs. Johnson', scheduledAt: today.toISOString(), location: 'Lab 2' }
    ]);
  }

  getNotifications(): Observable<any[]> {
    return of([
      { id: 1, title: 'Grade Posted - Alice', message: 'Mathematics test grade is available', timestamp: '2023-12-01T10:30:00', read: false },
      { id: 2, title: 'Absence Alert - Bob', message: 'Bob was absent from Science class', timestamp: '2023-12-01T09:00:00', read: false },
      { id: 3, title: 'Upcoming Exam', message: 'Alice has a Mathematics exam on Dec 20', timestamp: '2023-11-30T15:00:00', read: true }
    ]);
  }

  getChildClassDetails(childId: number, classId: number): Observable<any> {
    // Placeholder - Get detailed class info for specific child
    // return this.api.get(`/parent/children/${childId}/classes/${classId}`);
    return of({
      studentName: 'Alice',
      className: 'Mathematics',
      teacherName: 'Mr. Smith',
      subject: 'Math',
      description: 'Advanced Algebra and Calculus for Grade 10',
      nextClassTime: '2023-12-05 09:00 AM',
      attendance: 92,
      averageGrade: 87,
      completedAssignments: 15,
      totalAssignments: 18,
      classRank: '3rd of 25',
      exams: [
        { id: 1, title: 'Midterm Exam', date: '2023-10-15', score: 85, total: 100 },
        { id: 2, title: 'Quiz 1', date: '2023-09-20', score: 90, total: 100 },
        { id: 3, title: 'Final Exam', date: '2023-12-20', score: null, total: 100 }
      ],
      attendanceRecords: [
        { date: '2023-12-01', status: 'present' },
        { date: '2023-11-29', status: 'present' },
        { date: '2023-11-27', status: 'late' },
        { date: '2023-11-24', status: 'present' }
      ]
    });
  }
}
