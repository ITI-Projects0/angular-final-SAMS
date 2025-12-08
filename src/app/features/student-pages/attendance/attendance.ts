import { Component, inject, OnInit } from '@angular/core';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentAttendance } from '../../parent-pages/attendance/attendance';
import { StudentService } from '../../../core/services/student.service';
import { AttendanceRecord } from '../../../core/models/attendance.model';
import { tap } from 'rxjs';
import { LoaderComponent } from '../../../shared/loader/loader';

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, ParentAttendance, LoaderComponent],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class StudentAttendance implements OnInit {
  private tokenService = inject(TokenStorageService);
  private studentService = inject(StudentService);

  attendance$ = this.studentService.getAttendance().pipe(
    tap((records) => {
      this.attendance = records ?? [];
      this.onFilterChange();
    })
  );
  attendance: AttendanceRecord[] = [];

  // Filters
  selectedDate: string = '';
  selectedSubject: string = '';
  subjects = ['Mathematics', 'Science', 'History', 'English'];
  page = 1;
  perPage = 8;
  totalPages = 1;
  totalItems = 0;

  ngOnInit(): void {}

  get isParent(): boolean {
    return this.tokenService.getUser()?.roles.includes('parent') ?? false;
  }

  get paginatedRecords(): AttendanceRecord[] {
    const start = (this.page - 1) * this.perPage;
    return this.filteredRecords.slice(start, start + this.perPage);
  }

  private get filteredRecords(): AttendanceRecord[] {
    return this.attendance.filter((r) => {
      const matchDate = this.selectedDate ? r.date?.startsWith(this.selectedDate) : true;
      const matchSubject = this.selectedSubject ? r.subject === this.selectedSubject : true;
      return matchDate && matchSubject;
    });
  }

  get stats() {
    const list = this.filteredRecords;
    const countStatus = (status: string) => list.filter((r) => r.status === status).length;
    return {
      total: list.length,
      present: countStatus('present'),
      absent: countStatus('absent'),
      late: countStatus('late'),
      excused: countStatus('excused')
    };
  }

  onFilterChange() {
    this.page = 1;
    this.totalItems = this.filteredRecords.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.perPage));
  }

  goToPage(next: number): void {
    if (next < 1 || next > this.totalPages) return;
    this.page = next;
  }
}
