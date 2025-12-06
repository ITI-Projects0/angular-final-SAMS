import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, combineLatest, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';

interface StaffGroup {
  id: number;
  name: string;
  subject?: string;
  description?: string;
  center?: { id: number; name: string };
  teacher?: { id: number; name: string; email?: string };
  schedule_days?: string[] | null;
  schedule_time?: string | null;
  sessions_count?: number | null;
}

@Component({
  selector: 'app-staff-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.css'
})
export class StaffGroupDetail implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService
  ) {}

  group: StaffGroup | null = null;
  students: any[] = [];
  lessons: any[] = [];
  recentAttendance: any[] = [];

  loadingGroup = false;
  loadingStudents = false;
  loadingLessons = false;
  loadingAttendance = false;
  errorMessage = '';

  private routeSub?: Subscription;
  private groupId!: number;
  private roles: string[] = [];
  private attendanceDateFilter: string | null = null;
  panelOpen = false;
  panelMode: 'lesson' | 'attendance' | null = null;
  processing = false;
  lessonForm = { title: '', description: '', scheduled_at: '' };
  attendanceDate = '';
  attendanceEntries: Array<{ student_id: number; name: string; status: 'present' | 'absent' | 'late' | 'excused' }> = [];

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.routeSub = combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([params, queryParams]) => {
        const id = Number(params.get('id'));
        if (!id) {
          this.errorMessage = 'Invalid group id.';
          return;
        }
        this.groupId = id;
        this.attendanceDateFilter = queryParams.get('date');
        this.loadGroupData();
      }
    );
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  get scheduleLabel(): string {
    if (!this.group) {
      return 'No schedule provided';
    }

    const days = Array.isArray(this.group.schedule_days)
      ? this.group.schedule_days.join(', ')
      : this.group.schedule_days;
    if (!days && !this.group.schedule_time) {
      return 'No schedule provided';
    }
    return `${days || 'Flexible'} @ ${this.group.schedule_time || 'N/A'}`;
  }

  get canManageGroup(): boolean {
    return this.roles.some((role) => ['teacher', 'assistant', 'center_admin'].includes(role));
  }

  get panelTitle(): string {
    if (this.panelMode === 'lesson') {
      return 'Add Lesson';
    }
    if (this.panelMode === 'attendance') {
      return 'Mark Attendance';
    }
    return '';
  }

  openLessonForm(): void {
    if (!this.canManageGroup) return;
    this.lessonForm = {
      title: '',
      description: '',
      scheduled_at: this.defaultDateTime()
    };
    this.panelMode = 'lesson';
    this.panelOpen = true;
  }

  openAttendanceForm(): void {
    if (!this.canManageGroup) return;
    this.attendanceDate = new Date().toISOString().slice(0, 10);
    this.attendanceEntries = this.students.map((student) => ({
      student_id: student.id,
      name: student.name,
      status: 'present'
    }));
    this.panelMode = 'attendance';
    this.panelOpen = true;
  }

  closePanel(): void {
    this.panelOpen = false;
    this.panelMode = null;
    this.processing = false;
  }

  submitLesson(): void {
    if (!this.groupId || this.processing || !this.lessonForm.title) {
      return;
    }
    this.processing = true;
    this.staffService.createLesson(this.groupId, {
      title: this.lessonForm.title,
      description: this.lessonForm.description,
      scheduled_at: this.lessonForm.scheduled_at || null
    }).subscribe({
      next: () => {
        this.closePanel();
        this.loadLessonsAndAttendance();
      },
      error: () => {
        this.processing = false;
      }
    });
  }

  submitAttendance(): void {
    if (!this.groupId || this.processing || !this.attendanceDate || !this.attendanceEntries.length) {
      return;
    }
    this.processing = true;
    const entries = this.attendanceEntries.map((entry) => ({
      student_id: entry.student_id,
      status: entry.status
    }));
    this.staffService.markAttendance(this.groupId, {
      date: this.attendanceDate,
      entries
    }).subscribe({
      next: () => {
        this.closePanel();
        this.loadLessonsAndAttendance();
      },
      error: () => {
        this.processing = false;
      }
    });
  }

  private loadGroupData(): void {
    this.errorMessage = '';
    this.loadGroup();
    this.loadStudents();
    this.loadLessonsAndAttendance();
  }

  private loadGroup(): void {
    this.loadingGroup = true;
    this.staffService.getGroup(this.groupId).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.group = payload;
      },
      error: () => {
        this.errorMessage = 'Unable to load group information.';
      },
      complete: () => (this.loadingGroup = false)
    });
  }

  private loadStudents(): void {
    this.loadingStudents = true;
    this.staffService.getGroupStudents(this.groupId).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.students = this.unwrapCollection(payload).map((student: any) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          status: student.pivot?.status ?? 'approved',
          joined_at: student.pivot?.joined_at
        }));
      },
      error: () => {
        this.students = [];
      },
      complete: () => (this.loadingStudents = false)
    });
  }

  private loadLessonsAndAttendance(): void {
    this.loadingLessons = true;
    this.loadingAttendance = true;

    forkJoin({
      lessons: this.staffService.getGroupLessons(this.groupId).pipe(catchError(() => of([]))),
      attendance: this.staffService
        .getGroupAttendance(this.groupId, this.attendanceDateFilter || undefined)
        .pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ lessons, attendance }) => {
        const lessonPayload = lessons?.data ?? lessons;
        this.lessons = this.unwrapCollection(lessonPayload).map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          scheduled_at: lesson.scheduled_at,
          resources_count: lesson.resources_count ?? lesson.resources?.length ?? 0
        }));

        const attendancePayload = attendance?.data ?? attendance;
        this.recentAttendance = this.unwrapCollection(attendancePayload)
          .sort(
            (a: any, b: any) =>
              new Date(b.date ?? b.created_at).getTime() - new Date(a.date ?? a.created_at).getTime()
          )
          .slice(0, 8);
      },
      complete: () => {
        this.loadingLessons = false;
        this.loadingAttendance = false;
      }
    });
  }

  private unwrapCollection(payload: any): any[] {
    if (!payload) {
      return [];
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
    return Array.isArray(payload.items) ? payload.items : [];
  }

  private defaultDateTime(): string {
    const now = new Date();
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  }
}
