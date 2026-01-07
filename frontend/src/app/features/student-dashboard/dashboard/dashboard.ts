import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
interface Scholarship {
  id: number;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  matchScore: number;
  category: string;
}

import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { ScholarshipService, Scholarship } from '../../../core/services/scholarship.service';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardLayout, ConfirmModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  // =========================
  // LAYOUT DATA
  // =========================
  studentName = 'Student';

  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  // =========================
  // DASHBOARD STATS (ONLY WHAT YOU WANT)
  // =========================
  stats = {
    totalScholarships: 0,
    applied: 0,
    bookmarked: 0,
    recommended: 0,
  };

  // =========================
  // DATA
  // =========================
  recommendedScholarships: Scholarship[] = [];

  loading = false;
  error = '';

  constructor(
    private scholarshipService: ScholarshipService,
    private userScholarshipService: UserScholarshipService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }
  constructor(private authService: AuthService, private router: Router) {}

  // =========================
  // LOAD DASHBOARD DATA
  // =========================
  private loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      activeScholarships: this.scholarshipService.getActiveScholarships(),
      applied: this.userScholarshipService.getAppliedScholarships(),
      bookmarked: this.userScholarshipService.getBookmarkedScholarships(),
      recommended: this.scholarshipService.getRecommendedScholarships(),
    }).subscribe({
      next: ({ activeScholarships, applied, bookmarked, recommended }) => {
        this.stats.totalScholarships = activeScholarships.count;
        this.stats.applied = applied.data.length;
        this.stats.bookmarked = bookmarked.data.length;
        this.stats.recommended = recommended.data.length;

        this.recommendedScholarships = recommended.data;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to load dashboard';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // =========================
  // TEMPLATE ACTIONS
  // =========================
  onApplyNow(): void {
    this.router.navigate(['/student/scholarships']);
  }

  onViewSaved(): void {
    this.router.navigate(['/student/bookmarked']);
  }

  onEditProfile(): void {
    this.router.navigate(['/student/profile']);
  }

  onViewScholarship(id: string): void {
    this.router.navigate(['/student/scholarships', id]);
  }

  // =========================
  // HELPERS
  // =========================
  getDaysRemaining(deadline: Date): number {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }

  showLogoutModal = false;

  onSidebarAction(item: NavItem) {
    if (item.action === 'logout') {
      this.showLogoutModal = true;
    }
  }

  confirmLogout() {
    this.showLogoutModal = false;

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }
}
