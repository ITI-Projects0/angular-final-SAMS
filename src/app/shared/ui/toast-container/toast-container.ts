import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html'
})
export class ToastContainerComponent {
  protected feedback = inject(FeedbackService);

  dismiss(id: string) {
    this.feedback.dismissToast(id);
  }
}

