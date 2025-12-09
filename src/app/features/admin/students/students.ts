import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }
  students: any[] = [];
  loading = false;

  searchTerm = '';
  page = 1;
  perPage = 15;
  total = 0;
  lastPage = 1;
  infoOpen = false;
  selectedStudent: any = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents(page = this.page) {
    this.loading = true;
    const params = new HttpParams()
      .set('role', 'student')
      .set('per_page', this.perPage)
      .set('page', page)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/users', params).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.students = items
          .filter((u: any) => {
            const hasRole = Array.isArray(u.roles)
              ? u.roles.some((r: any) => (typeof r === 'string' ? r : r?.name) === 'student')
              : false;
            return hasRole || u.role === 'student';
          })
          .map((u: any) => {
            const groups = Array.isArray(u.groups?.data)
              ? u.groups.data
              : Array.isArray(u.groups)
                ? u.groups
                : [];

            return {
              id: u.id,
              name: u.name,
              email: u.email,
              center: u.center?.name || '',
              status: u.status || 'active',
              courseCount: u.groups_count ?? u.groupsCount ?? groups.length,
              courses: groups.map((g: any) => ({
                id: g.id,
                name: g.name,
                center: g.center?.name || '',
                studentsCount: g.students_count ?? g.studentsCount ?? 0,
              })),
              raw: u,
            };
          });
        const pagination = res?.meta?.pagination ?? payload?.meta ?? {};
        this.page = pagination.current_page ?? page;
        this.perPage = pagination.per_page ?? this.perPage;
        this.total = pagination.total ?? this.students.length;
        this.lastPage = pagination.last_page ?? this.lastPage ?? 1;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredStudents() {
    return this.students;
  }

  openInfo(student: any) {
    this.selectedStudent = student;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedStudent = null;
  }

  /** Handle page change from pagination component */
  onPageChange(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadStudents(page);
  }

  /** Handle per-page change from pagination component */
  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.page = 1;
    this.loadStudents(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadStudents(1);
  }
}
