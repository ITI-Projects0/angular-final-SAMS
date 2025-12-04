import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { LoaderComponent } from '../../../shared/loader/loader';
import { map } from 'rxjs';

@Component({
  selector: 'app-student-classes',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent],
  templateUrl: './classes.html',
  styleUrl: './classes.css'
})
export class StudentClasses {
  private studentService = inject(StudentService);
  classes$ = this.studentService.getGroups().pipe(
    map((res: any) => {
      const root = res?.data ?? res ?? [];
      return Array.isArray(root) ? root : [];
    })
  );
}
