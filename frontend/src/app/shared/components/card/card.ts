import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
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
}
