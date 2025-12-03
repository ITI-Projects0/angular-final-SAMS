import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from "../../shared/admin-sidebar/admin-sidebar";
import { AdminNav } from "../../shared/admin-nav/admin-nav";
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AdminSidebar, AdminNav, RouterModule, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  isSidebarCollapsed = false;
  constructor(public theme: ThemeService) {
    this.theme.init();
  }
}
