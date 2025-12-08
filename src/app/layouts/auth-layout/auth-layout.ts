import { Component, signal, OnInit, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
  ],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  encapsulation: ViewEncapsulation.None,
})
export class AuthLayout implements OnInit {
  isDark = signal<boolean>(false);
  currentRoute = signal<string>('');

  // Computed justify class based on current route
  justifyClass = computed(() => {
    const route = this.currentRoute();
    if (route.includes('login')) {
      return 'justify-end';
    } else if (route.includes('register')) {
      return 'justify-start';
    } else {
      return 'justify-center';
    }
  });

  constructor(private router: Router) { }

  ngOnInit() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDark.set(true);
      document.documentElement.classList.add('dark');
    }

    // Set initial route
    this.currentRoute.set(this.router.url);

    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.urlAfterRedirects);
    });
  }

  toggleDarkMode() {
    this.isDark.update((v) => !v);
    const html = document.documentElement;
    if (this.isDark()) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}