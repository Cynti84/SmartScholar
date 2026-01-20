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

  getMonthlySignupPoints(): string {
    const max = this.getMaxValue(this.monthlySignups);
    return this.monthlySignups
      .map((d, i) => `${i * 100},${200 - this.getBarHeight(d.value, max) * 2}`)
      .join(' ');
  }
  // ✅ Summary cards
  pendingProviders = 0;
  pendingScholarships = 0;
  activeScholarships = 0;
  totalStudents = 0;
  activeProviders = 0;
  // ✅ Lists
  newProviders = ['Oxford Foundation', 'MIT Global Aid', 'Chevening Trust'];
  newScholarships = ['STEM Excellence 2025', 'Women in Tech', 'Green Scholars'];
  expiringScholarships = ['DeKUT STEM 2024', 'Kenya Global 2023'];

  // ✅ Charts
  lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      { label: 'Applications', data: [10, 25, 18, 30, 22], fill: false, borderColor: '#4CAF50' },
    ],
  };

  lineChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  pieChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{ data: [45, 30, 25], backgroundColor: ['#4CAF50', '#FFC107', '#F44336'] }],
  };

  pieChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };
  quickStats: QuickStat[] = [];
  notifications: Notification[] = [];

  // Chart data
  mostAppliedScholarships: ChartData[] = [];
  monthlySignups: ChartData[] = [];
  categoryDistribution: ChartData[] = [];
  providerActivity: ChartData[] = [];

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
    this.notifications = [
      {
        id: 1,
        type: 'scholarship',
        message: 'New scholarship "Tech Excellence Award" pending approval',
        timestamp: new Date('2025-10-06T10:30:00'),
        priority: 'high',
      },
      {
        id: 2,
        type: 'provider',
        message: 'Provider "Global Education Foundation" awaiting verification',
        timestamp: new Date('2025-10-06T09:15:00'),
        priority: 'high',
      },
      {
        id: 3,
        type: 'scholarship',
        message: '3 scholarships expiring this week',
        timestamp: new Date('2025-10-05T16:45:00'),
        priority: 'medium',
      },
      {
        id: 4,
        type: 'provider',
        message: 'Provider "Healthcare Scholars Inc." updated their profile',
        timestamp: new Date('2025-10-05T14:20:00'),
        priority: 'low',
      },
      {
        id: 5,
        type: 'scholarship',
        message: 'Scholarship "Medical Excellence Grant" has 50+ new applications',
        timestamp: new Date('2025-10-05T11:00:00'),
        priority: 'medium',
      },
      {
        id: 6,
        type: 'provider',
        message: 'New provider registration from "Tech Innovation Hub"',
        timestamp: new Date('2025-10-04T15:30:00'),
        priority: 'high',
      },
      {
        id: 7,
        type: 'scholarship',
        message: 'Scholarship "Arts & Culture Award" deadline extended',
        timestamp: new Date('2025-10-04T10:15:00'),
        priority: 'low',
      },
    ];
  }

  loadChartData(): void {
    this.mostAppliedScholarships = [];
    this.monthlySignups = [];
    this.cd.detectChanges(); // ✅ force update after loading chart data
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

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getMaxValue(data: ChartData[]): number {
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
