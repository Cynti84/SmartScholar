import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';

@Component({
  selector: 'app-scholarship-management',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './scholarship-management.html',
  styleUrl: './scholarship-management.scss',
})
export class ScholarshipManagement {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
  ];
  stats = [
    { title: 'Pending Scholarships', value: 6, color: '#facc15' }, // yellow
    { title: 'Approved Scholarships', value: 120, color: '#22c55e' }, // green
    { title: 'Rejected Scholarships', value: 8, color: '#ef4444' }, // red
    { title: 'Expired Scholarships', value: 8, color: '#6b7280' }, // gray
  ];

  scholarships = [
    {
      title: 'Scholarship Name',
      provider: 'University',
      deadline: 'Dec 1, 2025',
      funding: 'Partially',
      country: 'Kenya',
      status: 'Pending',
    },
    {
      title: 'Scholarship Name',
      provider: 'University',
      deadline: 'Dec 1, 2025',
      funding: 'Partially',
      country: 'Kenya',
      status: 'Pending',
    },
    {
      title: 'Scholarship Name',
      provider: 'University',
      deadline: 'Dec 1, 2025',
      funding: 'Partially',
      country: 'Kenya',
      status: 'Pending',
    },
  ];
}
