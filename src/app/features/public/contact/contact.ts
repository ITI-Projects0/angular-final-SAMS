import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';
import { ApiService } from '../../../core/services/api.service';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, Footer],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {
  private readonly themeService = inject(ThemeService);
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  contactForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: [''],
  message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get isDark(): boolean {
    return this.themeService.darkMode();
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.apiService.post('/contact', this.contactForm.value).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Your message has been sent successfully!';
        this.contactForm.reset();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to send message. Please try again.';
      },
    });
  }
}

