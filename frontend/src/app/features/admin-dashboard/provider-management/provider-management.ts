import { Component } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-provider-management',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './provider-management.html',
  styleUrl: './provider-management.scss',
})
export class ProviderManagement {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
  ];
}
