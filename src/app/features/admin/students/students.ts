import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit {
  constructor(private api: ApiService) {}
  students: any[] = [];
  loading = false;
  currentId: number | null = null;

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formStudent = { name: '', email: '', center: '', status: '' };

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
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  openForm(student?: typeof this.formStudent) {
    this.isFormOpen = true;
    if (student) {
      this.isEditMode = true;
      this.formStudent = { ...student };
      this.currentIndex = this.students.indexOf(student);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formStudent = { name: '', email: '', center: '', status: '' };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      const id = this.students[this.currentIndex]?.id;
      if (!id) {
        this.students[this.currentIndex] = { ...this.formStudent };
        this.closeForm();
        return;
      }

      this.api.put(`/users/${id}`, {
        name: this.formStudent.name,
        email: this.formStudent.email,
        status: this.formStudent.status,
        role: 'student',
      }).subscribe(() => {
        this.loadStudents();
        this.closeForm();
      });
    } else {
      this.api.post('/users', {
        name: this.formStudent.name,
        email: this.formStudent.email,
        password: 'Password123', // placeholder; in real UI we should request it
        status: this.formStudent.status || 'active',
        role: 'student',
      }).subscribe(() => {
        this.loadStudents();
        this.closeForm();
      });
    }
  }

  delete(student: typeof this.formStudent) {
    const found = this.students.find(s => s.email === student.email && s.name === student.name);
    if (!found?.id) {
      this.students = this.students.filter(s => s !== student);
      return;
    }

    this.api.delete(`/users/${found.id}`).subscribe(() => {
      this.students = this.students.filter(s => s.id !== found.id);
    });
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
