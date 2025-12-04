import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
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
export class AdminLayout implements OnInit {
  isSidebarCollapsed = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

  constructor(public theme: ThemeService) {
    this.theme.init();
  }

  ngOnInit(): void {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window === 'undefined') return;
    this.isSidebarCollapsed = window.innerWidth < 1024;
  }
}
