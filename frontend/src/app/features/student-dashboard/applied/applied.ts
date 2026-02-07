import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';

interface Scholarship {
  id: number;
  name: string;
  provider: string;
  amount: number;
  appliedDate: Date;
  deadline: Date;
  status: 'active' | 'expired' | 'pending' | 'approved';
  description: string;
  requirements: string[];
  field: string;
}

@Component({
  selector: 'app-applied',
  imports: [CommonModule, DashboardLayout, MatIconModule, ConfirmModal],
  templateUrl: './applied.html',
  styleUrl: './applied.scss',
})
export class Applied implements OnInit {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  scholarships: Scholarship[] = [];
  filteredScholarships: Scholarship[] = [];
  selectedFilter: 'all' | 'active' | 'expired' | 'pending' | 'approved' = 'all';
  selectedScholarship: Scholarship | null = null;
  isModalOpen: boolean = false;

  totalApplied: number = 0;
  activeCount: number = 0;
  expiredCount: number = 0;
  pendingCount: number = 0;

  ngOnInit(): void {
    this.loadScholarships();
  }
  loadScholarships(): void {
    this.userScholarshipService.getAppliedScholarships().subscribe({
      next: (res) => {
        this.scholarships = res.data
          .filter((app) => !!app.scholarship)
          .map((app) => {
            const scholarship = app.scholarship!; // safe after filter
            const deadline = new Date(scholarship.deadline);

            return {
              id: app.application_id,
              name: scholarship.title,
              provider:
                typeof scholarship.provider === 'string'
                  ? scholarship.provider
                  : scholarship.provider?.name || 'Unknown Provider',
              amount: scholarship.amount,
              appliedDate: app.appliedAt ? new Date(app.appliedAt) : new Date(),
              deadline,
              status: this.mapStatus(app.status as 'pending' | 'accepted' | 'rejected', deadline),
              description: scholarship.description,
              requirements: scholarship.requirements || [],
              field: scholarship.field || 'General',
            };
          });

        this.calculateStats();
        this.filterScholarships(this.selectedFilter);
      },
      error: (err) => {
        console.error('Failed to load applied scholarships', err);
      },
    });
  }

  mapStatus(
    backendStatus: 'pending' | 'accepted' | 'rejected',
    deadline: Date
  ): 'active' | 'expired' | 'pending' {
    if (backendStatus === 'pending') return 'pending';
    if (deadline < new Date()) return 'expired';
    return 'active';
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private userScholarshipService: UserScholarshipService
  ) {}

  calculateStats(): void {
    this.totalApplied = this.scholarships.length;
    this.activeCount = this.scholarships.filter((s) => s.status === 'approved').length;
    this.expiredCount = this.scholarships.filter((s) => s.status === 'expired').length;
    this.pendingCount = this.scholarships.filter((s) => s.status === 'pending').length;
  }

  filterScholarships(filter: 'all' | 'active' | 'expired' | 'pending' | 'approved'): void {
    this.selectedFilter = filter;
    if (filter === 'all') {
      this.filteredScholarships = [...this.scholarships];
    } else {
      this.filteredScholarships = this.scholarships.filter((s) => s.status === filter);
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getDaysRemaining(deadline: Date): number {
    const today = new Date();
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  viewDetails(scholarship: Scholarship): void {
    this.selectedScholarship = scholarship;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedScholarship = null;
  }

  trackStatus(scholarship: Scholarship): void {
    // Implement tracking logic here
    console.log('Tracking status for:', scholarship.name);
    alert(`Tracking status for ${scholarship.name}`);
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
