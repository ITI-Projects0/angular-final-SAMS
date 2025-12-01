import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ParentService } from '../../../core/services/parent.service';

@Component({
    selector: 'app-child-class-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './child-class-details.html',
    styleUrl: './child-class-details.css'
})
export class ChildClassDetails {
    private route = inject(ActivatedRoute);
    private parentService = inject(ParentService);

    childId = this.route.snapshot.paramMap.get('childId');
    classId = this.route.snapshot.paramMap.get('classId');

    // Mock data - will come from API
    classDetails$ = this.parentService.getChildClassDetails(Number(this.childId), Number(this.classId));

    getCalendarDays() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const classSchedule = ['Monday', 'Wednesday', 'Friday'];

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);

            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
            const hasClass = currentDate.getMonth() === month && classSchedule.includes(dayName);

            days.push({
                date: currentDate.toISOString(),
                dayNumber: currentDate.getDate(),
                isCurrentMonth: currentDate.getMonth() === month,
                hasClass: hasClass,
                classTime: hasClass ? '09:00 AM' : '',
                location: hasClass ? 'Room 101' : ''
            });
        }

        return days;
    }
}
