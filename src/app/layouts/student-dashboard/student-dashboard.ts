import { Component, inject, OnInit } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { RouterOutlet } from '@angular/router';
import { TokenStorageService } from '../../core/auth/token-storage.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard implements OnInit {
  private readonly tokenStorage = inject(TokenStorageService);

  isSidebarCollapsed = false;

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    const roles = user?.roles || [];
    // Dashboard is role-agnostic now, no menu setup needed
  }
}
