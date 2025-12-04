import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { map, shareReplay, tap } from 'rxjs';
import { LoaderComponent } from '../../../shared/loader/loader';

@Component({
    selector: 'app-student-class-details',
    standalone: true,
    imports: [CommonModule, RouterModule, LoaderComponent],
    templateUrl: './class-details.html',
    styleUrl: './class-details.css'
})
export class StudentClassDetails {
    private route = inject(ActivatedRoute);
    private studentService = inject(StudentService);

    classId = this.route.snapshot.paramMap.get('id');
    classDetails$ = this.studentService.getClassDetails(Number(this.classId)).pipe(
        tap((res) => console.log('Class details', res)),
        map(res => res?.data ?? res ?? {}),
        shareReplay(1)
    );

    course$ = this.classDetails$.pipe(map(group => group.course ?? group));
    nextClass$ = this.classDetails$.pipe(map(group => group.next_class ?? null));
    schedule$ = this.classDetails$.pipe(map(group => group.monthly_schedule ?? []));
    lessons$ = this.classDetails$.pipe(map(group => group.lessons ?? group.upcoming_lessons ?? []));
    assignments$ = this.classDetails$.pipe(map(group => group.assignments ?? []));

    calendarDays$ = this.schedule$.pipe(
        map(list => this.buildCalendar(list ?? []))
    );

    private buildCalendar(schedule: any[]) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const start = new Date(firstDay);
        start.setDate(start.getDate() - firstDay.getDay());

        const days = [];
        for (let i = 0; i < 42; i++) {
            const current = new Date(start);
            current.setDate(start.getDate() + i);
            const dayKey = this.formatDateKey(current);
            const match = schedule.find((item: any) => {
                const raw = item.scheduled_at || item.scheduledAt || '';
                const dateStr = this.parseDateKey(raw);
                return dateStr === dayKey;
            });
            days.push({
                date: current.toISOString(),
                dayNumber: current.getDate(),
                isCurrentMonth: current.getMonth() === month,
                hasClass: !!match,
                title: match?.title,
                time: match ? this.formatTime(match.scheduled_at || match.scheduledAt) : ''
            });
        }
        return days;
    }

    private formatDateKey(date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    private parseDateKey(raw: string) {
        if (!raw) return '';
        const normalized = raw.replace(' ', 'T');
        const dt = new Date(normalized);
        if (isNaN(dt.getTime())) return raw.slice(0, 10);
        return this.formatDateKey(dt);
    }

    private formatTime(raw: string) {
        if (!raw) return '';
        const dt = new Date(raw.replace(' ', 'T'));
        if (isNaN(dt.getTime())) return '';
        return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
