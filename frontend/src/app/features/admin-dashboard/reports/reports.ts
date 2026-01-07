import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { NgChartsModule } from 'ng2-charts';

import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, DashboardLayout, NgChartsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
})
export class Reports {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
  ];

  // Line Chart (Students Growth)
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        data: [50, 80, 120, 180, 220, 280, 350],
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
    plugins: {
      legend: { display: true, labels: { color: '#374151' } },
    },
  };

  // Pie Chart (Scholarships by Status)
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Pending', 'Approved', 'Rejected', 'Expired'],
    datasets: [
      {
        data: [50, 200, 20, 30],
        backgroundColor: ['#facc15', '#22c55e', '#ef4444', '#6b7280'],
      },
    ],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  // Bar Chart (Scholarships by Country)
  countryChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia'],
    datasets: [
      {
        data: [40, 25, 30, 15, 20],
        label: 'Scholarships',
        backgroundColor: '#3b82f6',
      },
    ],
  };

  // Bar Chart (Most Popular Fields of Study)
  fieldChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Engineering', 'Medicine', 'IT', 'Business', 'Education'],
    datasets: [
      {
        data: [60, 45, 70, 40, 30],
        label: 'Students',
        backgroundColor: '#22c55e',
      },
    ],
  };

  // Horizontal Bar Chart (Top Providers)
  providerChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Provider A', 'Provider B', 'Provider C', 'Provider D', 'Provider E'],
    datasets: [
      {
        data: [50, 40, 30, 20, 15],
        label: 'Scholarships',
        backgroundColor: '#f97316',
      },
    ],
  };

  providerChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
  };
}
