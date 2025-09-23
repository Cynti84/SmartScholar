import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardLayout, NgChartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
  ];
  pendingProviders = 6;
  pendingScholarships = 20;
  activeScholarships = 100;
  totalStudents = 1240;

  newProviders = ['Provider A', 'Provider B', 'Provider C', 'Provider D'];
  newScholarships = ['Scholarship A', 'Scholarship B', 'Scholarship C', 'Scholarship D'];
  expiringScholarships = [{ name: 'Scholarship X', expiry: '3 days' }];

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        data: [10, 15, 20, 25, 18, 30, 40],
        label: 'Scholarships',
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: '#374151' } },
    },
  };

  // === Pie Chart (Scholarships by field) ===
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Engineering', 'Medicine', 'IT', 'Business', 'Education'],
    datasets: [
      {
        data: [60, 45, 70, 40, 30],
        backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444'],
      },
    ],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };
}
