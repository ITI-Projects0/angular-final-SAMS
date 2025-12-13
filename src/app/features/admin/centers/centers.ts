import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, signal, NgZone } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { FeedbackService } from '../../../core/services/feedback.service';
import { LoadingService } from '../../../core/services/loading.service';
import { interval, Subscription } from 'rxjs';

interface Center {
  id: number;
  name: string;
  paid: boolean;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  city?: string;
  address?: string;
  courses: { id: number; name: string; teacher: string; studentsCount: number }[];
  raw?: any;
}

interface PendingCenter {
  id: number;
  centerName: string;
  ownerName: string;
  email: string;
  phone: string;
  createdAt: string;
  raw?: any;
}

@Component({
  selector: 'app-admin-centers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centers.html',
  styleUrl: './centers.css',
})
export class Centers implements OnInit, OnDestroy {
  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService,
    private loadingService: LoadingService,
    private zone: NgZone
  ) { }

  // Tab control
  activeTab: 'approved' | 'pending' = 'approved';

  // Approved Centers
  centers: Center[] = [];
  loadingCenters = false;
  currentId: number | null = null;
  searchTerm = '';
  infoOpen = false;
  selectedCenter: Center | null = null;

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCenter: { id?: number | null; name: string; paid: boolean } = { id: null, name: '', paid: false };
  formErrors = { name: '' };
  formSubmitting = false;

  // Pagination for approved
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;

  // Pending Centers
  pendingCenters = signal<PendingCenter[]>([]);
  loadingPending = signal(false);
  pendingSearchTerm = '';
  pendingPage = 1;
  pendingPerPage = 10;
  pendingTotal = 0;
  pendingLastPage = 1;

  // Reject modal
  rejectModalOpen = false;
  rejectingCenter: PendingCenter | null = null;
  rejectReason = '';

  private pollingSub: Subscription | null = null;

  ngOnInit(): void {
    this.loadCenters();
    this.loadPendingCenters();

    // Poll every 3 seconds to keep pending centers updated
    this.zone.runOutsideAngular(() => {
      this.pollingSub = interval(3000).subscribe(() => {
        this.zone.run(() => {
          this.loadPendingCenters(this.pendingPage, true);
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  switchTab(tab: 'approved' | 'pending') {
    this.activeTab = tab;
  }

  // ==================== APPROVED CENTERS ====================
  loadCenters(page = this.page) {
    this.loadingCenters = true;
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/centers', params).subscribe({
      next: (res) => {
        this.zone.run(() => {
          const payload = res?.data ?? res;
          const items = payload?.data ?? payload ?? [];
          this.centers = items.map((c: any) => ({
            id: c.id,
            name: c.name,
            paid: !!c.is_active,
            ownerName: c.owner?.name || '',
            ownerEmail: c.owner?.email || '',
            ownerPhone: c.owner?.phone || '',
            city: c.city || '',
            address: c.address || '',
            courses: [], // Groups are not loaded in list view, only count is available
            groupsCount: c.groups_count || 0,
            raw: c,
          }));

          const paginationSource = res?.meta?.pagination ?? res?.pagination ?? res?.meta ?? payload?.meta ?? {};
          this.page = paginationSource.current_page ?? page;
          this.perPage = paginationSource.per_page ?? this.perPage;
          this.total = paginationSource.total ?? payload?.total ?? this.centers.length;
          this.lastPage = paginationSource.last_page ?? payload?.last_page ?? Math.max(Math.ceil(this.total / this.perPage) || 1, 1);

          this.loadingCenters = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.loadingCenters = false; this.cdr.detectChanges(); },
      complete: () => { this.loadingCenters = false; this.cdr.detectChanges(); }
    });
  }

  get filteredCenters() {
    return this.centers;
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadCenters(page);
  }

  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.page = 1;
    this.loadCenters(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadCenters(1);
  }

  openForm(center?: Center) {
    this.isFormOpen = true;
    if (center) {
      this.isEditMode = true;
      this.formCenter = { id: center.id, name: center.name, paid: center.paid };
      this.currentIndex = this.centers.findIndex(c => c.id === center.id);
      this.currentId = center.id;
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.currentId = null;
      this.formCenter = { id: null, name: '', paid: false };
    }
    this.formErrors = { name: '' };
  }

  save() {
    if (!this.validateForm()) {
      this.cdr.detectChanges();
      return;
    }

    // For edit mode, admin cannot change name - only paid status
    const payload: any = { is_active: this.formCenter.paid };
    if (!this.isEditMode) {
      payload.name = this.formCenter.name;
    }

    if (this.isEditMode && this.currentId !== null) {
      this.formSubmitting = true;
      this.api.put<any>(`/centers/${this.currentId}`, payload).subscribe({
        next: () => {
          this.formSubmitting = false;
          this.closeForm();
          this.feedback.showToast({ title: 'Center updated', message: `Status has been updated.`, tone: 'success' });
          this.loadCenters();
        },
        error: () => {
          this.formSubmitting = false;
          this.feedback.showToast({ title: 'Update failed', message: 'Could not update the center.', tone: 'error' });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.formSubmitting = true;
      this.api.post<any>('/centers', payload).subscribe({
        next: () => {
          this.formSubmitting = false;
          this.feedback.showToast({ title: 'Center created', message: `"${this.formCenter.name}" has been added.`, tone: 'success' });
          this.loadCenters();
          this.closeForm();
        },
        error: () => {
          this.formSubmitting = false;
          this.feedback.showToast({ title: 'Create failed', message: 'Could not create the center.', tone: 'error' });
          this.cdr.detectChanges();
        }
      });
    }
  }

  private validateForm(): boolean {
    this.formErrors = { name: '' };
    if (this.isEditMode) return true; // No validation needed for edit (name is readonly)

    const name = this.formCenter.name?.trim() ?? '';
    this.formCenter = { ...this.formCenter, name };

    if (!name) {
      this.formErrors.name = 'Center name is required.';
    } else if (name.length < 3) {
      this.formErrors.name = 'Center name must be at least 3 characters.';
    }
    return !this.formErrors.name;
  }

  delete(center: Center) {
    this.feedback.openModal({
      icon: 'warning',
      title: 'Delete Center?',
      message: `Are you sure you want to delete "${center.name}"? This action cannot be undone.`,
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.loadingCenters = true;
        this.api.delete(`/centers/${center.id}`).subscribe({
          next: () => {
            this.feedback.showToast({ title: 'Center deleted', message: `"${center.name}" has been removed.`, tone: 'success' });
            this.loadCenters();
          },
          error: () => {
            this.loadingCenters = false;
            this.feedback.showToast({ title: 'Delete failed', message: 'Could not delete the center.', tone: 'error' });
            this.cdr.detectChanges();
          }
        });
      },
      onSecondary: () => this.feedback.closeModal()
    });
  }

  closeForm() { this.isFormOpen = false; }

  openInfo(center: Center) {
    this.selectedCenter = center;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedCenter = null;
  }

  // ==================== PENDING CENTERS ====================
  loadPendingCenters(page = this.pendingPage, background = false) {
    if (!background) this.loadingPending.set(true);

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.pendingPerPage)
      .set('search', this.pendingSearchTerm.trim())
      .set('_t', Date.now().toString()); // Cache buster

    this.api.get<any>('/admin/pending-centers', params).subscribe({
      next: (res) => {
        this.zone.run(() => {
          const payload = res?.data ?? res;
          const items = payload?.data ?? payload ?? [];

          // Update data
          this.pendingCenters.set(items.map((item: any) => ({
            id: item.id,
            centerName: item.center?.name || item.center_name || item.centerName || item.name || '',
            ownerName: item.name || item.ownerName || '',
            email: item.email || '',
            phone: item.phone || '',
            createdAt: item.created_at || item.createdAt || '',
            raw: item,
          })));

          const meta = res?.meta ?? payload?.meta ?? {};
          this.pendingPage = meta.current_page ?? page;
          this.pendingPerPage = meta.per_page ?? this.pendingPerPage;
          this.pendingTotal = meta.total ?? this.pendingCenters().length;
          this.pendingLastPage = meta.last_page ?? Math.max(Math.ceil(this.pendingTotal / this.pendingPerPage) || 1, 1);

          if (!background) this.loadingPending.set(false);
          this.cdr.detectChanges();
        });
      },
      error: () => {
        if (!background) this.loadingPending.set(false);
        this.cdr.detectChanges();
      },
      complete: () => {
        if (!background) this.loadingPending.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  get filteredPendingCenters() {
    return this.pendingCenters();
  }

  onPendingPageChange(page: number): void {
    if (page < 1 || page > this.pendingLastPage) return;
    this.pendingPage = page;
    this.loadPendingCenters(page);
  }

  onPendingPerPageChange(perPage: number): void {
    this.pendingPerPage = perPage;
    this.pendingPage = 1;
    this.loadPendingCenters(1);
  }

  onPendingSearchChange() {
    this.pendingPage = 1;
    this.loadPendingCenters(1);
  }

  approve(center: PendingCenter) {
    this.feedback.openModal({
      icon: 'info',
      title: 'Approve Center?',
      message: `Approve "${center.centerName}" by ${center.ownerName}?`,
      primaryText: 'Approve',
      secondaryText: 'Cancel',
      onPrimary: () => this.doApprove(center),
      onSecondary: () => this.feedback.closeModal()
    });
  }

  doApprove(center: PendingCenter) {
    this.loadingService.show();
    this.api.post(`/admin/centers/${center.id}/approve`, {}).subscribe({
      next: () => {
        this.loadingService.hide();
        this.feedback.showToast({ title: 'Approved', message: `"${center.centerName}" has been approved.`, tone: 'success' });
        this.loadPendingCenters();
        this.loadCenters();
      },
      error: () => {
        this.loadingService.hide();
        this.feedback.showToast({ title: 'Error', message: 'Could not approve the center.', tone: 'error' });
      }
    });
  }

  openRejectModal(center: PendingCenter) {
    this.rejectingCenter = center;
    this.rejectReason = '';
    this.rejectModalOpen = true;
  }

  closeRejectModal() {
    this.rejectModalOpen = false;
    this.rejectingCenter = null;
    this.rejectReason = '';
  }

  confirmReject() {
    if (!this.rejectingCenter) return;
    this.loadingService.show();
    this.api.post(`/admin/centers/${this.rejectingCenter.id}/reject`, { reason: this.rejectReason }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.feedback.showToast({ title: 'Rejected', message: `"${this.rejectingCenter?.centerName}" has been rejected.`, tone: 'info' });
        this.closeRejectModal();
        this.loadPendingCenters();
      },
      error: () => {
        this.loadingService.hide();
        this.feedback.showToast({ title: 'Error', message: 'Could not reject the center.', tone: 'error' });
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
