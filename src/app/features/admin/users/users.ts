import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { LoadingService } from '../../../core/services/loading.service';

type UserRole = 'admin' | 'center_admin' | 'teacher' | 'assistant' | 'student' | 'parent';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  roles: string[];
};

type CreateForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  role: UserRole;
};

type EditForm = {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  role: UserRole;
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  constructor(
    private api: ApiService,
    private feedback: FeedbackService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  readonly roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: 'admin', label: 'Admin' },
    { value: 'center_admin', label: 'Center Admin' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'student', label: 'Student' },
    { value: 'parent', label: 'Parent' },
  ];

  users: UserRecord[] = [];
  loading = false;
  createOpen = false;
  editOpen = false;
  creating = false;
  updating = false;
  deleting = false;

  searchTerm = '';
  page = 1;
  perPage = 15;
  total = 0;
  lastPage = 1;

  createForm: CreateForm = this.emptyCreateForm();
  editForm: EditForm = this.emptyEditForm();

  ngOnInit(): void {
    this.loadUsers();
  }

  private emptyCreateForm(): CreateForm {
    return {
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
      role: 'teacher',
    };
  }

  private emptyEditForm(): EditForm {
    return {
      id: null,
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
      role: 'teacher',
    };
  }

  private extractRoleNames(user: any): string[] {
    if (!Array.isArray(user?.roles)) return [];
    return user.roles
      .map((role: any) => typeof role === 'string' ? role : role?.name)
      .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0);
  }

  private normalizeUser(user: any): UserRecord {
    const roles = this.extractRoleNames(user);
    return {
      id: Number(user?.id) || 0,
      name: user?.name || '-',
      email: user?.email || '-',
      phone: user?.phone || '-',
      status: user?.status || 'active',
      role: roles[0] || '-',
      roles,
    };
  }

  loadUsers(page = this.page): void {
    this.loading = true;
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/users', params).subscribe({
      next: (res) => {
        this.zone.run(() => {
          const payload = res?.data ?? res;
          const items = payload?.data ?? payload ?? [];
          const normalized = Array.isArray(items) ? items.map((user: any) => this.normalizeUser(user)) : [];
          this.users = [...normalized];

          const pagination = res?.meta?.pagination ?? payload?.meta ?? {};
          this.page = pagination.current_page ?? payload?.current_page ?? page;
          this.perPage = pagination.per_page ?? payload?.per_page ?? this.perPage;
          this.total = pagination.total ?? payload?.total ?? this.users.length;
          this.lastPage = pagination.last_page ?? payload?.last_page ?? 1;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.feedback.showToast({
            tone: 'error',
            title: 'Load failed',
            message: err?.error?.message || 'Failed to load users.',
          });
          this.cdr.detectChanges();
        });
      },
      complete: () => {
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  toggleCreate(): void {
    this.createOpen = !this.createOpen;
    if (!this.createOpen) {
      this.createForm = this.emptyCreateForm();
    }
  }

  submitCreate(): void {
    const payload = {
      ...this.createForm,
      name: this.createForm.name.trim(),
      email: this.createForm.email.trim(),
      phone: this.createForm.phone.trim(),
      password: this.createForm.password,
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.password) {
      this.feedback.showToast({
        tone: 'error',
        title: 'Missing fields',
        message: 'Name, email, phone, password, and role are required.',
      });
      return;
    }

    this.creating = true;
    this.loadingService.show();
    this.api.post('/users', payload).subscribe({
      next: () => {
        this.feedback.showToast({
          tone: 'success',
          title: 'Created',
          message: 'User created successfully.',
        });
        this.createOpen = false;
        this.createForm = this.emptyCreateForm();
        this.page = 1;
        this.loadUsers(1);
      },
      error: (err) => {
        this.feedback.showToast({
          tone: 'error',
          title: 'Creation failed',
          message: err?.error?.message || 'Failed to create user.',
        });
      },
      complete: () => {
        this.creating = false;
        this.loadingService.hide();
      }
    });
  }

  openEdit(user: UserRecord): void {
    this.editForm = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone === '-' ? '' : user.phone,
      password: '',
      status: user.status || 'active',
      role: (this.roleOptions.find(option => option.value === user.role)?.value ?? 'teacher'),
    };
    this.editOpen = true;
  }

  closeEdit(): void {
    this.editOpen = false;
    this.editForm = this.emptyEditForm();
  }

  submitEdit(): void {
    if (!this.editForm.id) return;

    const payload: Record<string, string> = {
      name: this.editForm.name.trim(),
      email: this.editForm.email.trim(),
      phone: this.editForm.phone.trim(),
      status: this.editForm.status,
      role: this.editForm.role,
    };

    if (this.editForm.password.trim().length > 0) {
      payload['password'] = this.editForm.password;
    }

    this.updating = true;
    this.loadingService.show();
    this.api.put(`/users/${this.editForm.id}`, payload).subscribe({
      next: () => {
        this.feedback.showToast({
          tone: 'success',
          title: 'Updated',
          message: 'User updated successfully.',
        });
        this.closeEdit();
        this.loadUsers(this.page);
      },
      error: (err) => {
        this.feedback.showToast({
          tone: 'error',
          title: 'Update failed',
          message: err?.error?.message || 'Failed to update user.',
        });
      },
      complete: () => {
        this.updating = false;
        this.loadingService.hide();
      }
    });
  }

  deleteUser(user: UserRecord): void {
    this.feedback.openModal({
      icon: 'error',
      title: 'Delete User',
      message: `Delete ${user.name}? This action cannot be undone.`,
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.deleting = true;
        this.loadingService.show();
        this.api.delete(`/users/${user.id}`).subscribe({
          next: () => {
            this.feedback.showToast({
              tone: 'success',
              title: 'Deleted',
              message: 'User deleted successfully.',
            });
            this.loadUsers(this.page);
            this.feedback.closeModal();
          },
          error: (err) => {
            this.feedback.showToast({
              tone: 'error',
              title: 'Delete failed',
              message: err?.error?.message || 'Failed to delete user.',
            });
            this.feedback.closeModal();
          },
          complete: () => {
            this.deleting = false;
            this.loadingService.hide();
          }
        });
      },
      onSecondary: () => this.feedback.closeModal(),
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadUsers(page);
  }

  changePerPage(perPage: number): void {
    this.perPage = perPage;
    this.page = 1;
    this.loadUsers(1);
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadUsers(1);
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get rangeEnd(): number {
    if (this.total === 0) return 0;
    return Math.min(this.rangeStart + this.users.length - 1, this.total);
  }
}
