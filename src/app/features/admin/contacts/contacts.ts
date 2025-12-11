import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { finalize, map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts implements OnInit {
  private readonly apiService = inject(ApiService);

  contacts: Contact[] = [];
  isLoading = true;
  errorMessage = '';

  // Pagination
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(page = this.page): void {
    this.isLoading = true;
    this.errorMessage = '';

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage);

    this.apiService
      .get<{ data?: Contact[], meta?: any } | Contact[]>('/admin/contacts', params)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          const payload = response?.data ?? response;
          const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
          this.contacts = items;

          const pagination = response?.meta?.pagination ?? response?.meta ?? {};
          this.page = pagination.current_page ?? page;
          this.perPage = pagination.per_page ?? this.perPage;
          this.total = pagination.total ?? this.contacts.length;
          this.lastPage = pagination.last_page ?? this.lastPage ?? 1;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to load contacts';
        },
      });
  }

  changePage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadContacts(page);
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.rangeStart + this.contacts.length - 1, this.total);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
