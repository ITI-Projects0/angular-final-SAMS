import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ThemeService } from '../../../core/services/theme.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { trigger, transition, style, animate } from '@angular/animations';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-email' | 'verify-success' | 'reset-password' | 'complete-profile';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  animations: [
    trigger('fadeSwitch', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('420ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('420ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class Auth {

  mode = signal<AuthMode>('login');
  position = signal<'right' | 'left'>('right');

  readonly resetEmailNotice = signal<string | null>(null);
  readonly verifyingEmail = signal<boolean>(false);
  readonly resetContext = signal<{ token: string | null; email: string | null }>({ token: null, email: null });

  private readonly modeRoutes: Partial<Record<AuthMode, string>> = {
    'login': '/login',
    'register': '/register',
    'forgot-password': '/forgot-password',
    'verify-email': '/verify-email',
    'reset-password': '/reset-password'
  };

  private readonly passwordValidators = [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
  ];

  authForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService,
    public themeService: ThemeService,
    private fb: FormBuilder,
    private feedback: FeedbackService
  ) {
    // Initialize single dynamic form
    this.authForm = this.fb.group({});
    this.bootstrapFromUrl();
  }

  switch(target: AuthMode = 'login') {
    if (target === 'verify-success') {
      this.mode.set(target);
      this.position.set('right');
      return;
    }

    if (target === 'forgot-password' || target === 'verify-email' || target === 'reset-password') {
      this.mode.set(target);
      this.position.set('right');
      this.updateUrl(target);
      this.setupFormForMode(target);
      return;
    }

    const newMode = target;
    this.position.set(newMode === 'login' ? 'right' : 'left');
    this.mode.set(newMode);
    this.updateUrl(newMode);
    this.setupFormForMode(newMode);
  }

  private setupFormForMode(mode: AuthMode) {
    // Clear all current controls
    Object.keys(this.authForm.controls).forEach(key => {
      this.authForm.removeControl(key);
    });

    // Reset validators
    this.authForm.clearValidators();

    // Setup controls based on mode
    switch (mode) {
      case 'login':
        this.authForm.addControl('email', this.fb.control('', [
          Validators.required,
          Validators.email,
          Validators.maxLength(255)
        ]));
        this.authForm.addControl('password', this.fb.control('', [
          Validators.required,
          Validators.minLength(8)
        ]));
        this.authForm.addControl('rememberMe', this.fb.control(false));
        break;

      case 'register':
        this.authForm.addControl('email', this.fb.control('', [
          Validators.required,
          Validators.email,
          Validators.maxLength(255)
        ]));
        this.authForm.addControl('fullName', this.fb.control('', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(255)
        ]));
        this.authForm.addControl('password', this.fb.control('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]));
        this.authForm.addControl('confirmPassword', this.fb.control('', [
          Validators.required
        ]));
        this.authForm.setValidators(this.passwordMatchValidator);
        break;

      case 'forgot-password':
        this.authForm.addControl('email', this.fb.control('', [
          Validators.required,
          Validators.email,
          Validators.maxLength(255)
        ]));
        break;

      case 'verify-email':
        this.authForm.addControl('code', this.fb.control('', [
          Validators.required,
          Validators.minLength(1)
        ]));
        break;

      case 'reset-password':
        this.authForm.addControl('password', this.fb.control('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]));
        this.authForm.addControl('confirmPassword', this.fb.control('', [
          Validators.required
        ]));
        this.authForm.setValidators(this.passwordMatchValidator);
        break;
    }

    this.authForm.updateValueAndValidity();
  }

  onSubmit() {
    const currentMode = this.mode();
    switch (currentMode) {
      case 'login':
        this.onLogin();
        break;
      case 'register':
        this.onRegister();
        break;
      case 'forgot-password':
        this.onForgotPassword();
        break;
      case 'reset-password':
        this.onResetPassword();
        break;
      case 'verify-email':
        this.onVerifyEmail();
        break;
    }
  }


  onLogin() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.feedback.showToast({
        tone: 'error',
        title: 'Check your input',
        message: 'Please correct the highlighted fields.'
      });
      return;
    }

    this.loadingService.show();
    const { email, password, rememberMe } = this.authForm.value;
    this.authService.login({ email, password }, rememberMe).subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.feedback.showToast({
          tone: 'success',
          title: 'Welcome back!',
          message: 'You are signed in successfully.'
        });

        if (response.user && !response.user.is_data_complete) {
          this.router.navigate(['/complete-profile']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loadingService.hide();
        this.feedback.showToast({
          tone: 'error',
          title: 'Unable to sign in',
          message: this.extractMessage(err, 'Login failed')
        });
      }
    });
  }

  onRegister() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.feedback.showToast({
        tone: 'error',
        title: 'Fix the highlighted fields',
        message: 'Please review your information.'
      });
      return;
    }

    this.loadingService.show();
    const { email, password, confirmPassword, fullName } = this.authForm.value;
    this.authService.register({
      email,
      password,
      password_confirmation: confirmPassword,
      name: fullName
    }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.feedback.openModal({
          icon: 'info',
          title: 'Activate your account',
          message: `We sent a beautiful activation link to ${email}. Please verify your email to continue.`,
          primaryText: 'Back to login',
          onPrimary: () => this.switch('login')
        });
        this.authForm.reset();
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

  onForgotPassword() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.feedback.showToast({
        tone: 'error',
        title: 'Enter a valid email',
        message: 'We need a valid email to send the reset link.'
      });
      return;
    }

    this.loadingService.show();
    const { email } = this.authForm.value;
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

  onResetPassword() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.feedback.showToast({
        tone: 'error',
        title: 'Passwords do not match',
        message: 'Please review the requirements.'
      });
      return;
    }

    const context = this.resetContext();
    if (!context.token || !context.email) {
      this.feedback.showToast({
        tone: 'error',
        title: 'Missing reset token',
        message: 'Please reopen the reset link from your email.'
      });
      return;
    }

    this.loadingService.show();
    const { password, confirmPassword } = this.authForm.value;

    this.authService.resetPassword({
      email: context.email,
      token: context.token,
      password,
      password_confirmation: confirmPassword
    }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.feedback.showToast({
          tone: 'success',
          title: 'Password updated',
          message: 'You can now sign in with the new password.'
        });
        this.authForm.reset();
        this.resetContext.set({ token: null, email: null });
        this.switch('login');
      },
      error: (err) => {
        this.loadingService.hide();
        this.feedback.showToast({
          tone: 'error',
          title: 'Reset failed',
          message: this.extractMessage(err, 'Password reset failed')
        });
      }
    });
  }

  onVerifyEmail(options?: { skipValidation?: boolean; silent?: boolean }) {
    if (!options?.skipValidation && this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      if (!options?.silent) {
        this.feedback.showToast({
          tone: 'error',
          title: 'Enter the activation code',
          message: 'The code is required.'
        });
      }
      return;
    }
    const code = this.authForm.get('code')?.value;
    if (!code) {
      this.feedback.showToast({
        tone: 'error',
        title: 'Missing code',
        message: 'Please paste the activation code from your email.'
      });
      return;
    }
    this.verifyingEmail.set(true);
    this.loadingService.show();
    this.authService.verifyEmail(code).subscribe({
      next: () => {
        this.loadingService.hide();
        this.verifyingEmail.set(false);
        if (!options?.silent) {
          this.feedback.showToast({
            tone: 'success',
            title: 'Account activated',
            message: 'You can now sign in.'
          });
        }
        this.updateUrl('verify-email');
        this.switch('verify-success');
      },
      error: (err) => {
        this.loadingService.hide();
        this.verifyingEmail.set(false);
        this.feedback.showToast({
          tone: 'error',
          title: 'Verification failed',
          message: this.extractMessage(err, 'Verification failed')
        });
      }
    });
  }

  onGoogleLogin() {
    window.location.href = 'http://localhost:8000/auth/google';
  }

  private bootstrapFromUrl() {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const current = window.location.pathname.replace('/', '');

    const googleToken = params.get('token');
    if (googleToken && current === 'login') {
      console.log('Auth: Received Google token:', googleToken);
      this.loadingService.show();
      this.authService.loginWithGoogle(googleToken).subscribe({
        next: (user) => {
          this.loadingService.hide();
          this.scrubQueryParams(['token']);
          if (user?.is_data_complete) {
            this.feedback.showToast({
              tone: 'success',
              title: 'Signed in with Google',
              message: 'Welcome back!'
            });
            this.router.navigate(['/dashboard']);
          } else {
            this.feedback.showToast({
              tone: 'info',
              title: 'Almost done',
              message: 'Complete your profile to unlock your dashboard.'
            });
            this.router.navigate(['/complete-profile']);
          }
        },
        error: (err) => {
          this.loadingService.hide();
          this.scrubQueryParams(['token']);
          this.feedback.showToast({
            tone: 'error',
            title: 'Google login failed',
            message: this.extractMessage(err, 'Please try again.')
          });
        }
      });
      return;
    }

    switch (current) {
      case 'register':
        this.mode.set('register');
        this.position.set('left');
        this.setupFormForMode('register');
        break;
      case 'forgot-password':
        this.mode.set('forgot-password');
        this.position.set('right');
        this.setupFormForMode('forgot-password');
        break;
      case 'verify-email':
        this.mode.set('verify-email');
        this.position.set('right');
        this.setupFormForMode('verify-email');
        const verifyCode = params.get('code');
        if (verifyCode) {
          this.authForm.patchValue({ code: verifyCode });
          this.onVerifyEmail({ skipValidation: true, silent: true });
        }
        break;
      case 'reset-password':
        this.mode.set('reset-password');
        this.position.set('right');
        this.setupFormForMode('reset-password');
        this.resetContext.set({
          token: params.get('token'),
          email: params.get('email')
        });
        if (!params.get('token') || !params.get('email')) {
          this.feedback.showToast({
            tone: 'error',
            title: 'Reset link incomplete',
            message: 'Please request a new password reset email.'
          });
        }
        break;
      default:
        this.mode.set('login');
        this.position.set('right');
        this.setupFormForMode('login');
    }
  }

  private updateUrl(mode: AuthMode, params?: Record<string, string | null>) {
    if (typeof window === 'undefined') {
      return;
    }
    const path = this.modeRoutes[mode];
    if (!path) {
      return;
    }
    const url = new URL(window.location.href);
    url.pathname = path;
    if (params) {
      url.search = '';
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value);
        }
      });
    } else {
      url.search = '';
    }
    history.pushState({}, '', url.toString());
  }

  private scrubQueryParams(keys: string[]) {
    if (typeof window === 'undefined') {
      return;
    }
    const url = new URL(window.location.href);
    let mutated = false;
    keys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        mutated = true;
      }
    });
    if (mutated) {
      history.replaceState({}, '', url.toString());
    }
  }

  private extractMessage(err: any, fallback: string): string {
    const message = err?.error?.message ?? err?.message;
    if (!message) {
      return fallback;
    }
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  // Password requirement checkers for better UX
  hasMinLength(password: string): boolean {
    return !!(password && password.length >= 8);
  }

  hasUpperCase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasLowerCase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasNumber(password: string): boolean {
    return /\d/.test(password);
  }

  hasSymbol(password: string): boolean {
    return /[\W_]/.test(password);
  }

  getPasswordValue(): string {
    return this.authForm.get('password')?.value || '';
  }
}
