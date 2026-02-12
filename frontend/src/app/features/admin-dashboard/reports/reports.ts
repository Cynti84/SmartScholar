import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { AdminService } from '../../../core/services/admin.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ✅ Define proper interfaces for type safety
interface MonthlySignup {
  month: string;
  count: string;
}
interface StatusData {
  status: string;
  count: string;
}
interface CountryData {
  country: string;
  count: string;
}
interface FieldData {
  field: string;
  count: string;
}
interface ProviderData {
  provider: string;
  count: string;
}
interface DashboardStats {
  totalStudents: number;
  totalProviders: number;
  totalScholarships: number;
  activeScholarships: number;
  expiredScholarships: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, DashboardLayout, NgChartsModule, ConfirmModal],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
})
export class Reports {
  menu: NavItem[] = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
    { label: 'Logout', action: 'logout' },
  ];

  stats: DashboardStats = {
    totalStudents: 0,
    totalProviders: 0,
    totalScholarships: 0,
    activeScholarships: 0,
    expiredScholarships: 0,
  };

  showLogoutModal = false;

  // Line chart (Students Growth)
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Students',
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.4,
      },
    ],
  };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: true, labels: { color: '#374151' } } },
  };

  // Pie chart (Scholarships by Status)
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#facc15', '#22c55e', '#ef4444', '#6b7280'] }],
  };
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  // Bar chart (Scholarships by Country)
  countryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Scholarships', backgroundColor: '#3b82f6' }],
  };

  // Bar chart (Popular Fields)
  fieldChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Fields', backgroundColor: '#22c55e' }],
  };

  // Horizontal Bar chart (Top Providers)
  providerChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Top Providers', backgroundColor: '#f97316' }],
  };
  providerChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.adminService.getAdminReports().subscribe({
      next: (res) => {
        if (res.success) {
          const data = res.data;

          // --- Dashboard Stats ---
          this.stats.totalStudents = data.totalStudents || 0;
          this.stats.totalProviders = data.totalProviders || 0;
          this.stats.totalScholarships = data.totalScholarships || 0;
          this.stats.activeScholarships = data.activeScholarships || 0;
          this.stats.expiredScholarships = data.expiredScholarships || 0;

          // --- Students Growth Line Chart ---
          const studentGrowth: MonthlySignup[] = data.monthlySignups || [];
          this.lineChartData.datasets[0].data = studentGrowth.map((d) => +d.count);
          this.lineChartData.labels = studentGrowth.map((d) => d.month);
          this.lineChartData = { ...this.lineChartData }; // force update

          // --- Scholarships by Status Pie Chart ---
          const statusData: StatusData[] = data.scholarshipsByStatus || [];
          this.pieChartData.datasets[0].data = statusData.map((d) => +d.count);
          this.pieChartData.labels = statusData.map((d) => d.status);
          this.pieChartData = { ...this.pieChartData };

          // --- Scholarships by Country Bar Chart ---
          const countryData: CountryData[] = data.scholarshipsByCountry || [];
          this.countryChartData.datasets[0].data = countryData.map((d) => +d.count);
          this.countryChartData.labels = countryData.map((d) => d.country);
          this.countryChartData = { ...this.countryChartData };

          // --- Popular Fields Bar Chart ---
          const fieldData: FieldData[] = data.fieldsData || [];
          this.fieldChartData.datasets[0].data = fieldData.map((d) => +d.count);
          this.fieldChartData.labels = fieldData.map((d) => d.field);
          this.fieldChartData = { ...this.fieldChartData };

          // --- Top Providers Horizontal Bar Chart ---
          const providerData: ProviderData[] = data.topProviders || [];
          this.providerChartData.datasets[0].data = providerData.map((d) => +d.count);
          this.providerChartData.labels = providerData.map((d) => d.provider);
          this.providerChartData = { ...this.providerChartData };
        }
      },
      error: (err) => console.error('Failed to load reports:', err),
    });
  }

  downloadReport() {
    this.adminService.getAdminReports().subscribe({
      next: (res) => {
        if (!res.success) return;

        const data = res.data;

        // 1️⃣ Prepare a flat structure for Excel
        const exportData: any[] = [];

        // Add total stats
        exportData.push({
          Metric: 'Total Students',
          Value: data.totalStudents,
        });
        exportData.push({
          Metric: 'Total Providers',
          Value: data.totalProviders,
        });
        exportData.push({
          Metric: 'Total Scholarships',
          Value: data.totalScholarships,
        });
        exportData.push({
          Metric: 'Active Scholarships',
          Value: data.activeScholarships,
        });
        exportData.push({
          Metric: 'Expired Scholarships',
          Value: data.expiredScholarships,
        });

        // Add charts data
        data.monthlySignups.forEach((d: any) => {
          exportData.push({
            Metric: `Students Signed Up - ${d.month}`,
            Value: d.count,
          });
        });

        data.scholarshipsByStatus.forEach((d: any) => {
          exportData.push({
            Metric: `Scholarships Status - ${d.status}`,
            Value: d.count,
          });
        });

        data.scholarshipsByCountry.forEach((d: any) => {
          exportData.push({
            Metric: `Scholarships Country - ${d.country}`,
            Value: d.count,
          });
        });

        data.fieldsData.forEach((d: any) => {
          exportData.push({
            Metric: `Field of Study - ${d.field}`,
            Value: d.count,
          });
        });

        data.topProviders.forEach((d: any) => {
          exportData.push({
            Metric: `Provider - ${d.provider}`,
            Value: d.count,
          });
        });

        // 2️⃣ Create worksheet and workbook
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Report');

        // 3️⃣ Save as Excel file
        const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `Dashboard_Report_${new Date().toISOString()}.xlsx`);
      },
      error: (err) => console.error('Export failed', err),
    });
  }

  onSidebarAction(item: NavItem) {
    if (item.action === 'logout') this.showLogoutModal = true;
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
