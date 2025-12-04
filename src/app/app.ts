import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/ui/toast-container/toast-container';
import { ModalHostComponent } from './shared/ui/modal-host/modal-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ModalHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ClassSphere');
}
