import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}
  students: any[] = [];
  loading = false;

  searchTerm = '';
  infoOpen = false;
  selectedStudent: any = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents() {
    this.loading = true;
    this.api.get<any>('/users').subscribe({
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
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            center: u.center?.name || '',
            status: u.status || 'active',
            raw: u,
          }));
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredStudents() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.students;
    return this.students.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.center || '').toLowerCase().includes(q) ||
      (s.status || '').toLowerCase().includes(q)
    );
  }

  openInfo(student: any) {
    this.selectedStudent = student;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedStudent = null;
  }
}
