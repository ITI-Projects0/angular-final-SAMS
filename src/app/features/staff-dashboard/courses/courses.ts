import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TeacherService } from '../../../core/services/teacher.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { FeedbackService } from '../../../core/services/feedback.service';

interface StaffGroupRow {
  id: number;
  title: string;
  subject: string;
  center: string;
  teacher: string;
  status: 'Active' | 'Inactive';
  schedule?: string;
  studentsCount?: number;
  raw: any;
}

@Component({
  selector: 'app-staff-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class StaffGroups implements OnInit {
  constructor(
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) { }

  loading = false;
  searchTerm = '';
  panelOpen = false;
  panelMode: 'info' | 'create' | 'edit' = 'info';
  selectedGroup: StaffGroupRow | null = null;
  groups: StaffGroupRow[] = [];
  processing = false;
  saveError = '';
  groupForm = {
    name: '',
    subject: '',
    description: '',
    scheduleDays: ['Monday', 'Wednesday'] as string[],
    schedule_time: '16:00',
    sessions_count: 8
  };
  readonly dayOptions = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  private roles: string[] = [];
  private centerAccessUnavailable = false;

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.loadGroups();
  }

  get isCenterAdmin(): boolean {
    return this.roles.includes('center_admin');
  }

  get canCreateGroup(): boolean {
    return this.roles.some((role) => role === 'teacher' || role === 'assistant' || role === 'center_admin');
  }

  private loadGroups(): void {
    this.loading = true;

    if (this.isCenterAdmin && !this.centerAccessUnavailable) {
      this.staffService.getCenterGroups().subscribe({
        next: (res) => {
          this.groups = this.mapGroups(res);
          this.finishLoading();
        },
        error: (error: HttpErrorResponse) => {
          if (error?.status === 404) {
            this.centerAccessUnavailable = true;
            this.loadTeacherGroups();
          } else {
            this.finishLoading();
          }
        }
      });
      return;
    }

    this.loadTeacherGroups();
  }

  private loadTeacherGroups(): void {
    this.staffService.getGroups().subscribe({
      next: (res) => {
        this.groups = this.mapGroups(res);
        this.finishLoading();
      },
      error: () => this.finishLoading()
    });
  }

  private mapGroups(response: any): StaffGroupRow[] {
    const payload = response?.data ?? response ?? [];
    const items = payload?.data ?? payload ?? [];

    return items.map((g: any) => ({
      id: g.id,
      title: g.name,
      subject: g.subject ?? 'General',
      center: g.center?.name ?? '-',
      teacher: g.teacher?.name ?? '-',
      status: g.is_active ? 'Active' : 'Inactive',
      schedule: this.formatSchedule(g),
      studentsCount: g.students_count ?? g.students?.length ?? undefined,
      raw: g
    }));
  }

  private formatSchedule(group: any): string {
    if (!group?.schedule_days || !group?.schedule_time) {
      return 'Flexible schedule';
    }

    const days = Array.isArray(group.schedule_days)
      ? group.schedule_days.join(', ')
      : group.schedule_days;
    return `${days} @ ${group.schedule_time}`;
  }

  get filteredGroups(): StaffGroupRow[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) {
      return this.groups;
    }

    return this.groups.filter((group) =>
      [group.title, group.subject, group.teacher, group.center]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }

  openInfo(group: StaffGroupRow): void {
    this.selectedGroup = group;
    this.panelMode = 'info';
    this.panelOpen = true;
  }

  closeInfo(): void {
    this.panelOpen = false;
    this.selectedGroup = null;
    this.panelMode = 'info';
    this.processing = false;
  }

  openCreate(): void {
    if (!this.canCreateGroup) return;
    this.groupForm = {
      name: '',
      subject: '',
      description: '',
      scheduleDays: ['Monday', 'Wednesday'],
      schedule_time: '16:00',
      sessions_count: 8
    };
    this.panelMode = 'create';
    this.panelOpen = true;
  }

  openEdit(group?: StaffGroupRow): void {
    if (!this.canCreateGroup) return;
    const target = group ?? this.selectedGroup;
    if (!target) return;
    const raw = target.raw ?? {};
    const scheduleDays = Array.isArray(raw.schedule_days)
      ? raw.schedule_days
      : typeof raw.schedule_days === 'string'
        ? raw.schedule_days.split(',').map((d: string) => d.trim()).filter(Boolean)
        : [];

    this.groupForm = {
      name: raw.name ?? target.title ?? '',
      subject: raw.subject ?? target.subject ?? '',
      description: raw.description ?? '',
      scheduleDays: scheduleDays.length ? scheduleDays : ['Monday', 'Wednesday'],
      schedule_time: raw.schedule_time ?? '16:00',
      sessions_count: raw.sessions_count ?? 8
    };
    this.selectedGroup = target;
    this.panelMode = 'edit';
    this.panelOpen = true;
  }

  toggleScheduleDay(day: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.groupForm.scheduleDays.includes(day)) {
        this.groupForm.scheduleDays.push(day);
      }
    } else {
      this.groupForm.scheduleDays = this.groupForm.scheduleDays.filter((d) => d !== day);
    }
  }

  submitGroup(): void {
    if (!this.canCreateGroup || this.processing || !this.groupForm.name || !this.groupForm.subject) {
      return;
    }

    // Only validate schedule days for create mode
    if (this.panelMode === 'create' && !this.groupForm.scheduleDays.length) {
      return;
    }

    this.processing = true;
    this.saveError = '';
    const user = this.tokenStorage.getUser() as any;
    const centerId = this.selectedGroup?.raw?.center_id ?? user?.center_id ?? user?.center?.id ?? null;
    const teacherId = this.selectedGroup?.raw?.teacher_id ?? user?.id ?? null;

    // Base payload
    let payload: any = {
      name: this.groupForm.name,
      subject: this.groupForm.subject,
      description: this.groupForm.description
    };

    if (this.panelMode === 'create') {
      const scheduleDays = (this.groupForm.scheduleDays || []).map((d) => (d || '').toString().trim()).filter(Boolean);
      const sessionsCount = Number(this.groupForm.sessions_count) || 0;
      const scheduleTime = this.groupForm.schedule_time || null;

      payload = {
        ...payload,
        schedule_days: scheduleDays,
        schedule_time: scheduleTime,
        sessions_count: sessionsCount,
        center_id: centerId,
        teacher_id: teacherId
      };
    }

    if (!centerId || !teacherId) {
      this.processing = false;
      this.saveError = !centerId
        ? 'Center id is required to save the group.'
        : 'Teacher id is required to save the group.';
      return;
    }

    const request$ =
      this.panelMode === 'edit' && this.selectedGroup
        ? this.staffService.updateGroup(this.selectedGroup.id, payload)
        : this.staffService.createGroup(payload);

    request$.subscribe({
      next: () => {
        this.closeInfo();
        this.loadGroups();
        this.feedback.showToast({
          title: this.panelMode === 'edit' ? 'Group updated' : 'Group created',
          message: `${payload.name} saved successfully.`,
          tone: 'success'
        });
      },
      error: (err) => {
        this.processing = false;
        const backendMessage =
          err?.error?.message ||
          (err?.error?.errors && Object.values(err.error.errors).flat().join(' ')) ||
          err?.message;
        this.saveError = backendMessage || 'Unable to save group. Please try again.';
        console.error('Save group failed', err);
        this.cdr.detectChanges();
      }
    });
  }

  deleteGroup(): void {
    if (!this.canCreateGroup || this.processing || !this.selectedGroup) {
      return;
    }
    const target = this.selectedGroup;
    this.feedback.openModal({
      icon: 'warning',
      title: 'Delete group?',
      message: `This will remove ${target.title}. This action cannot be undone.`,
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.processing = true;
        this.staffService.deleteGroup(target.id).subscribe({
          next: () => {
            this.closeInfo();
            this.loadGroups();
            this.feedback.showToast({
              title: 'Group deleted',
              message: `${target.title} has been removed.`,
              tone: 'success'
            });
          },
          error: (err) => {
            this.processing = false;
            const backendMessage =
              err?.error?.message ||
              (err?.error?.errors && Object.values(err.error.errors).flat().join(' ')) ||
              err?.message;
            this.saveError = backendMessage || 'Unable to delete group.';
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

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
