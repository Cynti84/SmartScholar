import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';

interface Scholarship {
  title: string;
  appliedDate: string;
  deadline: string;
  daysLeft: number;
  country: string;
  status: 'Ongoing' | 'Expired';
  funding: string;
}

@Component({
  selector: 'app-applied',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './applied.html',
  styleUrl: './applied.scss',
})
export class Applied {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Recommendations', route: '/student/recommendations' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
  ];

  totalScholarships = 6;
  active = 5;
  expired = 1;

  scholarships: Scholarship[] = [
    {
      title: 'Daad Postgraduate Scholarship',
      appliedDate: 'July 17, 2024',
      deadline: 'Nov 30, 2025',
      daysLeft: 5,
      country: 'Germany',
      status: 'Ongoing',
      funding: 'Fully Funded',
    },
    {
      title: 'Equity Leaders Program',
      appliedDate: 'July 17, 2024',
      deadline: 'Nov 30, 2025',
      daysLeft: 5,
      country: 'Kenya',
      status: 'Ongoing',
      funding: 'Fully Funded',
    },
    {
      title: 'Chevening Scholarship',
      appliedDate: 'July 17, 2024',
      deadline: 'Nov 30, 2025',
      daysLeft: 5,
      country: 'United Kingdom',
      status: 'Expired',
      funding: 'Fully Funded',
    },
  ];
}
