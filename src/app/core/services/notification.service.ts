import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './api.service';
import { TokenStorageService } from '../auth/token-storage.service';

export interface Notification {
  id: string;
  type: string;
  data: {
    type: string;
    title: string;
    message: string;
    icon: string;
    created_at: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiService = inject(ApiService);
  private tokenStorage = inject(TokenStorageService);
  private toastr = inject(ToastrService);

  private echo: Echo<any> | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  getCurrentNotifications(): Notification[] {
    return this.notificationsSubject.getValue();
  }

  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.getValue();
  }

  constructor() {}

  initialize(): void {
    const user = this.tokenStorage.getUser();
    const token = this.tokenStorage.getToken();

    if (!user) {
      console.warn('Cannot initialize notifications: User not authenticated');
      return;
    }

    // Set Pusher on window
    (window as any).Pusher = Pusher;

    // Initialize Laravel Echo
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: 'f3a80187efd8663a3273',
      cluster: 'mt1',
      forceTLS: false,
      encrypted: false,
      authorizer: this.createAuthorizer(token),
    });

    // Subscribe to private user channel
    this.subscribeToUserChannel(user.id);

    // Load initial data
    this.loadLatestNotifications();
    this.loadUnreadCount();
  }

  private subscribeToUserChannel(userId: number): void {
    if (!this.echo) return;

    this.echo.private(`user.${userId}`)
      .listen('.notification.created', (data: any) => {
        console.log('New notification received:', data);
        this.handleNewNotification(data);
      })
      .error((error: any) => {
        console.error('Echo subscription error:', error);
      });

    console.log(`Subscribed to user.${userId} channel`);
  }

  private handleNewNotification(data: any): void {
    // Show toast
    this.showToast(data);

    // Reload notifications and count
    this.loadLatestNotifications();
    this.loadUnreadCount();
  }

  private showToast(data: any): void {
    const title = data.title || 'New Notification';
    const message = data.message || '';

    this.toastr.info(message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
      positionClass: 'toast-top-right',
      enableHtml: true,
    });
  }

  loadLatestNotifications(): void {
    this.apiService.get<any>('/notifications/latest').subscribe({
      next: (response) => {
        this.notificationsSubject.next(response.data || []);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  loadUnreadCount(): void {
    this.apiService.get<any>('/notifications/unread-count').subscribe({
      next: (response) => {
        this.unreadCountSubject.next(response.count || 0);
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.apiService.post(`/notifications/${notificationId}/mark-read`);
  }

  markAllAsRead(): Observable<any> {
    return this.apiService.post('/notifications/mark-all-read');
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.apiService.delete(`/notifications/${notificationId}`);
  }

  disconnect(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }

    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  private createAuthorizer(token?: string | null) {
    const authUrl = 'http://localhost:8000/broadcasting/auth';

    return (channel: any, options: any) => ({
      authorize: (socketId: string, callback: (error: Error | null, data: any) => void) => {
        const body = new URLSearchParams({
          socket_id: socketId,
          channel_name: channel.name
        }).toString();

        const headers: Record<string, string> = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(authUrl, {
          method: 'POST',
          headers,
          credentials: 'include',
          body
        })
          .then(async (response) => {
            let data: any = null;
            try {
              data = await response.json();
            } catch {
              // Keep null to trigger failure path
            }

            if (!response.ok || !data?.auth) {
              console.error('Echo auth failed', { status: response.status, body: data });
              callback(new Error('Auth failed'), null);
              return;
            }

            callback(null, data);
          })
          .catch((error) => {
            console.error('Echo auth fetch error', error);
            callback(error, null);
          });
      }
    });
  }
}
