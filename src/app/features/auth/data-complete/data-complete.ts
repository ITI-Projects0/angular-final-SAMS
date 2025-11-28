import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-complete',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './data-complete.html',
  styleUrl: './data-complete.css',
})
export class DataComplete {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  profileForm = this.fb.group({
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    role: ['', Validators.required]
  });

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.authService.completeProfile(this.profileForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Profile completion failed', err);
      }
    });
  }
}
