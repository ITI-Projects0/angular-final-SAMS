import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentService } from '../../../core/services/parent.service';

@Component({
  selector: 'app-parent-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ParentProfile {
  private parentService = inject(ParentService);
  
  isEditMode = false;
  
  // Mock profile data - will come from API
  profile = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 234 567 890',
    address: '123 Main Street, City, State 12345',
    emergencyContact: '+1 987 654 321'
  };

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveProfile() {
    console.log('Saving profile:', this.profile);
    // Will call API: this.parentService.updateProfile(this.profile).subscribe(...)
    this.isEditMode = false;
  }

  cancelEdit() {
    this.isEditMode = false;
    // Reset to original values
  }
}
