import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
})
export class About {
  private readonly themeService = inject(ThemeService);

  readonly stats = [
    { label: 'Academies launched', value: '320+' },
    { label: 'Students served', value: '18k+' },
    { label: 'Support satisfaction', value: '97%' },
  ];

  readonly values = [
    {
      title: 'Built by educators',
      copy: 'SAMS was started by teachers who wanted calmer admin work. Every feature is designed with real classroom rhythms in mind.',
      accent: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Automation first',
      copy: 'Attendance nudges, credential emails, and reminders run automatically so you can focus on students, not spreadsheets.',
      accent: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Privacy by default',
      copy: 'Each academy is fully isolated. Your data stays yours—no noisy sharing, no hidden access.',
      accent: 'from-amber-500 to-orange-500'
    },
  ];

  readonly milestones = [
    {
      year: '2021',
      headline: 'Prototype in classrooms',
      detail: 'We tested SAMS in three community centers to replace paper attendance and WhatsApp threads.'
    },
    {
      year: '2022',
      headline: 'Automated onboarding',
      detail: 'Credential delivery and parent updates shipped, cutting setup time to minutes.'
    },
    {
      year: '2023',
      headline: 'AI student insights',
      detail: 'Students began asking SAMS about grades, attendance, and study tips—freeing up teachers for deeper feedback.'
    },
    {
      year: 'Today',
      headline: 'Growing with calm',
      detail: 'Hundreds of academies across the region run daily operations on SAMS with predictable, transparent workflows.'
    },
  ];

  readonly team = [
    {
      name: 'Salma Fares',
      role: 'Co-founder & Educator-in-Chief',
      bio: 'Former school leader who wanted better visibility for teachers and parents.',
    },
    {
      name: 'Omar Nassar',
      role: 'Co-founder & Product',
      bio: 'Built SAMS to automate the boring parts of academy management without losing the human touch.',
    }
  ];

  readonly differentiators = [
    'Launch-ready in under five minutes',
    'Parent and student updates on autopilot',
    'Transparent dashboards for every role',
    'Human support that actually answers',
  ];

  get isDark(): boolean {
    return this.themeService.darkMode();
  }
}
