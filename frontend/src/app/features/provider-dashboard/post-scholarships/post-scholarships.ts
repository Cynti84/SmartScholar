import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
@Component({
  selector: 'app-post-scholarships',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './post-scholarships.html',
  styleUrl: './post-scholarships.scss',
})
export class PostScholarships {
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
  ];
}
