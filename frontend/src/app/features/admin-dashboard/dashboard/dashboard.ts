import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { AdminService } from '../../../core/services/admin.service';
import { ChangeDetectorRef } from '@angular/core';

interface QuickStat {
  label: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

interface Notification {
  id: number;
  type: 'scholarship' | 'provider';
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayout, NgChartsModule, MatIconModule, ConfirmModal],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
    { label: 'Logout', action: 'logout' },
  ];

  Math = Math; // ✅ Fix for Math.abs()

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private cd: ChangeDetectorRef,
  ) {}

  // ✅ Summary cards
  pendingProviders = 0;
  pendingScholarships = 0;
  activeScholarships = 0;
  totalStudents = 0;
  activeProviders = 0;

  quickStats: QuickStat[] = [];
  notifications: Notification[] = [];

  // Chart data
  mostAppliedScholarships: ChartData[] = [];
  monthlySignups: ChartData[] = [];
  categoryDistribution: ChartData[] = [];
  providerActivity: ChartData[] = [];

  mostAppliedChart!: ChartConfiguration<'bar'>;
  monthlySignupChart!: ChartConfiguration<'line'>;
  categoryChart!: ChartConfiguration<'pie'>;
  providerChart!: ChartConfiguration<'bar'>;

  // View toggle
  showAllNotifications = false;
  maxNotificationsToShow = 5;

  // Loading states
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadChartData();
    this.loadNotifications();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    Promise.allSettled([
      this.loadStudentsCount(),
      this.loadPendingProviders(),
      this.loadScholarships(),
      this.loadProviders(),
    ]).then(() => {
      this.buildQuickStats();
      this.isLoading = false;
    });
  }

  //added
  loadStudentsCount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getTotalStudents().subscribe({
        next: (res) => {
          this.totalStudents = res.data.total;
          resolve();
        },
        error: reject,
      });
    });
  }
  //added2
  loadPendingProviders(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getPendingProviders().subscribe({
        next: (res) => {
          this.pendingProviders = res.count;
          resolve();
        },
        error: reject,
      });
    });
  }
  //added3
  loadScholarships(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getAllScholarships().subscribe({
        next: (res) => {
          this.activeScholarships = res.count;
          resolve();
        },
        error: reject,
      });
    });
  }
  //added4
  loadProviders(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getProviders().subscribe({
        next: (res) => {
          this.activeProviders = res.count; // ✅ REAL DATA
          resolve();
        },
        error: reject,
      });
    });
  }

  buildQuickStats(): void {
    this.quickStats = [
      {
        label: 'Total Scholarships',
        value: this.activeScholarships,
        change: 0,
        icon: 'school',
        color: '#4299e1',
      },
      {
        label: 'Pending Approvals',
        value: this.pendingProviders,
        change: 0,
        icon: 'hourglass_empty',
        color: '#ed8936',
      },
      {
        label: 'Active Providers',
        value: this.activeProviders, // ✅ BACKEND COUNT
        change: 0,
        icon: 'apartment',
        color: '#48bb78',
      },

      {
        label: 'Registered Students',
        value: this.totalStudents,
        change: 0,
        icon: 'group',
        color: '#9f7aea',
      },
    ];
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'scholarship':
        return 'school'; // 🎓
      case 'provider':
        return 'apartment'; // 🏢
      case 'student':
        return 'group'; // 👥
      case 'pending':
        return 'hourglass_top'; // ⏳ for pending approval
      default:
        return 'notifications';
    }
  }
  loadNotifications(): void {
    this.adminService.getNotifications().subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications = res.data.map((n: any) => ({
            ...n,
            timestamp: new Date(n.createdAt), // convert string to Date
          }));
        }
      },
      error: () => {
        this.notifications = [];
      },
    });
  }

  loadChartData(): void {
    this.adminService.getDashboardAnalytics().subscribe({
      next: (res) => {
        const data = res.data;

        this.mostAppliedScholarships = data.mostAppliedScholarships.map((d: any) => ({
          label: d.label,
          value: Number(d.value),
        }));

        this.monthlySignups = data.monthlySignups.map((d: any) => ({
          label: d.label,
          value: Number(d.value),
        }));

        this.categoryDistribution = data.categoryDistribution.map((d: any) => ({
          label: d.label,
          value: Number(d.value),
        }));

        this.providerActivity = data.providerActivity.map((d: any) => ({
          label: d.label,
          value: Number(d.value),
        }));

        this.cd.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  getMonthlySignupPoints(): string {
    if (!this.monthlySignups || this.monthlySignups.length === 0) {
      return '';
    }

    const max = this.getMaxValue(this.monthlySignups);
    const step = 700 / Math.max(this.monthlySignups.length - 1, 1);

    return this.monthlySignups
      .map((d, i) => `${i * step},${200 - this.getBarHeight(d.value, max) * 2}`)
      .join(' ');
  }

  buildCharts(): void {
    // Most Applied Scholarships (BAR)
    this.mostAppliedChart = {
      type: 'bar',
      data: {
        labels: this.mostAppliedScholarships.map((d) => d.label),
        datasets: [
          {
            label: 'Applications',
            data: this.mostAppliedScholarships.map((d) => d.value),
          },
        ],
      },
      options: { responsive: true },
    };

    // Monthly Signups (LINE)
    this.monthlySignupChart = {
      type: 'line',
      data: {
        labels: this.monthlySignups.map((d) => d.label),
        datasets: [
          {
            label: 'New Users',
            data: this.monthlySignups.map((d) => d.value),
            fill: false,
          },
        ],
      },
      options: { responsive: true },
    };

    // Category Distribution (PIE)
    this.categoryChart = {
      type: 'pie',
      data: {
        labels: this.categoryDistribution.map((d) => d.label),
        datasets: [
          {
            data: this.categoryDistribution.map((d) => d.value),
          },
        ],
      },
    };

    // Provider Activity (BAR)
    this.providerChart = {
      type: 'bar',
      data: {
        labels: this.providerActivity.map((d) => d.label),
        datasets: [
          {
            label: 'Scholarships Posted',
            data: this.providerActivity.map((d) => d.value),
          },
        ],
      },
      options: { responsive: true },
    };
  }

  getVisibleNotifications(): Notification[] {
    return this.showAllNotifications
      ? this.notifications
      : this.notifications.slice(0, this.maxNotificationsToShow);
  }

  toggleNotifications(): void {
    this.showAllNotifications = !this.showAllNotifications;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  formatTimestamp(date: string | Date): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // invalid date

    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getMaxValue(data: ChartData[]): number {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((d) => d.value));
  }

  getBarHeight(value: number, maxValue: number): number {
    return (value / maxValue) * 100;
  }

  getTotalApplications(): number {
    return this.mostAppliedScholarships.reduce((sum, item) => sum + item.value, 0);
  }

  getTotalSignups(): number {
    return this.monthlySignups.reduce((sum, item) => sum + item.value, 0);
  }

  dismissNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  viewPendingApprovals(): void {
    this.router.navigate(['/admin/providers'], {
      queryParams: { status: 'pending' },
    });
  }

  viewAllScholarships(): void {
    this.router.navigate(['/admin/scholarships']);
  }

  viewProviders(): void {
    this.router.navigate(['/admin/providers']);
  }

  viewStudents(): void {
    this.router.navigate(['/admin/students']);
  }

  downloadReport() {
    this.adminService.getAdminReports().subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;

        // Set a file name
        link.download = 'admin_report.xlsx'; // or .pdf/.csv depending on backend
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Report download failed', err);
      },
    });
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
