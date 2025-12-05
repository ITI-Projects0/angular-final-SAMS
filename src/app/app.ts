import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastContainerComponent } from './shared/ui/toast-container/toast-container';
import { ModalHostComponent } from './shared/ui/modal-host/modal-host';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/auth/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ModalHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('final-angular-SAMS');

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    // Initialize notifications if user is logged in
    if (this.authService.isLoggedIn()) {
      this.notificationService.initialize();
    }

    // Re-initialize notifications on navigation if user logs in
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.authService.isLoggedIn()) {
          this.notificationService.initialize();
        }
      });
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
    this.routerSubscription?.unsubscribe();
  }
}
