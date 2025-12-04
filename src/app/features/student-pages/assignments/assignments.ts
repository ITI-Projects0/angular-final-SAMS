import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';
import { map, tap } from 'rxjs';
import { LoaderComponent } from '../../../shared/loader/loader';

@Component({
  selector: 'app-student-assignments',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css'
})
export class StudentAssignments {
  private studentService = inject(StudentService);
  assignments$ = this.studentService.getAssignments().pipe(
    tap(res => console.log('Assignments', res)),
    map((res: any) => res?.data ?? res ?? [])
  );
}
