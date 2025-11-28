import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-host.html'
})
export class ModalHostComponent {
  protected feedback = inject(FeedbackService);

  confirm() {
    const modal = this.feedback.modal();
    modal?.onPrimary?.();
    this.feedback.closeModal();
  }

  cancel() {
    const modal = this.feedback.modal();
    modal?.onSecondary?.();
    if (modal?.dismissible !== false) {
      this.feedback.closeModal();
    }
  }

  dismiss() {
    if (this.feedback.modal()?.dismissible !== false) {
      this.feedback.closeModal();
    }
  }
}

