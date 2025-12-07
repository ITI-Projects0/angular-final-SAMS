import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly api = inject(ApiService);
  private readonly jsonHeaders = new HttpHeaders({ 'Accept': 'application/json' });

  // ========================================
  // Stats
  // ========================================

  getStats(): Observable<any> {
    return this.api.get('/teacher/stats');
  }

  // ========================================
  // Directory (Teachers listing)
  // ========================================

  getTeachers(params?: Record<string, string | number>): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.api.get('/teachers', httpParams);
  }

  // ========================================
  // Groups
  // ========================================

  getGroups(page: number = 1): Observable<any> {
    return this.api.get(`/teacher/groups?page=${page}`);
  }

  getGroup(id: number): Observable<any> {
    return this.api.get(`/groups/${id}`);
  }

  createGroup(data: any): Observable<any> {
    return this.api.post('/groups', data);
  }

  updateGroup(id: number, data: any): Observable<any> {
    return this.api.put(`/groups/${id}`, data);
  }

  deleteGroup(id: number): Observable<any> {
    return this.api.delete(`/groups/${id}`);
  }

  // ========================================
  // Group Students
  // ========================================

  getGroupStudents(groupId: number, page: number = 1): Observable<any> {
    return this.api.get(`/groups/${groupId}/students?page=${page}`);
  }

  addStudentToGroup(groupId: number, studentId: number): Observable<any> {
    return this.api.post(`/groups/${groupId}/students`, { student_id: studentId });
  }

  // ========================================
  // Lessons
  // ========================================

  getGroupLessons(groupId: number, page: number = 1): Observable<any> {
    return this.api.get(`/groups/${groupId}/lessons?page=${page}`);
  }

  createLesson(groupId: number, data: any): Observable<any> {
    return this.api.post(`/groups/${groupId}/lessons`, data);
  }

  getLesson(groupId: number, lessonId: number): Observable<any> {
    return this.api.get(`/lessons/${lessonId}`).pipe(
      map((res: any) => res?.data ?? res),
      catchError(() => of(null))
    );
  }

  updateLesson(lessonId: number, data: any): Observable<any> {
    return this.api.put(`/lessons/${lessonId}`, data);
  }

  deleteLesson(lessonId: number): Observable<any> {
    return this.api.delete(`/lessons/${lessonId}`);
  }

  createAssessment(lessonId: number, data: any): Observable<any> {
    return this.api.post(`/lessons/${lessonId}/assessments`, data);
  }

  getAssessment(assessmentId: number): Observable<any> {
    return this.api.get(`/assessments/${assessmentId}`);
  }

  saveAssessmentGrade(assessmentId: number, studentId: number, score: number, feedback?: string): Observable<any> {
    return this.api.post(`/assessments/${assessmentId}/results`, { student_id: studentId, score, feedback });
  }

  // ========================================
  // Attendance
  // ========================================

  getGroupAttendance(groupId: number, date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.api.get(`/groups/${groupId}/attendance`, params);
  }

  getCenterStats(): Observable<any> {
    return this.api.get('/center-admin/management/stats');
  }

  getCenterGroups(page: number = 1): Observable<any> {
    return this.api.get(`/center-admin/groups?page=${page}`);
  }

  createTeacherManagedGroup(data: any): Observable<any> {
    return this.api.post('/teacher-management/groups', data);
  }

  createManagementUser(data: any): Observable<any> {
    return this.api.post('/center-admin/management/users', data, { headers: this.jsonHeaders });
  }

  updateManagementUser(userId: number, data: any): Observable<any> {
    return this.api.put(`/center-admin/management/users/${userId}`, data, { headers: this.jsonHeaders });
  }

  deleteManagementUser(userId: number): Observable<any> {
    return this.api.delete(`/center-admin/management/users/${userId}`);
  }

  createTeacherManagedUser(data: any): Observable<any> {
    return this.api.post('/teacher-management/users', data);
  }

  markAttendance(groupId: number, data: any): Observable<any> {
    return this.api.post(`/groups/${groupId}/attendance`, data);
  }

  // ========================================
  // Members (Teachers, Assistants, Students)
  // ========================================

  getMembers(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.api.get('/center-admin/members', httpParams);
  }

  // Teachers
  createTeacher(data: any): Observable<any> {
    return this.api.post('/center-admin/teachers', data);
  }

  updateTeacher(id: number, data: any): Observable<any> {
    return this.api.put(`/center-admin/teachers/${id}`, data);
  }

  deleteTeacher(id: number): Observable<any> {
    return this.api.delete(`/center-admin/teachers/${id}`);
  }

  // Assistants
  createAssistant(data: any): Observable<any> {
    return this.api.post('/center-admin/assistants', data);
  }

  updateAssistant(id: number, data: any): Observable<any> {
    return this.api.put(`/center-admin/assistants/${id}`, data);
  }

  deleteAssistant(id: number): Observable<any> {
    return this.api.delete(`/center-admin/assistants/${id}`);
  }

  // Students
  createStudent(data: any): Observable<any> {
    return this.api.post('/center-admin/students', data);
  }

  updateStudent(id: number, data: any): Observable<any> {
    return this.api.put(`/center-admin/students/${id}`, data);
  }

  deleteStudent(id: number): Observable<any> {
    return this.api.delete(`/center-admin/students/${id}`);
  }
}
