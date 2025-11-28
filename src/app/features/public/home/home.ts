import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  isDark = true;
  isMenuOpen = false;
  readonly currentYear = new Date().getFullYear();
  activeSlideIndex = 0;
  readonly slides = [
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1920&q=80',
  ];
  readonly navLinks = [
    { label: 'Home', target: '#hero' },
    { label: 'Programs', target: '#features' },
    { label: 'Stories', target: '#stories' },
    { label: 'Contact', target: '#contact' },
  ];
  readonly heroStats = [
    { value: '76', label: 'Active cohorts' },
    { value: '178', label: 'Daily check-ins' },
    { value: '505', label: 'Parents engaged' },
  ];
  readonly highlightCards = [
    {
      tag: 'Attendance',
      title: 'On-time check-ins up 11%',
      copy: 'Automated reminders reduced late arrivals across centers this week.',
    },
    {
      tag: 'Staffing',
      title: 'Balanced workloads',
      copy: 'Reassignments keep every classroom on track and fully covered.',
    },
    {
      tag: 'Groups',
      title: 'Cohort health',
      copy: 'Three flagship programs are live now with 96% engagement.',
    },
    {
      tag: 'Alerts',
      title: 'Issues resolved fast',
      copy: 'Attendance, schedule, and staffing alerts cleared before noon.',
    },
  ];
  readonly featurePillars = [
    {
      title: 'Attendance, automated',
      copy: 'One tap check-ins, instant reconciliations, and proactive nudges keep mornings calm.',
      accent: 'from-cyan-400 to-emerald-300',
    },
    {
      title: 'Staff visibility',
      copy: 'Rosters, workloads, and coverage maps give every team the context they need.',
      accent: 'from-indigo-400 to-sky-300',
    },
    {
      title: 'Groups & cohorts',
      copy: 'Parents and students see schedules while staff track progress in real-time.',
      accent: 'from-amber-300 to-rose-300',
    },
  ];
  readonly timelineSteps = [
    {
      title: 'Days 1–3 · Discovery & data import',
      copy: 'Sync rosters, attendance rules, and access controls with guided onboarding.',
      color: 'bg-cyan-400',
    },
    {
      title: 'Days 4–7 · Workspace setup',
      copy: 'Configure groups, notifications, and dashboards tailored to your centers.',
      color: 'bg-emerald-400',
    },
    {
      title: 'Days 8–14 · Training & go-live',
      copy: 'Runbooks, Q&A, and coaching keep every team member confident on day one.',
      color: 'bg-amber-300',
    },
  ];
  private slideIntervalId?: ReturnType<typeof setInterval>;

  toggleTheme(): void {
    this.isDark = !this.isDark;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  setActiveSlide(index: number): void {
    this.activeSlideIndex = index;
    this.restartSlideshow();
  }

  ngOnInit(): void {
    this.startSlideshow();
  }

  ngOnDestroy(): void {
    if (this.slideIntervalId) {
      clearInterval(this.slideIntervalId);
    }
  }

  private startSlideshow(): void {
    this.slideIntervalId = setInterval(() => {
      this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
    }, 5200);
  }

  private restartSlideshow(): void {
    if (this.slideIntervalId) {
      clearInterval(this.slideIntervalId);
    }
    this.startSlideshow();
  }
}
