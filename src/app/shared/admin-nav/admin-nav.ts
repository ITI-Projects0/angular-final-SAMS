import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-admin-nav',
  imports: [],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.css',
})
export class AdminNav {
  dropdown = false;
  @Output() toggleSidebar = new EventEmitter<void>();
}
