import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
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
export class Dashboard {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
    { label: 'Logout', action: 'logout' },
  ];

  Math = Math; // ✅ Fix for Math.abs()

  constructor(private router: Router, private authService: AuthService) {}

  getMonthlySignupPoints(): string {
    const max = this.getMaxValue(this.monthlySignups);
    return this.monthlySignups
      .map((d, i) => `${i * 100},${200 - this.getBarHeight(d.value, max) * 2}`)
      .join(' ');
  }
  // ✅ Summary cards
  pendingProviders = 4;
  pendingScholarships = 7;
  activeScholarships = 12;
  totalStudents = 56;

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
  }

  loadDashboardData(): void {
    // Simulate API call
    setTimeout(() => {
      this.loadQuickStats();
      this.loadNotifications();
      this.loadChartData();
      this.isLoading = false;
    }, 1000);
  }

  loadQuickStats(): void {
    this.quickStats = [
      {
        label: 'Total Scholarships',
        value: 248,
        change: 12.5,
        icon: 'school',
        color: '#4299e1',
      },
      {
        label: 'Pending Approvals',
        value: 15,
        change: -5.2,
        icon: 'hourglass_empty',
        color: '#ed8936',
      },
      {
        label: 'Active Providers',
        value: 87,
        change: 8.3,
        icon: 'apartment',
        color: '#48bb78',
      },
      {
        label: 'Registered Students',
        value: 3542,
        change: 15.7,
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
    this.mostAppliedScholarships = [
      { label: 'Tech Excellence', value: 324 },
      { label: 'Medical Grant', value: 298 },
      { label: 'Engineering Award', value: 267 },
      { label: 'Arts Scholarship', value: 189 },
      { label: 'Business Leaders', value: 156 },
    ];

    this.monthlySignups = [
      { label: 'Apr', value: 234 },
      { label: 'May', value: 298 },
      { label: 'Jun', value: 356 },
      { label: 'Jul', value: 412 },
      { label: 'Aug', value: 478 },
      { label: 'Sep', value: 523 },
      { label: 'Oct', value: 241 },
    ];

    this.categoryDistribution = [
      { label: 'Engineering', value: 35 },
      { label: 'Medicine', value: 28 },
      { label: 'Business', value: 18 },
      { label: 'Arts', value: 12 },
      { label: 'Law', value: 7 },
    ];

    this.providerActivity = [
      { label: 'TechCorp', value: 45 },
      { label: 'Health Foundation', value: 38 },
      { label: 'Global Edu', value: 32 },
      { label: 'Innovation Hub', value: 28 },
      { label: 'Cultural Society', value: 22 },
    ];
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

  viewAllScholarships(): void {
    console.log('Navigate to scholarships page');
  }

  viewPendingApprovals(): void {
    console.log('Navigate to pending approvals');
  }

  viewProviders(): void {
    console.log('Navigate to providers page');
  }

  viewStudents(): void {
    console.log('Navigate to students page');
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
