import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-staff-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  constructor(
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) { }

  teachers: any[] = [];
  loading = false;

  searchTerm = '';
  panelOpen = false;
  selectedTeacher: any = null;
  panelMode: 'info' | 'create' | 'edit' = 'info';
  form = { name: '', email: '', phone: '', role: 'teacher' as 'teacher' | 'assistant' };
  formErrors = { name: '', email: '', phone: '' };
  processing = false;
  saveError = '';
  page = 1;
  perPage = 6;
  totalPages = 1;
  totalItems = 0;
  private roles: string[] = [];
  private centerAccessUnavailable = false;
  activeRole: 'teacher' | 'assistant' = 'teacher';
  public staffNames: string[] = [];

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.loadTeachers();
  }

  get isCenterAdmin(): boolean {
    return this.roles.includes('center_admin');
  }

  get panelTitle(): string {
    if (this.panelMode === 'create') {
      return this.form.role === 'teacher' ? 'Add Teacher' : 'Add Assistant';
    }
    if (this.panelMode === 'edit') {
      return `Edit ${this.selectedTeacher?.name ?? 'Staff'}`;
    }
    return 'Staff info';
  }

  get canSubmitForm(): boolean {
    const name = this.form.name?.trim() ?? '';
    const email = this.form.email?.trim() ?? '';
    return !!name && !!email && !this.formErrors.name && !this.formErrors.email && !this.formErrors.phone;
  }

  private loadTeachers() {
    this.loading = true;

    if (this.isCenterAdmin && !this.centerAccessUnavailable) {
      this.staffService.getMembers({ role: this.activeRole, page: this.page, search: this.searchTerm || undefined }).subscribe({
        next: (res) => {
          const payload = res?.data ?? res;
          const teachers = this.unwrapCollection(
            this.activeRole === 'teacher' ? payload?.teachers ?? payload : payload?.assistants ?? payload
          );
          const collection = this.activeRole === 'teacher' ? payload?.teachers : payload?.assistants;
          this.totalPages = collection?.meta?.last_page ?? 1;
          this.perPage = collection?.meta?.per_page ?? this.perPage;
          this.totalItems = collection?.meta?.total ?? teachers.length;
          this.page = collection?.meta?.current_page ?? this.page;

          this.teachers = teachers.map((t: any) => ({
            id: t.id,
            name: t.name,
            email: t.email,
            center: payload?.center?.name ?? t.center?.name ?? '',
            courses: t.groups_count ?? t.groups?.length ?? 0,
            phone: t.phone || '',
            raw: t,
          }));
          this.finishLoading();
        },
        error: (err: HttpErrorResponse) => {
          if (err?.status === 404) {
            this.centerAccessUnavailable = true;
            this.loadDirectoryTeachers();
          } else {
            this.finishLoading();
            this.feedback.showToast({
              title: 'Load failed',
              message: 'Unable to load center staff.',
              tone: 'error'
            });
          }
        }
      });
      return;
    }

    this.loadDirectoryTeachers();
  }

  private loadDirectoryTeachers(): void {
    this.staffService.getTeachers().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = this.unwrapCollection(payload);
        this.teachers = items.map((t: any) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          center: t.taught_groups?.[0]?.center?.name || t.center?.name || '',
          courses: t.taught_groups_count ?? t.taughtGroups_count ?? t.taught_groups?.length ?? 0,
          phone: t.phone || '',
          raw: t,
        }));
        this.staffNames = this.teachers.map((t) => t.name).filter(Boolean);
        this.finishLoading();
      },
      error: () => {
        this.finishLoading();
        this.feedback.showToast({
          title: 'Load failed',
          message: 'Unable to load staff directory.',
          tone: 'error'
        });
      }
    });
  }

  private unwrapCollection(collection: any): any[] {
    if (!collection) {
      return [];
    }
    if (Array.isArray(collection)) {
      return collection;
    }
    if (Array.isArray(collection.data)) {
      return collection.data;
    }
    return Array.isArray(collection.items) ? collection.items : [];
  }

  get filteredTeachers() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.teachers;
    return this.teachers.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.center || '').toLowerCase().includes(q) ||
      String(t.courses ?? '').toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q)
    );
  }

  get pageStart(): number {
    if (!this.totalItems) return 0;
    return (this.page - 1) * this.perPage + 1;
  }

  get pageEnd(): number {
    if (!this.totalItems) return 0;
    return Math.min(this.page * this.perPage, this.totalItems);
  }

  openInfo(teacher: any) {
    this.selectedTeacher = teacher;
    this.panelMode = 'info';
    this.panelOpen = true;
  }

  closeInfo() {
    this.panelOpen = false;
    this.selectedTeacher = null;
    this.panelMode = 'info';
    this.processing = false;
    this.saveError = '';
  }

  setRoleFilter(role: 'teacher' | 'assistant'): void {
    if (this.activeRole === role) {
      return;
    }
    this.activeRole = role;
    this.page = 1;
    this.loadTeachers();
  }

  openCreate(role: 'teacher' | 'assistant'): void {
    if (!this.isCenterAdmin) return;
    this.form = { name: '', email: '', phone: '', role };
    this.formErrors = { name: '', email: '', phone: '' };
    this.selectedTeacher = null;
    this.panelMode = 'create';
    this.panelOpen = true;
    this.saveError = '';
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (!err) return fallback;

    if (typeof err === 'string') {
      return err;
    }

    if (typeof err?.error === 'string') {
      return err.error;
    }

    const errorsObj = err?.error?.errors;
    if (typeof errorsObj === 'string') {
      return errorsObj;
    }
    if (errorsObj && typeof errorsObj === 'object') {
      const collected: string[] = [];
      Object.values(errorsObj).forEach((val: any) => {
        if (Array.isArray(val)) {
          collected.push(...val.map((v) => String(v)));
        } else if (val) {
          collected.push(String(val));
        }
      });
      if (collected.length) {
        return collected.join(' ');
      }
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.message) {
      return err.message;
    }

    return fallback;
  }

  openEdit(teacher: any): void {
    if (!this.isCenterAdmin) return;
    this.selectedTeacher = teacher;
    this.form = {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone ?? '',
      role: this.activeRole
    };
    this.formErrors = { name: '', email: '', phone: '' };
    this.panelMode = 'edit';
    this.panelOpen = true;
    this.saveError = '';
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
    this.loadTeachers();
  }

  goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages) return;
    this.page = nextPage;
    this.loadTeachers();
  }

  submitForm(): void {
    if (!this.isCenterAdmin || this.processing) {
      return;
    }
    if (!this.validateForm()) {
      this.cdr.detectChanges();
      return;
    }
    const name = this.form.name.trim();
    const email = this.form.email.trim();
    const phone = this.form.phone.trim();

    this.processing = true;
    this.saveError = '';
    const payload: any = {
      name,
      email,
      phone: phone || null,
      role: this.form.role
    };

    const request$ =
      this.panelMode === 'create'
        ? this.staffService.createManagementUser(payload)
        : this.staffService.updateManagementUser(this.selectedTeacher.id, {
          name,
          email,
          phone: phone || null
        });

    request$
      .pipe(
        finalize(() => {
          this.processing = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.closeInfo();
          this.loadTeachers();
          this.feedback.showToast({
            title: this.panelMode === 'create' ? 'Staff created' : 'Staff updated',
            message: `${this.form.name} saved successfully.`,
            tone: 'success'
          });
        },
        error: (err) => {
          this.closeInfo();
          this.saveError = this.extractErrorMessage(err, 'Unable to save staff member.');
          this.feedback.showToast({
            title: 'Save failed',
            message: this.saveError,
            tone: 'error'
          });
          this.cdr.detectChanges();
        }
      });
  }

  deleteSelected(): void {
    if (!this.isCenterAdmin || !this.selectedTeacher || this.processing) {
      return;
    }
    const target = this.selectedTeacher;
    this.closeInfo();
    this.feedback.openModal({
      icon: 'warning',
      title: 'Delete staff?',
      message: `This will remove ${target.name} from your center.`,
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.processing = true;
        this.staffService.deleteManagementUser(target.id)
          .pipe(
            finalize(() => {
              this.processing = false;
              this.cdr.detectChanges();
            })
          )
          .subscribe({
            next: () => {
              this.closeInfo();
              this.loadTeachers();
              this.feedback.showToast({
                title: 'Staff deleted',
                message: `${target.name} has been removed.`,
                tone: 'success'
              });
            },
            error: (err) => {
              this.saveError = this.extractErrorMessage(err, 'Unable to delete staff.');
              this.feedback.showToast({
                title: 'Delete failed',
                message: this.saveError,
                tone: 'error'
              });
              this.cdr.detectChanges();
            }
          });
      },
      onSecondary: () => this.feedback.closeModal()
    });
  }

  get canEditSelected(): boolean {
    return this.isCenterAdmin && !!this.selectedTeacher;
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }

  onFormChange(): void {
    this.validateForm();
  }

  private validateForm(updateErrors: boolean = true): boolean {
    const errors = { name: '', email: '', phone: '' };
    const name = this.form.name?.trim() ?? '';
    const email = this.form.email?.trim() ?? '';
    const phone = this.form.phone?.trim() ?? '';

    if (!name) {
      errors.name = 'Name is required.';
    } else if (name.length < 3) {
      errors.name = 'Name must be at least 3 characters.';
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!emailPattern.test(email)) {
      errors.email = 'Enter a valid email.';
    }

    if (phone) {
      const phonePattern = /^(010|011|012|015)[0-9]{8}$/;
      if (!phonePattern.test(phone)) {
        errors.phone = 'Phone must start with 010, 011, 012, or 015 and be 11 digits.';
      }
    }

    if (updateErrors) {
      this.formErrors = errors;
    }

    return !errors.name && !errors.email && !errors.phone;
  }
}
