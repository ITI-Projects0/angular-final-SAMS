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
  teachers: TeacherCard[] = [];
  loading = false;

  searchTerm = '';
  infoOpen = false;
  selectedTeacher: TeacherCard | null = null;

  ngOnInit(): void {
    this.loadTeachers();
  }

  private loadTeachers() {
    this.loading = true;
    this.api.get<any>('/teachers').subscribe({
      next: (res) => {
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
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredTeachers(): TeacherCard[] {
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

  openInfo(teacher: TeacherCard) {
    this.selectedTeacher = teacher;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedTeacher = null;
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
