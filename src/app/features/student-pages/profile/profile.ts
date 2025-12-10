import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { RouterLink } from '@angular/router';
import { FeedbackService } from '../../../core/services/feedback.service';

type Profile = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  studentId?: string;
  grade?: string;
  role?: string;
  avatar?: string;
};

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class StudentProfile implements OnInit {
  private tokenService = inject(TokenStorageService);
  private studentService = inject(StudentService);
  private cdr = inject(ChangeDetectorRef);
  private feedback = inject(FeedbackService);

  profile = signal<Profile | null>(null);
  initialProfile = signal<Profile | null>(null);
  loading = signal(false);
  isEditMode = signal(false);
  saving = signal(false);
  success = signal('');
  error = signal('');
  nameError = signal('');
  phoneError = signal('');
  passwordSaving = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  passwordFieldErrors = signal<{ current?: string; password?: string; confirm?: string }>({});
  avatarFile = signal<File | null>(null);
  passwordForm = signal({
    current: '',
    password: '',
    confirm: ''
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  get isParent(): boolean {
    return this.tokenService.getUser()?.roles.includes('parent') ?? false;
  }

  private mapProfile(raw: any): Profile {
    const user = raw?.user ?? raw ?? {};
    const roles = Array.isArray(user.roles)
      ? user.roles
      : typeof user.roles === 'string'
        ? [user.roles]
        : [];

    return {
      name: user.name ?? '—',
      email: user.email ?? '—',
      phone: user.phone ?? user.mobile ?? '—',
      address: user.address ?? raw.address ?? '',
      avatar: user.avatar ?? user.photo ?? '',
      studentId: user.student_id ?? user.studentId ?? user.id ?? '—',
      grade: user.grade ?? user.level ?? '—',
      role: roles.join(', ') || user.role || 'Student'
    };
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set('');
    this.studentService.getProfile().subscribe({
      next: (data) => {
        const mapped = this.mapProfile(data);
        this.profile.set(mapped);
        this.initialProfile.set({ ...mapped });
        this.syncStoredUser(data);
        this.cdr.markForCheck();
      },
      error: () => {
        this.error.set('Unable to load your profile right now.');
        this.loading.set(false);
        this.toast('Could not load profile.', 'error');
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  toggleEditMode(): void {
    if (!this.profile()) return;
    this.success.set('');
    this.error.set('');
    this.nameError.set('');
    this.phoneError.set('');
    this.passwordFieldErrors.set({});
    this.isEditMode.set(!this.isEditMode());
  }

  saveProfile(): void {
    const current = this.profile();
    if (!current) return;
    if (!this.validateProfile()) return;
    this.saving.set(true);
    this.success.set('');
    this.error.set('');
    this.nameError.set('');
    this.phoneError.set('');
    this.passwordFieldErrors.set({});

    const avatarFile = this.avatarFile();
    const payload = {
      name: current.name,
      phone: current.phone,
      avatarFile: avatarFile ?? null,
      // only send avatar string when a new file was chosen
      avatar: avatarFile ? current.avatar : undefined
    };

    this.studentService.updateProfile(payload).subscribe({
      next: () => {
        this.isEditMode.set(false);
        this.saving.set(false);
        this.success.set('Profile updated.');
        this.toast('Profile updated', 'success');
        this.loadProfile();
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Could not save changes. Please try again.');
        this.toast('Could not save changes', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.success.set('');
    this.error.set('');
    this.nameError.set('');
    this.phoneError.set('');
    this.passwordFieldErrors.set({});
    this.avatarFile.set(null);
    if (this.initialProfile()) {
      this.profile.set({ ...this.initialProfile()! });
    }
  }

  changePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.passwordFieldErrors.set({});
    const pwd = this.passwordForm();
    if (!pwd.current || !pwd.password || !pwd.confirm) {
      this.passwordError.set('Please fill in all password fields.');
      this.passwordFieldErrors.set({
        current: pwd.current ? '' : 'Current password is required.',
        password: pwd.password ? '' : 'New password is required.',
        confirm: pwd.confirm ? '' : 'Confirm password is required.'
      });
      this.toast('Please fill in all password fields.', 'error');
      return;
    }
    if (pwd.password !== pwd.confirm) {
      this.passwordError.set('New passwords do not match.');
      this.passwordFieldErrors.set({ confirm: 'New passwords do not match.' });
      this.toast('New passwords do not match.', 'error');
      return;
    }
    const pwdValue = pwd.password;
    const strong =
      pwdValue.length >= 8 &&
      /[a-z]/.test(pwdValue) &&
      /[A-Z]/.test(pwdValue) &&
      /\d/.test(pwdValue) &&
      /[^A-Za-z0-9]/.test(pwdValue);
    if (!strong) {
      this.passwordError.set('Password must be at least 8 chars with upper, lower, number, and symbol.');
      this.passwordFieldErrors.set({
        password: 'Password must be at least 8 chars with upper, lower, number, and symbol.',
        confirm: ''
      });
      this.toast('Password must be at least 8 chars with upper, lower, number, and symbol.', 'error');
      return;
    }

    this.passwordSaving.set(true);
    this.studentService.updatePassword({
      current_password: pwd.current,
      password: pwd.password,
      password_confirmation: pwd.confirm
    }).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordSuccess.set('Password updated successfully.');
        this.passwordForm.set({ current: '', password: '', confirm: '' });
        this.toast('Password updated', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.passwordSaving.set(false);
        const backendMsg = err || 'Could not update password. Check your current password and try again.';
        this.passwordError.set(backendMsg);
        this.toast(backendMsg, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  updateProfileField(field: keyof Profile, value: string): void {
    this.profile.update((p) => (p ? { ...p, [field]: value } : p));
    if (field === 'name') this.nameError.set('');
    if (field === 'phone') this.phoneError.set('');
  }

  updatePasswordField(field: 'current' | 'password' | 'confirm', value: string): void {
    this.passwordForm.update((f) => ({ ...f, [field]: value }));
  }

  handleAvatarSelected(file: File | null): void {
    this.avatarFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profile.update((p) => (p ? { ...p, avatar: reader.result as string } : p));
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' | 'warning' | 'danger') {
    this.feedback.showToast({ title: 'Profile', message, tone, timeout: 4000 });
  }

  private syncStoredUser(raw: any): void {
    const current = this.tokenService.getUser();
    if (!current) return;
    const user = raw?.user ?? raw ?? {};
    this.tokenService.updateStoredUser({
      ...current,
      name: user.name ?? current.name,
      email: user.email ?? current.email,
      phone: user.phone ?? current.phone,
      avatar: user.avatar ?? current.avatar,
      roles: Array.isArray(user.roles) ? user.roles : current.roles
    });
  }

  private validateProfile(): boolean {
    const current = this.profile();
    if (!current) return false;
    if (!current.name || current.name.trim().length < 3) {
      this.nameError.set('Name must be at least 3 characters.');
      this.toast('Name must be at least 3 characters.', 'error');
      return false;
    }
    const phone = current.phone ?? '';
    if (phone && !/^01[0125][0-9]{8}$/.test(phone)) {
      this.phoneError.set('Phone must start with 010/011/012/015 and be 11 digits.');
      this.toast('Phone must start with 010/011/012/015 and be 11 digits.', 'error');
      return false;
    }
    return true;
  }
}
