import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class LoaderComponent {
  @Input() label = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() inline = false;

  get sizePx(): number {
    if (this.size === 'sm') return 28;
    if (this.size === 'lg') return 56;
    return 40;
  }
}

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loaderService.isLoading()) {
      <div class="global-loader-overlay" @fadeInOut>
        <div class="loader-container">
          <!-- Animated Logo/Orbs -->
          <div class="loader-orbs">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="orb orb-3"></div>
            <div class="orb orb-center">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <!-- Progress Ring -->
          <svg class="progress-ring" viewBox="0 0 100 100">
            <circle class="progress-ring-bg" cx="50" cy="50" r="45"/>
            <circle class="progress-ring-fill" cx="50" cy="50" r="45"/>
          </svg>

          <!-- Loading Text -->
          @if (loaderService.message()) {
            <p class="loader-message">{{ loaderService.message() }}</p>
          } @else {
            <p class="loader-message">Loading...</p>
          }

          <!-- Animated Dots -->
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './global-loader.css'
})
export class GlobalLoaderComponent {
  loaderService = inject(LoaderService);
}

