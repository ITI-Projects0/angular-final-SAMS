import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { LoadingService } from '../../../core/services/loading.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-centers.html',
  styleUrl: './pending-centers.css',
})
export class PendingCenters implements OnInit {
  constructor(
    private api: ApiService,
    private feedback: FeedbackService,
    private loading: LoadingService
  ) {}

  pendingCenters = signal<PendingCenter[]>([]);
  isLoading = signal(false);
  searchTerm = '';
  
  // Reject modal state
  rejectModalOpen = signal(false);
  rejectReason = '';
  selectedUserId: number | null = null;

  ngOnInit(): void {
    this.loadPendingCenters();
  }

  loadPendingCenters(): void {
    this.isLoading.set(true);
    this.api.get<any>('/admin/pending-centers').subscribe({
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

  get filteredCenters() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.pendingCenters();
    return this.pendingCenters().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.centerName.toLowerCase().includes(q)
    );
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
