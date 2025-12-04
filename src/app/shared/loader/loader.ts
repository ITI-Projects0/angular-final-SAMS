import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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

  get sizePx(): number {
    if (this.size === 'sm') return 28;
    if (this.size === 'lg') return 56;
    return 40;
  }
}
