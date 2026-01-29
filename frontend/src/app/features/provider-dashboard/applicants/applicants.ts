import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { ProviderService } from '../../../core/services/provider.service';
import { MatIconModule } from '@angular/material/icon';

Chart.register(...registerables);

interface Scholarship {
  id: string;
  title: string;
}

interface SummaryStats {
  totalApplied: number;
  mostPopular: {
    title: string;
    count: number;
  };
  deadlineSoonest: {
    title: string;
    daysLeft: number;
  };
}

interface EducationData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface ScholarshipTableData {
  title: string;
  totalApplied: number;
  topField: string;
  topCountry: string;
}

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, DashboardLayout, FormsModule, ConfirmModal, MatIconModule],
  templateUrl: './applicants.html',
  styleUrl: './applicants.scss',
})
export class Applicants implements OnInit, OnDestroy {
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  @ViewChild('educationChart') educationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fieldChart') fieldChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('countryChart') countryChartRef!: ElementRef<HTMLCanvasElement>;

  selectedScholarship: string = 'all';

  scholarships: Scholarship[] = [];

  summaryStats: SummaryStats = {
    totalApplied: 0,
    mostPopular: { title: '-', count: 0 },
    deadlineSoonest: { title: '-', daysLeft: 0 },
  };

  educationData: EducationData[] = [];
  fieldData: { label: string; value: number }[] = [];
  countryData: { label: string; value: number }[] = [];

  scholarshipTableData: ScholarshipTableData[] = [];

  private educationChart?: Chart;
  private fieldChart?: Chart;
  private countryChart?: Chart;

  showLogoutModal = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private providerService: ProviderService,
  ) {}

  ngOnInit(): void {
    this.loadScholarships();
    this.loadSummaryStats();
    this.loadEducationStats();
    this.loadFieldStats();
    this.loadCountryStats();
    this.loadScholarshipOverview();
  }

  private loadScholarships(): void {
    this.providerService
      .getMyScholarships()
      .subscribe((data: { scholarship_id: string; title: string }[]) => {
        this.scholarships = data.map((s) => ({
          id: s.scholarship_id,
          title: s.title,
        }));
      });
  }

  private loadSummaryStats(): void {
    this.providerService.getMostPopularScholarship().subscribe((popular) => {
      if (!popular?.popular_scholarship) return;

      const s = popular.popular_scholarship;

      this.summaryStats.mostPopular = {
        title: s.title,
        count: s.application_count,
      };

      this.providerService.getScholarshipApplicationsCount(s.scholarship_id).subscribe((res) => {
        this.summaryStats.totalApplied = res.count;
      });

      this.providerService.getScholarshipDeadline().subscribe((res) => {
        if (!res.deadline || !res.title) {
          this.summaryStats.deadlineSoonest = { title: '-', daysLeft: 0 };
          return;
        }

        const deadline = new Date(res.deadline);
        const today = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        this.summaryStats.deadlineSoonest = {
          title: res.title,
          daysLeft,
        };
      });
    });
  }

  private loadEducationStats(scholarshipId?: number): void {
    this.providerService.getApplicantsByEducationLevel(scholarshipId).subscribe((data) => {
      const total = data.reduce((sum, d) => sum + d.count, 0);

      this.educationData = data.map((d) => ({
        label: d.education_level,
        value: d.count,
        percentage: total ? Math.round((d.count / total) * 100) : 0,
        color: this.getRandomColor(),
      }));

      this.educationChart ? this.updateEducationChart() : this.createEducationChart();
    });
  }

  private loadFieldStats(scholarshipId?: number): void {
    this.providerService.getApplicantsByField(scholarshipId).subscribe((data) => {
      this.fieldData = data.map((d) => ({
        label: d.field,
        value: d.count,
      }));

      this.fieldChart ? this.updateFieldChart() : this.createFieldChart();
    });
  }

  private loadCountryStats(scholarshipId?: number): void {
    this.providerService.getApplicantsByCountry(scholarshipId).subscribe((data) => {
      this.countryData = data.map((d) => ({
        label: d.country,
        value: d.count,
      }));

      this.countryChart ? this.updateCountryChart() : this.createCountryChart();
    });
  }

  private loadScholarshipOverview(): void {
    this.providerService.getScholarshipOverview().subscribe((data) => {
      this.scholarshipTableData = data.map((item) => ({
        title: item.title,
        totalApplied: item.total_applications,
        topField: item.top_field,
        topCountry: item.top_country,
      }));
    });
  }

  onScholarshipChange(): void {
    const id = this.selectedScholarship === 'all' ? undefined : Number(this.selectedScholarship);

    this.loadEducationStats(id);
    this.loadFieldStats(id);
    this.loadCountryStats(id);
  }

  private createEducationChart(): void {
    const ctx = this.educationChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.educationChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.educationData.map((d) => d.label),
        datasets: [
          {
            data: this.educationData.map((d) => d.value),
            backgroundColor: this.educationData.map((d) => d.color),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: { legend: { display: false } },
      },
    });
  }

  private updateEducationChart(): void {
    if (!this.educationChart) return;
    this.educationChart.data.labels = this.educationData.map((d) => d.label);
    this.educationChart.data.datasets[0].data = this.educationData.map((d) => d.value);
    this.educationChart.update();
  }

  private createFieldChart(): void {
    const ctx = this.fieldChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.fieldChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.fieldData.map((d) => d.label),
        datasets: [
          {
            data: this.fieldData.map((d) => d.value),
            backgroundColor: '#3b82f6',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  private updateFieldChart(): void {
    if (!this.fieldChart) return;
    this.fieldChart.data.labels = this.fieldData.map((d) => d.label);
    this.fieldChart.data.datasets[0].data = this.fieldData.map((d) => d.value);
    this.fieldChart.update();
  }

  private createCountryChart(): void {
    const ctx = this.countryChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.countryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.countryData.map((d) => d.label),
        datasets: [
          {
            data: this.countryData.map((d) => d.value),
            backgroundColor: '#10b981',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } },
      },
    });
  }

  private updateCountryChart(): void {
    if (!this.countryChart) return;
    this.countryChart.data.labels = this.countryData.map((d) => d.label);
    this.countryChart.data.datasets[0].data = this.countryData.map((d) => d.value);
    this.countryChart.update();
  }

  private getRandomColor(): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  onSidebarAction(item: NavItem) {
    if (item.action === 'logout') this.showLogoutModal = true;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  ngOnDestroy(): void {
    this.educationChart?.destroy();
    this.fieldChart?.destroy();
    this.countryChart?.destroy();
  }
}
