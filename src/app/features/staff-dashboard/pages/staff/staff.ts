import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class Staff {

  isFormOpen = false;
  isEditMode = false;
  searchText = '';

  newStaff = {
    name: '',
    role: '',
    email: '',
    img: '',
  };

  staffList = [
    {
      name: 'John Doe',
      role: 'Manager',
      email: 'john@example.com',
      img: 'https://randomuser.me/api/portraits/men/11.jpg'
    },
    {
      name: 'Sarah Smith',
      role: 'Team Leader',
      email: 'sarah@example.com',
      img: 'https://randomuser.me/api/portraits/women/50.jpg'
    },
    {
      name: 'Michael Brown',
      role: 'Developer',
      email: 'michael@example.com',
      img: 'https://randomuser.me/api/portraits/men/34.jpg'
    }
  ];

  filteredList = [...this.staffList];

  openForm(editData?: any) {
    this.isFormOpen = true;

    if (editData) {
      this.isEditMode = true;
      this.newStaff = { ...editData };
    } else {
      this.isEditMode = false;
      this.newStaff = { name: '', role: '', email: '', img: '' };
    }
  }

  closeForm() {
    this.isFormOpen = false;
  }

  saveStaff() {
    if (this.isEditMode) {
      const index = this.staffList.findIndex(s => s.email === this.newStaff.email);
      if (index !== -1) this.staffList[index] = { ...this.newStaff };
    } else {
      this.newStaff.img = 'https://via.placeholder.com/150';
      this.staffList.push({ ...this.newStaff });
    }
    this.filteredList = [...this.staffList];
    this.closeForm();
  }

  deleteStaff(email: string) {
    this.staffList = this.staffList.filter(s => s.email !== email);
    this.filteredList = [...this.staffList];
  }

  search() {
    this.filteredList = this.staffList.filter(s =>
      s.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      s.role.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
