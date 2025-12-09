import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Subscription, combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';
import { FeedbackService } from '../../../../core/services/feedback.service';

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

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

@Component({
  selector: 'app-staff-group-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffGroupDetail implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private feedback: FeedbackService
  ) { }

  group: StaffGroup | null = null;
  students: any[] = [];
  lessons: any[] = [];

  loadingGroup = false;
  loadingStudents = false;
  loadingLessons = false;
  errorMessage = '';

  private routeSub?: Subscription;
  private groupId!: number;
  private roles: string[] = [];
  panelOpen = false;
  panelMode: 'lesson' | null = null;
  processing = false;
  lessonForm = { title: '', description: '', scheduled_at: '' };
  lessonError = '';

  // Pagination
  studentsMeta: PaginationMeta | null = null;
  lessonsMeta: PaginationMeta | null = null;

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
    return '';
  }

  openLessonForm(): void {
    if (!this.canManageGroup) return;
    this.lessonForm = {
      title: '',
      description: '',
      scheduled_at: this.defaultDateTime()
    };
    this.lessonError = '';
    this.panelMode = 'lesson';
    this.panelOpen = true;
  }

  viewLesson(lessonId: number): void {
    if (!this.groupId || !lessonId) {
      return;
    }
    this.router.navigate(['/dashboard/staff/groups', this.groupId, 'lessons', lessonId]);
  }

  closePanel(): void {
    this.panelOpen = false;
    this.panelMode = null;
    this.processing = false;
    this.lessonError = '';
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.panelOpen) {
      this.closePanel();
    }
  }

  submitLesson(): void {
    if (!this.groupId || this.processing || !this.lessonForm.title || !this.lessonForm.description) {
      return;
    }

    const trimmedTitle = this.lessonForm.title.trim();
    const trimmedDesc = this.lessonForm.description.trim();
    const scheduledAt = this.lessonForm.scheduled_at;

    if (!trimmedTitle || !trimmedDesc) {
      this.lessonError = 'Title and description are required.';
      this.cdr.detectChanges();
      return;
    }

    if (!scheduledAt || !this.isScheduleValid(scheduledAt)) {
      this.lessonError = 'Please choose a date/time that is today or later.';
      this.cdr.detectChanges();
      return;
    }

    this.lessonError = '';
    this.processing = true;
    this.staffService.createLesson(this.groupId, {
      title: trimmedTitle,
      description: trimmedDesc,
      scheduled_at: scheduledAt
    }).subscribe({
      next: () => {
        this.closePanel();
        this.feedback.showToast({ title: 'Success', message: 'Lesson created successfully!', tone: 'success' });
        this.loadLessons();
      },
      error: () => {
        this.processing = false;
        this.feedback.showToast({ title: 'Error', message: 'Failed to create lesson.', tone: 'error' });
        this.cdr.detectChanges();
      }
    });
  }

  private loadGroupData(): void {
    this.errorMessage = '';
    this.loadGroup();
    this.loadStudents();
    this.loadLessons();
  }

  private loadGroup(): void {
    this.loadingGroup = true;
    this.staffService.getGroup(this.groupId).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.group = payload;
        this.loadingGroup = false;
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        console.error('Failed to load group:', err);
        this.errorMessage = 'Unable to load group information.';
        this.loadingGroup = false;
        this.cdr.detectChanges(); // Force update
      }
    });
  }

  loadStudents(page = 1): void {
    this.loadingStudents = true;
    this.staffService.getGroupStudents(this.groupId, page).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        // The API returns { approved: { data: [...], current_page: ... }, pending: [] }
        // Or if wrapped in success: { data: { approved: ... } }

        let approvedData = payload.approved || payload.data?.approved;

        if (approvedData) {
          this.studentsMeta = {
            current_page: approvedData.current_page,
            last_page: approvedData.last_page,
            total: approvedData.total,
            per_page: approvedData.per_page
          };

          const studentsList = approvedData.data || [];
          this.students = studentsList.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            status: student.pivot?.status ?? 'approved',
            joined_at: student.pivot?.joined_at
          }));
        } else {
          this.students = [];
          this.studentsMeta = null;
        }

        this.loadingStudents = false;
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        console.error('Failed to load students:', err);
        this.students = [];
        this.loadingStudents = false;
        this.cdr.detectChanges(); // Force update
      }
    });
  }

  loadLessons(page = 1): void {
    this.loadingLessons = true;
    this.staffService
      .getGroupLessons(this.groupId, page)
      .pipe(
        catchError((err) => {
          console.error('Failed to load lessons:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (res) => {
          // LessonResource collection usually returns { data: [...], meta: { ... } }
          // But if wrapped in success: { data: { data: [...], meta: ... } } ?
          // Let's assume standard Laravel Resource response structure
          // If res is the full response body

          const data = res.data || res; // Outer wrapper

          // Check for pagination meta
          const meta = res.meta || (res.data && res.data.meta);
          if (meta) {
            this.lessonsMeta = {
              current_page: meta.current_page,
              last_page: meta.last_page,
              total: meta.total,
              per_page: meta.per_page
            };
          } else {
            // Fallback if meta is missing (e.g. not paginated or different structure)
            this.lessonsMeta = null;
          }

          const lessonsList = Array.isArray(data) ? data : (data.data || []);

          this.lessons = lessonsList.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            scheduled_at: lesson.scheduled_at,
            resources_count: lesson.resources_count ?? lesson.resources?.length ?? 0
          }));

          this.loadingLessons = false;
          this.cdr.detectChanges(); // Force update
        },
        error: () => {
          this.loadingLessons = false;
          this.cdr.detectChanges(); // Force update
        }
      });
  }

  changeStudentPage(page: number): void {
    if (page < 1 || (this.studentsMeta && page > this.studentsMeta.last_page)) return;
    this.loadStudents(page);
  }

  changeLessonPage(page: number): void {
    if (page < 1 || (this.lessonsMeta && page > this.lessonsMeta.last_page)) return;
    this.loadLessons(page);
  }

  private defaultDateTime(): string {
    const now = new Date();
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  }

  get minDateTime(): string {
    return this.defaultDateTime();
  }

  private isScheduleValid(value: string): boolean {
    const selected = new Date(value);
    if (isNaN(selected.getTime())) return false;
    const now = new Date();
    return selected.getTime() >= now.setSeconds(0, 0);
  }

  get lessonFormValid(): boolean {
    return !!this.lessonForm.title.trim() &&
      !!this.lessonForm.description.trim() &&
      !!this.lessonForm.scheduled_at &&
      this.isScheduleValid(this.lessonForm.scheduled_at);
  }
}
