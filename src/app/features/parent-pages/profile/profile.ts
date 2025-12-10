import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentService } from '../../../core/services/parent.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';

type Profile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  emergencyContact?: string;
  roles?: string[];
};

@Component({
  selector: 'app-parent-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ParentProfile implements OnInit {
  private parentService = inject(ParentService);
  private cdr = inject(ChangeDetectorRef);
  private feedback = inject(FeedbackService);
  private tokenService = inject(TokenStorageService);

  isEditMode = signal(true);
  loading = signal(false);
  saving = signal(false);
  passwordSaving = signal(false);
  error = signal('');
  success = signal('');
  passwordError = signal('');
  passwordSuccess = signal('');

  profile = signal<Profile | null>(null);
  initialProfile = signal<Profile | null>(null);
  avatarFile = signal<File | null>(null);
  passwordForm = signal({
    current: '',
    password: '',
    confirm: ''
  });

  ngOnInit(): void {
    this.loadProfile();
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
      avatar: user.avatar ?? '',
      address: user.address ?? raw.address ?? '',
      emergencyContact: user.emergency_contact ?? user.emergencyContact ?? '',
      roles
    };
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set('');
    this.parentService.getProfile().subscribe({
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

  toggleEditMode() {
    if (!this.profile()) return;
    this.success.set('');
    this.error.set('');
    this.isEditMode.set(!this.isEditMode());
  }

  saveProfile() {
  const current = this.profile();
  if (!current) return;

  this.saving.set(true);
  this.error.set('');
  this.success.set('');

    this.parentService.updateProfile({
      name: current.name,
      phone: current.phone,
      avatarFile: this.avatarFile()   // 👈 شيل avatar: current.avatar
    }).subscribe({
      next: () => {
      this.isEditMode.set(false);
      this.saving.set(false);
      this.success.set('Profile updated.');
      this.toast('Profile updated', 'success');
      this.avatarFile.set(null);
      this.loadProfile(); // ترجع تقرأ avatar الجديد من السيرفر
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

  cancelEdit() {
    this.isEditMode.set(false);
    this.success.set('');
    this.error.set('');
    this.avatarFile.set(null);
    if (this.initialProfile()) {
      this.profile.set({ ...this.initialProfile()! });
    }
  }

  changePassword() {
    this.passwordError.set('');
    this.passwordSuccess.set('');
    const pwd = this.passwordForm();
    if (!pwd.current || !pwd.password || !pwd.confirm) {
      this.passwordError.set('Please fill in all password fields.');
      return;
    }
    if (pwd.password !== pwd.confirm) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    this.passwordSaving.set(true);
    this.parentService.updatePassword({
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
      error: () => {
        this.passwordSaving.set(false);
        this.passwordError.set('Could not update password. Check your current password and try again.');
        this.toast('Could not update password', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  updateProfileField(field: keyof Profile, value: string): void {
    this.profile.update((p) => (p ? { ...p, [field]: value } : p));
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
}
