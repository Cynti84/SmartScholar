import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new Subject<ToastMessage>();
  public messages$ = this.subject.asObservable();

  show(message: string, opts?: Partial<ToastMessage>) {
    this.subject.next({
      text: message,
      type: opts?.type ?? 'info',
      duration: opts?.duration ?? 4000,
    });
  }

  success(message: string, duration?: number) {
    this.show(message, { type: 'success', duration });
  }
  error(message: string, duration?: number) {
    this.show(message, { type: 'error', duration });
  }
  info(message: string, duration?: number) {
    this.show(message, { type: 'info', duration });
  }
}
