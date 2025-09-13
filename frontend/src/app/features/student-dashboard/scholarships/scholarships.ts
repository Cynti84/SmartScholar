import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';

@Component({
  selector: 'app-scholarships',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './scholarships.html',
  styleUrl: './scholarships.scss',
})
export class Scholarships {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Recommendations', route: '/student/recommendations' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
  ];
}
