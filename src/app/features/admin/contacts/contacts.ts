import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { finalize, map } from 'rxjs/operators';

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

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService
      .get<{ data?: Contact[] } | Contact[]>('/admin/contacts')
      .pipe(
        // Normalize API responses that return either raw arrays or wrapped objects
        map((response) => (Array.isArray(response) ? response : response.data ?? [])),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to load contacts';
        },
      });
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
