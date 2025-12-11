import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {

  constructor(private api: ApiService, private cdr: ChangeDetectorRef, private zone: NgZone) { }

  courses: any[] = [];
  loading = false;

  /** Search */
  searchTerm = '';
  page = 1;
  perPage = 15;
  total = 0;
  lastPage = 1;

  /** Info modal */
  infoOpen = false;
  selectedCourse: any = null;

  /** Form */
  formOpen = false;
  isEditMode = false;
  currentId: number | null = null;
  currentIndex: number | null = null;

  formCourse = {
    title: '',
    status: 'Active'
  };

  ngOnInit(): void {
    this.loadCourses();
  }

  /** ================= LOAD COURSES ================= */
  private loadCourses(page = this.page) {
    this.loading = true;

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/groups', params).subscribe({
      next: (res) => {
        this.zone.run(() => {
          const payload = res?.data ?? res;
          const items = payload?.data ?? payload ?? [];

          this.courses = items.map((g: any) => ({
            id: g.id,
            title: g.name,
            center: g.center?.name || '',
            teacher: g.teacher?.name || '',
            status: g.is_active ? 'Active' : 'Inactive',
            studentsCount: g.students_count ?? g.studentsCount ?? g.students?.length ?? 0,
            raw: g,
          }));

          const pagination = res?.meta?.pagination ?? payload?.meta ?? {};
          this.page = pagination.current_page ?? page;
          this.perPage = pagination.per_page ?? this.perPage;
          this.total = pagination.total ?? this.courses.length;
          this.lastPage = pagination.last_page ?? this.lastPage ?? 1;
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
      },
    });
  }

  /** ================= FILTER ================= */
  get filteredCourses() {
    return this.courses;
  }

  /** ================= INFO ================= */
  openInfo(course: any) {
    this.selectedCourse = course;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedCourse = null;
  }

  changePage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadCourses(page);
  }

  changePerPage(value: number) {
    this.perPage = value;
    this.page = 1;
    this.loadCourses(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadCourses(1);
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.rangeStart + this.courses.length - 1, this.total);
  }

  /** ================= FORM ================= */
  openForm(index?: number) {
    this.formOpen = true;

    if (index !== undefined) {
      // Edit mode
      this.isEditMode = true;
      this.currentIndex = index;
      const c = this.courses[index];

      this.currentId = c.id;

      this.formCourse = {
        title: c.title,
        status: c.status
      };
    } else {
      // Add mode
      this.isEditMode = false;
      this.currentId = null;
      this.currentIndex = null;
      this.formCourse = {
        title: '',
        status: 'Active'
      };
    }
  }

  closeForm() {
    this.formOpen = false;
    this.isEditMode = false;
    this.currentId = null;
    this.currentIndex = null;

    this.formCourse = {
      title: '',
      status: 'Active'
    };
  }

  /** ================= SAVE ================= */
  save() {
    const ref = this.currentIndex !== null ? this.courses[this.currentIndex] : null;

    const payload: any = {
      name: this.formCourse.title,
      description: '',
      subject: this.formCourse.title,
      is_active: this.formCourse.status === 'Active',
      center_id: ref?.raw?.center_id,
      teacher_id: ref?.raw?.teacher_id,
    };

    /** EDIT */
    if (this.isEditMode && this.currentId !== null) {
      this.api.put(`/groups/${this.currentId}`, payload).subscribe(() => {
        this.loadCourses();
        this.closeForm();
      });
      return;
    }

    /** CREATE */
    if (!payload.center_id || !payload.teacher_id) {
      this.closeForm();
      return;
    }

    this.api.post('/groups', payload).subscribe(() => {
      this.loadCourses();
      this.closeForm();
    });
  }
}
