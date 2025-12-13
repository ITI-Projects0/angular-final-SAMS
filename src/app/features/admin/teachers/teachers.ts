import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private feedback: FeedbackService,
    private loadingService: LoadingService
  ) { }
  teachers: TeacherCard[] = [];
  loading = false;

  searchTerm = '';
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;
  infoOpen = false;
  selectedTeacher: TeacherCard | null = null;

  ngOnInit(): void {
    this.loadTeachers();
  }

  private loadTeachers(page = this.page) {
    this.loading = true;
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/teachers', params).subscribe({
      next: (res) => {
        this.zone.run(() => {
          const payload = res?.data ?? res;
          const items = payload?.data ?? payload ?? [];
          this.teachers = items.map((t: any) => {
            const groups = t.groups ?? t.taught_groups ?? t.taughtGroups ?? [];
            const courseList: TeacherCourse[] = groups.map((g: any) => ({
              id: Number(g.id) || 0,
              name: g.name || '-',
              studentsCount: Number(g.students_count ?? g.studentsCount ?? g.students?.length ?? 0) || 0,
              center: g.center?.name || ''
            }));
            const computedTotal = courseList.reduce((sum: number, c: TeacherCourse) => sum + (Number(c.studentsCount) || 0), 0);
            const totalStudents = Number(t.total_students ?? t.totalStudents);

            return {
              id: t.id,
              name: t.name,
              email: t.email,
              center: groups?.[0]?.center?.name || t.center?.name || '',
              courses: t.taught_groups_count ?? t.taughtGroups_count ?? courseList.length ?? 0,
              phone: t.phone || '',
              status: t.status || 'active',
              totalStudents: Number.isFinite(totalStudents) ? totalStudents : computedTotal,
              pendingStudents: t.pending_students_count ?? t.pendingStudents_count ?? 0,
              approvedStudents: t.approved_students_count ?? t.approvedStudents_count ?? 0,
              courseList,
              raw: t,
            };
          });

          const pagination = res?.meta?.pagination ?? res?.pagination ?? payload?.meta ?? {};
          this.page = pagination.current_page ?? page;
          this.perPage = pagination.per_page ?? this.perPage;
          this.total = pagination.total ?? (payload?.total ?? this.teachers.length);
          this.lastPage = pagination.last_page ?? payload?.last_page ?? this.lastPage ?? 1;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      complete: () => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  get filteredTeachers(): TeacherCard[] {
    // Server-side filtering applied; return list as-is.
    return this.teachers;
  }

  openInfo(teacher: TeacherCard) {
    this.selectedTeacher = teacher;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedTeacher = null;
  }

  deleteUser(id: number) {
    this.feedback.openModal({
      icon: 'error',
      title: 'Delete Teacher',
      message: 'Are you sure you want to delete this teacher? This action cannot be undone.',
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.loadingService.show();
        this.api.delete(`/users/${id}`).subscribe({
          next: () => {
            this.loadingService.hide();
            this.feedback.showToast({
              tone: 'success',
              title: 'Deleted',
              message: 'Teacher deleted successfully.'
            });
            this.closeInfo();
            this.loadTeachers();
            this.feedback.closeModal();
          },
          error: (err) => {
            this.loadingService.hide();
            this.feedback.showToast({
              tone: 'error',
              title: 'Error',
              message: err?.error?.message || 'Failed to delete teacher.'
            });
            this.feedback.closeModal();
          }
        });
      },
      onSecondary: () => this.feedback.closeModal()
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadTeachers(page);
  }

  changePerPage(value: number) {
    this.perPage = value;
    this.page = 1;
    this.loadTeachers(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadTeachers(1);
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.rangeStart + this.teachers.length - 1, this.total);
  }
}

type TeacherCourse = {
  id: number;
  name: string;
  studentsCount: number;
  center: string;
};

type TeacherCard = {
  id: number;
  name: string;
  email: string;
  center: string;
  courses: number;
  phone: string;
  status: string;
  totalStudents: number;
  pendingStudents: number;
  approvedStudents: number;
  courseList: TeacherCourse[];
  raw: any;
};
