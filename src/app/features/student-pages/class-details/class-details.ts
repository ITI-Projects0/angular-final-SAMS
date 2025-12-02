import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-student-class-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './class-details.html',
    styleUrl: './class-details.css'
})
export class StudentClassDetails {
    private route = inject(ActivatedRoute);
    private studentService = inject(StudentService);

    classId = this.route.snapshot.paramMap.get('id');
    classDetails$ = this.studentService.getClassDetails(Number(this.classId));
    schedule$ = this.studentService.getClassSchedule(Number(this.classId));

    getCalendarDays() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const classSchedule = ['Monday', 'Wednesday', 'Friday']; // Mock - will come from API
        
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
