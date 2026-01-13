import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { ScholarshipService, Scholarship } from '../../../core/services/scholarship.service';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayout, ConfirmModal],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'], // ✅ fixed typo
})
export class DashboardComponent implements OnInit {
  // =========================
  // LAYOUT DATA
  // =========================
  studentName = 'Student';

  menu: NavItem[] = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  // =========================
  // DASHBOARD STATS
  // =========================
  stats = {
    activeScholarships: 0,
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

  showLogoutModal = false;

  constructor(
    private scholarshipService: ScholarshipService,
    private userScholarshipService: UserScholarshipService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

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
      recommended: this.scholarshipService
        .getRecommendedScholarships()
        .pipe(catchError(() => of({ success: true, data: [] }))),
    }).subscribe({
      next: ({ activeScholarships, applied, bookmarked, recommended }) => {
        this.stats.activeScholarships = activeScholarships?.count ?? 0;
        this.stats.applied = applied?.data?.length ?? 0;
        this.stats.bookmarked = bookmarked?.data?.length ?? 0;
        this.stats.recommended = recommended?.data?.length ?? 0;
      },
      error: (err) => console.error('Dashboard error:', err),
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

  // =========================
  // HELPERS
  // =========================
  getDaysRemaining(deadline: Date): number {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }
}
