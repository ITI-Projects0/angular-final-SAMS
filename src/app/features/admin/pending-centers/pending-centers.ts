import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { LoadingService } from '../../../core/services/loading.service';
import { HttpParams } from '@angular/common/http';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';

interface PendingCenter {
  id: number;
  name: string;
  email: string;
  phone: string;
  centerName: string;
  createdAt: string;
  raw: any;
}

@Component({
  selector: 'app-pending-centers',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './pending-centers.html',
  styleUrl: './pending-centers.css',
})
export class PendingCenters implements OnInit {
  constructor(
    private api: ApiService,
    private feedback: FeedbackService,
    private loading: LoadingService
  ) { }

  pendingCenters = signal<PendingCenter[]>([]);
  isLoading = signal(false);
  searchTerm = '';

  // Pagination
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;

  // Reject modal state
  rejectModalOpen = signal(false);
  rejectReason = '';
  selectedUserId: number | null = null;

  ngOnInit(): void {
    this.loadPendingCenters();
  }

  loadPendingCenters(page = this.page): void {
    this.isLoading.set(true);
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/admin/pending-centers', params).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];

        const centers = items.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '—',
          centerName: user.owned_center?.name || user.center?.name || '—',
          createdAt: user.created_at,
          raw: user,
        }));

        this.pendingCenters.set(centers);

        const pagination = res?.meta?.pagination ?? payload?.meta ?? {};
        this.page = pagination.current_page ?? page;
        this.perPage = pagination.per_page ?? this.perPage;
        this.total = pagination.total ?? this.pendingCenters().length;
        this.lastPage = pagination.last_page ?? this.lastPage ?? 1;

        this.isLoading.set(false);
      },
      error: () => {
        this.feedback.showToast({
          tone: 'error',
          title: 'Error',
          message: 'Failed to load pending centers.'
        });
        this.isLoading.set(false);
      }
    });
  }

  // Removed client-side filtering as we now use backend search
  get filteredCenters() {
    return this.pendingCenters();
  }

  /** Handle page change from pagination component */
  onPageChange(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadPendingCenters(page);
  }

  /** Handle per-page change from pagination component */
  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.page = 1;
    this.loadPendingCenters(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadPendingCenters(1);
  }

  approve(center: PendingCenter): void {
    this.feedback.openModal({
      icon: 'info',
      title: 'Approve Center',
      message: `Are you sure you want to approve "${center.name}"?`,
      primaryText: 'Approve',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.doApprove(center.id);
        this.feedback.closeModal();
      },
      onSecondary: () => this.feedback.closeModal()
    });
  }

  private doApprove(userId: number): void {
    this.loading.show();
    this.api.post<any>(`/admin/centers/${userId}/approve`, {}).subscribe({
      next: () => {
        this.loading.hide();
        this.feedback.showToast({
          tone: 'success',
          title: 'Approved',
          message: 'Center has been approved successfully.'
        });
        this.loadPendingCenters();
      },
      error: (err) => {
        this.loading.hide();
        this.feedback.showToast({
          tone: 'error',
          title: 'Error',
          message: err?.error?.message || 'Failed to approve center.'
        });
      }
    });
  }

  openRejectModal(center: PendingCenter): void {
    this.selectedUserId = center.id;
    this.rejectReason = '';
    this.rejectModalOpen.set(true);
  }

  closeRejectModal(): void {
    this.rejectModalOpen.set(false);
    this.selectedUserId = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.selectedUserId) return;

    this.loading.show();
    this.api.post<any>(`/admin/centers/${this.selectedUserId}/reject`, {
      reason: this.rejectReason || null
    }).subscribe({
      next: () => {
        this.loading.hide();
        this.feedback.showToast({
          tone: 'success',
          title: 'Rejected',
          message: 'Center registration has been rejected.'
        });
        this.closeRejectModal();
        this.loadPendingCenters();
      },
      error: (err) => {
        this.loading.hide();
        this.feedback.showToast({
          tone: 'error',
          title: 'Error',
          message: err?.error?.message || 'Failed to reject center.'
        });
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
