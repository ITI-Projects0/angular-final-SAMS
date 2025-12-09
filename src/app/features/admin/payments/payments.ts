import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments implements OnInit {
  filter: 'all' | 'paid' | 'unpaid' = 'all';

  centers = [
    { name: 'Skyline Learning', city: 'Cairo', phone: '+20 123 456 7890', amount: 2500, paid: true },
    { name: 'Future Skills Hub', city: 'Alexandria', phone: '+20 111 222 3344', amount: 4200, paid: false },
    { name: 'Gulf Academy', city: 'Riyadh', phone: '+966 50 123 4567', amount: 3100, paid: true },
    { name: 'Nile Tech Center', city: 'Giza', phone: '+20 100 987 6543', amount: 1800, paid: true },
    { name: 'Red Sea Institute', city: 'Hurghada', phone: '+20 122 333 4444', amount: 3500, paid: false },
    { name: 'Delta Knowledge', city: 'Mansoura', phone: '+20 101 111 2222', amount: 2200, paid: true },
    { name: 'Upper Egypt Academy', city: 'Assiut', phone: '+20 114 555 6666', amount: 2900, paid: false },
    { name: 'Canal Training', city: 'Suez', phone: '+20 106 777 8888', amount: 4000, paid: true },
    { name: 'Sinai Future', city: 'Sharm El Sheikh', phone: '+20 109 999 0000', amount: 5000, paid: false },
    { name: 'Oasis Learning', city: 'Fayoum', phone: '+20 112 222 3333', amount: 1500, paid: true },
    { name: 'Luxor Skills', city: 'Luxor', phone: '+20 105 444 5555', amount: 3200, paid: false },
    { name: 'Aswan Tech', city: 'Aswan', phone: '+20 111 888 9999', amount: 2700, paid: true },
  ];

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCenter = { name: '', city: '', phone: '', amount: 0, paid: false };

  // Pagination
  page = 1;
  perPage = 10;

  ngOnInit() {
    // Simulate data loading
  }

  get filteredCenters() {
    return this.centers.filter(c =>
      this.filter === 'all' ||
      (this.filter === 'paid' && c.paid) ||
      (this.filter === 'unpaid' && !c.paid)
    );
  }

  get paginatedCenters() {
    const start = (this.page - 1) * this.perPage;
    return this.filteredCenters.slice(start, start + this.perPage);
  }

  get total() {
    return this.filteredCenters.length;
  }

  get lastPage() {
    return Math.ceil(this.total / this.perPage) || 1;
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.rangeStart + this.paginatedCenters.length - 1, this.total);
  }

  changePage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
  }

  changePerPage(value: number) {
    this.perPage = value;
    this.page = 1;
  }

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
    // Adjust page if current page becomes empty
    if (this.page > this.lastPage) {
      this.page = Math.max(1, this.lastPage);
    }
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
