import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts {
  constructor() {}
  contacts = [
    { name: 'Mohamed Adel', email: 'mohamed@example.com', phone: '+20 123 456 7890', role: 'Teacher' },
    { name: 'Mona El-Sayed', email: 'mona@example.com', phone: '+20 112 223 3344', role: 'Student' },
    { name: 'Ayman Saleh', email: 'ayman@example.com', phone: '+966 55 000 0111', role: 'Center Admin' },
  ];

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formContact = { name: '', email: '', phone: '', role: '' };

  openForm(contact?: typeof this.formContact) {
    this.isFormOpen = true;
    if (contact) {
      this.isEditMode = true;
      this.formContact = { ...contact };
      this.currentIndex = this.contacts.indexOf(contact);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formContact = { name: '', email: '', phone: '', role: '' };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      this.contacts[this.currentIndex] = { ...this.formContact };
    } else {
      this.contacts = [...this.contacts, { ...this.formContact }];
    }
    this.closeForm();
  }

  delete(contact: typeof this.formContact) {
    this.contacts = this.contacts.filter(c => c !== contact);
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
