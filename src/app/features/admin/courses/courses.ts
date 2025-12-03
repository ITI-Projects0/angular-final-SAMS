import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  constructor(private api: ApiService) {}
  courses: any[] = [];
  loading = false;
  currentId: number | null = null;

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCourse = { title: '', center: '', teacher: '', status: 'Active' };

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
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  openForm(course?: any) {
    this.isFormOpen = true;
    if (course) {
      this.isEditMode = true;
      this.formCourse = {
        title: course.title,
        center: course.center,
        teacher: course.teacher,
        status: course.status,
      };
      this.currentIndex = this.courses.findIndex(c => c.id === course.id);
      this.currentId = course.id ?? null;
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.currentId = null;
      this.formCourse = { title: '', center: '', teacher: '', status: 'Active' };
    }
  }

  save() {
    const referenceCourse = this.currentIndex !== null ? this.courses[this.currentIndex] : null;
    const payload: any = {
      name: this.formCourse.title,
      description: '',
      subject: this.formCourse.title,
      is_active: this.formCourse.status === 'Active',
      is_approval_required: false,
      center_id: referenceCourse?.raw?.center_id,
      teacher_id: referenceCourse?.raw?.teacher_id,
    };

    if (this.isEditMode && this.currentId !== null) {
      this.api.put(`/groups/${this.currentId}`, payload).subscribe(() => {
        this.loadCourses();
        this.closeForm();
      });
    } else {
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

  delete(course: any) {
    const found = this.courses.find(c => c.id === course.id);
    if (!found?.id) {
      this.courses = this.courses.filter(c => c !== course);
      return;
    }

    this.api.delete(`/groups/${found.id}`).subscribe(() => {
      this.courses = this.courses.filter(c => c.id !== found.id);
    });
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
