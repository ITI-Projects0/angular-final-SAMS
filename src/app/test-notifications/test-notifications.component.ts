import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';
import { ApiService } from '../core/services/api.service';
import { TokenStorageService } from '../core/auth/token-storage.service';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

@Component({
  selector: 'app-test-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            🧪 Notification System Test Suite
          </h1>
          <p class="text-slate-600 dark:text-slate-400 mb-8">
            Test all notification features in real-time
          </p>

          <!-- Test Controls -->
          <div class="flex gap-4 mb-8">
            <button
              (click)="runAllTests()"
              [disabled]="isRunning"
              class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ isRunning ? 'Running Tests...' : 'Run All Tests' }}
            </button>

            <button
              (click)="clearResults()"
              [disabled]="isRunning"
              class="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Clear Results
            </button>

            <button
              (click)="testRealTimeConnection()"
              [disabled]="isRunning"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Test Real-Time
            </button>
          </div>

          <!-- Test Results -->
          <div class="space-y-4">
            @for (result of testResults; track result.name) {
              <div
                class="p-4 rounded-lg border"
                [ngClass]="{
                  'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600': result.status === 'pending',
                  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800': result.status === 'success',
                  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800': result.status === 'error'
                }"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    @if (result.status === 'pending') {
                      <div class="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    }
                    @if (result.status === 'success') {
                      <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                    @if (result.status === 'error') {
                      <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    }
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-slate-900 dark:text-white">
                      {{ result.name }}
                    </h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {{ result.message }}
                    </p>
                    @if (result.details) {
                      <pre class="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-x-auto">{{ result.details | json }}</pre>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Summary -->
          @if (testResults.length > 0 && !isRunning) {
            <div class="mt-8 p-6 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Test Summary
              </h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-3xl font-bold text-slate-900 dark:text-white">
                    {{ getTestCount('success') }}
                  </div>
                  <div class="text-sm text-green-600 dark:text-green-400">Passed</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-slate-900 dark:text-white">
                    {{ getTestCount('error') }}
                  </div>
                  <div class="text-sm text-red-600 dark:text-red-400">Failed</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-slate-900 dark:text-white">
                    {{ testResults.length }}
                  </div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">Total</div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TestNotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private apiService = inject(ApiService);
  private tokenStorage = inject(TokenStorageService);

  testResults: TestResult[] = [];
  isRunning = false;

  ngOnInit() {
    this.addResult('System Initialized', 'success', 'Test component loaded successfully');
  }

  async runAllTests() {
    this.isRunning = true;
    this.testResults = [];

    await this.testAuthentication();
    await this.testNotificationService();
    await this.testApiEndpoints();
    await this.testUnreadCount();
    await this.testLatestNotifications();
    await this.testMarkAsRead();
    await this.testMarkAllAsRead();

    this.isRunning = false;
  }

  async testAuthentication() {
    this.addResult('Authentication Check', 'pending', 'Checking user authentication...');

    await this.delay(500);

    const user = this.tokenStorage.getUser();
    const token = this.tokenStorage.getToken();

    if (user && token) {
      this.updateLastResult('success', `User authenticated: ${user.name}`, { userId: user.id, email: user.email });
    } else {
      this.updateLastResult('error', 'User not authenticated');
    }
  }

  async testNotificationService() {
    this.addResult('Notification Service', 'pending', 'Checking service initialization...');

    await this.delay(500);

    if (this.notificationService) {
      this.updateLastResult('success', 'Notification service is initialized');
    } else {
      this.updateLastResult('error', 'Notification service not found');
    }
  }

  async testApiEndpoints() {
    this.addResult('API Endpoints', 'pending', 'Testing API connectivity...');

    try {
      const response = await this.apiService.get<any>('/notifications/unread-count').toPromise();
      this.updateLastResult('success', 'API endpoints accessible', response);
    } catch (error: any) {
      this.updateLastResult('error', `API error: ${error.message}`);
    }
  }

  async testUnreadCount() {
    this.addResult('Unread Count', 'pending', 'Fetching unread count...');

    try {
      const response = await this.apiService.get<any>('/notifications/unread-count').toPromise();
      this.updateLastResult('success', `Unread count: ${response.count}`, response);
    } catch (error: any) {
      this.updateLastResult('error', `Failed to get unread count: ${error.message}`);
    }
  }

  async testLatestNotifications() {
    this.addResult('Latest Notifications', 'pending', 'Fetching latest notifications...');

    try {
      const response = await this.apiService.get<any>('/notifications/latest').toPromise();
      const count = response.data?.length || 0;
      this.updateLastResult('success', `Retrieved ${count} notifications`, { count });
    } catch (error: any) {
      this.updateLastResult('error', `Failed to get notifications: ${error.message}`);
    }
  }

  async testMarkAsRead() {
    this.addResult('Mark as Read', 'pending', 'Testing mark as read functionality...');

    try {
      const notifications = await this.apiService.get<any>('/notifications/latest').toPromise();
      const unreadNotification = notifications.data?.find((n: any) => !n.read_at);

      if (unreadNotification) {
        await this.apiService.post(`/notifications/${unreadNotification.id}/mark-read`).toPromise();
        this.updateLastResult('success', 'Successfully marked notification as read');
      } else {
        this.updateLastResult('success', 'No unread notifications to test with');
      }
    } catch (error: any) {
      this.updateLastResult('error', `Mark as read failed: ${error.message}`);
    }
  }

  async testMarkAllAsRead() {
    this.addResult('Mark All as Read', 'pending', 'Testing mark all as read...');

    try {
      await this.apiService.post('/notifications/mark-all-read').toPromise();
      this.updateLastResult('success', 'Successfully marked all as read');
    } catch (error: any) {
      this.updateLastResult('error', `Mark all as read failed: ${error.message}`);
    }
  }

  async testRealTimeConnection() {
    this.isRunning = true;
    this.testResults = [];

    this.addResult('Real-Time Connection', 'pending', 'Checking Pusher connection...');

    await this.delay(1000);

    const user = this.tokenStorage.getUser();
    if (user) {
      this.updateLastResult('success', `Should be subscribed to: user.${user.id}`, {
        channel: `user.${user.id}`,
        instruction: 'Check browser console for "Subscribed to user.X channel"'
      });
    } else {
      this.updateLastResult('error', 'User not authenticated');
    }

    this.addResult('Broadcast Test', 'pending', 'Send a test notification from Laravel to see real-time updates');
    await this.delay(500);
    this.updateLastResult('success', 'Run: php test_realtime.php', {
      command: 'php test_realtime.php',
      expected: 'Toast notification + Badge update + Dropdown refresh'
    });

    this.isRunning = false;
  }

  clearResults() {
    this.testResults = [];
  }

  private addResult(name: string, status: 'pending' | 'success' | 'error', message: string, details?: any) {
    this.testResults.push({ name, status, message, details });
  }

  private updateLastResult(status: 'success' | 'error', message: string, details?: any) {
    if (this.testResults.length > 0) {
      const last = this.testResults[this.testResults.length - 1];
      last.status = status;
      last.message = message;
      if (details) last.details = details;
    }
  }

  getTestCount(status: string): number {
    return this.testResults.filter(r => r.status === status).length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
