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
  lessonErrors = { title: '', description: '', scheduled_at: '' };
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
    this.lessonErrors = { title: '', description: '', scheduled_at: '' };
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
    this.lessonErrors = { title: '', description: '', scheduled_at: '' };
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.panelOpen) {
      this.closePanel();
    }
  }

  submitLesson(): void {
    if (!this.groupId || this.processing) {
      return;
    }

    if (!this.validateLessonForm()) {
      this.cdr.detectChanges();
      return;
    }

    const trimmedTitle = this.lessonForm.title.trim();
    const trimmedDesc = this.lessonForm.description.trim();
    const scheduledAt = this.lessonForm.scheduled_at;

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
          // Normalize possible response shapes and pagination meta
          const payload = res?.data ?? res;
          const lessonsWrapper = payload?.data ?? payload ?? [];
          const lessonsList = Array.isArray(lessonsWrapper) ? lessonsWrapper : (lessonsWrapper.data ?? []);

          const paginationSource =
            res?.meta?.pagination ??
            res?.pagination ??
            res?.meta ??
            payload?.meta?.pagination ??
            payload?.meta ??
            null;
          if (paginationSource) {
            const total = paginationSource.total ?? lessonsList.length;
            const perPage = paginationSource.per_page ?? 10;
            const lastPage = paginationSource.last_page ?? Math.max(Math.ceil(total / perPage) || 1, 1);
            this.lessonsMeta = {
              current_page: paginationSource.current_page ?? page,
              last_page: lastPage,
              total,
              per_page: perPage
            };
          } else {
            // Fallback: no meta; treat as single page
            this.lessonsMeta = {
              current_page: page,
              last_page: 1,
              total: lessonsList.length,
              per_page: lessonsList.length || 1
            };
          }

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

  onLessonInputChange(field: 'title' | 'description' | 'scheduled_at'): void {
    this.validateLessonForm();
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
      !this.lessonErrors.title &&
      !this.lessonErrors.description &&
      !this.lessonErrors.scheduled_at &&
      this.isScheduleValid(this.lessonForm.scheduled_at);
  }

  private validateLessonForm(): boolean {
    this.lessonErrors = { title: '', description: '', scheduled_at: '' };
    const title = this.lessonForm.title?.trim() ?? '';
    const description = this.lessonForm.description?.trim() ?? '';
    const scheduledAt = this.lessonForm.scheduled_at;

    this.lessonForm = { ...this.lessonForm, title, description };

    if (!title) {
      this.lessonErrors.title = 'Title is required.';
    } else if (title.length < 3) {
      this.lessonErrors.title = 'Title must be at least 3 characters.';
    }

    if (!description) {
      this.lessonErrors.description = 'Description is required.';
    } else if (description.length < 5) {
      this.lessonErrors.description = 'Description must be at least 5 characters.';
    }

    if (!scheduledAt) {
      this.lessonErrors.scheduled_at = 'Schedule date/time is required.';
    } else if (!this.isScheduleValid(scheduledAt)) {
      this.lessonErrors.scheduled_at = 'Please choose a date/time that is today or later.';
    }

    return !this.lessonErrors.title && !this.lessonErrors.description && !this.lessonErrors.scheduled_at;
  }
}
