import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  forgotPasswordForm: FormGroup;
  readonly resetEmailNotice = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private feedback: FeedbackService,
    public themeService: ThemeService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]]
    });
  }

  onSwitch(mode: string) {
    this.router.navigate(['/' + mode]);
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.feedback.showToast({
        tone: 'error',
        title: 'Enter a valid email',
        message: 'We need a valid email to send the reset link.'
      });
      return;
    }

    this.loadingService.show();
    const { email } = this.forgotPasswordForm.value;
    this.authService.sendResetCode(email).subscribe({
      next: () => {
        this.loadingService.hide();
        this.resetEmailNotice.set(email);
        this.feedback.showToast({
          tone: 'info',
          title: 'Check your inbox',
          message: `We emailed a reset link to ${email}.`
        });
      },
      error: (err) => {
        this.loadingService.hide();
        this.feedback.showToast({
          tone: 'error',
          title: 'Unable to send reset link',
          message: this.extractMessage(err, 'Failed to send reset email')
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
