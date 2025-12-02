import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentService } from '../../../core/services/parent.service';

@Component({
  selector: 'app-parent-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class ParentAttendance {
  private parentService = inject(ParentService);

  children$ = this.parentService.getChildren();

  selectedChildId: number | null = null;
  selectedDate: string = '';
  selectedSubject: string = '';

  // Mock subjects for filter
  subjects = ['Mathematics', 'Science', 'History', 'English'];

  // This would ideally be a filtered observable based on the inputs
  attendance$ = this.parentService.getChildAttendance(101);

  onFilterChange() {
    console.log('Filters changed:', this.selectedChildId, this.selectedDate, this.selectedSubject);
    // Here you would call the service with new filter params
    // this.attendance$ = this.parentService.getAttendance(this.selectedChildId, this.selectedDate, this.selectedSubject);
  }
}
