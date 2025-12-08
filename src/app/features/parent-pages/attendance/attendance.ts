import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentService } from '../../../core/services/parent.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-parent-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class ParentAttendance implements OnInit {
  private parentService = inject(ParentService);

  children$ = this.parentService.getChildren().pipe(
    tap((children) => {
      if (!this.selectedChildId && children.length) {
        this.selectedChildId = children[0].id;
        this.loadAttendance();
      }
    })
  );

  selectedChildId: number | null = null;
  selectedDate: string = '';
  selectedSubject: string = '';

  // Mock subjects for filter
  subjects = ['Mathematics', 'Science', 'History', 'English'];

  attendance$ = this.parentService.getAttendance();

  ngOnInit(): void {
    this.loadAttendance();
  }

  onFilterChange() {
    this.loadAttendance();
  }

  private loadAttendance() {
    this.attendance$ = this.parentService.getAttendance({
      childId: this.selectedChildId || undefined,
      date: this.selectedDate || undefined,
      subject: this.selectedSubject || undefined
    });
  }
}
