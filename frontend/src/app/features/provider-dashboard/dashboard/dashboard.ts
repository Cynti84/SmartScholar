import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { Card } from '../../../shared/components/card/card';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ProviderScholarshipDto, ProviderService } from '../../../core/services/provider.service';
import { count, forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

Chart.register(...registerables);

interface StatCard {
  count: number;
  percentage: string;
  trend: 'up' | 'down';
}

interface ScholarshipTableRow {
  name: string;
  datePosted: Date;
  applicationCount: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardLayout, Card, ConfirmModal, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dashboardChart', { static: false })
  dashboardChartRef!: ElementRef<HTMLCanvasElement>;

  private dashboardChart?: Chart;

  /** Sidebar Menu */
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  /** UI State */
  today = new Date();
  showLogoutModal = false;
  hasAnyScholarship = false;
  showEmptyState = false;

  /** Stat Cards */
  approvedScholarships: StatCard = { count: 0, percentage: '0%', trend: 'up' };
  pendingScholarships: StatCard = { count: 0, percentage: '0%', trend: 'down' };
  studentsApplied: StatCard = { count: 0, percentage: '0%', trend: 'up' };
  totalScholarships: StatCard = { count: 0, percentage: '0%', trend: 'up' };

  /** Table */
  scholarships: ScholarshipTableRow[] = [];
  filteredScholarships: ScholarshipTableRow[] = [];
  activeFilter: 'monthly' | 'weekly' | 'today' = 'today';

  /** Chart Data */
  dashboardChartData: { label: string; value: number; color: string }[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private providerService: ProviderService
  ) {}

  // ----------------------------------
  // INIT
  // ----------------------------------
  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // chart is created AFTER data loads
  }

  // ----------------------------------
  // DATA LOADING
  // ----------------------------------
  private loadDashboardData(): void {
    this.providerService.getMyScholarships().subscribe({
      next: (scholarships) => {
        this.hasAnyScholarship = scholarships.length > 0;
        this.showEmptyState = !this.hasAnyScholarship;

        this.mapScholarshipsToTable(scholarships);
        this.buildStats(scholarships);
        this.buildChartData(scholarships);
        this.filterScholarships();

        setTimeout(() => this.renderChart(), 100);
      },
      error: (err) => {
        console.error('Dashboard load failed', err);
        this.hasAnyScholarship = false;
        this.showEmptyState = true;
      },
    });
  }

  // ----------------------------------
  // MAPPERS
  // ----------------------------------
  private mapScholarshipsToTable(apiScholarships: ProviderScholarshipDto[]): void {
    this.scholarships = apiScholarships.map((s) => ({
      name: s.title,
      datePosted: new Date(s.created_at),
      applicationCount: 0, // temporary
      status: s.status === 'approved' ? 'Active' : 'Inactive',
    }));

    // fetch provider total ONCE
    this.providerService.getScholarshipApplicationsCount(0).subscribe((res) => {
      const total = res.count ?? 0;

      // distribute or just show same value (optional design choice)
      this.scholarships = this.scholarships.map((s) => ({
        ...s,
        applicationCount: total,
      }));
    });
  }

  // ----------------------------------
  // STATS
  // ----------------------------------
  private buildStats(apiScholarships: ProviderScholarshipDto[]): void {
    const total = apiScholarships.length;
    const approved = apiScholarships.filter((s) => s.status === 'approved').length;
    const pending = apiScholarships.filter((s) => s.status === 'pending').length;

    this.totalScholarships = {
      count: total,
      percentage: '100%',
      trend: 'up',
    };

    this.approvedScholarships = {
      count: approved,
      percentage: this.getPercentage(approved, total),
      trend: 'up',
    };

    this.pendingScholarships = {
      count: pending,
      percentage: this.getPercentage(pending, total),
      trend: 'down',
    };

    // ✅ Fetch provider total ONCE
    this.providerService.getScholarshipApplicationsCount(0).subscribe((res) => {
      this.studentsApplied = {
        count: res.count ?? 0,
        percentage: '',
        trend: 'up',
      };
    });
  }

  private getPercentage(part: number, total: number): string {
    if (!total) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  }

  onPost(): void {
    this.router.navigate(['/provider/post']);
  }

  // ----------------------------------
  // CHART
  // ----------------------------------
  private buildChartData(apiScholarships: ProviderScholarshipDto[]): void {
    const approved = apiScholarships.filter((s) => s.status === 'approved').length;
    const pending = apiScholarships.filter((s) => s.status === 'pending').length;
    const rejected = apiScholarships.filter((s) => s.status === 'rejected').length;

    this.dashboardChartData = [
      { label: 'Approved', value: approved, color: '#3b82f6' },
      { label: 'Pending', value: pending, color: '#f59e0b' },
      { label: 'Rejected', value: rejected, color: '#ef4444' },
    ];
  }

  private renderChart(): void {
    if (!this.dashboardChartRef?.nativeElement) return;

    if (this.dashboardChart) {
      this.dashboardChart.destroy();
    }

    const ctx = this.dashboardChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const total = this.dashboardChartData.reduce((sum, d) => sum + d.value, 0);

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.dashboardChartData.map((d) => d.label),
        datasets: [
          {
            data: this.dashboardChartData.map((d) => d.value),
            backgroundColor: this.dashboardChartData.map((d) => d.color),
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const percentage = total ? Math.round((value / total) * 100) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    };

    this.dashboardChart = new Chart(ctx, config);
  }

  // ----------------------------------
  // TABLE FILTERING
  // ----------------------------------
  setFilter(filter: 'monthly' | 'weekly' | 'today'): void {
    this.activeFilter = filter;
    this.filterScholarships();
  }

  private filterScholarships(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const monthAgo = new Date(today.getTime() - 30 * 86400000);

    switch (this.activeFilter) {
      case 'today':
        this.filteredScholarships = this.scholarships.filter((s) => s.datePosted >= today);
        break;
      case 'weekly':
        this.filteredScholarships = this.scholarships.filter((s) => s.datePosted >= weekAgo);
        break;
      case 'monthly':
        this.filteredScholarships = this.scholarships.filter((s) => s.datePosted >= monthAgo);
        break;
    }

    if (!this.filteredScholarships.length) {
      this.filteredScholarships = [...this.scholarships];
    }
  }

  // ----------------------------------
  // Download Report
  // ----------------------------------

  downloadReport(): void {
    if (!this.scholarships.length) {
      alert('No scholarships available to export.');
      return;
    }

    const headers = ['Scholarship Title', 'Status', 'Date Posted', 'Application Count'];

    const rows = this.scholarships.map((s) => [
      `"${s.name}"`,
      s.status,
      s.datePosted.toISOString().split('T')[0],
      s.applicationCount.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `smartscholar-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ----------------------------------
  // LOGOUT
  // ----------------------------------
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

  // ----------------------------------
  // CLEANUP
  // ----------------------------------
  ngOnDestroy(): void {
    this.dashboardChart?.destroy();
  }
}
