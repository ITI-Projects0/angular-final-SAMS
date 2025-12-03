import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  constructor(private api: ApiService) {}
  teachers: any[] = [];
  loading = false;

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formTeacher = { name: '', email: '', center: '', courses: 0, phone: '' };

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
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  openForm(teacher?: typeof this.formTeacher) {
    this.isFormOpen = true;
    if (teacher) {
      this.isEditMode = true;
      this.formTeacher = { ...teacher };
      this.currentIndex = this.teachers.indexOf(teacher);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formTeacher = { name: '', email: '', center: '', courses: 0, phone: '' };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      const teacher = this.teachers[this.currentIndex];
      if (!teacher?.id) {
        this.teachers[this.currentIndex] = { ...this.formTeacher };
        this.closeForm();
        return;
      }
      this.api.put(`/users/${teacher.id}`, {
        name: this.formTeacher.name,
        email: this.formTeacher.email,
        phone: this.formTeacher.phone,
        role: 'teacher',
      }).subscribe(() => {
        this.loadTeachers();
        this.closeForm();
      });
    } else {
      this.api.post('/users', {
        name: this.formTeacher.name,
        email: this.formTeacher.email,
        password: 'Password123',
        phone: this.formTeacher.phone,
        role: 'teacher',
      }).subscribe(() => {
        this.loadTeachers();
        this.closeForm();
      });
    }
  }

  delete(teacher: typeof this.formTeacher) {
    const found = this.teachers.find(t => t.email === teacher.email && t.name === teacher.name);
    if (!found?.id) {
      this.teachers = this.teachers.filter(t => t !== teacher);
      return;
    }
    this.api.delete(`/users/${found.id}`).subscribe(() => {
      this.teachers = this.teachers.filter(t => t.id !== found.id);
    });
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
