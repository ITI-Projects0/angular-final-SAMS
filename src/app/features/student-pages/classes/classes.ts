import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-student-classes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './classes.html',
  styleUrl: './classes.css'
})
export class StudentClasses {
  private studentService = inject(StudentService);
  classes$ = this.studentService.getClasses();
}
