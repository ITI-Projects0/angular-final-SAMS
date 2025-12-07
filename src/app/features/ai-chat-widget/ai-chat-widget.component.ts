import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

type ChatMessage = { role: 'user' | 'ai'; content: string };

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-widget.component.html',
  styleUrls: ['./ai-chat-widget.component.scss'],
})
export class AiChatWidgetComponent {
  messages: ChatMessage[] = [
    { role: 'ai', content: 'Hi! I am the AI assistant. How can I help you today?' }
  ];
  input = '';
  loading = false;
  error = '';

  constructor(private ai: AiService) {}

  send() {
    const text = this.input.trim();
    if (!text || this.loading) return;
    this.error = '';
    this.input = '';
    this.messages.push({ role: 'user', content: text });
    this.loading = true;

    this.ai.chat({ role: 'teacher', message: text }).subscribe({
      next: (res) => {
        this.messages.push({ role: 'ai', content: res.reply || '...' });
        this.loading = false;
      },
      error: () => {
        this.error = 'Something went wrong. Please try again.';
        this.loading = false;
      }
    });
  }
}
