import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.css',
})
export class AdminNav {
  dropdown = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public theme: ThemeService) {}
}
