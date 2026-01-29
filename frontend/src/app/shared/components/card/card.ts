import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  @Input() icon = '';
  @Input() title = '';
  @Input() value: string | number | null = null;
  @Input() subtitle = '';
  @Input() percentage?: string;
  @Input() trend?: 'up' | 'down';

  get iconColor(): string {
    switch (this.icon) {
      case 'check_circle':
        return '#2e7d32'; // green
      case 'pending_actions':
        return '#f9a825'; // yellow
      case 'groups':
        return '#0288d1'; // blue
      case 'menu_book':
        return '#6a1b9a'; // purple
      default:
        return '#000'; // fallback
    }
  }
}
