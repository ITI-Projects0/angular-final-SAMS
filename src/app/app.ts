import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { ToastContainerComponent } from './shared/ui/toast-container/toast-container';
import { ModalHostComponent } from './shared/ui/modal-host/modal-host';
import { GlobalLoaderComponent } from './shared/loader/loader';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/auth/auth.service';
import { LoaderService } from './core/services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ModalHostComponent, GlobalLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('ClassSphere');

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  private router = inject(Router);
  private routerSubscription?: Subscription;
  private notificationsInitialized = false;
  private navigationStartTime = 0;

  ngOnInit(): void {
    // Handle route navigation loading
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigationStartTime = Date.now();
        this.loaderService.show();
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        // Calculate remaining time to reach minimum 1 second
        const elapsed = Date.now() - this.navigationStartTime;
        const minDuration = 1000; // 1 second minimum
        const remainingTime = Math.max(0, minDuration - elapsed);

        // Hide loader after minimum duration for dashboard routes
        if (event instanceof NavigationEnd && event.url.includes('/dashboard')) {
          setTimeout(() => {
            this.loaderService.hide();
          }, remainingTime);
        } else {
          this.loaderService.hide();
        }

        // Initialize notifications only once after successful navigation to a protected route
        if (event instanceof NavigationEnd && !this.notificationsInitialized) {
          const isAuthPage = event.url.includes('/login') ||
                            event.url.includes('/register') ||
                            event.url.includes('/forgot-password') ||
                            event.url.includes('/reset-password');

          if (!isAuthPage && this.authService.isLoggedIn()) {
            this.notificationsInitialized = true;
            // Small delay to ensure token is properly set
            setTimeout(() => {
              this.notificationService.initialize();
            }, 500);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
    this.routerSubscription?.unsubscribe();
  }
}
