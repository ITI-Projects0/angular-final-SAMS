import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-approval.html'
})
export class PendingApproval implements OnInit {
  checking = signal<boolean>(false);
  userName = signal<string>('');
  userEmail = signal<string>('');

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private loadingService: LoadingService,
    private feedback: FeedbackService
  ) {}

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    if (user) {
      this.userName.set(user.name || '');
      this.userEmail.set(user.email || '');

      // If already approved, redirect to dashboard
      if (user.approval_status === 'approved') {
        const redirectUrl = this.authService.getDashboardUrl(user.roles || []);
        this.router.navigate([redirectUrl]);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Check approval status by calling /me endpoint
   */
  checkStatus(): void {
    this.checking.set(true);
    this.loadingService.show();

    this.authService.user().subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.checking.set(false);

        const user = response.data || response;
        
        // Update stored user
        this.tokenStorage.updateStoredUser(user);

        if (user.approval_status === 'approved') {
          this.feedback.showToast({
            tone: 'success',
            title: 'Approved!',
            message: 'Your account has been approved. Redirecting...'
          });
          
          const redirectUrl = this.authService.getDashboardUrl(user.roles || []);
          setTimeout(() => this.router.navigate([redirectUrl]), 1000);
        } else if (user.approval_status === 'rejected') {
          this.feedback.showToast({
            tone: 'error',
            title: 'Registration Rejected',
            message: 'Your registration has been rejected. Please contact support.'
          });
          this.logout();
        } else {
          this.feedback.showToast({
            tone: 'info',
            title: 'Still Pending',
            message: 'Your account is still awaiting approval.'
          });
        }
      },
      error: () => {
        this.loadingService.hide();
        this.checking.set(false);
        this.feedback.showToast({
          tone: 'error',
          title: 'Error',
          message: 'Failed to check status. Please try again.'
        });
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
