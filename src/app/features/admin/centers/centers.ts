import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-admin-centers',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './centers.html',
  styleUrl: './centers.css',
})
export class Centers implements OnInit {
  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}

  centers: any[] = [];
  loading = false;
  currentId: number | null = null;
  searchTerm = '';
  infoOpen = false;
  selectedCenter: any = null;

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCenter: { id?: number | null; name: string; paid: boolean } = { id: null, name: '', paid: false };
  formErrors = { name: '' };
  formSubmitting = false;

  // Pagination
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;

  ngOnInit(): void {
    this.loadCenters();
  }

  loadCenters(page = this.page) {
    this.setLoading(true);
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/centers', params).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.centers = items.map((c: any) => ({
          id: c.id,
          name: c.name,
          paid: !!c.is_active,
          courses: (c.groups || []).map((g: any) => ({
            id: g.id,
            name: g.name,
            teacher: g.teacher?.name || '',
            studentsCount: g.students_count ?? g.studentsCount ?? 0,
          })),
          raw: c,
        }));

        // Normalize pagination regardless of API shape
        const paginationSource =
          res?.meta?.pagination ??
          res?.pagination ??
          res?.meta ??
          payload?.meta?.pagination ??
          payload?.meta ??
          {};
        const currentPage = paginationSource.current_page ?? page;
        const perPage = paginationSource.per_page ?? this.perPage;
        const total = paginationSource.total ?? payload?.total ?? this.centers.length;
        const lastPage =
          paginationSource.last_page ??
          payload?.last_page ??
          Math.max(Math.ceil(total / perPage) || 1, 1);

        this.page = currentPage;
        this.perPage = perPage;
        this.total = total;
        this.lastPage = lastPage;

        this.cdr.detectChanges();
      },
      error: () => { this.setLoading(false); this.cdr.detectChanges(); },
      complete: () => { this.setLoading(false); this.cdr.detectChanges(); }
    });
  }

  // Backend handles search; display results as returned
  get filteredCenters() {
    return this.centers;
  }

  /** Handle page change from pagination component */
  onPageChange(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadCenters(page);
  }

  /** Handle per-page change from pagination component */
  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.page = 1;
    this.loadCenters(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadCenters(1);
  }

  openForm(center?: typeof this.formCenter) {
    this.isFormOpen = true;
    if (center) {
      this.isEditMode = true;
      this.formCenter = { id: center.id ?? null, name: center.name, paid: center.paid };
      this.currentIndex = this.centers.findIndex(c => c.id === center.id);
      this.currentId = center.id ?? null;
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

    const payload = {
      name: this.formCenter.name,
      is_active: this.formCenter.paid,
    };

    if (this.isEditMode && this.currentId !== null) {
      this.formSubmitting = true;
      this.api.put<any>(`/centers/${this.currentId}`, payload).subscribe({
        next: () => {
          this.formSubmitting = false;
          this.cdr.detectChanges();
          this.closeForm();
          this.feedback.showToast({
            title: 'Center updated',
            message: `"${this.formCenter.name}" has been updated.`,
            tone: 'success'
          });
          this.loadCenters();
        },
        error: () => {
          this.formSubmitting = false;
          this.feedback.showToast({
            title: 'Update failed',
            message: 'Could not update the center. Please try again.',
            tone: 'error'
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.formSubmitting = true;
      this.api.post<any>('/centers', payload).subscribe({
        next: () => {
          this.formSubmitting = false;
          this.feedback.showToast({
            title: 'Center created',
            message: `"${this.formCenter.name}" has been added.`,
            tone: 'success'
          });
          this.loadCenters();
          this.closeForm();
        },
        error: () => {
          this.formSubmitting = false;
          this.feedback.showToast({
            title: 'Create failed',
            message: 'Could not create the center. Please try again.',
            tone: 'error'
          });
          this.cdr.detectChanges();
        }
      });
    }
  }

  private validateForm(): boolean {
    this.formErrors = { name: '' };

    const name = this.formCenter.name?.trim() ?? '';

    this.formCenter = { ...this.formCenter, name };

    if (!name) {
      this.formErrors.name = 'Center name is required.';
    } else if (name.length < 3) {
      this.formErrors.name = 'Center name must be at least 3 characters.';
    }

    return !this.formErrors.name;
  }

  delete(center: typeof this.formCenter) {
    const found = this.centers.find(c => c.id === center.id);
    if (!found?.id) {
      this.centers = this.centers.filter(c => c.id !== center.id);
      return;
    }

    this.feedback.openModal({
      icon: 'warning',
      title: 'Delete Center?',
      message: `Are you sure you want to delete "${found.name}"? This action cannot be undone.`,
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.setLoading(true);
        this.api.delete(`/centers/${found.id}`).subscribe({
          next: () => {
            this.feedback.showToast({
              title: 'Center deleted',
              message: `"${found.name}" has been removed.`,
              tone: 'success'
            });
            this.loadCenters(); // Reload to update pagination
          },
          error: () => {
            this.setLoading(false);
            this.feedback.showToast({
              title: 'Delete failed',
              message: 'Could not delete the center. Please try again.',
              tone: 'error'
            });
            this.cdr.detectChanges();
          }
        });
      },
      onSecondary: () => this.feedback.closeModal()
    });
  }

  closeForm() {
    this.isFormOpen = false;
  }

  openInfo(center: any) {
    this.selectedCenter = center;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedCenter = null;
  }

  private setLoading(state: boolean) {
    this.loading = state;
    try {
      this.cdr.detectChanges();
    } catch {
      // View might be destroyed; ignore
    }
  }
}
