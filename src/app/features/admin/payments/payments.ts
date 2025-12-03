import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments {
  filter: 'all' | 'paid' | 'unpaid' = 'all';

  centers = [
    { name: 'Skyline Learning', city: 'Cairo', phone: '+20 123 456 7890', amount: 2500, paid: true },
    { name: 'Future Skills Hub', city: 'Alexandria', phone: '+20 111 222 3344', amount: 4200, paid: false },
    { name: 'Gulf Academy', city: 'Riyadh', phone: '+966 50 123 4567', amount: 3100, paid: true },
  ];

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCenter = { name: '', city: '', phone: '', amount: 0, paid: false };

  openForm(item?: typeof this.formCenter) {
    this.isFormOpen = true;
    if (item) {
      this.isEditMode = true;
      this.formCenter = { ...item };
      this.currentIndex = this.centers.indexOf(item);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formCenter = { name: '', city: '', phone: '', amount: 0, paid: false };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      this.centers[this.currentIndex] = { ...this.formCenter };
    } else {
      this.centers = [...this.centers, { ...this.formCenter }];
    }
    this.closeForm();
  }

  delete(item: typeof this.formCenter) {
    this.centers = this.centers.filter(c => c !== item);
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
