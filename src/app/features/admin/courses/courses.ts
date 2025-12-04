import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  courses: any[] = [];
  loading = false;

  searchTerm = '';
  infoOpen = false;
  selectedCourse: any = null;

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses() {
    this.loading = true;
    this.api.get<any>('/groups').subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.courses = items.map((g: any) => ({
          id: g.id,
          title: g.name,
          center: g.center?.name || '',
          teacher: g.teacher?.name || '',
          status: g.is_active ? 'Active' : 'Inactive',
          raw: g,
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredCourses() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.courses;
    return this.courses.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.center || '').toLowerCase().includes(q) ||
      (c.teacher || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    );
  }

  openInfo(course: any) {
    this.selectedCourse = course;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedCourse = null;
  }
}
