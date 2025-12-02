import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-assignments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css'
})
export class StudentAssignments {
  private studentService = inject(StudentService);
  assignments$ = this.studentService.getAssignments();
}
