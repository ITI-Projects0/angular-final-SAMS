import { Component, HostListener, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Login implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  shouldLoadAnimation = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private feedback: FeedbackService,
    public themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.updateAnimationState();
    this.route.queryParams.subscribe(params => {
      const exchangeToken = params['exchange_token'];
      if (exchangeToken) {
        this.handleExchangeToken(exchangeToken);
      }
    });
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateAnimationState();
  }

  private handleExchangeToken(token: string) {
    this.loadingService.show();

    // Check if this is a new user registration (pending flag from URL)
    const isPending = this.route.snapshot.queryParamMap.get('pending') === '1';

    this.authService.exchangeToken(token, true).subscribe({
      next: (response) => {
        this.loadingService.hide();

        // If new user (from Google registration), they need approval
        if (isPending || response.user?.approval_status === 'pending') {
          this.feedback.showToast({
            tone: 'info',
            title: 'Account Created',
            message: 'Your account is pending admin approval.'
          });
          this.router.navigate(['/pending-approval']);
          return;
        }

        this.feedback.showToast({
          tone: 'success',
          title: 'Welcome back!',
          message: 'Signed in with Google successfully.'
        });
        
        const roles = response.roles || response.user?.roles || [];
        const redirectUrl = this.authService.getDashboardUrl(roles);
        this.router.navigate([redirectUrl]);
      },
      error: (err) => {
        this.loadingService.hide();
        this.feedback.showToast({
          tone: 'error',
          title: 'Google Login Failed',
          message: 'Could not authenticate with the provided token.'
        });
      }
    });
  }

  private updateAnimationState() {
    if (typeof window === 'undefined') {
      this.shouldLoadAnimation = false;
      return;
    }
    this.shouldLoadAnimation = window.innerWidth >= 768;
  }

  onSwitch(mode: string, params?: Record<string, any>) {
    this.router.navigate(['/' + mode], { queryParams: params });
  }

  onGoogleLogin() {
    window.location.href = 'http://localhost:8000/auth/google';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.feedback.showToast({
        tone: 'error',
        title: 'Check your input',
        message: 'Please correct the highlighted fields.'
      });
      return;
    }

    this.loadingService.show();
    const { email, password, rememberMe } = this.loginForm.value;
    this.authService.login({ email, password }, rememberMe).subscribe({
      next: (response) => {
        this.loadingService.hide();

        // Check if account is pending approval
        if (response.approval_status === 'pending') {
          this.feedback.showToast({
            tone: 'info',
            title: 'Account Pending',
            message: 'Your account is awaiting admin approval.'
          });
          this.router.navigate(['/pending-approval']);
          return;
        }

        this.feedback.showToast({
          tone: 'success',
          title: 'Welcome back!',
          message: 'You are signed in successfully.'
        });

        // Redirect based on role
        const redirectUrl = this.authService.getDashboardUrl(response.user?.roles || []);
        this.router.navigate([redirectUrl]);
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



  private extractMessage(err: any, fallback: string): string {
    const message = err?.error?.message ?? err?.message;
    if (!message) {
      return fallback;
    }
    return typeof message === 'string' ? message : JSON.stringify(message);
  }
}
