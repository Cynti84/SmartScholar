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
  pendingProviders = 6;
  verifiedProviders = 120;
  rejectedProviders = 8;

  providers = [
    {
      name: 'Provider One',
      type: 'University',
      registered: 'Yes',
      status: 'Pending',
      scholarship: 'Scholarship',
    },
    {
      name: 'Provider Two',
      type: 'University',
      registered: 'Yes',
      status: 'Pending',
      scholarship: 'Scholarship',
    },
    {
      name: 'Provider Three',
      type: 'University',
      registered: 'Yes',
      status: 'Pending',
      scholarship: 'Scholarship',
    },
    {
      name: 'Provider Four',
      type: 'University',
      registered: 'Yes',
      status: 'Pending',
      scholarship: 'Scholarship',
    },
  ];

  selectedProvider: any = null;

  selectProvider(provider: any) {
    this.selectedProvider = provider;
  }

  approveProvider() {
    if (this.selectedProvider) {
      this.selectedProvider.status = 'Approved';
    }
  }

  rejectProvider() {
    if (this.selectedProvider) {
      this.selectedProvider.status = 'Rejected';
    }
  }
}
