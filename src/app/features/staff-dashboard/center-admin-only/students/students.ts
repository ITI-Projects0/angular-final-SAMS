import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';
import { FeedbackService } from '../../../../core/services/feedback.service';

@Component({
  selector: 'app-staff-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class Students implements OnInit {
  constructor(
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) { }

  students: any[] = [];
  loading = false;
  searchTerm = '';
  panelOpen = false;
  selectedStudent: any = null;
  panelMode: 'info' | 'create-student' | 'create-parent' | 'edit-student' = 'info';
  studentForm = { name: '', email: '', phone: '', groupId: '' };
  parentForm = { name: '', email: '', phone: '', studentId: '' };
  studentErrors = { name: '', email: '', phone: '', groupId: '' };
  parentErrors = { name: '', email: '', phone: '', studentId: '' };
  processing = false;
  saveError = '';
  page = 1;
  perPage = 6;
  totalPages = 1;
  totalItems = 0;
  private roles: string[] = [];
  availableGroups: any[] = [];
  centerGroupsUnavailable = false;
  groupFilter = '';
  studentFilter = '';

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.loadStudents();
    this.loadGroupsForForms();
  }

  get isCenterAdmin(): boolean {
    return this.roles.includes('center_admin');
  }

  private loadStudents(): void {
    this.loading = true;

    if (this.isCenterAdmin) {
      this.staffService.getMembers({ role: 'student', page: this.page, per_page: this.perPage, search: this.searchTerm || undefined }).subscribe({
        next: (res) => {
          const payload = res?.data ?? res;
          const collection = payload?.students ?? [];
          const items = this.unwrapCollection(collection);
          const meta = collection?.meta ?? {};
          this.perPage = meta.per_page ?? this.perPage;
          this.totalItems = meta.total ?? items.length;
          this.totalPages = meta.last_page ?? 1;
          this.page = meta.current_page ?? this.page;
          this.students = items.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            center: payload?.center?.name ?? student.center?.name ?? '',
            status: student.status ?? 'active',
            phone: student.phone ?? '',
            groups: [],
            raw: student
          }));
          this.finishLoading();
        },
        error: (err: HttpErrorResponse) => {
          if (err?.status === 404) {
            this.loadTeacherStudents();
          } else {
            this.finishLoading();
          }
        }
      });
      return;
    }

    this.loadTeacherStudents();
  }

  private loadTeacherStudents(): void {
    this.staffService.getGroups().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const groups = this.unwrapCollection(payload);

        if (!groups.length) {
          this.students = [];
          this.finishLoading();
          return;
        }

        const requests = groups.map((group: any) =>
          this.staffService.getGroupStudents(group.id)
        );

        forkJoin(requests).subscribe({
          next: (results) => {
            const aggregated = new Map<number, any>();

            results.forEach((result, index) => {
              const students = this.unwrapCollection(result);
              const group = groups[index];

              students.forEach((student: any) => {
                const groupName = group?.name ?? 'Group';
                const existing = aggregated.get(student.id);

                if (existing) {
                  if (!existing.groups.includes(groupName)) {
                    existing.groups.push(groupName);
                  }
                } else {
                  aggregated.set(student.id, {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    center: group?.center?.name ?? '',
                    status: 'active',
                    phone: student.phone ?? '',
                    groups: [groupName],
                    raw: student
                  });
                }
              });
            });

            this.students = Array.from(aggregated.values());
            this.totalItems = this.students.length;
            this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.perPage));
            this.page = Math.min(this.page, this.totalPages);
            this.finishLoading();
          },
          error: () => this.finishLoading()
        });
      },
      error: () => this.finishLoading()
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

  get filteredStudents(): any[] {
    if (this.isCenterAdmin) {
      // Backend handles search/pagination for center admins
      return this.students;
    }
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) {
      return this.students;
    }

    return this.students.filter((student) =>
      [student.name, student.email, student.center, student.status, (student.groups ?? []).join(', ')]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }

  get paginatedStudents(): any[] {
    // Center admin receives paginated data from backend; show as-is
    if (this.isCenterAdmin) {
      return this.filteredStudents;
    }
    const start = (this.page - 1) * this.perPage;
    return this.filteredStudents.slice(start, start + this.perPage);
  }

  get pageStart(): number {
    if (!this.totalItems) return 0;
    return (this.page - 1) * this.perPage + 1;
  }

  get pageEnd(): number {
    if (!this.totalItems) return 0;
    return Math.min(this.page * this.perPage, this.totalItems);
  }

  openInfo(student: any): void {
    this.selectedStudent = student;
    this.panelMode = 'info';
    this.panelOpen = true;
  }

  closeInfo(): void {
    this.panelOpen = false;
    this.selectedStudent = null;
    this.panelMode = 'info';
    this.studentErrors = { name: '', email: '', phone: '', groupId: '' };
    this.parentErrors = { name: '', email: '', phone: '', studentId: '' };
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
    if (this.isCenterAdmin) {
      this.loadStudents();
    } else {
      this.totalItems = this.filteredStudents.length;
      this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.perPage));
      this.cdr.detectChanges();
    }
  }

  goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages) return;
    this.page = nextPage;
    this.loadStudents();
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (typeof err?.error === 'string') return err.error;
    const errorsObj = err?.error?.errors;
    if (typeof errorsObj === 'string') return errorsObj;
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
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    return fallback;
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }

  get canAddMembers(): boolean {
    return (
      this.isCenterAdmin ||
      this.roles.some((role) => role === 'teacher' || role === 'assistant')
    );
  }

  get canEditStudents(): boolean {
    return this.isCenterAdmin;
  }

  get panelTitle(): string {
    switch (this.panelMode) {
      case 'create-student':
        return 'Add Student';
      case 'create-parent':
        return 'Add Parent';
      case 'edit-student':
        return `Edit ${this.selectedStudent?.name ?? 'Student'}`;
      default:
        return 'Student info';
    }
  }

  get filteredGroupsForSelect(): any[] {
    const q = this.groupFilter.trim().toLowerCase();
    if (!q) return this.availableGroups;
    return this.availableGroups.filter((g) =>
      [g.name, g.subject].filter(Boolean).some((val: string) => val.toLowerCase().includes(q))
    );
  }

  get filteredStudentsForSelect(): any[] {
    const q = this.studentFilter.trim().toLowerCase();
    if (!q) return this.students;
    return this.students.filter((s) =>
      [s.name, s.email, s.center].filter(Boolean).some((val: string) => val.toLowerCase().includes(q))
    );
  }

  private loadGroupsForForms(): void {
    const source$ =
      this.isCenterAdmin && !this.centerGroupsUnavailable
        ? this.staffService.getCenterGroups()
        : this.staffService.getGroups();

    source$.subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.availableGroups = items.map((g: any) => ({
          id: g.id,
          name: g.name ?? 'Group',
          subject: g.subject ?? ''
        }));
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err?.status === 404) {
          this.centerGroupsUnavailable = true;
        }
      }
    });
  }

  openCreateStudent(): void {
    this.groupFilter = '';
    this.studentForm = { name: '', email: '', phone: '', groupId: this.filteredGroupsForSelect[0]?.id ?? '' };
    this.studentErrors = { name: '', email: '', phone: '', groupId: '' };
    this.panelMode = 'create-student';
    this.panelOpen = true;
  }

  openCreateParent(): void {
    this.studentFilter = '';
    this.parentForm = { name: '', email: '', phone: '', studentId: this.filteredStudentsForSelect[0]?.id ?? '' };
    this.parentErrors = { name: '', email: '', phone: '', studentId: '' };
    this.panelMode = 'create-parent';
    this.panelOpen = true;
  }

  openEditStudent(student: any): void {
    if (!this.isCenterAdmin) return;
    this.selectedStudent = student;
    this.studentForm = {
      name: student.name,
      email: student.email,
      phone: student.phone ?? '',
      groupId: ''
    };
    this.studentErrors = { name: '', email: '', phone: '', groupId: '' };
    this.panelMode = 'edit-student';
    this.panelOpen = true;
  }

  submitStudent(): void {
    if (this.processing) {
      return;
    }
    if (!this.validateStudentForm()) {
      this.cdr.detectChanges();
      return;
    }
    this.saveError = '';
    const payload: any = {
      name: this.studentForm.name.trim(),
      email: this.studentForm.email.trim(),
      phone: this.studentForm.phone.trim() || null,
      role: 'student',
      group_id: this.studentForm.groupId
    };
    this.processing = true;
    const request$ =
      this.panelMode === 'edit-student' && this.selectedStudent
        ? this.staffService.updateManagementUser(this.selectedStudent.id, {
          name: this.studentForm.name,
          email: this.studentForm.email,
          phone: this.studentForm.phone.trim() || null
        })
        : this.isCenterAdmin
          ? this.staffService.createManagementUser(payload)
          : this.staffService.createTeacherManagedUser(payload);

    request$.subscribe({
      next: () => {
        this.closeInfo();
        this.loadStudents();
        this.feedback.showToast({
          title: this.panelMode === 'edit-student' ? 'Student updated' : 'Student created',
          message: `${this.studentForm.name} saved successfully.`,
          tone: 'success'
        });
      },
      error: (err) => {
        this.processing = false;
        this.closeInfo();
        this.saveError = this.extractErrorMessage(err, 'Unable to save student.');
        this.feedback.showToast({
          title: 'Save failed',
          message: this.saveError,
          tone: 'error'
        });
        this.cdr.detectChanges();
      },
      complete: () => {
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitParent(): void {
    if (this.processing) {
      return;
    }
    if (!this.validateParentForm()) {
      this.cdr.detectChanges();
      return;
    }
    this.saveError = '';
    const payload = {
      name: this.parentForm.name.trim(),
      email: this.parentForm.email.trim(),
      phone: this.parentForm.phone.trim() || null,
      role: 'parent',
      student_id: this.parentForm.studentId
    };
    this.processing = true;
    const request$ = this.isCenterAdmin
      ? this.staffService.createManagementUser(payload)
      : this.staffService.createTeacherManagedUser(payload);
    request$.subscribe({
      next: () => {
        this.closeInfo();
        this.feedback.showToast({
          title: 'Parent created',
          message: `${this.parentForm.name} added successfully.`,
          tone: 'success'
        });
      },
      error: (err) => {
        this.processing = false;
        this.closeInfo();
        this.saveError = this.extractErrorMessage(err, 'Unable to save parent.');
        this.feedback.showToast({
          title: 'Save failed',
          message: this.saveError,
          tone: 'error'
        });
        this.cdr.detectChanges();
      },
      complete: () => {
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteStudent(): void {
    if (!this.isCenterAdmin || !this.selectedStudent || this.processing) {
      return;
    }
    const target = this.selectedStudent;
    this.closeInfo();
    this.feedback.openModal({
      icon: 'warning',
      title: 'Delete student?',
      message: `This will remove ${target.name}.`,
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.feedback.closeModal();
        if (!target) return;
        // target remains available even after closing the panel
        this.closeInfo();
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
              this.loadStudents();
              this.feedback.showToast({
                title: 'Student deleted',
                message: `${target.name} has been removed.`,
                tone: 'success'
              });
            },
            error: (err) => {
              this.saveError = this.extractErrorMessage(err, 'Unable to delete student.');
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

  onStudentInputChange(): void {
    this.validateStudentForm();
  }

  onParentInputChange(): void {
    this.validateParentForm();
  }

  get canSubmitStudent(): boolean {
    return this.validateStudentForm(false);
  }

  get canSubmitParent(): boolean {
    return this.validateParentForm(false);
  }

  private validateStudentForm(updateErrors: boolean = true): boolean {
    const errors = { name: '', email: '', phone: '', groupId: '' };
    const name = this.studentForm.name?.trim() ?? '';
    const email = this.studentForm.email?.trim() ?? '';
    const phone = this.studentForm.phone?.trim() ?? '';
    const groupId = this.studentForm.groupId;

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

    if (this.panelMode === 'create-student' && !groupId) {
      errors.groupId = 'Group is required.';
    }

    if (updateErrors) {
      this.studentErrors = errors;
    }

    return !errors.name && !errors.email && !errors.phone && !errors.groupId;
  }

  private validateParentForm(updateErrors: boolean = true): boolean {
    const errors = { name: '', email: '', phone: '', studentId: '' };
    const name = this.parentForm.name?.trim() ?? '';
    const email = this.parentForm.email?.trim() ?? '';
    const phone = this.parentForm.phone?.trim() ?? '';
    const studentId = this.parentForm.studentId;

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

    if (!studentId) {
      errors.studentId = 'Linked student is required.';
    }

    if (updateErrors) {
      this.parentErrors = errors;
    }

    return !errors.name && !errors.email && !errors.phone && !errors.studentId;
  }
}
