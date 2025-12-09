import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
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
  templateUrl: './register.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Register implements OnInit {
  registerForm: FormGroup;
  passwordVisibility = {
    password: false,
    confirm: false
  };
  shouldLoadAnimation = false;

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

  ngOnInit(): void {
    this.updateAnimationState();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateAnimationState();
  }

  onSwitch(mode: string) {
    this.router.navigate(['/' + mode]);
  }

  onGoogleLogin() {
    window.location.href = 'http://localhost:8000/auth/google';
  }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
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
      next: (response) => {
        this.loadingService.hide();

        // New accounts require approval - redirect to pending page
        if (response.requires_approval || response.user?.approval_status === 'pending') {
          this.feedback.showToast({
            tone: 'success',
            title: 'Registration Successful!',
            message: 'Your account is pending admin approval.'
          });
          this.router.navigate(['/pending-approval']);
          return;
        }

        // Account approved immediately - session cookie already issued
        this.feedback.showToast({
          tone: 'success',
          title: 'Welcome!',
          message: 'Account created and signed in successfully.'
        });

        const redirectUrl = this.authService.getDashboardUrl(response.user?.roles || []);
        this.router.navigate([redirectUrl]);
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

  private updateAnimationState() {
    if (typeof window === 'undefined') {
      this.shouldLoadAnimation = false;
      return;
    }
    this.shouldLoadAnimation = window.innerWidth >= 768;
  }
}
