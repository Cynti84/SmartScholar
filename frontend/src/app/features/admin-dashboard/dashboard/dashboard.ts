import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardLayout],
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
}
