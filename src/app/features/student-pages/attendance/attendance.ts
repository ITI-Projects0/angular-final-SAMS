import { Component, inject } from '@angular/core';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentAttendance } from '../../parent-pages/attendance/attendance';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, ParentAttendance],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class StudentAttendance {
  private tokenService = inject(TokenStorageService);
  private studentService = inject(StudentService);

  attendance$ = this.studentService.getAttendance();

  // Filters
  selectedDate: string = '';
  selectedSubject: string = '';
  subjects = ['Mathematics', 'Science', 'History', 'English'];

  get isParent(): boolean {
    return this.tokenService.getUser()?.roles.includes('parent') ?? false;
  }

  onFilterChange() {
    console.log('Filters:', this.selectedDate, this.selectedSubject);
    // Will call API with filters when backend ready
  }
}
