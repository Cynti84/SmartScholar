import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface ScholarshipDetail {
  id: number;
  scholarshipId: number;
  title: string;
  provider: string;
  providerLogo?: string;
  status: 'active' | 'expired' | 'applied';
  tags?: string[];
  matchScore?: number;
  category: string;
  country: string;
  level: string;
  fundingType: string;
  fieldOfStudy: string;
  amount: string;
  deadline: string;
  description: string;
  eligibility: string[];
  fundingDetails: string;
  requirements: string[];
  applicationUrl?: string;
  savedDate: Date;
}

@Component({
  selector: 'app-scholarship-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scholarship-detail-modal.component.html',
  styleUrls: ['./scholarship-detail-modal.component.scss'],
})
export class ScholarshipDetailModalComponent implements OnChanges {
  @Input() scholarship: ScholarshipDetail | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<number>();

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scholarship'] && this.scholarship) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else if (changes['scholarship'] && !this.scholarship) {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'auto';
    }
  }

  closeModal(): void {
    document.body.style.overflow = 'auto';
    this.close.emit();
  }

  onApplyNow(): void {
    if (
      this.scholarship &&
      this.scholarship.status !== 'applied' &&
      this.scholarship.status !== 'expired'
    ) {
      this.apply.emit(this.scholarship.scholarshipId);
      this.closeModal();
    }
  }

  onBackdropClick(event: Event): void {
    // Only close if clicking the backdrop itself, not the modal content
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  getDaysRemaining(deadline: string | Date): number {
    const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const diff = date.getTime() - Date.now();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }

  getDeadlineClass(): string {
    if (!this.scholarship) return 'normal';

    const daysLeft = this.getDaysRemaining(this.scholarship.deadline);

    if (this.scholarship.status === 'expired') return 'expired';
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'soon';
    return 'normal';
  }
}
