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
      name: 'Bassel Essam',
      role: 'Developer',
      bio: 'A versatile developer proficient in frontend and backend technologies, actively contributing to open-source projects and continuously expanding technical skillsets to deliver robust web solutions.',
      image: 'assets/team/photo.png',
    },
    {
      name: 'Ahmed Alaa',
      role: 'Developer',
      bio: 'A proactive developer committed to delivering scalable and maintainable solutions. Collaborates effectively across teams, embraces new technologies, and balances innovation with reliability in every project..',
      image: 'assets/team/photo.png',
    },
    {
      name: 'Abdulrahman Abas',
      role: 'Developer',
      bio: 'Tech enthusiast with expertise in AI, Networking, and Full-Stack Web Development. Strong ability to work effectively in a team environment while building scalable web applications and integrating AI solutions to solve real-world problems.',
      image: 'assets/team/photo.png',
    },
    {
      name: 'Aballah Elsaied',
      role: 'Developer',
      bio: 'works closely with designers, front-end developers, and project managers to bring our eCommerce vision to life. They write clean, efficient PHP code, connect databases, and ensure everything runs seamlessly behind the scenes.',
      image: 'assets/team/photo.png',
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
