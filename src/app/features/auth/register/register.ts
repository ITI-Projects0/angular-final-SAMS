import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html'
})
export class Register {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private feedback: FeedbackService,
    public themeService: ThemeService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      phone: ['', [Validators.required]],
      centerName: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  onSwitch(mode: string) {
    this.router.navigate(['/' + mode]);
  }

  onGoogleLogin() {
    window.location.href = 'http://localhost:8000/auth/google';
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.feedback.showToast({
        tone: 'error',
        title: 'Fix the highlighted fields',
        message: 'Please review your information.'
      });
      return;
    }

    this.loadingService.show();
    const { email, password, confirmPassword, fullName, phone, centerName } = this.registerForm.value;

    // If centerName is empty, use fullName
    const finalCenterName = centerName ? centerName : fullName;

    this.authService.register({
      email,
      password,
      password_confirmation: confirmPassword,
      name: fullName,
      phone,
      center_name: finalCenterName
    }).subscribe({
      next: () => {
        // Auto-login after successful registration
        this.authService.login({ email, password }).subscribe({
          next: (response) => {
            this.loadingService.hide();
            this.feedback.showToast({
              tone: 'success',
              title: 'Welcome!',
              message: 'Account created and signed in successfully.'
            });

            // Redirect based on role
            const redirectUrl = this.authService.getDashboardUrl(response.user?.roles || []);
            this.router.navigate([redirectUrl]);
          },
          error: (loginErr) => {
            this.loadingService.hide();
            // Fallback if login fails but register succeeded (unlikely but possible)
            this.feedback.openModal({
              icon: 'info',
              title: 'Account created',
              message: 'Please sign in with your new account.',
              primaryText: 'Go to Login',
              onPrimary: () => this.onSwitch('login')
            });
          }
        });
      },
      error: (err) => {
        this.loadingService.hide();
        this.feedback.showToast({
          tone: 'error',
          title: 'Registration failed',
          message: this.extractMessage(err, 'Registration failed')
        });
      }
    });
  }

  private extractMessage(err: any, fallback: string): string {
    const message = err?.error?.message ?? err?.message;
    if (!message) {
      return fallback;
    }
    return typeof message === 'string' ? message : JSON.stringify(message);
  }
}
