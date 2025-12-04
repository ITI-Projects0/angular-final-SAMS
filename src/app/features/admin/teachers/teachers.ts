import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  teachers: any[] = [];
  loading = false;

  searchTerm = '';
  infoOpen = false;
  selectedTeacher: any = null;

  ngOnInit(): void {
    this.loadTeachers();
  }

  private loadTeachers() {
    this.loading = true;
    this.api.get<any>('/teachers').subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.teachers = items.map((t: any) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          center: t.taught_groups?.[0]?.center?.name || t.center?.name || '',
          courses: t.taught_groups_count ?? t.taughtGroups_count ?? t.taught_groups?.length ?? 0,
          phone: t.phone || '',
          raw: t,
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredTeachers() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.teachers;
    return this.teachers.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.center || '').toLowerCase().includes(q) ||
      String(t.courses ?? '').toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q)
    );
  }

  openInfo(teacher: any) {
    this.selectedTeacher = teacher;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedTeacher = null;
  }
}
