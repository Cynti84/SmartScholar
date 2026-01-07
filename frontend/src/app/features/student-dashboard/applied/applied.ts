import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

interface Scholarship {
  id: number;
  name: string;
  provider: string;
  amount: number;
  appliedDate: Date;
  deadline: Date;
  status: 'active' | 'expired' | 'pending';
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
export class Applied {
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
  selectedFilter: 'all' | 'active' | 'expired' | 'pending' = 'all';
  selectedScholarship: Scholarship | null = null;
  isModalOpen: boolean = false;

  totalApplied: number = 0;
  activeCount: number = 0;
  expiredCount: number = 0;
  pendingCount: number = 0;

  ngOnInit(): void {
    this.loadScholarships();
    this.calculateStats();
    this.filterScholarships('all');
  }

  loadScholarships(): void {
    // Sample data - replace with actual API call
    this.scholarships = [
      {
        id: 1,
        name: 'Merit Excellence Scholarship',
        provider: 'National Education Foundation',
        amount: 5000,
        appliedDate: new Date('2024-09-15'),
        deadline: new Date('2025-12-31'),
        status: 'active',
        description: 'Scholarship for students with outstanding academic performance',
        requirements: ['GPA above 3.5', 'Essay submission', 'Letter of recommendation'],
        field: 'General Studies',
      },
      {
        id: 2,
        name: 'STEM Innovation Award',
        provider: 'Tech Foundation',
        amount: 7500,
        appliedDate: new Date('2024-08-20'),
        deadline: new Date('2025-06-30'),
        status: 'active',
        description: 'Supporting students pursuing STEM careers',
        requirements: ['STEM major', 'Project portfolio', 'Interview'],
        field: 'Science & Technology',
      },
      {
        id: 3,
        name: 'Community Service Grant',
        provider: 'Civic Organizations',
        amount: 3000,
        appliedDate: new Date('2024-06-10'),
        deadline: new Date('2024-10-30'),
        status: 'expired',
        description: 'For students with exceptional community involvement',
        requirements: ['100+ volunteer hours', 'Community project', 'References'],
        field: 'Community Development',
      },
      {
        id: 4,
        name: 'Arts & Humanities Fellowship',
        provider: 'Cultural Institute',
        amount: 4500,
        appliedDate: new Date('2024-10-05'),
        deadline: new Date('2025-03-15'),
        status: 'pending',
        description: 'Supporting creative and humanities students',
        requirements: ['Portfolio submission', 'Artist statement', 'Academic transcript'],
        field: 'Arts & Humanities',
      },
      {
        id: 5,
        name: 'Business Leaders Scholarship',
        provider: 'Chamber of Commerce',
        amount: 6000,
        appliedDate: new Date('2024-07-12'),
        deadline: new Date('2024-11-01'),
        status: 'expired',
        description: 'For future business and entrepreneurship leaders',
        requirements: ['Business plan', 'Leadership experience', 'Interview'],
        field: 'Business',
      },
    ];
  }

  constructor(private authService: AuthService, private router: Router) {}

  calculateStats(): void {
    this.totalApplied = this.scholarships.length;
    this.activeCount = this.scholarships.filter((s) => s.status === 'active').length;
    this.expiredCount = this.scholarships.filter((s) => s.status === 'expired').length;
    this.pendingCount = this.scholarships.filter((s) => s.status === 'pending').length;
  }

  filterScholarships(filter: 'all' | 'active' | 'expired' | 'pending'): void {
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
