import { Component, inject } from '@angular/core';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../core/services/student.service';
// import { ParentProfile } from '../../parent-pages/profile/profile'; // Assuming I'll create it or use a shared one.
// Actually I didn't create ParentProfile separately in the file creation step, I created ParentOverview, ParentChildren, ParentAttendance.
// Let's check if I created ParentProfile. I think I missed it.
// I'll create it now or just put the content here.

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class StudentProfile {
  private tokenService = inject(TokenStorageService);
  private studentService = inject(StudentService);

  profile$ = this.studentService.getProfile();

  get isParent(): boolean {
    return this.tokenService.getUser()?.roles.includes('parent') ?? false;
  }
}
