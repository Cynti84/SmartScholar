import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let m of messages" class="toast" [ngClass]="m.type">
        {{ m.text }}
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 320px;
      }
      .toast {
        padding: 0.6rem 1rem;
        border-radius: 8px;
        background: #333;
        color: white;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        font-size: 0.95rem;
        opacity: 0.98;
      }
      .toast.success {
        background: #198754;
      }
      .toast.error {
        background: #dc3545;
      }
      .toast.info {
        background: #0d6efd;
      }
    `,
  ],
})
export class AppToastComponent implements OnInit {
  messages: ToastMessage[] = [];
  private sub?: Subscription;

  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.sub = this.toast.messages$.subscribe((msg) => {
      this.messages.push(msg);
      const idx = this.messages.length - 1;
      setTimeout(() => {
        this.messages.splice(idx, 1);
      }, msg.duration ?? 4000);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
